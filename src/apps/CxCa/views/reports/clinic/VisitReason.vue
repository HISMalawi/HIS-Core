<template>
  <ion-page>
    <report-template :title="title" :rows="rows" :fields="fields" :columns="columns" :period="period"
      :onReportConfiguration="init"></report-template>
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
    title: 'Visit reasons',
    rows: [] as RowInterface[],
    reportService: {} as any,
    columns: [
      [
        table.thTxt(''),
        table.thTxt('Reason'),
         table.thTxt('Number'),
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
      const data = await this.reportService.getClinicReport('VISIT REASONS');
      this.rows = this.buildRows(data)

    },
    buildRows(data: any): RowInterface[] {
      const formattedData: any = [];
      const results: any = {};
      const concepts = [
        'Initial Screening',
        'Postponed treatment',
        'One year subsequent check-up after treatment',
        'Subsequent screening',
        'Problem visit after treatment',
        'Referral'
      ];

      let count = 1;

      for (const concept of concepts) {
        if (results[concept] == undefined)
          results[concept] = [];

        for (const record of data) {
          const result = record.reason;
          const patientID = record.patient_id;
          if (result != concept)
            continue;

          results[result].push(patientID);
        }
      }

      for (const result in results) {
        formattedData.push(
          [table.td(count++), table.td(result), table.td(results[result].length)]
        );
      }
      return formattedData;
    },
  },
})
</script>
