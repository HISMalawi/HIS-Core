<template>
    <ion-page>
        <ion-loading :is-open="isLoading" message="Please wait..."/>
        <v2Datatable
            title="Monthly Screen Report"
            :subtitle="period"
            :columns="columns"
            :columnData="reportData"
            :rowsPerPage="25"
            :onConfigure="configure"
            :csvQuarter="csvQuarter"
            :onRefresh="() => generate()"
            :order="order"
            :headers="csvheaders"
            :csv-spacing="spacing"
            :csv-sub-header="subHeaders"
        />
    </ion-page>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { IonPage, IonLoading, modalController } from "@ionic/vue"
import  v2Datatable from "@/apps/CxCa/views/reports/clinic/TableView.vue"
import { v2ColumnDataInterface, v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { CxCaReportService } from "@/apps/CxCa/services/reports/cxca_report_service"
import { toastDanger, toastWarning } from '@/utils/Alerts';
import DrillPatientIds from '../../../../../components/DrillPatientIds.vue';
import { toDate } from '@/utils/Strs';
import { MultiStepPopupForm } from "@/utils/PopupKeyboard";
import { FieldType } from "@/components/Forms/BaseFormElements";
import { Option } from '@/components/Forms/FieldInterface'
import { isPlainObject } from "lodash";
import Validation from "@/components/Forms/validations/StandardValidations"
import { Service } from "@/services/service"
import HisDate from "@/utils/Date"
import dayjs from "dayjs";


const reportData = ref<any>([])
const startDate = ref('')
const endDate = ref('')
const period = ref('')
const isLoading = ref(false)
const csvQuarter = ref('')

export default defineComponent({ 
    components: { 
        IonPage,
        IonLoading,
        v2Datatable,
    },
    setup() {
        const convertToArray = (data: any, totals: any) => {
            const convertedData = [
                convertGroupToArray(data.first_time_screened),
                convertGroupToArray(data.rescreened_after_prev_visit),
                convertGroupToArray(data.post_treatment_followup),
            ];

            convertedData.push(extractTotals(totals))

            return convertedData
        }
        const convertGroupToArray = (group: any) =>  {
            return group.map((item: { [x: string]: any; age_group: any }) => {
                const { age_group, ...procedures } = item;
                return { ...procedures, age_group };
            });
        }

        const extractTotals = (data: any) => {
            const extractedTotals: { [key: string]: any }[] = [];
            for (const key in data) {
                const obj: { [key: string]: any } = {};
                obj[key] = data[key];
                extractedTotals.push(obj);
            }
            return extractedTotals;
        }

        const drilldown = async (title: string, patientIdentifiers: number[]) => {
            if (patientIdentifiers.length <= 0) {
                // The array is empty or has no elements, so don't launch the drilldown
                return;
            }
            (await modalController.create({
                component: DrillPatientIds,
                backdropDismiss: false,
                cssClass: 'large-modal',
                componentProps: {
                    title,
                    subtitle: period,
                    patientIdentifiers,
                    onFinish: () => modalController.getTop().then(v => v && modalController.dismiss())
                }
            })).present()
        }
        /**
         * ordering of columns
         */
        const order = [
            'age_group',
            'negative',
            'positive',
            'for_same_day_tx',
            'suspected'
        ];

        //csv headers
        const csvheaders = [
            'Age Group', 
            'Negative', 
            'Positive', 
            'For same day Tx',
            'Suspected Cancer'
        ];

        //sub headers for report sections
        const subHeaders = [
                    ["","",'1st time screened',"",""],
                    ["","",'Rescreened after previous negative',"",""],
                    ["","",'Post-treatment follow-up',"",""],
                    ["","",'Month Summary',"",""]
            ];

        //blank spacing for csv spacing
        const spacing = 3;


        /**
         * Table column definition and value mapping
         */
        const columns: Array<v2ColumnInterface[]> = [
            [
                {
                    label: "Facility:",
                    ref: ""
                },
                {
                    label: "Month/Year:",
                    ref: "",
                    span: {
                        thColspan: 1,
                    }
                },
                {
                    label: "Report Officer:",
                    ref: "",
                    span: {
                        thColspan: 3,
                    }
                },
            ],
            [
                {
                    label: "Age Disaggregate:",
                    ref: "data.age_group",
                    value: (data: any) => data.age_group
                },
                {
                    label: "Negative",
                    ref: "data.cryotherapy.length",
                    secondaryLabel: "1st screened (negative)",
                    value: (data: any) => data.negative?.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.negative
                    )
                },
                {
                    label: "Positive",
                    ref: "data.positive.length",
                    secondaryLabel: "1st screened (positive)",
                    value: (data: any) => data.positive?.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.positive
                    )
                },
                {
                    label: "For same day Tx",
                    ref: "data.for_same_day_tx.length",
                    secondaryLabel: "1st screened (For same day Tx)",
                    value: (data: any) => data.for_same_day_tx?.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.for_same_day_tx
                    )
                },
                {
                    label: "Suspected Cancer",
                    ref: "data.suspected.length",
                    secondaryLabel: "1st screened (Suspected Cancer)",
                    value: (data: any) => data.suspected?.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.suspected
                    )
                }
            ],
            [
                {
                    label: "Age Disaggregate:",
                    ref: "data.age_group",
                    value: (data: any) => data.age_group
                },
                {
                    label: "Negative",
                    ref: "data.cryotherapy.length",
                    secondaryLabel: "Rescreened after previous negative (negative)",
                    value: (data: any) => data.negative?.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.negative
                    )
                },
                {
                    label: "Positive",
                    ref: "data.positive.length",
                    secondaryLabel: "Rescreened after previous negative (positive)",
                    value: (data: any) => data.positive?.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.positive
                    )
                },
                {
                    label: "For same day Tx",
                    ref: "data.for_same_day_tx.length",
                    secondaryLabel: "Rescreened after previous negative (For same day Tx)",
                    value: (data: any) => data.for_same_day_tx?.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.for_same_day_tx
                    )
                },
                {
                    label: "Suspected Cancer",
                    ref: "data.suspected.length",
                    secondaryLabel: "Rescreened after previous negative (Suspected Cancer)",
                    value: (data: any) => data.suspected?.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.suspected
                    )
                }
            ],
            [
                {
                    label: "Age Disaggregate:",
                    ref: "data.age_group",
                    value: (data: any) => data.age_group
                },
                {
                    label: "Negative",
                    ref: "data.cryotherapy.length",
                    secondaryLabel: "Post-treatment follow-up (negative)",
                    value: (data: any) => data.negative?.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.negative
                    )
                },
                {
                    label: "Positive",
                    ref: "data.positive.length",
                    secondaryLabel: "Post-treatment follow-up positive)",
                    value: (data: any) => data.positive?.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.positive
                    )
                },
                {
                    label: "For same day Tx",
                    ref: "data.for_same_day_tx.length",
                    secondaryLabel: "Post-treatment follow-up (For same day Tx)",
                    value: (data: any) => data.for_same_day_tx?.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.for_same_day_tx
                    )
                },
                {
                    label: "Suspected Cancer",
                    ref: "data.suspected.length",
                    secondaryLabel: "Post-treatment follow-up (Suspected Cancer)",
                    value: (data: any) => data.suspected?.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.suspected
                    )
                }
            ],
            [
                {
                    label: "1st time Screened",
                    ref: "",
                    exportable: false,
                    span: {
                        thColspan: 7,
                    }
                }
            ],
            [
                {
                    label: "Rescreened after previous negative",
                    ref: "",
                    exportable: false,
                    span: {
                        thColspan: 7,
                    }
                }
            ],
            [
                {
                    label: "Post-treatment follow-up",
                    ref: "",
                    
                    span: {
                        thColspan: 7,
                    }
                }
            ],
            [
                {
                    label: "Month Summary",
                    ref: "",
                    span: {
                        thColspan: 7,
                    }
                }
            ],
            [
                {
                    label: "Total Screened",
                    ref: "data.total_screened.length",
                    secondaryLabel: "Total Screened",
                    value: (data: any) => data.total_screened?.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel}`, data.total_screened
                    )
                }
            ],
            [
                {
                    label: "Total Negative",
                    ref: "data.total_negative.length",
                    secondaryLabel: "Total Negative",
                    value: (data: any) => data.total_negative?.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel}`, data.total_negative
                    )
                }
            ],
            [
                {
                    label: "Total Via + eligible for same day Tx",
                    ref: "data.total_via_plus_eligible_for_same_day_tx.length",
                    secondaryLabel: "Total Via + eligible for same day Tx",
                    value: (data: any) => data.total_via_plus_eligible_for_same_day_tx?.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel}`, data.total_via_plus_eligible_for_same_day_tx
                    )
                }
            ],
            [
                {
                    label: "Total Positive",
                    ref: "data.total_positive.length",
                    secondaryLabel: "Total Positive",
                    value: (data: any) => data.total_positive?.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel}`, data.total_positive
                    )
                }
            ],
            [
                {
                    label: "Total Suspected Cancer",
                    ref: "data.total_suspect_cancer.length",
                    secondaryLabel: "Total Suspected Cancer",
                    value: (data: any) => data.total_suspect_cancer?.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel}`, data.total_suspect_cancer
                    )
                }
            ],
            [
                {
                    label: "Total VIA+ Referred",
                    ref: "data.total_via_reffered.length",
                    secondaryLabel: "Total VIA+ Referred",
                    value: (data: any) => data.total_via_reffered?.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel}`, data.total_via_reffered
                    )
                }
            ],
            [
                {
                    label: "Total CXCA Suspect Referred",
                    ref: "data.suspects_reffered.length",
                    secondaryLabel: "Total CXCA Suspect Referred",
                    value: (data: any) => data.suspects_reffered?.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel}`, data.suspects_reffered
                    )
                }
            ],
            [
                {
                    label: "Total Referred",
                    ref: "data.total_reffered.length",
                    secondaryLabel: "Total Referred",
                    value: (data: any) => data.total_reffered?.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel}`, data.total_reffered
                    )
                }
            ]
        ]
        /**
         * Generates report by start date and end date
         */
         const generate = async () => {
            if (!(startDate.value && endDate.value))  {
                return toastWarning('Start date and end date required!')
            }
            isLoading.value = true
            reportData.value = []
            const report = new CxCaReportService()
            report.startDate = startDate.value
            report.endDate = endDate.value
            try {
                const rawReport = (await report.getClinicReport('MONTHLY SCREEN'))
                reportData.value = convertToArray(rawReport.data, rawReport.totals)
            } catch (e) {
                toastDanger("Unable to generate report!")
                console.error(e)
            }
            isLoading.value = false
        }
        /**
         * Loads a dialogue to allow users to configure start and end date
         */
         const configure = () => MultiStepPopupForm([
            {
                id: 'year',
                helpText: 'Select Year',
                type: FieldType.TT_NUMBER,
                computedValue: (v: Option) => v.value,
                validation: (v: Option) => {
                    const year = isPlainObject(v) ? v.value : -1
                    return Validation.validateSeries([
                        () => Validation.required(v),
                        () => {
                            if (isNaN(parseInt(`${year}`))) {
                                return ['Invalid year']
                            }
                            return null
                        },
                        () => Validation.rangeOf(v, 2000, HisDate.getYear(Service.getSessionDate()))
                    ])
                }
            },
            {
                id: 'month',
                helpText: 'Select Month',
                type: FieldType.TT_SELECT,
                validation: (v: Option) => Validation.required(v),
                computedValue: (v: Option) => v.value,
                options: () => {
                    return [
                        {label: 'January', value: '01'},
                        {label: 'February', value: '02'},
                        {label: 'March', value: '03'},
                        {label: 'April', value: '04'},
                        {label: 'May', value: '05'},
                        {label: 'June', value: '06'},
                        {label: 'July', value: '07'},
                        {label: 'August', value: '08'},
                        {label: 'September', value: '09'},
                        {label: 'October', value: '10'},
                        {label: 'November', value: '11'},
                        {label: 'December', value: '12'}
                    ]
                }
            }
        ], 
        (f: any) => {
            startDate.value = `${f.year.value}-${f.month.value}-01`
            endDate.value = dayjs(new Date(startDate.value).toISOString()).endOf("month").format("YYYY-MM-DD")
            period.value = `Period (${toDate(startDate.value)} to ${toDate(endDate.value)})`
            modalController.dismiss()
            csvQuarter.value = `${toDate(startDate.value)} to ${toDate(endDate.value)}`
            generate()
        })

        /**
         * Initialization code when the report is empty!
         */
        onMounted(() => !reportData.value.length && configure())


        return  {
            columns,
            isLoading,
            reportData,
            period,
            csvQuarter,
            generate,
            configure,
            order,
            csvheaders,
            spacing,
            subHeaders
        }
    }
})

</script>