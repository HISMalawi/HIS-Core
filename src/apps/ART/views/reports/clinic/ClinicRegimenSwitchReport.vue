<template>
    <ion-page>
        <v2Datatable default-sort-order="asc" default-sorted-column="arv_number" :icon-url="logo" title="Clinic Regimen Switch Report" report-prefix="Clinic" :subtitle="period" :columns="columns"
            :columnData="reportData" :rowsPerPage="50" :onConfigure="configure" :onRefresh="generate" />
    </ion-page>
</template>

<script lang='ts' setup>
import { IonPage } from "@ionic/vue"
import { onMounted, ref } from 'vue'
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { toastInfo, toastWarning } from '@/utils/Alerts';
import { toDate, formatGender } from "@/utils/Strs";
import { RegimenReportService } from "@/apps/ART/services/reports/regimen_report_service"
import { DateSelection } from "@/utils/ReportDateSelectionPrompt";
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import Img from "@/utils/Img";
import { addArvColumn, wrapGeneration } from "@/utils/v2utils";

const logo = Img('reports.png')
const reportData = ref<any>([])
const period = ref('')
const report = new RegimenReportService()
const columns: Array<v2ColumnInterface[]> = [[
    addArvColumn(),
    { label: "Gender", ref: "gender", toValue: (val) => formatGender(val) },
    { label: "DOB", ref: "birthdate", toValue: (val) => toDate(val) },
    { label: "ART start date", ref: "art_start_date", toValue: (val) => toDate(val) },
    { label: "Weight", ref: "current_weight"},
    { label: "Prev.Reg", ref: "previous_regimen" },
    { label: "Curr.Reg", ref: "current_regimen" },
    {
        label: "ARVs",
        ref: "medication",
        toValue: (data) => data.map((d: any) => `${d.medication} (${d.quantity})`).join(', ')
    },
    { label: 'Curr.reg dispensed', ref: "last_dispensation_date", toValue: (val) => toDate(val) }
]]

const generate = () => wrapGeneration(async () => {
    if (!(report.startDate && report.endDate)) return toastWarning('Start date and end date required!')
    reportData.value = []
    const res = await report.getRegimenSwitchReport(false);
    reportData.value = Object.values(res).map((d: any) => ({ 
        ...d, last_dispensation_date: d.medication.reduce((_: any, c: any) => c.start_date, '') 
    }))
    if (reportData.value.length <= 0) toastInfo("Report complete but no data!", 3000)
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