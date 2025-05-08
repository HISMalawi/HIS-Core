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
    ></report-template>
  </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { OpdReportService } from "@/apps/OPD/services/opd_report_service"
import ReportTemplate from "@/views/reports/BaseTableReport.vue"
import table, { ColumnInterface, RowInterface } from "@/components/DataViews/tables/ReportDataTable"
import ReportMixin from '@/apps/ART/views/reports/ReportMixin.vue'
import HisDate from '@/utils/Date'
import { IonPage } from "@ionic/vue";

export default defineComponent({
  components: { ReportTemplate, IonPage },
  mixins: [ReportMixin],
   data: () => ({
    title: 'Clients / Patients with NIDs',
    rows: [] as RowInterface[][],
    reportService: {} as any,
    columns : [
      [
        table.thTxt('NID'),
        table.thTxt('First Name'),
        table.thTxt('Last Name'),
        table.thTxt('Gender'),
        table.thTxt('DOB'),
        table.thTxt('Date Reg.'),
        table.thTxt('Address'),
      ]
    ]as ColumnInterface[][],
  
  }),
  created(){
    this.fields = this.getDateDurationFields()
  },
  methods: {
    async init(_: any, config: any){
      this.reportService = new OpdReportService()
      this.reportService.setStartDate(config.start_date)
      this.reportService.setEndDate(config.end_date)
      this.period = this.reportService.getDateIntervalPeriod()
      this.rows = this.buildRows((await this.reportService.getPatientsWithNIDs()))
      
    },
     buildRows(data: any[]): RowInterface[][] {
      if(!data.length) return []
      return data.map((record: any) => [
          table.td(record.nid),
          table.td(record.given_name),
          table.td(record.family_name),
          table.td(record.gender),
          table.td(HisDate.toStandardHisDisplayFormat(record.birthdate)),
          table.td(HisDate.toStandardHisDisplayFormat(record.date)),
          table.td(record.address)
        ])
    },
  },
})
</script>
