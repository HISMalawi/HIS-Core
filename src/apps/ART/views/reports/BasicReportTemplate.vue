<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-row> 
          <ion-col> 
            <h1> {{title}} </h1>
          </ion-col>
        </ion-row>
      </ion-toolbar>
      <ion-toolbar> 
        <report-filter
          :showPerPageFilter="showFilters || paginated"
          :disableSearchFilter="isTableLoading"
          :disablePerPageFilter="isTableLoading"
          :totalRowCount="tableRows.length"
          @onItemsPerPage="(i) => itemsPerPage = i"
          @onSearchFilter="(f) => searchFilter = f"> 
        </report-filter>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="report-content">
        <report-table
          :rows="rows"
          :paginated="paginated"
          :asyncRows="asyncRows"
          :rowParser="rowParser"
          :columns="columns"
          :showFilters="showFilters"
          :newPage="currentPage"
          :searchFilter="searchFilter"
          :rowsPerPage="itemsPerPage"
          @onIsLoading="(l) => isTableLoading = l"
          @onTableRows="(r) => tableRows = r"
          @onPagination="(p) => totalPages = p.length"
          @onActiveColumns="(c) => activeColumns = c"
          @onActiveRows="(r) => activeRows = r">
        </report-table>
      </div>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <pagination
          v-if="!searchFilter && paginated || !searchFilter && totalPages > 0 && paginated"
          :perPage="itemsPerPage"
          :maxVisibleButtons="10"
          :totalPages="totalPages"
          @onChangePage="(p) => currentPage=p"
          />
      </ion-toolbar>
      <ion-toolbar v-if="showReportStamp"> 
        <ion-chip color="primary">Date Created: <b>{{ date }}</b></ion-chip>
        <ion-chip color="primary">His-Core Version: <b>{{ coreVersion }}</b></ion-chip>
        <ion-chip color="primary">API Version: <b>{{ apiVersion }}</b></ion-chip>
      </ion-toolbar>
    </ion-footer>
    <his-footer :color="footerColor" :btns="btns"></his-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import HisFooter from "@/components/HisDynamicNavFooter.vue";
import { toExportableFormat, ColumnInterface, RowInterface, AsyncTableRowHandler, TableRowParser} from "@/components/DataViews/tables/ReportDataTable" 
import ReportTable from "@/components/DataViews/tables/ReportDataTable.vue"
import { IonCol, IonRow, IonPage,IonHeader, IonContent, IonToolbar, IonChip, IonFooter } from "@ionic/vue"
import { toCsv, toTablePDF } from "@/utils/Export"
import { Service } from "@/services/service"
import HisDate from "@/utils/Date"
import ReportFilter from "@/components/ReportFilter.vue"
import Pagination from "@/components/Pagination.vue"
import { EncryptionOptions } from "jspdf";
import { infoActionSheet } from "@/utils/ActionSheets";

export default defineComponent({
  components: {
    IonCol, 
    IonRow, 
    Pagination, 
    ReportTable, 
    ReportFilter, 
    HisFooter, 
    IonPage, 
    IonHeader,
    IonContent, 
    IonToolbar, 
    IonChip, 
    IonFooter 
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    columns: {
      type: Array as PropType<Array<Array<ColumnInterface>>>,
      required: true
    },
    encryptPDF: {
      type: Boolean,
      default: false
    },
    rows: {
      type: Array as PropType<Array<Array<RowInterface>>>,
      default: () => []
    },
    rowParser: {
      type: Function as PropType<TableRowParser>
    },
    showFilters: {
      type: Boolean,
      default: false
    },
    rowsPerPage: {
      type: Number
    },
    asyncRows: {
      type: Function as PropType<AsyncTableRowHandler>
    },
    paginated: {
      type: Boolean,
      default: false
    },
    customBtns: {
      type: Array,
      default: () => []
    },
    showReportStamp: {
      type: Boolean,
      default: true
    },
    footerColor: {
      type: String,
      default: 'dark'
    },
    customFileName: {
      type: String,
      default: ''
    },
    canExport: {
      type: Boolean,
      default: true
    },
    onFinish: {
      type: Function as PropType<() => Promise<any> | any>
    }
  },
  data: () => ({
    btns: [] as Array<any>,
    isTableLoading: false as boolean,
    searchFilter: '' as string,
    itemsPerPage: 50 as number,
    currentPage: 0 as number,
    coreVersion: Service.getCoreVersion(),
    tableRows: [] as any,
    totalPages: 0 as number,
    activeColumns: [] as any,
    activeRows: [] as any,
    date: HisDate.toStandardHisDisplayFormat(Service.getSessionDate()),
    apiVersion: Service.getApiVersion(),
    siteUUID: Service.getSiteUUID() as string,
  }),
  methods: {
    getFileName(){
      return this.customFileName ? this.customFileName : this.title
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
  },
  created() {
    this.btns = [
      ...this.customBtns,
      {
        name: "CSV",
        size: "large",
        slot: "start",
        color: "primary",
        visible: this.canExport,
        onClick: () => {
          const {columns, rows} = toExportableFormat(this.activeColumns, this.activeRows, "csvMode")
          toCsv(columns, [
            ...rows,
            [`Date Created: ${this.date}`],
            [`HIS-Core Version: ${this.coreVersion}`],
            [`API Version: ${this.apiVersion}`],
            [`Site UUID: ${this.siteUUID}`],
            [`Generated by: ${Service.getUserName()}`]
          ], this.getFileName())
        }
      },
      {
        name: "PDF",
        size: "large",
        slot: "start",
        color: "primary",
        visible: this.canExport,
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
            false,
            this.encryptPDF && mode !='ignorePDFColumnexport' ? this.pdfEncryptionData() : {}
          )
        }
      },
      {
        name: "Finish",
        size: "large",
        slot: "end",
        color: "success",
        visible: true,
        onClick: () => {
          if (typeof this.onFinish === 'function') {
            return this.onFinish()
          }
          this.$router.push({ path:'/' })
        }
      }
    ]
  }
})
</script>

