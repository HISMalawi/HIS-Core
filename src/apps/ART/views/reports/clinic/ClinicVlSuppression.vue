<template>
    <ion-page>
        <v2Datatable
            title="Clinic VL Suppression Report"
            :icon-url="logo"
            :subtitle="period"
            :columns="columns"
            :columnData="reportData"
            :rowsPerPage="30"
            :onConfigure="configure"
            :onRefresh="() => generate()"
            report-prefix="Clinic"
        />
    </ion-page>
</template>

<script lang='ts'>
import { IonPage } from "@ionic/vue"
import { defineComponent, onMounted, ref } from 'vue'
import  v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { DateSelection } from '@/utils/ReportDateSelectionPrompt';
import { toastWarning } from '@/utils/Alerts';
import { ClinicReportService } from "@/apps/ART/services/reports/clinic_report_service";
import Img from "@/utils/Img";
import { showArtDrilldown, wrapGeneration } from "@/utils/v2utils";

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
                ref,
                label,
                toValue: (data: any) => data.length,
                tdClick: (row: any) => showArtDrilldown({
                    title: `${row.column.label}`,
                    subtitle: period.value,
                    patientIdentifiers: row.refData,
                })
            }
        }
        const columns: Array<v2ColumnInterface[]> = [
            [
                { label: "Regimen", ref: "regimen" },
                toDrillColumn("Due for VL", "due_for_vl"),
                toDrillColumn("Sample drawn", "drawn"),
                toDrillColumn("High vl (>=1000 copies))", "high_vl"),
                toDrillColumn("Low vl (<1000 copies))", "low_vl")
            ]
        ]

        const generate = () => wrapGeneration(async () => {
            if (!(report.startDate && report.endDate)) return toastWarning('Start date and end date required!')
            reportData.value = []
            reportData.value = await report.getVlSuppressionReport()
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
