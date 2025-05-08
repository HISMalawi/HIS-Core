<template>
  <ion-page>
        <ion-loading :is-open="isLoading" message="Please wait..."/>
        <v2Datatable
            title="Disaggregated Diagnosis Report"
            :subtitle="period"
            :columns="columns"
            :columnData="reportData"
            :rowsPerPage="25"
            :onConfigure="configure"
            :csvQuarter="csvQuarter"
            :headers="csvheaders"
            :onRefresh="() => generate()"
        />
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent, ref, onMounted } from 'vue';
import { IonPage, IonLoading, modalController } from "@ionic/vue"
import  v2Datatable from "@/apps/AETC/views/reports/clinic/CustomTableView.vue"
import { v2ColumnDataInterface, v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { AETCReportService } from "@/apps/AETC/services/aetc_report_service"
import DrillPatientIds from '../../../../../components/DrillPatientIds.vue';
import { toDate } from '@/utils/Strs';
import { MultiStepPopupForm } from "@/utils/PopupKeyboard";
import { FieldType } from "@/components/Forms/BaseFormElements";
import { Option } from '@/components/Forms/FieldInterface'
import Validation from "@/components/Forms/validations/StandardValidations"

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
        /**
         * Generates report by start date and end date
         */
         const generate = async () => {
            const report = new AETCReportService()
            report.startDate = startDate.value
            report.endDate = endDate.value
            try {
                const rawReport = (await report.getClinicReport("DISAGGREGATED_DIAGNOSIS"))
                reportData.value = transformObject(rawReport)
            }catch (e){
                console.log(e)
            }
         }

        //csv headers
        const csvheaders = [
            'Diagnosis', 
            '<6 Months> M', 
            '<6 Months> F', 
            '6 Months to < 5 M', 
            '6 Months to < 5 F', 
            '5 to 14 F',
            '5 to 14 M',
            '>14 M',
            '>14 F',
            'Total by gender M',
            'Total by gender F',
            'Total'
        ];

         //table headers and data mapping
         const columns: Array<v2ColumnInterface[]> = [
            [
                {
                    label: "Diagnosis",
                    ref: "",
                    span: {
                        thRowspan: 2,
                    }
                },
                {
                    label: "<6 Months>",
                    ref: "",
                    span: {
                        thColspan: 2,
                    }
                },
                {
                    label: "6 Months to < 5",
                    ref: "",
                    span: {
                        thColspan: 2,
                    }
                },
                {
                    label: "5 to 14",
                    ref: "",
                    span: {
                        thColspan: 2,
                    }
                },
                {
                    label: ">14",
                    ref: "",
                    span: {
                        thColspan: 2,
                    }
                },
                {
                    label: "Total by gender",
                    ref: "",
                    span: {
                        thColspan: 2,
                    }
                },
                {
                    label: "Total",
                    ref: "",
                    span: {
                        thRowspan: 2,
                    }
                },
            ],
            [
                {
                    label: "M",
                    ref: ""
                },
                {
                    label: "F",
                    ref: ""
                },
                {
                    label: "M",
                    ref: ""
                },
                {
                    label: "F",
                    ref: ""
                },
                {
                    label: "M",
                    ref: ""
                },
                {
                    label: "F",
                    ref: ""
                },
                {
                    label: "M",
                    ref: ""
                },
                {
                    label: "F",
                    ref: ""
                },
                {
                    label: "M",
                    ref: ""
                },
                {
                    label: "F",
                    ref: ""
                },
            ],
            [
                {
                    label: "Diagnosis",
                    ref: "data.diagnosis",
                    value: (data: any) => data.diagnosis
                },
                {
                    label: "< 6 months M",
                    ref: "data.< 6 months.M.length",
                    secondaryLabel: "< 6 months Male diagnosed with",
                    value: (data: any) => data.ls_6_months.M.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel} ${data.diagnosis} `, data.ls_6_months.M
                    )
                },
                {
                    label: "<6 months F",
                    ref: "data.ls_6_months.F.length",
                    secondaryLabel: "< 6 months Female diagnosed with",
                    value: (data: any) => data.ls_6_months.F.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel} ${data.diagnosis} `, data.ls_6_months.F
                    )
                },
                {
                    label: "6 months to < 5",
                    ref: "data.i6_months_to_ls_5.M.length",
                    secondaryLabel: "6 months to < 5 Males with",
                    value: (data: any) => data.i6_months_to_ls_5.M.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel} ${data.diagnosis} `, data.i6_months_to_ls_5.M
                    )
                },
                {
                    label: "6 months to < 5",
                    ref: "data.i6_months_to_ls_5.F.length",
                    secondaryLabel: "6 months to < 5 Females with",
                    value: (data: any) => data.i6_months_to_ls_5.F.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel} ${data.diagnosis} `, data.i6_months_to_ls_5.F
                    )
                },
                {
                    label: "5 to 14",
                    ref: "data.i5_to_14.M.length",
                    secondaryLabel: "5 to 14 Males with",
                    value: (data: any) => data.i5_to_14.M.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel} ${data.diagnosis} `, data.i5_to_14.M
                    )
                },
                {
                    label: "5 to 14",
                    ref: "data.i5_to_14.F.length",
                    secondaryLabel: "5 to 14 Females with",
                    value: (data: any) => data.i5_to_14.F.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel} ${data.diagnosis} `, data.i5_to_14.F
                    )
                },
                {
                    label: ">14",
                    ref: "data.gt_14.M.length",
                    secondaryLabel: "Greater than 14 males with",
                    value: (data: any) => data.gt_14.M.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel} ${data.diagnosis} `, data.gt_14.M
                    )
                },
                {
                    label: ">14",
                    ref: "data.gt_14.F.length",
                    secondaryLabel: "Greater than 14 females with",
                    value: (data: any) => data.gt_14.F.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel} ${data.diagnosis} `, data.gt_14.F
                    )
                },
                {
                    label: "Total by gender",
                    ref: "data.total_by_gender.M.length",
                    secondaryLabel: "Total by gender males",
                    value: (data: any) => data.total_by_gender.M.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel} `, data.total_by_gender.M
                    )
                },
                {
                    label: "5 to 14",
                    ref: "data.total_by_gender.F.length",
                    secondaryLabel: "Total by gender females",
                    value: (data: any) => data.total_by_gender.F.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel} `, data.total_by_gender.F
                    )
                },
                {
                    label: "Total",
                    ref: "Total",
                    value: (data: any) => {
                        return [
                            ...data.ls_6_months.M,
                            ...data.ls_6_months.F,
                            ...data.i6_months_to_ls_5.M,
                            ...data.i6_months_to_ls_5.F,
                            ...data.i6_months_to_ls_5.M,
                            ...data.i6_months_to_ls_5.F,
                            ...data.i6_months_to_ls_5.M,
                            ...data.i6_months_to_ls_5.F,
                            ...data.i5_to_14.M,
                            ...data.i5_to_14.F,
                            ...data.gt_14.M,
                            ...data.gt_14.F
                        ].length
                    },
                    tdClick: ({ column, data }: v2ColumnDataInterface) => {
                        const tempTotalArray = [
                            ...data.ls_6_months.M,
                            ...data.ls_6_months.F,
                            ...data.i6_months_to_ls_5.M,
                            ...data.i6_months_to_ls_5.F,
                            ...data.i6_months_to_ls_5.M,
                            ...data.i6_months_to_ls_5.F,
                            ...data.i6_months_to_ls_5.M,
                            ...data.i6_months_to_ls_5.F,
                            ...data.i5_to_14.M,
                            ...data.i5_to_14.F,
                            ...data.gt_14.M,
                            ...data.gt_14.F
                        ]
                        drilldown(`${column.label} `, tempTotalArray)
                    }
                },
            ]
        ]

        const transformObject = (arr: { [key: string]: any }[]): { [key: string]: any }[] => {
            const formatedArray = []
            for(const item of arr){
                const replaced = replaceSpacesWithUnderscoresAndAddI(item)
                formatedArray.push(replaced)
            }
            return formatedArray
        };


        const replaceSpacesWithUnderscoresAndAddI = (obj: any) => {
            const newObj: any = {};

            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    let newKey = key.replace(/ /g, '_');
                    const value = obj[key];

                    // Check if the newKey starts with a number and if so, add 'i' at the beginning
                    if (/^\d/.test(newKey)) {
                        newKey = 'i' + newKey;
                    }

                    // Replace symbols within the newKey
                    newKey = newKey.replace(/[<>&]/g, (match) => {
                        switch (match) {
                            case '<':
                                return 'ls';
                            case '>':
                                return 'gt';
                            case '&':
                                return 'amp';
                            // Add more cases for other symbols as needed
                            default:
                                return match;
                        }
                    });

                    newObj[newKey] = typeof value === 'object' && !Array.isArray(value)
                        ? replaceSpacesWithUnderscoresAndAddI(value)
                        : value;
                }
            }

            return newObj;
        };

        const drilldown = async (title: string, patientIdentifiers: number[]) => {
            if (patientIdentifiers.length <= 0) {return;}
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
         * Loads a dialogue to allow users to configure start and end date
         */
         const configure = () => MultiStepPopupForm([
            {
                id: "start_date",
                helpText: "Start Date",
                type: FieldType.TT_FULL_DATE,
                validation: (val: Option) => Validation.required(val),
                computedValue: (v: Option) => v.value
            },
            {
                id: "end_date",
                helpText: "End Date",
                type: FieldType.TT_FULL_DATE,
                validation: (val: Option) => Validation.required(val),
                computedValue: (v: Option) => v.value
            },
        ], 
        (f: any, c: any) => {
            startDate.value = c.start_date
            endDate.value = c.end_date
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
            csvheaders,
            generate,
            configure
         }
    }
})

</script>
