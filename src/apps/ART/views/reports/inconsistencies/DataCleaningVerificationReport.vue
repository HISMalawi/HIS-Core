<template>
    <ion-page>
      <ion-loading :is-open="isLoading" message="Please wait..." />
      <v2Datatable title="Data cleaning supervision history" report-prefix="Data management"
        :columns="columns" :columnData="reportData" :rowsPerPage="20" :onRefresh="generate" />
    </ion-page>
  </template>
  
  <script lang='ts' setup>
  import { IonPage, IonLoading } from "@ionic/vue"
  import { onMounted, ref } from 'vue'
  import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
  import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
  import { toastDanger } from '@/utils/Alerts';
  import { DataCleaningReportService } from "@/apps/ART/services/reports/data_cleaning_report_service"
  import { toDate } from "@/utils/Strs";
  
  const reportData = ref([])
  const isLoading = ref(false)
  const report = new DataCleaningReportService()
  const columns: Array<v2ColumnInterface[]> = [[
    { label: "Supervisors", ref: 'all_supervisors', toValue: (val) => val.join("<br/>") },
    { label: "Data cleaning date", ref: 'data_cleaning_datetime', toValue: (val) => toDate(val) },    
    { label: "Creator", ref: "created_by", toValue: (val) => val.name },
    { label: "Created on", ref: "date_created", toValue: (val) => toDate(val) },
    { label: "Comment", ref: 'comments'},
  ]]
  
  const generate = async () => {
    isLoading.value = true
    try {
      reportData.value = []
      reportData.value = await report.getSupervisionHistory();
    } catch (e) {
      toastDanger("Unable to generate report!")
    }
    isLoading.value = false
  }
  
  /**
   * Initialization code when the report is empty!
  */
  onMounted(() => generate())
  </script>
  