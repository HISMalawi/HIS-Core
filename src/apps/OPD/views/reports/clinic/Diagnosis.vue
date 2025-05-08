<template>
  <ion-page>
    <report-template
      :title="title"
      :rows="rows"
      :fields="fields"
      :columns="columns"
      :period="period"
      :reportPrefix="'Clinic'"
      :customInfo="customInfo"
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
import { get, isEmpty } from 'lodash'
import { IonPage } from "@ionic/vue";
import { Patientservice } from '@/services/patient_service'

export default defineComponent({
  components: { ReportTemplate, IonPage },
  mixins: [ReportMixin],
  data: () => ({
    title: 'OPD Diagnosis',
    rows: [] as RowInterface[][],
    reportService: {} as any,
    customInfo: {
      label: "Total OPD Visits",
      value: 0
    },
    columns: [
      [
        table.thTxt('Age Groups', {
          sortable: false,
          exportable: false 
        }),
        table.thTxt('<6 months', {
          colspan: 2,
          sortable: false,
          exportable: false 
        }),
        table.thTxt('6 months < 5 yrs', {
          colspan: 2,
          sortable: false,
          exportable: false 
        }),
        table.thTxt('5 yrs < 14 yrs', {
          colspan: 2,
          sortable: false,
          exportable: false 
        }),
        table.thTxt('> 14 yrs', {
          colspan: 2,
          sortable: false,
          exportable: false 
        }),
        table.thTxt('', {
          sortable: false,
          exportable: false 
        }),
      ],
      [
        table.thTxt('Diagnosis'),
        table.thTxt('F', { value: 'Females <6 months' }),
        table.thTxt('M', { value: 'Males <6 months' }),
        table.thTxt('F', { value: 'Females 6 months < 5 yrs'}),
        table.thTxt('M', { value: 'Males 6 months < 5 yrs' }),
        table.thTxt('F', { value: 'Females 5 yrs < 14 yrs' }),
        table.thTxt('M', { value: 'Males 5 yrs < 14 yrs' }),
        table.thTxt('F', { value: 'Females > 14 yrs' }),
        table.thTxt('M', { value: 'Males > 14 yrs' }),
        table.thTxt('Total'),
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
      this.rows = this.buildRows((await this.reportService.getDiagnosis()))
      const visits = await this.reportService.getAttendance()
      this.customInfo.value = visits.length
      
    },
    totalDiagnosis(diagnosis: Record<string, number>) {
      return Object.values(diagnosis).reduce((a, b) => a + b, 0)
    },
    getDrillDownColumns() {
      return [[
        table.thTxt("Patient ID"),
        table.thTxt("First Name"),
        table.thTxt("Last Name"),
        table.thTxt("Gender"),
        table.thTxt("Phone Number"),
        table.thTxt("Address")
      ]]
    },
    buildColumn(patients: Array<string>, title='Drilldown Data') {
      if(isEmpty(patients)) {
        return table.td(0)
      }
      return table.tdLink(patients.length, async () => this.drilldownData(
        title,
        this.getDrillDownColumns(),
        patients,
        async (tableRows: number[]) => {
          return await Promise.all(tableRows.map( async (patientId) => {
            const p = await Patientservice.findByID(patientId)
            const patient = new Patientservice(p)
            return [
              table.td(patientId),
              table.td(patient.getGivenName()),
              table.td(patient.getFamilyName()),
              table.td(patient.getGender()),
              table.td(patient.getPhoneNumber()),
              table.td(`${patient.getCurrentDistrict()}, ${patient.getCurrentVillage()}, ${patient.getClosestLandmark()}`)
            ]
          }))
        }
      ))
    },
    buildRows(data: Record<string, any>): RowInterface[][] {
      if(isEmpty(data)) return []
      const rows: RowInterface[][] = []
      Object.keys(data).forEach(diagnosis => {
        const underSixFemales: Array<string> = get(data[diagnosis], "F.0-5 months", [])
        const underSixMales: Array<string> = get(data[diagnosis], 'M.0-5 months', [])
        const underFiveFemales: Array<string> = get(data[diagnosis], 'F.6 mth < 5 yrs', [])
        const underFiveMales: Array<string> = get(data[diagnosis], 'M.6 mth < 5 yrs', [])
        const underFourteenFemales: Array<string> = get(data[diagnosis], 'F.5-14 yrs', [])
        const underFourteenMales: Array<string> = get(data[diagnosis], 'M.5-14 yrs', [])
        const overFourteenFemales: Array<string> = get(data[diagnosis], 'F.>= 14 years', [])
        const overFourteenMales: Array<string> = get(data[diagnosis], 'M.>= 14 years', [])

        rows.push([
          table.td(diagnosis, {style: {textAlign: 'left'}}),
          this.buildColumn(underSixFemales, `under 6 months females diagnosed with ${diagnosis}`),
          this.buildColumn(underSixMales, `under 6 months males diagnosed with ${diagnosis}`),
          this.buildColumn(underFiveFemales, `under 5 years females diagnosed with ${diagnosis}`),
          this.buildColumn(underFiveMales, `under 5 years males diagnosed with ${diagnosis}`),
          this.buildColumn(underFourteenFemales, `under 14 years females diagnosed with ${diagnosis}`),
          this.buildColumn(underFourteenMales, `under 14 years males diagnosed with ${diagnosis}`),
          this.buildColumn(overFourteenFemales, `over 14 years females diagnosed with ${diagnosis}`),
          this.buildColumn(overFourteenMales, `over 14 years males diagnosed with ${diagnosis}`),
          this.buildColumn([
            ...underFiveFemales,
            ...underFiveMales,
            ...underSixFemales,
            ...underSixMales,
            ...underFourteenFemales,
            ...underFourteenMales,
            ...overFourteenFemales,
            ...overFourteenMales
          ], `Total diagnosed with ${diagnosis}`),
        ])
      })

      return rows.sort((a, b) => {
        if(a[0].td < b[0].td) return -1
        if(a[0].td > b[0].td) return 1
        return 0
      })
    },
  },
})
</script>
