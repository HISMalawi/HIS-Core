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
import { MENTAL_HEALTH_DIAGNOSIS, OpdReportService } from "@/apps/OPD/services/opd_report_service"
import ReportTemplate from "@/views/reports/BaseTableReport.vue"
import table, { ColumnInterface, RowInterface } from "@/components/DataViews/tables/ReportDataTable"
import ReportMixin from '@/apps/ART/views/reports/ReportMixin.vue'
import { IonPage } from "@ionic/vue";
import { toDate } from '@/utils/Strs'

interface PatientData {
  type_of_visit: string;
  encounter_type: number;
  given_name: string;
  family_name: string;
  birthdate: string;
  person_id: number;
  value_coded: number;
  gender: string;
  concept_id: number;
  district: string;
  ta: string;
  village: string;
  value: string;
  age: number;
  name: string;
  encounter_id: number | null;
}


export default defineComponent({
  components: { ReportTemplate, IonPage },
  mixins: [ReportMixin],
  data: () => ({
    title: 'Mental health report',
    rows: [] as RowInterface[][],
    reportService: {} as any,
    columns: [
      [
        table.thTxt('', {
          sortable: false,
          exportable: false 
        }),
        table.thTxt('New cases', {
          colspan: 4,
          sortable: false,
          exportable: false 
        }),
        table.thTxt('Subsequent cases', {
          colspan: 4,
          sortable: false,
          exportable: false 
        }),
      ],
      [
        table.thTxt('Diagnosis'),
        table.thTxt('Male (0-15 years)', { value: 'Males (0-15 years New Cases)' }),
        table.thTxt('Male (>=16 years)', { value: 'Males (>=16 years New Cases)' }),
        table.thTxt('Female (0-15 years)', { value: 'Females (0-15 years New Cases)' }),
        table.thTxt('Female (>=16 years)', { value: 'Females (>=16 years New Cases)' }),
        table.thTxt('Male (0-15 years)', { value: 'Males (0-15 years Subsequent Cases)' }),
        table.thTxt('Male (>=16 years)', { value: 'Males (>=16 years Subsequent Cases)' }),
        table.thTxt('Female (0-15 years)', { value: 'Females (0-15 years Subsequent Cases)' }),
        table.thTxt('Female (>=16 years)', { value: 'Females (>=16 years Subsequent Cases)' }),
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
      const data: Array<PatientData> = await this.reportService.getMentalHealth();
      this.rows = this.buildRows(data);
      
    },
    buildRows(data: Array<PatientData>): RowInterface[][] {
      return MENTAL_HEALTH_DIAGNOSIS.map( diagnosis => ([
        table.td(diagnosis, {style: {textAlign: 'left'}}),
        this.toDrillColumn(data, diagnosis, "M", "0-15 years", true),
        this.toDrillColumn(data, diagnosis, "M", ">=16 years", true),
        this.toDrillColumn(data, diagnosis, "F", "0-15 years", true),
        this.toDrillColumn(data, diagnosis, "F", ">=16 years", true),
        this.toDrillColumn(data, diagnosis, "M", "0-15 years"),
        this.toDrillColumn(data, diagnosis, "M", ">=16 years"),
        this.toDrillColumn(data, diagnosis, "F", "0-15 years"),
        this.toDrillColumn(data, diagnosis, "F", ">=16 years"),
      ]))
    },
    getAgeGroup(age: number) {
      return age < 16 ? "0-15 years" : ">=16 years"
    },
    toDrillColumn(data: Array<PatientData>, type: string, gender: "M" | "F", ageGroup: string, isNew: boolean = false){
      const patients = data.filter(p => p.name === type && 
        p.gender === gender && 
        (this.getAgeGroup(p.age) === ageGroup) && 
        (isNew ? /new patient/i.test(p.type_of_visit) : true)
      );
      if(patients.length) {
        const columns: Array<Array<ColumnInterface>> = [[
          table.thTxt("Name"),
          table.thTxt("Birthdate (Age)"),
          table.thTxt("Address"),
        ]]
        const rows = patients.map(patient => [
          table.td(`${patient.given_name} ${patient.family_name}`),
          table.td(`${toDate(patient.birthdate)} (${patient.age})`),
          table.td(`${patient.village}, ${patient.ta}, ${patient.district}`),
        ]);

        return table.tdLink(patients.length, () => {
          return this.drilldownData(`${ageGroup} ${this.formatGender(gender)} patients with ${type}`, columns, rows, undefined)
        });
      }

      return table.td(0)
    },
  },
})
</script>
