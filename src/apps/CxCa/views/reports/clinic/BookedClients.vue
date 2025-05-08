<template>
  <ion-page>
    <report-template :title="title" :rows="rows" :fields="fields" :columns="columns" :period="period" canExportPDf canExportCsv encryptPDF
      :onReportConfiguration="init"></report-template>
  </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table, { ColumnInterface, RowInterface } from "@/components/DataViews/tables/ReportDataTable"
import ReportMixin from '@/apps/ART/views/reports/ReportMixin.vue'
import { IonPage } from "@ionic/vue";
import { CxCaReportService } from '@/apps/CxCa/services/reports/cxca_report_service'
export default defineComponent({

  components: { ReportTemplate, IonPage },
  mixins: [ReportMixin],
  data: () => ({
    title: 'Booked Clients',
    rows: [] as RowInterface[][],
    reportService: {} as any,
    columns: [
      [
        table.thTxt('Identifier'),
        table.thTxt('First Name', { csvExportable: false, pdfExportable: true }), 
        table.thTxt('Last Name', { csvExportable: false, pdfExportable: true }),
        table.thTxt('Birthdate'),
        table.thTxt('Booked date'),
        table.thTxt('Seen'),
        table.thTxt('Action', { csvExportable: false, pdfExportable: true  })
      ]
    ] as ColumnInterface[][],
  }),
  created() {
    this.fields = this.getDateDurationFields()
  },
  methods: {
    async init(_: any, config: any) {
      this.reportService = new CxCaReportService()
      this.reportService.setStartDate(config.start_date)
      this.reportService.setEndDate(config.end_date)
      const data = await this.reportService.getClinicReport('BOOKED CLIENTS FROM ART RAW DATA');
      this.rows = this.buildRows(data)

    },
    buildRows(data: any): RowInterface[][] {
     return data.map((d: any) => ([
        table.td(d['identifier']),
        table.td(d['given_name']),
        table.td(d['family_name']),
        table.tdDate(d['dob']),
        table.td(d['booked_date']),
        table.td(d['seen']),
        table.tdBtn('View', () => this.$router.push(`/patient/dashboard/${d['person_id']}`))
      ]))
    },
  },
})
</script>
