<template>
  <ion-page>
    <v2Datatable :icon-url="logo" title="Active clients with adverse outcomes" report-prefix="Clinic"
      :columns="columns" :columnData="reportData" :rowsPerPage="50" :onRefresh="generate" />
  </ion-page>
</template>

<script lang='ts' setup>
import { IonPage } from "@ionic/vue"
import { onMounted, ref } from 'vue'
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { toDate } from "@/utils/Strs";
import { PatientReportService } from '@/apps/ART/services/reports/patient_report_service'
import Img from "@/utils/Img";
import { wrapGeneration } from "@/utils/v2utils";

const logo = Img('reports.png')
const reportData = ref([])
const report = new PatientReportService()
const columns: Array<v2ColumnInterface[]> = [[
  { label: "Filing#", ref: "filing_number" },
  { label: "Outcome", ref: 'outcome', },
  { label: "Outcome date", ref: 'outcome_date', toValue: (val) => `${toDate(val)}` }
]]

const generate = () => wrapGeneration(async () => {
  reportData.value = []
  reportData.value = await report.getArchivingCandidates();
})

/**
 * Initialization code when the report is empty!
*/
onMounted(() => generate())
</script>
