<template>
    <ion-page>
        <v2Datatable
            title="TX HIV HTN Report"
            :icon-url="logo"
            :subtitle="period"
            :columns="columns"
            :columnData="reportData"
            :rowsPerPage="50" 
            :onConfigure="configure"
            :onRefresh="() => generate()"
            report-prefix="PEPFAR"
        />
    </ion-page>
</template>

<script lang='ts'>
import { IonPage, modalController } from "@ionic/vue"
import { defineComponent, onMounted, ref } from 'vue'
import  v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { DateSelection } from '@/utils/ReportDateSelectionPrompt';
import { toastWarning } from '@/utils/Alerts';
import { ClinicReportService } from "@/apps/ART/services/reports/clinic_report_service";
import Img from "@/utils/Img";
import { wrapGeneration } from "@/utils/v2utils";
import ArtDrilldown from "@/apps/ART/Components/ArtDrilldown.vue";

export default defineComponent({
    components: { 
        IonPage,
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
                tdClick: (row: any) => drilldown(`${row.column.label}`, row.refData)
            }
        }
        const columns: Array<v2ColumnInterface[]> = [
            [
                { label: "#", ref: "index" },
                { label: "Age group", ref: 'age_group' },
                { label: "Gender", ref: 'gender' },
                toDrillColumn("TX CURR", "tx_curr"),
                toDrillColumn("Ever Diagnosed HTN", "ever_diagnosed_htn"),
                toDrillColumn("Screened for HTN", "screened_for_htn"),
                toDrillColumn("Newly diagnosed HTN", "newly_diagnosed_htn"),
                toDrillColumn("Controlled HTN", "controlled_htn")
            ]
        ]

        const drilldown = async (title: string, patients: Array<any>) => {
            if(patients.length) {
                (await modalController.create({
                    component: ArtDrilldown,
                    backdropDismiss: false,
                    cssClass: 'large-modal',
                    componentProps: {
                        title,
                        subtitle: period,
                        patientIdentifiers: patients,
                        onFinish: () => modalController.getTop().then(v => v && modalController.dismiss())
                    }
                })).present();
            }
        }

        const generate = () => wrapGeneration(async () => {
            if (!(report.startDate && report.endDate)) return toastWarning('Start date and end date required!')
            reportData.value = []
            const res = await report.getTxHtnReport()
            const data = Object.keys(res).reduce((a: any, k) => {
                if (/unknown|all/i.test(k)) return a
                a.M.push({ age_group: k, gender: 'Male', ...res[k]['M'] })
                a.F.push({ age_group: k, gender: 'Female', ...res[k]['F'] })
                return a
            },{ F: [], M: [] })
            const final: any = [
                ...data.F, 
                ...data.M,
                { age_group: 'All', gender: "Male", ... res.All.Male },
                { age_group: 'All', gender: "FP", ...res.All.FP },
                { age_group: 'All', gender: 'FNP', ...res.All.FNP },
                { age_group: 'All', gender: 'FBf', ...res.All.FBf }
            ]
            reportData.value = final.map((d: any, i: any) => ({index: i+1, ...d}))
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
