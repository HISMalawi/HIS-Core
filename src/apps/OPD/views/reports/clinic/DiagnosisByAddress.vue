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
import { isEmpty } from 'lodash'
import { IonPage, modalController } from "@ionic/vue";
import DrillPatientIds from '@/components/DrillPatientIds.vue';

export default defineComponent({
  components: { ReportTemplate, IonPage },
  mixins: [ReportMixin],
  data: () => ({
    title: 'OPD diagnosis by address report',
    rows: [] as RowInterface[][],
    reportService: {} as any,
    columns: [
      [
        table.thTxt('Address'),
        table.thTxt('Diagnosis'),
        table.thTxt('Count'),
      ]
    ] as ColumnInterface[][],
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
      this.rows = this.buildRows((await this.reportService.getDiagnosisByAddress()))
      
    },
    async drill(patientIdentifiers: number[], title: string) {
      if (!patientIdentifiers || !patientIdentifiers.length) return;
      (await modalController.create({
        component: DrillPatientIds,
        backdropDismiss: false,
        cssClass: 'large-modal',
        componentProps: {
            title,
            patientIdentifiers,
            subtitle: this.period,
            onFinish: () => modalController.getTop().then(v => v && modalController.dismiss())
        }
      })).present();
    },
    totalDiagnosis(diagnosis: Record<string, number>) {
      return Object.values(diagnosis).reduce((a, b) => a + b, 0)
    },
    buildRows(data: Record<string, any>): RowInterface[][] {
      const rows: RowInterface[][] = [];
      if(isEmpty(data)) return rows
      for (const diagnosis in data) {
        for(const address in data[diagnosis]){
          const count = data[diagnosis][address]
          rows.push([
            table.td(address),
            table.td(diagnosis),
            table.tdLink(count.length, () => this.drill(count, address))
          ])
        }
      }
      return rows
    },
  },
})
</script>
