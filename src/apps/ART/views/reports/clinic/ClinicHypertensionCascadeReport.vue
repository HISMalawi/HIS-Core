<template>
    <ion-page>
        <v2Datatable
            title="Hypertension Cascade Report"
            :icon-url="logo"
            :subtitle="period"
            :columns="columns"
            :columnData="reportData"
            :rowsPerPage="50" 
            :onConfigure="configure"
            :onRefresh="() => generate()"
            report-prefix="Clinic"
        />
    </ion-page>
</template>

<script lang='ts'>
import { IonPage, IonLoading, modalController } from "@ionic/vue"
import { defineComponent, onMounted, ref } from 'vue'
import  v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { DateSelection } from '@/utils/ReportDateSelectionPrompt';
import { toastWarning } from '@/utils/Alerts';
import { ClinicReportService } from "@/apps/ART/services/reports/clinic_report_service";
import Img from "@/utils/Img";
import { wrapGeneration } from "@/utils/v2utils";
import HypertensionDrilldown from "@/apps/ART/Components/HypertensionDrilldown.vue";

export default defineComponent({
    components: { 
        IonPage,
        IonLoading,
        v2Datatable
    },
    setup() {
        const logo = Img('reports.png')
        const reportData = ref([])
        const period = ref('')
        const report = new ClinicReportService()
        const toDrillColumn = (label: string, ref: string) => {
            return {
                label,
                ref,
                toValue: (data: any) => data.length,
                tdClick: async (row: any) => {
                    if(row.refData.length) {
                        (await modalController.create({
                            component: HypertensionDrilldown,
                            backdropDismiss: false,
                            cssClass: 'large-modal',
                            componentProps: {
                                title: row.column.label,
                                subtitle: period,
                                patients: row.refData,
                                onFinish: () => modalController.getTop().then(v => v && modalController.dismiss())
                            }
                        })).present();
                    }
                }
            }
        }
        const columns: Array<v2ColumnInterface[]> = [
            [
                { label: "#", ref: "index" },
                { label: "Age group", ref: 'age_group' },
                { label: "Gender", ref: 'gender' },
                toDrillColumn("Due for BP screening", "due_screening"),
                toDrillColumn("Screened for HTN", "screened"),
                toDrillColumn("Normal <140/<90", "normal_reading"),
                toDrillColumn("Mild 140-159/90-99", "mild_reading"),
                toDrillColumn("Moderate 160-180/100-110", "moderate_reading"),
                toDrillColumn("Severe >180/>110", "severe_reading"),
                toDrillColumn("Hydrochlorothiazide 25mg", "hydrochlorothiazide_25mg"),
                toDrillColumn("Amlodipine 5mg", "amlodipine_5mg"),
                toDrillColumn("Amlodipine 10 mg", "amlodipine_10mg"),
                toDrillColumn("Captopril 25mg", "captopril_25mg"),
                toDrillColumn("Captopril 6-25mg", "captopril_6_25mg"),
                toDrillColumn("Captopril 12-5mg", "captopril_12_5mg"),
                toDrillColumn("Captopril 50mg", "captopril_50mg"),
                toDrillColumn("Enalapril 5 mg", "enalapril_5mg"),
                toDrillColumn("Enalapril 10mg", "enalapril_10mg"),
                toDrillColumn("Atenolol 50mg", "atenolol_50mg"),
                toDrillColumn("Atenolol 100mg", "atenolol_100mg"),
                toDrillColumn("Nifedipine 10mg", "nifedipine_10mg"),
                toDrillColumn("Nifedipine 20mg", "nifedipine_20mg"),
                toDrillColumn("Total (regimen)", "total_regimen")
            ]
        ]

        const generate = () => wrapGeneration(async () => {
            if (!(report.startDate && report.endDate)) return toastWarning('Start date and end date required!')
            reportData.value = []
            const res = await report.getHypertensionReport(true)
            const data = Object.keys(res).reduce((a: any, k) => {
                a.M.push({ age_group: k, gender: 'Male', ...res[k]['M']})
                a.F.push({ age_group: k, gender: 'Female', ...res[k]['F']})
                return a
            }, { F: [], M: [] })
            reportData.value = data.F.concat(data.M).map((d: any, i: any) => ({index: i+1, ...d}))
        })

        /**
         * Loads a dialogue to allow users to configure start and end date
         */
         const configure = () => DateSelection({
            onFinish: (sDate: string, eDate: string, periodstr: string, occupation: string) => {
                if (occupation) report.setOccupation(occupation)
                period.value = `${periodstr}`
                report.startDate = sDate
                report.endDate = eDate
                generate()
            }
        })

        /**
         * Initialization code when the report is empty!
        */
        onMounted(() => configure())

        return {
            logo,
            reportData,
            configure,
            generate,
            columns,
            period
        }
    }
})
</script>
