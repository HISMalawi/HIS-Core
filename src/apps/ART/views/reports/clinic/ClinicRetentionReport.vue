<template>
    <ion-page>
        <v2Datatable :icon-url="logo" title="Clinic Retention report" report-prefix="Clinic" :subtitle="period" :columns="columns"
            :columnData="reportData" :rowsPerPage="100" :onConfigure="configure" :onRefresh="generate" />
    </ion-page>
</template>

<script lang='ts' setup>
import { IonPage } from "@ionic/vue"
import { onMounted, ref } from 'vue'
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { toastWarning } from '@/utils/Alerts';
import { PatientReportService } from "@/apps/ART/services/reports/patient_report_service"
import { DateSelection } from "@/utils/ReportDateSelectionPrompt";
import { AGE_GROUPS } from "@/apps/ART/services/reports/patient_report_service"
import Img from "@/utils/Img";
import { showArtDrilldown, wrapGeneration } from "@/utils/v2utils";

const logo = Img('reports.png')
const report = new PatientReportService()
const reportData = ref<any>([])
const period = ref('')

const toDrillColumn = (label: string, ref: string) => ({
    label, ref,
    toValue: (data: any) => data.length,
    tdClick: (row: any) => showArtDrilldown({
        title: `${row.column.label}`,
        subtitle: period.value,
        patientIdentifiers: row.refData.map((d: any) => d.patient_id)
    })
})

const columns: Array<v2ColumnInterface[]> = [[
    { label: "Age group", ref: "age_group" },
    { label: "Gender", ref: "gender" },
    toDrillColumn("Initiated one month", "initiated_one_month"),
    toDrillColumn("Completed one month", "completed_one_month"),
    toDrillColumn("Initiated Three months", "initiated_three_months"),
    toDrillColumn("Completed Three months","completed_three_months"),
    toDrillColumn("Initiated Six months", "initiated_six_months"),
    toDrillColumn("Completed Six months", "completed_six_months")
]]

const generate = () => wrapGeneration(async () => {
    if (!(report.startDate && report.endDate)) return toastWarning('Start date and end date required!')
    reportData.value = []
    const res = (await report.getClientRentention()) ?? {};
    const data = ([...AGE_GROUPS, 'Unknown']).reduce((a: any, group: string) => {
        const getData = (gender: "M" | "F") => {
            const indicator = (month: "1"|"3"|"6", indicator: "all" | "retained") => (
                res?.[month]?.[indicator]||[]).filter((a: any) => a.age_group === group && a.gender === gender
            )
            return {
                initiated_one_month: indicator("1", "all"),
                completed_one_month: indicator("1", "retained"),
                initiated_three_months: indicator("3", "all"),
                completed_three_months: indicator("3", "retained"),
                initiated_six_months: indicator("6", "all"),
                completed_six_months: indicator("6", "retained")
            }
        }
        a.M.push({ age_group: group, gender: "Male", ...getData("M") })
        a.F.push({ age_group: group, gender: "Female", ...getData("F") })
        return a
    }, { M: [], F: [] })
    reportData.value = [ ...data.F, ...data.M ]
})

/**
 * Loads a dialogue to allow users to configure start and end date
 */
const configure = () => DateSelection({
    onFinish: (sDate: string, eDate: string, periodstr: string, occupation: string) => {
        if (occupation) report.setOccupation(occupation)
        report.startDate = sDate
        report.endDate = eDate
        period.value = `${periodstr}`
        generate()
    }
})

/**
 * Initialization code when the report is empty!
 */
onMounted(() => !reportData.value.length && configure())
</script>