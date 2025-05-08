<template>
    <ion-page>
        <v2Datatable default-sort-order="asc" default-sorted-column="arv_number" :icon-url="logo" title="Clinic Regimen Report" report-prefix="Clinic" :subtitle="period" :columns="columns"
            :columnData="reportData" :rowsPerPage="50" :onConfigure="configure" :onRefresh="generate" />
    </ion-page>
</template>

<script lang='ts' setup>
import { IonPage } from "@ionic/vue"
import { onMounted, ref } from 'vue'
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { toastWarning } from '@/utils/Alerts';
import { toDate, formatGender } from "@/utils/Strs";
import { RegimenReportService } from "@/apps/ART/services/reports/regimen_report_service"
import { DateSelection } from "@/utils/ReportDateSelectionPrompt";
import Img from "@/utils/Img";
import { addArvColumn, wrapGeneration } from "@/utils/v2utils";

const logo = Img('reports.png')
const reportData = ref<any>([])
const period = ref('')
const report = new RegimenReportService()
report.setReportType('moh')

const columns: Array<v2ColumnInterface[]> = [[
    addArvColumn(),
    { label: "Gender", ref: "gender", toValue: (val) => formatGender(val) },
    { label: "DOB", ref: 'birthdate', toValue: (val) => toDate(val) },
    { label: "ART start date", ref: "art_start_date", toValue: (val) => toDate(val) },
    { label: "Weight(Kg)", ref: "current_weight" },
    { label: "Curr.Reg", ref: "current_regimen" },
    { 
        label: "ARVs", 
        ref: "medication",
        toValue: (val) => val.map((d: any) => `${d.medication} (${d.quantity})`).join(', ')
    },
    { label: "Curr.reg dispensed", ref: "last_dispensation_date", toValue: (val) => toDate(val) },
    { label: "VL result", ref: "vl_result" },
    { label: "Date of VL result", ref: "vl_result_date", toValue: (val) => toDate(val??"") }
]]

const generate = () => wrapGeneration(async () => {
    if (!(report.startDate && report.endDate)) return toastWarning('Start date and end date required!')
    reportData.value = []
    const res = await report.getRegimenReport();
    reportData.value = Object.values(res).map((d: any) => {
        return { ...d, last_dispensation_date: d.medication.reduce((a: any, c: any) => c.start_date, '') }
    })
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