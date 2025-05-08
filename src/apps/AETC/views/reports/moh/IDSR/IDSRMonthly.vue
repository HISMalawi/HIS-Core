<template>
  <ion-loading :is-open="isLoading" message="Please wait...">
  </ion-loading>
  <his-standard-form v-if="!reportReady" @onFinish="onPeriod" :skipSummary="true" :fields="fields">
  </his-standard-form>
  <ion-page v-if="reportReady">
    <ion-content>
      <div id="report-content">
        <idsr-h :key="componentKey" :reportName="reportName" :rangeLabel="rangeLabel" :range="range" ref="header" :periodLabel="periodLabel" :periodDates="periodDates" :clinicName="clinicName" :totalOPDVisits="TotalOPDVisits"></idsr-h>
        <monthly :key="componentKey" :onDrillDown="onDrillDown" :params="idsr" :month="range" ref="rep"> </monthly>
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
import { IDSRReportService } from "@/apps/OPD/services/idsr_service"
import IdsrH from "@/apps/OPD/views/reports/moh/MOHReportHeader.vue"
import Monthly from "@/apps/OPD/views/reports/moh/IDSR/IDSRTableTemplate.vue"
import HisDate from "@/utils/Date"

export default defineComponent({
  mixins: [ReportMixinVue],
  components: { IonLoading, IdsrH, Monthly, HisStandardForm, HisFooter, IonPage, IonContent },
  data: () => ({
    formData: {} as any,
    componentKey: 0 as number,
    computedFormData: {} as any,
    idsr: {} as any,
    btns: [] as Array<any>,
    isLoading: false as boolean,
    fields: [] as Array<Field>,
    reportID: -1 as any,
    periodLabel: 'Month Dates',
    periodDates: '' as string,
    reportName: 'MONTHLY DISEASE SURVEILLANCE REPORT',
    rangeLabel: 'Month',
    range: '' as string,
    TotalOPDVisits: 0 as number,
    clinicName: IDSRReportService.getLocationName(),
    reportReady: false as boolean,
  }),
  created() {
    this.btns = this.getBtns()
    this.fields = this.getMonthlyFields()
  },
  methods: {
    async onPeriod(form: any, config: any, regenerate = false) {
      this.componentKey += 1
      this.formData = form
      this.computedFormData = config
      this.reportReady = true
      this.isLoading = true
      this.report = new IDSRReportService()
      this.report.setRegenerate(regenerate)
      this.report.setEpiWeek(form.idsrmonth.label)
      this.report.setStartDate(HisDate.toStandardHisFormat(form.idsrmonth.other.start))
      this.report.setEndDate(HisDate.toStandardHisFormat(form.idsrmonth.other.end))
      this.periodDates = this.report.getReportPeriod()
      this.range = form.idsrmonth.label.split(" ")[0]
      try {
        const idsr = await this.report.requestIDSRMonthly()
        const visits = await this.report.getAttendance()
        if (idsr && visits) {
          this.reportID = "data"
          this.TotalOPDVisits = visits.length
          this.idsr = idsr
        }
      } catch (error) {
        console.log(error)
      } finally {
        this.isLoading = false
      }
    },
    getBtns() {
      return [
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
          onClick: () => this.exportToCustomPDF('Print IDSR Monthly Report')
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
          onClick: () => this.$router.push({ path: '/' })
        }
      ]
    },
  }
})
</script>
