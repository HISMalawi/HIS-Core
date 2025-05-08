<template>
  <ion-page>
    <report-template
      :title="title"
      :rows="rows"
      :fields="fields"
      :columns="columns"
      :period="period"
      :reportPrefix="'Clinic'"
      :onReportConfiguration="init"
      :customBtns="customBtns"
    ></report-template>
  </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { LA_TYPES, OpdReportService } from "@/apps/OPD/services/opd_report_service"
import ReportTemplate from "@/views/reports/BaseTableReport.vue"
import table, { ColumnInterface, RowInterface } from "@/components/DataViews/tables/ReportDataTable"
import ReportMixin from '@/apps/ART/views/reports/ReportMixin.vue'
import { isEmpty } from 'lodash'
import { IonPage } from "@ionic/vue";

export default defineComponent({
  components: { ReportTemplate, IonPage },
  mixins: [ReportMixin],
  data: () => ({
    title: 'Lumefantrine + Arthemether Report',
    rows: [] as RowInterface[][],
    reportService: {} as any,
    prescriptions: {} as any,
    columns: [[
      table.thTxt('Types of LA'),
      table.thTxt('Prescribed'),
      table.thTxt('Dispensed'),
    ]] as ColumnInterface[][],
    customBtns: [] as any
  }),
  created(){
    this.fields = this.getDateDurationFields()
    this.customBtns.push({
      name: "Print",
      size: "large",
      slot: "start",
      color: "primary",
      visible: true,
      onClick: async () => this.reportService.printLaReport(this.prescriptions)
    })
  },
  methods: {
    async init(_: any, config: any){
      this.reportService = new OpdReportService()
      this.reportService.setStartDate(config.start_date)
      this.reportService.setEndDate(config.end_date)
      this.period = this.reportService.getDateIntervalPeriod()
      this.prescriptions = await this.reportService.getLaPrescriptions()
      this.rows = this.buildRows(this.prescriptions)
      
    },
    buildRows(data: Record<string, any>): RowInterface[][] {
      if(isEmpty(data)) return []
      return Object.keys(LA_TYPES).map(key => [
        table.td(LA_TYPES[key]),
        table.td(data[`total_la_${key}_prescribed_drugs`]),
        table.td(data[`total_la_${key}_dispensed_drugs`]),
      ])
    },
  },
})
</script>
