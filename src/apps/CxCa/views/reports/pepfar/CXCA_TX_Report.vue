<template>
    <ion-page>
        <ion-loading :is-open="isLoading" message="Please wait..."/>
        <v2Datatable
            title="CXCA TX Report"
            :subtitle="period"
            :columns="columns"
            :columnData="reportData"
            :rowsPerPage="25"
            :onConfigure="configure"
            :csvQuarter="csvQuarter"
            :onRefresh="() => generate()"
        />
    </ion-page>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { IonPage, IonLoading, modalController } from "@ionic/vue"
import  v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
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
                    label: "Cryotherapy",
                    ref: 'first_time_screened_cryotherapy',
                    secondaryLabel: "1st screened (cryotherapy)",
                    value: (data: any) => data.first_time_screened.cryotherapy.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.first_time_screened.cryotherapy
                    )
                },
                {
                    label: "Thermocoagulation",
                    ref: 'first_time_screened_thermocoagulation',
                    secondaryLabel:  "1st time screened (Thermocoagulation)",
                    value: (data: any) => data.first_time_screened.thermocoagulation.length,
                    tdClick: ({ column,data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.first_time_screened.thermocoagulation
                    )
                },
                {
                    label: "LEEP",
                    ref: 'first_time_screened_leep',
                    secondaryLabel: "1st screened(leep)",
                    value: (data: any) => data.first_time_screened.leep.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.first_time_screened.leep
                    )
                },
                {
                    label: "Cryotherapy",
                    ref: 'post_treatment_followup_cryotherapy',
                    secondaryLabel: "Post-treatment followup(Cryotherapy)",
                    value: (data: any) => data.post_treatment_followup.cryotherapy.length,
                    tdClick: ({column, data}: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.post_treatment_followup.cryotherapy
                    )
                },
                {
                    label: "Thermocoagulation",
                    ref: "post_treatment_followup_thermocoagulation",
                    secondaryLabel: "Post-treatment followup (Thermocoagulation)",
                    value: (data: any) => data.post_treatment_followup.thermocoagulation.length,
                    tdClick: ({column, data}: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.post_treatment_followup.thermocoagulation
                    )
                },
                {
                    label: "LEEP",
                    ref: "post_treatment_followup_leep",
                    secondaryLabel: "Post-treatment followup (leep)",
                    value: (data: any) => data.post_treatment_followup.leep.length,
                    tdClick: ({ column, data}: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.post_treatment_followup.leep
                    )
                },
                {
                    label: "Cryotherapy",
                    ref: 'rescreened_after_prev_visit_cryotherapy',
                    secondaryLabel: "Rescreen after prev visit (Cryotherapy)",
                    value: (data: any) => data.rescreened_after_prev_visit.cryotherapy.length,
                    tdClick: ({column, data}: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.rescreened_after_prev_visit.cryotherapy
                    )
                },
                {
                    label: "Thermocoagulation",
                    ref: 'rescreened_after_prev_visit_thermocoagulation',
                    secondaryLabel: "Rescreen after prev visit (Thermocoagulation)",
                    value: (data: any) => data.rescreened_after_prev_visit.thermocoagulation.length,
                    tdClick: ({column, data}: v2ColumnDataInterface) => drilldown(
                        `${data.age_group} ${column.secondaryLabel}`, data.rescreened_after_prev_visit.thermocoagulation
                    )
                },
                {
                    label: "LEEP",
                    ref: 'rescreened_after_prev_visit_leep',
                    secondaryLabel: "Rescreen after prev visit (leep)",
                    value: (data: any) => data.rescreened_after_prev_visit.leep.length,
                    tdClick: ({column, data}: v2ColumnDataInterface) => drilldown(
                       `${data.age_group} ${column.secondaryLabel}`, data.rescreened_after_prev_visit.leep
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
                reportData.value = (await report.getClinicReport('CXCA TX'))
                    .slice(5)
                    .map((data: any, index: any) => {
                        data.index = index + 1
                        data.gender = "Female"
                        return data
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

        return  {
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