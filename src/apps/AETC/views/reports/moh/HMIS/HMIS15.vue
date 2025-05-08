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
      <div id="report-content">
        <hmis-header :key="componentKey" :reportName="reportName" ref="header" :periodLabel="periodLabel" :periodDates="periodDates" :clinicName="clinicName" :totalOPDVisits="TotalOPDVisits" ></hmis-header>
        <hmis-template :key="componentKey" :reportName="reportName" :onDrillDown="onDrillDown" :params="hmis15Data" :periodDates="periodDates" ref="rep"></hmis-template>
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
import { HMISReportService } from "@/apps/OPD/services/hmis_report_service"
import HmisHeader from "@/apps/OPD/views/reports/moh/MOHReportHeader.vue"
import HmisTemplate from "@/apps/OPD/views/reports/moh/HMIS/HMISTemplate.vue"
import HisDate from "@/utils/Date"
import { NavBtnInterface } from "@/components/HisDynamicNavFooterInterface";

export default defineComponent({
  mixins: [ReportMixinVue],
  components: { IonLoading, HmisHeader, HmisTemplate, HisStandardForm, HisFooter, IonPage, IonContent },
  data: () => ({
    formData: {} as any,
    componentKey: 0 as number,
    computedFormData: {} as any,
    hmis15Data: {} as any,
    btns: [] as Array<NavBtnInterface>,
    isLoading: false as boolean,
    fields: [] as Array<Field>,
    reportID: -1 as any,
    periodLabel: 'Period',
    periodDates: '' as string,
    reportName: 'HMIS 15',
    TotalOPDVisits: 0 as number,
    clinicName: HMISReportService.getLocationName(),
    reportReady: false as boolean,
  }),
  created() {
    this.btns = this.getBtns()
    this.fields = this.getDateDurationFields()
  },
  methods: {
    async onPeriod(form: any, config: any, regenerate=false) {
      this.componentKey += 1
      this.formData = form
      this.computedFormData = config
      this.reportReady = true 
      this.isLoading = true
      this.report = new HMISReportService()
      this.report.setRegenerate(regenerate)
      this.report.setStartDate(HisDate.toStandardHisFormat(config.start_date))
      this.report.setEndDate(HisDate.toStandardHisFormat(config.end_date))
      this.periodDates = this.report.getReportPeriod()
      try {
        const hmis = await this.report.requestHMIS15()
        const visits = await this.report.getAttendance()
        if(hmis && visits) {
          this.reportID = "data"
          this.TotalOPDVisits = visits.length
          this.hmis15Data = hmis
        }
      } catch (error) {
        console.log(error)
      } finally {
        this.isLoading = false
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
          onClick: async () => {
            const rep = this.$refs.rep as any
            rep.onDownload()
          }
        },
        {
          name: "PDF",
          size: "large",
          slot: "start",
          color: "primary",
          visible: true,
          onClick: () => this.exportToCustomPDF(this.reportName)
        },
        {
          name: "Back",
          size: "large",
          slot: "end",
          color: "warning",
          visible: true,
          onClick: () => this.reportReady = false
        },
        {
          name: "Refresh",
          size: "large",
          slot: "end",
          color: "warning",
          visible: true,
          onClick: async () => await this.onPeriod(this.formData, this.computedFormData, true)
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
