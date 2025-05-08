<template>
  <ion-page>
    <v2Datatable 
      title="Clinic Discrepancy Report"
      :icon-url="logo"
      report-prefix="Clinic"
      :subtitle="period" 
      :columns="columns" 
      :columnData="reportData" 
      :rowsPerPage="50" 
      :onConfigure="configure" 
      :onRefresh="generate" 
    />
  </ion-page>
</template>

<script lang='ts' setup>
import { IonPage } from "@ionic/vue"
import { onMounted, ref } from 'vue'
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { toastWarning } from '@/utils/Alerts';
import { toDate, toNumString } from "@/utils/Strs";
import { StockReportService } from "@/apps/ART/services/reports/stock_report_service";
import { DateSelection } from "@/utils/ReportDateSelectionPrompt";
import Img from "@/utils/Img";
import { wrapGeneration } from "@/utils/v2utils";

const reportData = ref([])
const logo = Img('reports.png')
const period = ref('')
const report = new StockReportService()
const columns: Array<v2ColumnInterface[]> = [[
  {
    label: "Drug Count Date",
    ref: 'verification_date',
    toValue: (val) => `${toDate(val)}`
  },
  {
    label: "Drug Name",
    ref: 'short_name',
  },
  {
    label: "Expected Count",
    ref: 'expected_quantity',
    toValue: (val) => toNumString(val)
  },
  {
    label: "Verified Count",
    ref: 'current_quantity',
    toValue: (val) => toNumString(val)
  },
  {
    label: "Difference",
    ref: 'difference',
    toValue: (val) => toNumString(val)
  },
  {
    label: "Reason",
    ref: 'variance_reason',
  }
]]

const generate = () => wrapGeneration(async () => {
  if (!(report.startDate && report.endDate)) return toastWarning('Start date and end date required!')
  reportData.value = []
  reportData.value = await report.getDiscrepancyReport();
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
