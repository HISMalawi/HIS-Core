<template>
  <ion-page>
    <ion-loading :is-open="isLoading" message="Please wait..." />
    <v2Datatable title="Clinic Outcomes Report" :subtitle="period" :columns="columns" :columnData="reportData" :rowsPerPage="15" :onConfigure="configure" :onRefresh="() => generate()" report-prefix="Clinic" />
  </ion-page>
</template>

<script lang='ts' setup>
import { IonPage, IonLoading } from "@ionic/vue"
import { computed, onMounted, ref } from 'vue'
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { DateSelection } from '@/utils/ReportDateSelectionPrompt';
import { toastDanger, toastWarning } from '@/utils/Alerts';
import { formatGender, toDate } from "@/utils/Strs";
import { SpineReportService } from "@/apps/SPINE/services/spine_report_service";

const reportData = ref<Array<any>>([])
const period = ref('')
const isLoading = ref(false)
const report = new SpineReportService();
const columns = computed<Array<Array<v2ColumnInterface>>>(() => [[
  {
    label: "Age Group",
    ref: 'age_group',
  },
  {
    label: "Gender",
    ref: 'gender',
  },
  {
    label: "Alive",
    ref: 'alive',
  },
  {
    label: "Died",
    ref: 'gender',
    value: (data) => formatGender(data.gender)
  },
  {
    label: "Referred Within",
    ref: 'birthdate',
    value: (data) => toDate(data.birthdate)
  },
  {
    label: "Transferred Out",
    ref: 'order_date',
    value: (data) => toDate(data.order_date)
  },
]])

/**
 * Generates report by start date and end date
 */
const generate = async () => {
  if (!(report.startDate && report.endDate)) {
    return toastWarning('Start date and end date required!')
  }
  isLoading.value = true
  reportData.value = []
  try {
    reportData.value = await report.getOutcomesReport()
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
    period.value = `Period (${periodstr})`
    report.startDate = sDate
    report.endDate = eDate
    generate()
  }
})

/**
 * Initialization code when the report is empty!
*/
onMounted(() => configure())
</script>
