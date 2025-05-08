<template>
    <ion-page>
        <v2Datatable :icon-url="logo" :subtitle="period" title="National ID utilization report" report-prefix="Clinic" :columns="columns"
            :onConfigure="configure" :columnData="reportData" :rowsPerPage="100" :onRefresh="generate" />
    </ion-page>
</template>

<script lang='ts' setup>
import { IonPage } from "@ionic/vue"
import { onMounted, ref } from 'vue'
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { ClinicReportService } from '@/apps/ART/services/reports/clinic_report_service'
import { DateSelection } from "@/utils/ReportDateSelectionPrompt";
import Img from "@/utils/Img";
import { showArtDrilldown, wrapGeneration } from "@/utils/v2utils";

const logo = Img('reports.png')
const reportData = ref([])
const period = ref('')
const report = new ClinicReportService()

const drill = (refData: any) => ({
    ...refData,
    toValue: (data: any) => data.length,
    tdClick: (row: any) => {
        showArtDrilldown({
            title: `${row.data.age_group} ${row.column.label}`,
            subtitle: period.value,
            patientIdentifiers: row.refData,
        })
    }
})

const columns: Array<v2ColumnInterface[]> = [[
    { label: 'Age group', ref: "age_group" },
    { label: 'Gender', ref: "gender"},
    drill({ label: "Total Clients visits", ref: 'total_visits' }),
    drill({ label: 'Clients with NID', ref: "nid_clients"}),
    drill({ label: 'New NID registered', ref: "new_nid"}),
]]

const generate = () => wrapGeneration(async () => {
    reportData.value = []
    reportData.value = await report.getNidUtilizationReport()
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
onMounted(() => !reportData.value.length && configure())
</script>