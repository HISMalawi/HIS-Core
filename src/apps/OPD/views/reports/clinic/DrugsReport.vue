<template>
  <ion-page>
    <report-template
      :title="title"
      :rows="rows"
      :fields="fields"
      :columns="columns"
      :itemsPerPage="12"
      :period="period"
      :reportPrefix="'Clinic'"
      :onReportConfiguration="init"
      paginated
    ></report-template>
  </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { OpdReportService } from "@/apps/OPD/services/opd_report_service"
import ReportTemplate from "@/views/reports/BaseTableReport.vue"
import table, { ColumnInterface, RowInterface } from "@/components/DataViews/tables/ReportDataTable"
import HisDate from '@/utils/Date'
import ReportMixin from '@/apps/ART/views/reports/ReportMixin.vue'
import { IonPage } from "@ionic/vue";
import { Service } from "@/services/service";

export default defineComponent({
  components: { ReportTemplate, IonPage },
  mixins: [ReportMixin],
  data: () => ({
    title: 'Drugs report',
    rows: [] as RowInterface[][],
    columns: [[
      table.thTxt('First Name'),
      table.thTxt('Last Name'),
      table.thTxt('Gender'),
      table.thTxt('Age'),
      table.thTxt('Drug'),
      table.thTxt('Prescribe Quantity'),
      table.thTxt('Dispense Quantity'),
      table.thTxt('Diagnosis'),
      table.thTxt('Date'),
    ]] as ColumnInterface[][]
  }),
  created(){
    this.fields = this.getDateDurationFields()
  },
  methods: {
    async init(_: any, config: any){
      const reportService = new OpdReportService()
      reportService.setStartDate(config.start_date)
      reportService.setEndDate(config.end_date)
      this.period = reportService.getDateIntervalPeriod()
      this.rows = this.buildRows((await reportService.getDrugs()))
    },
    buildRows(data: any[]): RowInterface[][] {
      if(!data.length) return []
      return data.map((record: any) => [
        table.td(record.given_name),
        table.td(record.family_name),
        table.td(record.gender),
        table.td(HisDate.calculateAge(record.birthdate, Service.getSessionDate())),
        table.td(record.drug_name),
        table.td(record.prescribe_quantity),
        table.td(record.dispense_quantity),
        table.td(record.diagnosis),
        table.td(HisDate.toStandardHisDisplayFormat(record.date)),
      ])
    }
  },
})
</script>
