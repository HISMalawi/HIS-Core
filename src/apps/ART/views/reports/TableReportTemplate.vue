<template>
  <his-standard-form
    v-show="!canShowReport"
    @onFinish="onFinish"
    :skipSummary="true" 
    :fields="fields">
  </his-standard-form>
  <ion-page v-if="canShowReport">
    <ion-header>
      <ion-toolbar>
        <ion-title v-if="showtitleOnly"> 
          <span v-html="title"></span> 
        </ion-title>
        <ion-item  v-if="!showtitleOnly"> 
          <ion-thumbnail slot="start"> 
            <ion-img :src="logo"/>
          </ion-thumbnail>
          <ion-label>
            <ul class="header-text-list"> 
              <li>Title <b>{{ title }}</b></li>
              <li>Period <b>{{ period }}</b></li>
              <li v-for="(info, index) in headerInfoList" :key="index"> 
                {{ info.label }}
                <a href="#" v-if="info && info?.other?.onclick"
                  @click.prevent="info.other.onclick()">
                  {{ info.value }}
                </a>
                <b v-if="info && !info?.other?.onclick"><span v-html="info.value"></span></b> 
              </li>
              <li v-if="showValidationStatus">
                <ion-chip @click="showErrors" color="danger" v-if="hasErrors"> 
                  <b>{{errorCount}} </b> Error(s) found. Click for more
                </ion-chip>
                <ion-chip color="success" v-if="!hasErrors"> 
                  Report is Consistent
                </ion-chip>
              </li>
            </ul>
          </ion-label>
        </ion-item>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="report-content">
        <report-table
          :rows="rows"
          :columns="columns"
          :showFilters="showFilters"
          :config="{
            ...config,
            tableCssTheme: tableCssTheme
          }"
          @onActiveColumns="onActiveColumns"
          @onActiveRows="onActiveRows"
          >
        </report-table>
      </div>
    </ion-content>
    <ion-footer> 
      <ion-toolbar> 
        <ion-chip color="primary">Date Created: <b>{{ date }}</b></ion-chip>
        <ion-chip color="primary">His-Core Version: <b>{{ coreVersion }}</b></ion-chip>
        <ion-chip color="primary">API Version: <b>{{ apiVersion }}</b></ion-chip>
      </ion-toolbar>
    </ion-footer>
    <his-footer :btns="btns"></his-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import HisFooter from "@/components/HisDynamicNavFooter.vue";
import ReportTable from "@/components/DataViews/tables/ReportDataTable.vue"
import { Field } from '@/components/Forms/FieldInterface'
import { toCsv, toTablePDF } from "@/utils/Export"
import { toExportableFormat, ColumnInterface, RowInterface} from "@/components/DataViews/tables/ReportDataTable" 
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { 
  IonPage,
  IonHeader,
  IonContent,
  IonFooter,
  IonToolbar,
  IonLabel,
  IonThumbnail,
  IonItem,
  IonChip,
  IonImg,
  loadingController,
  modalController
} from "@ionic/vue"
import { alertConfirmation, toastDanger } from "@/utils/Alerts";
import Img from "@/utils/Img"
import { Service } from "@/services/service"
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import ReportErrors from "@/apps/ART/Components/ReportErrors.vue"
import { EncryptionOptions } from "jspdf";
import { infoActionSheet } from "@/utils/ActionSheets";
import { removeTags } from "@/utils/Strs";

