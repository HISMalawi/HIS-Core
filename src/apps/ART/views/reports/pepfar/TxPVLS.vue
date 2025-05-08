<template>
  <ion-page>
    <report-template
      title="PEPFAR TX_PVLS Report"
      :period="period"
      :rows="rows"
      :fields="fields"
      :columns="columns"
      :config="{
        showIndex: true
      }"
      reportPrefix="PEPFAR"
      :hasServerSideCaching="true"
      :onReportConfiguration="onPeriod"
    >
    </report-template>
  </ion-page>
</template>
<script lang='ts'>
import { defineComponent } from "vue";
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue";
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue";
import table from "@/components/DataViews/tables/ReportDataTable";
import { ViralLoadReportService } from "@/apps/ART/services/reports/viral_load_report";
import { AGE_GROUPS } from "@/apps/ART/services/reports/patient_report_service"
import { IonPage, modalController } from "@ionic/vue";
import { get, uniq } from "lodash";
import ArtDrilldown from "@/apps/ART/Components/ArtDrilldown.vue";

export default defineComponent({
  mixins: [ReportMixin],
  components: { ReportTemplate, IonPage },
  data: () => ({
    cohort: {} as any,
    rows: [] as Array<any>,
    totals: {
      F: {},
      M: {}
    } as any,
    columns: [[
      table.thTxt("Age group"),
      table.thTxt("Gender"),
      table.thTxt("TX_CURR"),
      table.thTxt("Due for VL"),
      table.thTxt("Routine (Sample Drawn)"),
      table.thTxt('Targeted (Sample Drawn)'),
      table.thTxt('Routine (High VL (>=1000 copies))'),
      table.thTxt('Targeted High VL (>=1000 copies)'),
      table.thTxt('Routine (Low VL (<1000 copies))'),
      table.thTxt('Targeted (Low VL (<1000 copies))'),
    ]]
  }),
  created() {
    this.fields = this.getDateDurationFields();
  },
  methods: {
    async onPeriod(_: any, config: any, rebuildCache = false) {
      this.rows = [];
      this.totals = {
        F: {},
        M: {}
      };
      this.report = new ViralLoadReportService();
      this.report.setOccupation(config.occupation)
      this.report.setStartDate(config.start_date);
      this.report.setEndDate(config.end_date);
      this.period = this.report.getDateIntervalPeriod();
      this.cohort = await this.report.getVLCoverage(rebuildCache);
      await this.setRows("F");
      await this.setRows("M");
      this.setAllMalesTotalsRow()
      await this.setFemaleTotalsRow()
    },
    setTotals(key: string, gender: 'M' | 'F', data: Array<any>) {      
      if (!this.totals[gender][key]) this.totals[gender][key] = []

      this.totals[gender][key] = this.totals[gender][key].concat(data)
    },
    drillDown(patients: Array<any>, context: string) {
      if (patients.length >= 1) {
        return table.tdLink(patients.length, async () => (await modalController.create({
          component: ArtDrilldown,
          backdropDismiss: false,
          cssClass: 'large-modal',
          componentProps: {
            subtitle: this.period,
            patientIdentifiers: patients,
            title: context,
            viewRef: 'person_id',
            onFinish: () => modalController.getTop().then(v => v && modalController.dismiss())
          }
        })).present())
      }
      return table.td(0)
    },
    async setFemaleTotalsRow() {
      const totals = this.totals.F
      const allFemale = uniq(Object.values(totals).flat(1));
      const fStatus = await this.report.getMaternalStatus(allFemale)
      const allFp = fStatus.FBf.concat(fStatus.FP);
      const fp = (gender: 'FBf' | 'FP', patients: Array<number>) => patients.filter(id => fStatus[gender].includes(id));
      const fnp = (patients: Array<number>) => patients.filter(id => !allFp.includes(id));

      this.rows.push([
        table.td('All'),
        table.td('FP'),
        this.drillDown(fp('FP', totals.tx_curr), 'TX_CURR FP'),
        this.drillDown(fp('FP', totals.due_for_vl), 'Due for VL FP'),
        this.drillDown(fp('FP', totals.drawn_routine), 'Routine (Sample Drawn) FP'),
        this.drillDown(fp('FP', totals.drawn_targeted), 'Targetted (Sample Drawn) FP'),
        this.drillDown(fp('FP', totals.high_vl_routine), 'Routine (High VL (>=1000 copies)) FP'),
        this.drillDown(fp('FP', totals.high_vl_targeted), 'Targeted High VL (>=1000 copies) FP'),
        this.drillDown(fp('FP', totals.low_vl_routine), 'Routine (Low VL (<1000 copies)) FP'),  
        this.drillDown(fp('FP', totals.low_vl_targeted), 'Targeted (Low VL (<1000 copies)) FP'),
      ])

      this.rows.push([
        table.td('All'),
        table.td('FNP'),
        this.drillDown(fnp(totals.tx_curr), 'TX_CURR FNP'),
        this.drillDown(fnp(totals.due_for_vl), 'Due for VL FNP'),
        this.drillDown(fnp(totals.drawn_routine), 'Routine (Sample Drawn) FNP'),
        this.drillDown(fnp(totals.drawn_targeted), 'Targetted (Sample Drawn) FNP'),
        this.drillDown(fnp(totals.high_vl_routine), 'Routine (High VL (>=1000 copies)) FNP'),
        this.drillDown(fnp(totals.high_vl_targeted), 'Targeted High VL (>=1000 copies) FNP'),
        this.drillDown(fnp(totals.low_vl_routine), 'Routine (Low VL (<1000 copies)) FNP'),        
        this.drillDown(fnp(totals.low_vl_targeted), 'Targeted (Low VL (<1000 copies)) FNP'),
      ])
  
      this.rows.push([
        table.td('All'),
        table.td('FBF'),
        this.drillDown(fp('FBf', totals.tx_curr), 'TX_CURR FBf'),
        this.drillDown(fp('FBf', totals.due_for_vl), 'Due for VL FBf'),
        this.drillDown(fp('FBf', totals.drawn_routine), 'Routine (Sample Drawn) FBf'),
        this.drillDown(fp('FBf', totals.drawn_targeted), 'Targetted (Sample Drawn) FBf'),
        this.drillDown(fp('FBf', totals.high_vl_routine), 'Routine (High VL (>=1000 copies)) FBf'),
        this.drillDown(fp('FBf', totals.high_vl_targeted), 'Targeted High VL (>=1000 copies) FBf'),
        this.drillDown(fp('FBf', totals.low_vl_routine), 'Routine (Low VL (<1000 copies)) FBf'),        
        this.drillDown(fp('FBf', totals.low_vl_targeted), 'Targeted (Low VL (<1000 copies)) FBf'),
      ])
    },
    setAllMalesTotalsRow() {
      const totals = this.totals['M']
      return this.rows.push([
        table.td('All'),
        table.td('Male'),
        this.drillDown(totals.tx_curr, 'TX_CURR Male'),
        this.drillDown(totals.due_for_vl, 'Due for VL Male'),
        this.drillDown(totals.drawn_routine, 'Routine (Sample Drawn) Male'),
        this.drillDown(totals.drawn_targeted, 'Targetted (Sample Drawn) Male'),
        this.drillDown(totals.high_vl_routine, 'Routine (High VL (>=1000 copies)) Male'),
        this.drillDown(totals.high_vl_targeted, 'Targeted High VL (>=1000 copies) Male'),
        this.drillDown(totals.low_vl_routine, 'Routine (Low VL (<1000 copies)) Male'),
        this.drillDown(totals.low_vl_targeted, 'Targeted (Low VL (<1000 copies)) Male')
      ])
    },
    async setRows(gender: 'M' | 'F') {
      const fullGender = this.formatGender(gender)
      for (const group of AGE_GROUPS) {
        const td = (id: string, patients: any, context: string) => {
          this.setTotals(id, gender, patients)
          return this.drillDown(patients, context)
        }
        this.rows.push([
          table.td(group),
          table.td(fullGender),
          td('tx_curr', get(this.cohort, `${group}.${gender}.tx_curr`, []), `${group} TX_CURR (${fullGender})`),
          td('due_for_vl', get(this.cohort, `${group}.${gender}.due_for_vl`, []), `${group} Due for VL (${fullGender})`),
          td('drawn_routine',  get(this.cohort, `${group}.${gender}.drawn.routine`, []), `${group} Routine (Sample Drawn) (${fullGender}s)`),
          td('drawn_targeted', get(this.cohort, `${group}.${gender}.drawn.targeted`, []), `${group} Targeted (Sample Drawn) (${fullGender}s)`),
          td('high_vl_routine', get(this.cohort, `${group}.${gender}.high_vl.routine`, []), `${group} Routine (High VL (>=1000 copies)) (${fullGender}s)`),
          td('high_vl_targeted', get(this.cohort, `${group}.${gender}.high_vl.targeted`, []), `${group} Targeted High VL (>=1000 copies) (${fullGender}s)`),
          td('low_vl_routine', get(this.cohort, `${group}.${gender}.low_vl.routine`, []), `${group} Routine (Low VL (<1000 copies)) (${fullGender}s)`),
          td('low_vl_targeted', get(this.cohort, `${group}.${gender}.low_vl.targeted`, []), `${group} Targeted (Low VL (<1000 copies)) (${fullGender}s)`)
        ]);
      }
    },
  },
});
</script>
