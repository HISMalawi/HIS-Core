<template>
  <ion-loading
    :is-open="isLoading"
    message="Please wait..."
  >
  </ion-loading>
  <his-standard-form
    v-if="!reportReady"
    @onFinish="onPeriod"
    :skipSummary="true" 
    :fields="fields">
  </his-standard-form>
  <ion-page v-if="reportReady">
    <ion-content>
      <cohort-v :key="componentKey" :indicators="indicators"> </cohort-v>
      <div id="report-content">
        <cohort-h :key="componentKey" :reportparams="period" :clinicName="clinicName"></cohort-h>
        <cohort-ft :key="componentKey" @onClickIndicator="onDrillDown" :indicators="indicators"> </cohort-ft>
      </div>
    </ion-content>
    <his-footer :btns="btns"></his-footer>
  </ion-page>
  <div id='print'> </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HisFooter from "@/components/HisDynamicNavFooter.vue";
import { IonPage, IonContent, IonLoading } from "@ionic/vue"
import { Field } from '@/components/Forms/FieldInterface'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import ReportMixinVue from "../../ReportMixin.vue";
import { MohCohortReportService } from "@/apps/ART/services/reports/moh_cohort_service"
import CohortH from "@/apps/ART/views/reports/moh/CohortReport/CohortHeader.vue"
import CohortV from "@/apps/ART/views/reports/moh/CohortReport/CohortValidation.vue"
import CohortFt from "@/apps/ART/views/reports/moh/CohortReport/CohortFT.vue"
import HisDate from "@/utils/Date"
import Url from "@/utils/Url"
import { modalController } from "@ionic/vue";
import dayjs from "dayjs";
import { Service } from "@/services/service";
import { toCsv, toPDFfromHTML } from "@/utils/Export"
import { find } from "lodash";
import { alertConfirmation, toastDanger } from "@/utils/Alerts";
import { addArvColumn, addViewPatientColumn, showV2TableModal } from "@/utils/v2utils";

