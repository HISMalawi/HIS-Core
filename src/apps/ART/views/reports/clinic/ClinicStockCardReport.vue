<template>
    <ion-page>
        <v2Datatable :icon-url="logo" title="HIV Stock report" report-prefix="Clinic" :subtitle="period" :columns="columns"
            :columnData="reportData" :rowsPerPage="50" :onConfigure="configure" :onRefresh="generate" />
    </ion-page>
</template>

<script lang='ts' setup>
import { IonPage } from "@ionic/vue"
import { onMounted, ref } from 'vue'
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { toastWarning } from '@/utils/Alerts';
import { toNumString } from "@/utils/Strs";
import { StockReportService } from "@/apps/ART/services/reports/stock_report_service"
import { DateSelection } from "@/utils/ReportDateSelectionPrompt";
import Img from "@/utils/Img";
import { wrapGeneration } from "@/utils/v2utils";

const logo = Img('reports.png')
const reportData = ref([])
const period = ref('')
const report = new StockReportService()
const columns: Array<v2ColumnInterface[]> = [[
    { label: "Medication", ref: "drug_name" },
    { label: "Pack Size", ref: "pack_size" },
    { label: "Opening Stock (Tins/Pallets)", ref: "opening_balance", toValue: (val) => toNumString(val) },
    { label: "Quantity Dispensed (Tins/Pallets)", ref: "dispensed_quantity", toValue: (val) => toNumString(val||0) },
    { label: "Stock on hand (Tins/Pallets)", ref: "closing_balance", toValue: (val) => toNumString(val) }
]]

const generate = () => wrapGeneration(async () => {
    if (!(report.startDate && report.endDate)) return toastWarning('Start date and end date required!')
    reportData.value = []
    reportData.value = await report.getStockCardReport();
})

/**
 * Loads a dialogue to allow users to configure start and end date
 */
const configure = () => DateSelection({
    onFinish: (sDate: string, eDate: string, periodstr: string) => {
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