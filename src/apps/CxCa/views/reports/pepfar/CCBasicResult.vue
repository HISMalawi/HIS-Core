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
    title: 'CC Basic Results',
    rows: [] as RowInterface[], 
    reportService: {} as any,
    columns: [
      [
        table.thTxt('Fine Age'),
        table.thTxt('CXCA_SCRN_D'),
        table.thTxt('CXCA_SCRN_N'),
        table.thTxt('CXCA_SCRN_POS'),
        table.thTxt('CXCA_SCRN_TX'),
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
      const data = await this.reportService.getPepfarReport('CC Basic Result');
      this.rows = this.buildRows(data)
      
    },
    buildRows(data: any): RowInterface[] {
      return data.map((d: any) => ([
        table.td(d.age_group),
        table.td(d['CXCA_SCRN_D'].length),
        table.td(d['CXCA_SCRN_N'].length),
        table.td(d['CXCA_SCRN_POS'].length),
        table.td(d['CXCA_SCRN_TX'].length),

      ]))
    },
  },
})
</script>