export default defineComponent({
  mixins: [ReportMixinVue],
  components: { IonLoading, CohortH, CohortV, CohortFt, HisStandardForm, HisFooter, IonPage, IonContent },
  data: () => ({
    formData: {} as any,
    componentKey: 0 as number,
    computedFormData: {} as any,
    indicators: {} as any,
    cohort: {} as any,
    btns: [] as Array<any>,
    isLoading: false as boolean,
    fields: [] as Array<Field>,
    reportID: -1 as any,
    clinicName: MohCohortReportService.getLocationName(),
    reportReady: false as boolean,
    disaggregatedReportParams: '' as string,
    startDate: '' as string,
    endDate: '' as string,
    quarter: '' as string,
    onGenerateTempCallback: null as any
  }),
  created() {
    this.btns = this.getBtns()
    this.fields = this.getDateDurationFields(true, true, 21, null)
  },
  methods: {
    async onPeriod(form: any, config: any, regenerate=false) {
      this.componentKey += 1
      this.formData = form
      this.computedFormData = config
      this.reportReady = true 
      this.isLoading = true
      this.report = new MohCohortReportService()
      this.report.setRegenerate(regenerate)
      let data: any = {}
      if (form.quarter.value === 'custom_period') {
        this.quarter = 'Custom'
        this.startDate = config.start_date
        this.endDate = config.end_date
      } else {
        this.quarter = form.quarter.label
        this.startDate = HisDate.toStandardHisFormat(form.quarter.other.start)
        this.endDate = HisDate.toStandardHisFormat(form.quarter.other.end)
      }
      this.report.setOccupation(config.occupation)
      this.report.setQuarter(this.quarter)
      this.report.setStartDate(this.startDate)
      this.report.setEndDate(this.endDate)

      if (this.quarter === 'Custom') {
        this.period = `Custom ${this.report.getDateIntervalPeriod()}`
        data = this.report.datePeriodRequestParams()
      } else {
        this.period = this.quarter
        data = this.report.qaurterRequestParams()
      }
      this.disaggregatedReportParams = Url.parameterizeObjToString({ 
        'start_date': this.startDate,
        'end_date': this.endDate,
        'quarter': this.quarter,
        'occupation': config.occupation
      })
      const request = await this.report.requestCohort(data)
      if (request.ok) {
        // Check the backend if background task is complete
        const interval = setInterval(async () => {
          data.regenerate = false
          const state = await this.report.requestCohort(data)
          if (state.status === 200) {
            const data = await state.json()
            this.reportID = data.id
            this.cohort = data.values
            this.indicators = this.toIndicators(data.values)
            this.isLoading = false
            this.report.cacheCohort(data.values)
            clearInterval(interval)
            // Run any temporary callback functions and clear them afterwards
            if (typeof this.onGenerateTempCallback === 'function') {
              const action = this.onGenerateTempCallback
              action()
              this.onGenerateTempCallback = null
            }
          }
        }, 3000)
      }
    },
    /**
     * Transform indicators from array to a simple key value pair object
    */ 
    toIndicators(params: any) {
      return params.reduce((data: Record<string, number>, indicator: any) => {
        data[indicator.name] = parseInt(indicator.contents)
        return data
      }, {})
    },
    regenerate() {
      return this.onPeriod(this.formData, this.computedFormData, true)
    },
    async onDrillDown(indicatorName: string) {
      const indicator = find(this.cohort, {name: indicatorName})
      if (!indicator) return
      const resourceId = indicator.id
      let persons: any = []
      this.isLoading = true
      try {
        persons = this.sortByArvNumber((await this.report.getCohortDrillDown(resourceId)) as Array<any> || [], 'arv_number')
      } catch (e) {
        toastDanger("Unable to generate drilldown report!")
      }
      this.isLoading = false
      /**
       * Hack to fix Empty drilldown result-set.
       * 
       * This hack addresses an issue where the cohort report indicator is counting
       * patients but isnt able to fetch them during drilldown. This is a caching issue on the report
       * and requires a regeneration to solve this...
      */
      if (parseInt(indicator.contents) > 0 && persons.length <= 0) {
        // user has to confirm if they want to rebuild
        if (await alertConfirmation("Unable to fetch drilldown patients, Do you want to rebuild cohort to resolve this?")) {
          setTimeout(() => {
            // Close the drilldown dialogue so that we can load the next one if it's ready
            modalController.getTop().then(v => v ? modalController.dismiss() : null)
            // Reload the drilldown table with updated data
            this.onGenerateTempCallback = () => this.onDrillDown(indicatorName)
            this.regenerate()
          }, 100)
        }
      }
      showV2TableModal({
        title: indicator.description,
        subtitle: `Total: ${persons.length}`,
        columns: [
          [
            addArvColumn('arv_number', 'ARV Number'),
            { label: "First name", ref: 'given_name', encrypted: true },
            { label: "Last name", ref: "family_name", encrypted: true },
            { label: "Gender", ref: "gender", toValue: (v: any) => this.formatGender(v) },
            { label: "Birthdate", ref: "birthdate", toValue: (v: any) => this.toDate(v) },
            { label: "Outcome", ref: "outcome" },
            { label: "Art start date", ref: "art_start_date", toValue: (v: any) => this.toDate(v)  },
            addViewPatientColumn('person_id')
          ]
        ],
        rowsPerPage: 50,
        columnData: persons
      })
    },
    exportToCsv() {
      const headers = ['Indicator', 'Value']
      const rows = Object.keys(this.indicators).map(k => [k, this.indicators[k]])
      const reportTitle = `${Service.getLocationName()} cohort report ${this.period}`
      toCsv([headers], [
        ...rows,
        [`Date Created: ${dayjs().format('DD/MMM/YYYY HH:MM:ss')}`],
        ['Quarter: ' + (this.quarter.match(/custom/i) 
          ? `${this.startDate} - ${this.endDate}` 
          : this.quarter)
        ],
        [`HIS-Core Version: ${Service.getCoreVersion()}`],
        [`API Version: ${Service.getApiVersion()}`],
        [`Site: ${Service.getLocationName()}`],
        [`Site UUID: ${Service.getSiteUUID()}`]
      ], reportTitle)
    },
    printSpec() {
      const content = document.getElementById('report-content')
      if (content) {
        toPDFfromHTML(`
          <html>
            <head>
              <title>Print Cohort</title>
              <style> 
                .numbers {
                  width: 2.5%;
                  text-align: center;
                  border-width: 0px 1px 0px 0px;
                  border-style: dotted;
                }
                .row-title {
                  width: 17.75%;
                  text-align: left;
                  padding-left: 5px;
                  border-style: dotted;
                }
                .signatures {
                  width: 39.875%;
                  text-align: left;
                  padding-left: 5px;
                  border-style: dotted;
                }
                .row-name {
                  width: 39.875%;
                  text-align: left;
                  padding-left: 5px;
                  border-style: dotted;
                  border-left-style: solid;
                }
                .no-borders {
                  border-width: 0px;
                }
                #version-row td {
                  height: 30px;
                }
                #version {
                  text-align: right;
                  padding-right: 5px;
                  font-size: 10px;
                }
                #consistency_check div {
                  color: red;
                  padding-bottom: 10px;
                }
                a {
                  color: black;
                  text-decoration: none;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 10px;
                }
                tr {
                  height: 45px;
                }
                .vertical-separator {
                  border-width: 0px;
                }
                td {
                  border-style: solid;
                  border-width: 1px;
                  padding: 1em;
                  text-align: center;
                }
                .section-description td {
                  border-width: 0px;
                }
                .horisonatl-separator td {
                  border-width: 0px;
                }
                .numbers {
                  width: 2.5%;
                  text-align: center;
                  border-width: 0px 1px 0px 0px;
                  border-style: dotted;
                }
                .sum-arrows {
                  width: 75px;
                  height: 55px;
                }
                .postfixes {
                  font-size: x-small;
                  font-weight: bold;
                  position: relative;
                  top: -15px;
                  left: -40px;
                }
                .granules {
                  width: 100%;
                  height: 32px;
                  margin: 10px;
                  display: table;
                }
                .granules-row {
                  display: table-row;
                }
                .granules-cell {
                  display: table-cell;
                  text-align: center;
                }
                .granules span{
                  font-size: 10px;
                }
                .granules-right-td {
                  border-right-style: dotted !important;
                  border-right-width: 1px;
                }

                @media print
                {
                  table { page-break-after:auto }
                  tr    { page-break-inside:avoid; page-break-after:auto }
                  td    { page-break-inside:avoid; page-break-after:auto }
                  thead { display:table-header-group }
                  tfoot { display:table-footer-group }
                }
              </style>
            </head>
            <body>
              ${content.innerHTML}
            </body>
          </html>
        `)
      }
    },
    getBtns() {
      return  [
        {
          name: "CSV",
          size: "large",
          slot: "start",
          color: "primary",
          visible: true,
          onClick: () => this.exportToCsv()
        },
        {
          name: "PDF",
          size: "large",
          slot: "start",
          color: "primary",
          visible: true,
          onClick: () => this.printSpec()
        },
        {
          name: "Regenerate",
          size: "large",
          slot: "end",
          color: "danger",
          visible: true,
          onClick: async () => this.regenerate()
        },
        {
          name: "Disaggregeted",
          size: "large",
          slot: "end",
          color: "primary",
          visible: true,
          onClick: () => this.$router.push(`/art/moh_disaggregated_report?${this.disaggregatedReportParams}`)
        },
        {
          name: "Finish",
          size: "large",
          slot: "end",
          color: "success",
          visible: true,
          onClick: () => this.$router.push({ path:'/' })
        }
      ]   
    }
  }
})
</script>
