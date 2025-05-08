<template>
  <ion-page>
    <report-template
      :title="title"
      :rows="rows"
      :fields="fields"
      :columns="columns"
      :period="period"
      :onReportConfiguration="init"
    ></report-template>
  </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportTemplate from "@/views/reports/BaseTableReport.vue"
import table, { ColumnInterface, RowInterface } from "@/components/DataViews/tables/ReportDataTable"
import ReportMixin from '@/apps/ART/views/reports/ReportMixin.vue'
import { IonPage } from "@ionic/vue";
import { CxCaReportService } from '@/apps/CxCa/services/reports/cxca_report_service'
export default defineComponent({

  components: { ReportTemplate, IonPage },
  mixins: [ReportMixin],
  data: () => ({
    title: 'CC Type of Screen',
    rows: [] as RowInterface[], 
    reportService: {} as any,
    columns: [
      [
        table.thTxt('Fine Age'),
        table.thTxt('CXCA_SCRN_First screen'),
        table.thTxt('CXCA_SCRN_Rescreen'),
        table.thTxt('CXCA_SCRN_Follow Up Screen'),
      ]
    ] as ColumnInterface[][],
  }),
  created(){
    this.fields = this.getDateDurationFields()
  },
  methods: {
    async init(_: any, config: any){
      this.reportService = new CxCaReportService()
      this.reportService.setStartDate(config.start_date)
      this.reportService.setEndDate(config.end_date)
      const data = await this.reportService.getPepfarReport('CC Type of Screen');
      this.rows = this.buildRows(data)
      
    },
    buildRows(data: any): RowInterface[] {
      return data.map((d: any) => ([
        table.td(d.age_group),
        table.td(d['first_screen'].length),
        table.td(d['rescreen'].length),
        table.td(d['follow_up_screen'].length),
      ]))
    },
  },
})
</script>