export default defineComponent({
  components: { 
    HisStandardForm,   
    IonHeader,
    ReportTable, 
    HisFooter, 
    IonPage, 
    IonContent, 
    IonToolbar,
    IonChip,
    IonFooter,
    IonLabel,
    IonThumbnail,
    IonItem,
    IonImg
  },
  props: {
    encryptPDF: {
      type: Boolean,
      default: false
    },
    showValidationStatus: {
      type: Boolean,
      default: false
    },
    validationErrors: {
      type: Array as PropType<Array<any>>,
      default: () => []
    },
    config: {
      type: Object
    },
    headerInfoList: {
      type: Array as PropType<Array<any>>,
      default: () => []
    },
    reportPrefix: {
      type: String,
      default: ''
    },
    reportLogo: {
      type: String,
    },
    showtitleOnly: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true,
    },
    period: {
      type: String
    },
    showFilters: {
      type: Boolean,
      default: false
    },
    fields: {
      type: Array as PropType<Field[]>,
      default: () => []
    },
    columns: {
      type: Object as PropType<Array<ColumnInterface[]>>,
      required: true
    },
    rows: {
      type: Object as PropType<Array<RowInterface[]>>,
      required: true
    },
    customBtns: {
      type: Array as PropType<Array<any>>,
      default: () => []
    },
    hasServerSideCaching: {
      type: Boolean,
      default: false
    },
    canExportPDf: {
      type: Boolean,
      default: true
    },
    canExportCsv: {
      type: Boolean,
      default: true
    },
    enabledPDFHorizontalPageBreak: {
      type: Boolean,
      default: false
    },
    onFinishBtnAction: {
      type: Function
    },
    onReportConfiguration: {
      type: Function,
      required: true
    },
    onDefaultConfiguration: {
      type: Function
    },
    customFileName: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    date: '',
    formData: {} as any,
    btns: [] as Array<any>,
    computeFormData: {} as any,
    activeColumns: [] as any,
    activeRows: [] as any,
    isLoadingData: false as boolean,
    canShowReport: false as boolean,
    siteUUID: Service.getSiteUUID() as string,
    apiVersion: Service.getApiVersion(),
    coreVersion: Service.getCoreVersion(),
    artVersion: Service.getAppVersion(),
    tableCssTheme: 'art-report-theme'
  }),
  watch: {
    validationErrors: {
      handler(errors: string[]) {
        if (!isEmpty(errors)) this.showErrors()
      },
      deep: true,
      immediate: true
    },
    fields: {
      handler(fields: Array<any>) {
        if (!isEmpty(fields)) {
          this.canShowReport = false;
          this.btns.forEach(b => {
            if (b.name === 'Back') {
              b.visible = true
            } 
          })
        } else {
          this.canShowReport = true;
          this.refreshTimeStamp();
        }
      },
      immediate: true
    }
  },
  computed: {
    logo(): string {
      if (!this.reportLogo && typeof this.reportPrefix === 'string') {
        if (this.reportPrefix.match(/pepfar/i)) {
          return Img('login-logos/PEPFAR.png')
        }
        if (this.reportPrefix.match(/moh/i)) {          
          return Img('login-logos/Malawi-Coat_of_arms_of_arms.png')
        }
      }
      return Img('reports.png')
    },
    hasErrors(): boolean {
      return !isEmpty(this.validationErrors)
    },
    errorCount(): number {
      return this.validationErrors ? this.validationErrors.length : 0
    },
    footerRows(): Array<Array<string>> {
      const rows = [[`Date Created: ${this.date}`]]
      if(this.period) rows.push([`Quarter: ${this.period}`]);
      rows.push([`HIS-Core Version: ${this.coreVersion}`])
      rows.push([`API Version: ${this.apiVersion}`])
      rows.push([`Site UUID: ${this.siteUUID}`])
      rows.push([`Generated by: ${Service.getUserName()}`]);
      return rows;
    }
  },
  methods: {
    async showErrors() {
      const modal = await modalController.create({
        component: ReportErrors,
        backdropDismiss: false,
        cssClass: "large-modal",
        componentProps: {
          errors: this.validationErrors
        }
      })
      modal.present();
    },
    pdfEncryptionData(): Record<"encryption", EncryptionOptions> {
      const password = Service.getUserName()
      return {
        encryption: {
          userPassword: password,
          ownerPassword: password,
          userPermissions: ["print"]
        }
      }
    },
    refreshTimeStamp() {
      this.date = dayjs().format('DD/MMM/YYYY HH:MM:ss')
    },
    onActiveColumns(columns: any) {
      this.activeColumns = columns
    },
    onActiveRows(rows: any) {
      this.activeRows = rows
    },
    getFileName() {
      return this.customFileName || 
        `${this.reportPrefix} ${Service.getLocationName()} ${removeTags(this.title).replace(this.reportPrefix, "")} ${this.period ?? this.date}`
    },
    /**
     * Loads report without depending on Field configurations
     */
    async onLoadDefault() {
      this.canShowReport = true
      await this.presentLoading()
      try {
        this.refreshTimeStamp()
        if (this.onDefaultConfiguration) {
          await this.onDefaultConfiguration()
        }
        loadingController.dismiss()
      }catch(e) {
        toastDanger(`${e}`)
        console.error(e)
        loadingController.dismiss()
      }
    },
    /**
     * Callback is used when a form has been submitted with report configurations
     */
    async onFinish(formData: any, computedData: any, shouldRebuildCache=false) {
      this.formData = formData
      this.computeFormData = computedData
      this.canShowReport = true
      await this.presentLoading()
      try {
        this.refreshTimeStamp()
        await this.onReportConfiguration(
          this.formData,
          this.computeFormData,
          shouldRebuildCache
        )
        loadingController.dismiss()
      }catch(e) {
        toastDanger(`${e}`)
        console.error(e)
        loadingController.dismiss()
      }
    },
    /**Reinitiate the report with default configurations */
    async reloadReport(shouldRebuildCache=false) {
      if (!isEmpty(this.formData) || !isEmpty(this.computeFormData)) {
        await this.onFinish(this.formData, this.computeFormData, shouldRebuildCache)
        return
      }
      if (this.onDefaultConfiguration) {
        await this.onLoadDefault()
      }
    },
    async presentLoading() {
      const loading = await loadingController
        .create({
          message: 'Please wait...',
          backdropDismiss: false
        })
      await loading.present()
    }
  },
  created() {
    if (this.onDefaultConfiguration) {
      this.onLoadDefault()
    } 
    this.btns = this.customBtns
    this.btns.push({
      name: "CSV",
      size: "large",
      slot: "start",
      color: "primary",
      visible: this.canExportCsv,
      onClick: async () => {
        const {columns, rows} = toExportableFormat(this.activeColumns, this.activeRows, 'csvMode')
        toCsv(
          columns, 
          [
            ...rows,
            ...this.footerRows
          ],
          this.getFileName()
        )
      }
    })
    this.btns.push({
      name: "PDF",
      size: "large",
      slot: "start",
      color: "primary",
      visible: this.canExportPDf,
      onClick: async () => {
        let mode: 'pdfMode' | 'ignorePDFColumnexport' = 'pdfMode'
        if (this.encryptPDF) {
          const option = await infoActionSheet(
            'Security warning',
            'PDF may contain private data that will require a password to unlock',
            'To access private data choose Secure PDF over Regular PDF',
            [
              { 
                name: "Secure PDF",
                slot: "start",
                color: "success"
              },
              { 
                name: "Regular PDF",
                slot: "start",
                color: "success"
              }
            ],
            'his-danger-color'
          )
          mode = option === 'Secure PDF' ? 'pdfMode' : 'ignorePDFColumnexport'
        }
        const {columns, rows} = toExportableFormat(this.activeColumns, this.activeRows, mode)
        toTablePDF(
          columns, 
          rows, 
          this.getFileName(), 
          this.enabledPDFHorizontalPageBreak,
          this.encryptPDF && mode !='ignorePDFColumnexport' ? this.pdfEncryptionData() : {}
        )
      }
    })
    this.btns.push({
      name: "Refresh/Rebuild",
      size: "large",
      slot: "end",
      color: "warning",
      visible: true,
      onClick: async () => {
        let shouldRebuildCache = false
        if (this.hasServerSideCaching) {
          shouldRebuildCache = await alertConfirmation('Do you want to rebuild report cache?', { header: "Rebuild Report"})
        }
        this.reloadReport(shouldRebuildCache)
      } 
    })
    this.btns.push({
      name: "Back",
      size: "large",
      slot: "end",
      color: "primary",
      visible: !isEmpty(this.fields),
      onClick: () => this.canShowReport = false
    })
    this.btns.push({
      name: "Finish",
      size: "large",
      slot: "end",
      color: "success",
      visible: true,
      onClick: () => {
        if (this.onFinishBtnAction) {
          this.onFinishBtnAction()
        } else {
          this.$router.push({ path:'/' })   
        }
      }
    })
  }
})
</script>
<style scoped>
.logo {
  width: 60px;
  margin: auto;
}
.header-text-list {
  list-style: none;
}
.report-content {
  margin: auto;
  width: 99.9%;
  height: 99%;
  overflow: auto;
}
a {
  text-decoration: none;
  font-weight: 600;
  font-size: 1em;
}
</style>
