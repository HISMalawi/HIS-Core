<template>
    <ion-page>
        <ion-loading :is-open="isLoading" message="Please wait..." />
        <v2Datatable 
            title="CXCA SCRN Report" 
            :csvQuarter="csvQuarter"
            :subtitle="period" 
            :columns="columns" 
            :columnData="reportData"
            :rowsPerPage="25" 
            :onConfigure="configure" :onRefresh="() => generate()" />
    </ion-page>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { IonPage, IonLoading, modalController } from "@ionic/vue"
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { v2ColumnDataInterface, v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { CxCaReportService } from "@/apps/CxCa/services/reports/cxca_report_service"
import { DateSelection } from "@/utils/ReportDateSelectionPrompt"
import { toastDanger, toastWarning } from '@/utils/Alerts';
import DrillPatientIds from '../../../../../components/DrillPatientIds.vue';
import { toDate } from '@/utils/Strs';

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
         * Table column definition and value mapping
         */
        const columns: Array<v2ColumnInterface[]> = [
            [
                {
                    label: "#",
                    ref: "index",
                    span: {
                        thRowspan: 2
                    }
                },
                {
                    label: "Age group",
                    ref: "age_group",
                    span: {
                        thRowspan: 2,
                    }
                },
                {
                    label: "Gender",
                    ref: "gender",
                    exportable: false,
                    span: {
                        thRowspan: 2
                    }
                },
                {
                    label: "1st time screened",
                    ref: "",
                    span: {
                        thColspan: 3
                    }
                },
                {
                    label: "Rescreened after previous negative",
                    ref: "",
                    span: {
                        thColspan: 3
                    }
                },
                {
                    label: "Post-treatment follow-up",
                    ref: "",
                    span: {
                        thColspan: 3
                    }
                }
            ],
            [
                {
                    label: "Negative",
                    ref: 'first_time_screened_negative',
                    secondaryLabel: "1st screened (Negative)",
                    value: (data: any) => data.first_time_screened.negative.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.first_time_screened.negative
                    )
                },
                {
                    label: "Positive",
                    ref: 'first_time_screened_positive',
                    secondaryLabel: "1st time screened (Positive)",
                    value: (data: any) => data.first_time_screened.positive.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.first_time_screened.positive
                    )
                },
                {
                    label: "Suspected Cancer",
                    ref: 'first_time_screened_suspected_cancer',
                    secondaryLabel: "1st screened(Suspected cancer)",
                    value: (data: any) => data.first_time_screened.suspected.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.first_time_screened.suspected
                    )
                },
                {
                    label: "Negative",
                    ref: 'rescreened_after_prev_visit_negative',
                    secondaryLabel: "Rescreen after prev visit (Negative)",
                    value: (data: any) => data.rescreened_after_prev_visit.negative.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.rescreened_after_prev_visit.negative
                    )
                },
                {
                    label: "Positive",
                    ref: 'rescreened_after_prev_visit_positive',
                    secondaryLabel: "Rescreen after prev visit (Positive)",
                    value: (data: any) => data.rescreened_after_prev_visit.positive.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.rescreened_after_prev_visit.positive
                    )
                },
                {
                    label: "Suspected cancer",
                    ref: 'rescreened_after_prev_visit_suspected',
                    secondaryLabel: "Rescreen after prev visit (Suspected)",
                    value: (data: any) => data.rescreened_after_prev_visit.suspected.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.rescreened_after_prev_visit.suspected
                    )
                },
                {
                    label: "Negative",
                    ref: 'post_treatment_followup_negative',
                    secondaryLabel: "Post-treatment followup(Negative)",
                    value: (data: any) => data.post_treatment_followup.negative.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.post_treatment_followup.negative
                    )
                },
                {
                    label: "Positive",
                    ref: "post_treatment_followup_positive",
                    secondaryLabel: "Post-treatment followup (Positive)",
                    value: (data: any) => data.post_treatment_followup.positive.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.post_treatment_followup.positive
                    )
                },
                {
                    label: "Suspected cancer",
                    ref: "post_treatment_followup_suspected",
                    secondaryLabel: "Post-treatment followup (Suspected)",
                    value: (data: any) => data.post_treatment_followup.suspected.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.post_treatment_followup.suspected
                    )
                }
            ]
        ]

        /**
         * Generates report by start date and end date
         */
        const generate = async () => {
            if (!(startDate.value && endDate.value)) return toastWarning('Start date and end date required!')
            isLoading.value = true
            reportData.value = []
            const report = new CxCaReportService()
            report.startDate = startDate.value
            report.endDate = endDate.value
            try {
                reportData.value = (await report.getClinicReport('CXCA SCRN'))                    
                    .slice(5)
                    .map((data: any, index: any) => {
                        data.index = index + 1
                        data.gender = "Female"
                        return data
                    })
                const aggregateIndicators = (indicator: 
                    'first_time_screened' |
                    'post_treatment_followup' | 
                    'rescreened_after_prev_visit') => {
                        const getCounts = (statusIndicator: 'positive' | 'negative' | 'suspected') => {
                            return reportData.value.reduce((totals: any, record: any) => {
                                return totals.concat(record[indicator][statusIndicator] || [])
                            }, [])
                        }
                        return {
                            positive: getCounts('positive'),
                            negative: getCounts('negative'),
                            suspected: getCounts('suspected')
                        }
                }
                reportData.value.push({ 
                    age_group : 'All',
                    gender: 'Female',
                    index: reportData.value.length + 1,
                    first_time_screened: aggregateIndicators('first_time_screened'),
                    post_treatment_followup: aggregateIndicators('post_treatment_followup'),
                    rescreened_after_prev_visit: aggregateIndicators('rescreened_after_prev_visit')

                })
            } catch (e) {
                toastDanger("Unable to generate report!")
            }
            isLoading.value = false
        }

        /**
         * Loads a dialogue to allow users to configure start and end date
         */
        const configure = () => DateSelection({
            onFinish: (sDate: string, eDate: string, periodstr: string) => {
                startDate.value = sDate
                endDate.value = eDate
                period.value = `Period (${periodstr})`
                csvQuarter.value = `${toDate(startDate.value)} to ${toDate(endDate.value)}`
                generate()
            }
        })

        /**
         * Initialization code when the report is empty!
         */
        onMounted(() => !reportData.value.length && configure())

        return {
            columns,
            isLoading,
            reportData,
            period,
            csvQuarter,
            generate,
            configure
        }
    }
})
</script>