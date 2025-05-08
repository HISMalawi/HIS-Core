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
import { NCD_TYPES, OpdReportService } from "@/apps/OPD/services/opd_report_service"
import ReportTemplate from "@/views/reports/BaseTableReport.vue"
import table, { ColumnInterface, RowInterface } from "@/components/DataViews/tables/ReportDataTable"
import ReportMixin from '@/apps/ART/views/reports/ReportMixin.vue'
import { IonPage } from "@ionic/vue";

interface NcdData {
  encounter_type: number;
  given_name: string;
  family_name: string;
  person_id: number;
  value_coded: number;
  gender: "M" | "F";
  concept_id: number;
  district: string;
  ta: string;
  village: string;
  value: string;
  age_group: string;
  name: string;
  encounter_id: number | null;
  type_of_visit: string
}

export default defineComponent({
  components: { ReportTemplate, IonPage },
  mixins: [ReportMixin],
  data: () => ({
    title: 'Cases seen report',
    rows: [] as RowInterface[][], 
    reportService: {} as OpdReportService,
    columns: [
      [
        table.thTxt('', {
          sortable: false,
          exportable: false 
        }),
        table.thTxt('New cases', {
          colspan: 2,
          sortable: false,
          exportable: false 
        }),
        table.thTxt('All cases', {
          colspan: 2,
          sortable: false,
          exportable: false 
        }),
      ],
      [
        table.thTxt('NCD type'),
        table.thTxt('Male', { value: 'Male (New Cases)' }),
        table.thTxt('Female', { value: 'Female (New Cases)' }),
        table.thTxt('Male', { value: 'Male (All Cases)' }),
        table.thTxt('Female', { value: 'Female (All Cases)' }),
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
      const data: Array<NcdData> = await this.reportService.getCasesSeen() ;
      this.rows = this.buildRows(data);
    },
    toDrillColumn(data: Array<NcdData>, type: string, gender: "M" | "F", isNew: boolean){
      const patients = data.filter(patient => {
        if (isNew) return patient.name === type && patient.gender === gender && /new patient/i.test(patient.type_of_visit)
        return patient.name === type && patient.gender === gender
      });
      if(patients.length) {
        const columns: Array<Array<ColumnInterface>> = [[
          table.thTxt("Name"),
          table.thTxt("Age Group"),
          table.thTxt("Address"),
        ]]
        const rows = patients.map(patient => [
          table.td(`${patient.given_name} ${patient.family_name}`),
          table.td(patient.age_group),
          table.td(`${patient.village}, ${patient.ta}, ${patient.district}`),
        ]);

        return table.tdLink(patients.length, () => {
          return this.drilldownData(`${this.formatGender(gender)} patients with ${type}`, columns, rows, undefined)
        });
      }

      return table.td(0)
    },
    buildRows(data: Array<NcdData>): RowInterface[][] {
      return NCD_TYPES.map(type => ([
        table.td(type, {style: {textAlign: 'left'}}),
        this.toDrillColumn(data, type, "M", true),
        this.toDrillColumn(data, type, "F", true),
        this.toDrillColumn(data, type, "M", false),
        this.toDrillColumn(data, type, "F", false),
      ]))
    },
  },
})
</script>
