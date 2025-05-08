<template>
  <ion-page>
    <v2Datatable default-sort-order="asc" default-sorted-column="arv_number" :icon-url="logo" :subtitle="period" title="Viral Load Register" report-prefix="Clinic" :columns="columns"
      :onConfigure="configure" :headerBadge="headerBadge" :columnData="reportView" :rowsPerPage="50"
      :onRefresh="generate" />
  </ion-page>
</template>

<script lang='ts' setup>
import { IonPage } from "@ionic/vue"
import { computed, onMounted, ref } from 'vue'
import { v2ColumnInterface, v2TableBadge } from '@/components/DataViews/tables/v2PocDatatable/types';
import { toDate } from "@/utils/Strs";
import { ArtReportService } from "@/apps/ART/services/reports/art_report_service"
import { DateSelection } from "@/utils/ReportDateSelectionPrompt";
import { documents, filter } from "ionicons/icons"
import { optionsActionSheet } from '@/utils/ActionSheets'
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import HisDate from '@/utils/Date'
import Img from "@/utils/Img";
import { addArvColumn, showV2TableModal, wrapGeneration } from "@/utils/v2utils";

const logo = Img('reports.png')
const period = ref('')
const reportData = ref([])
const filters = ref('All')
const headerBadge = ref<v2TableBadge[]>([])
const report = new ArtReportService()

const columns: Array<v2ColumnInterface[]> = [
  [
    addArvColumn(),
    { label: 'Accession #', ref: "accession_number" },
    { label: 'Status', ref: "order_status" },
    { label: 'Order Date', ref: "date_ordered", toValue: (val) => `${toDate(val)}`},
    {
      label: 'Result', ref: "result", toValue: (val) => val ? val.replace(/</g, '&lt;') : ""
    },
    { label: 'Date received', ref: "date_received", toValue: (val) => `${toDate(val)??""}` },
    {
      label: 'Mode of Delivery', ref: "result_delivery_mode",
      toValue: (val) => val == 'test_results_delivered_to_site_electronically'
        ? 'Electronic'
        : val == 'test_results_delivered_to_site_manually'
        ? 'Manual'
        : ''
    },
    { label: 'Test reason', ref: "test_reason" },
    {
      label: 'TAT(Days)', ref: "tat",
      value: (row) => {
        if (row.date_received && row.date_ordered) {
          return HisDate.dateDiffInDays(row.date_received, row.date_ordered)
        }
        return ""
      }
    }
  ]
]

const ReportFilters: any = {
  'All' : () => true,
  'No results': (data: any) => !data.result,
  'With Results': (data: any) => data.result,
  'Rejected': (data: any) => data.order_status === 'test-rejected',
  'Drawn': (data: any) => data.order_status === 'drawn',
  'Pending': (data: any) => data.order_status === 'pending',
  'Started': (data: any) => data.order_status === 'started',
  'Failed': (data: any) => data.order_status === 'failed',
  'Not-done': (data: any) => data.order_status === 'not-done',
  'Completed': (data: any) => data.order_status === 'completed',
  "Targeted orders": (data: any) => /target/i.test(`${data.test_reason}`),
  "Targeted orders with results": (data: any) => /target/i.test(`${data.test_reason}`) && data.result
}

const applyFilters = (filter: string) => {
  return ReportFilters[filter] 
    ? reportData.value.filter((data: any) => ReportFilters[filter](data))
    : []
}

const reportView = computed(() => applyFilters(filters.value))

const getHighLevelReport = async () => {
  const calculate = (filter: string) => applyFilters(filter).length||"0"
  const columns = [[ { label: "Indicator", ref: "label" },{ label: "Count", ref: "value" } ]]
  const data: any = [
    { label: "Total Orders", value: calculate("All") },
    { label: "Total Orders With Results", value: calculate("With Results") },
    { label: "Total Orders No Results", value: calculate("No results") },
    { label: "Total Orders Rejected", value: calculate("Rejected") },
    { label: "Total Targeted Orders", value: calculate("Targeted orders") },
    { label: "Total Targeted Orders With Results", value: calculate("Targeted orders with results") },
    { label: "Total Orders Drawn", value: calculate("Drawn") },
    { label: "Total Orders Pending", value: calculate("Pending")},
    { label: "Total Orders Started", value: calculate("Started")},
    { label: "Total Orders Failed", value: calculate("Failed")},
    { label: "Total Orders Not-done", value: calculate("Not-done")},
    { label: "Total Orders Completed", value: calculate("Completed")},
    { 
      label: "Average TAT (days)", 
      value: (() => {
        let totalTAT = 0
        const totalDays = reportData.value.reduce((all: any, row: any) => {
          if (row.date_received && row.date_ordered) {
            ++totalTAT
            return all + parseInt(`${HisDate.dateDiffInDays(row.date_received, row.date_ordered)}`)
          }
          return all
        }, 0)
        return Math.floor(totalDays/totalTAT)
      })()
    }
  ];
  showV2TableModal({
    title: "Register Summary",
    columns,
    columnData: data,
    subtitle: period.value,
    rowsPerPage: 50
  })
}

const setHeaderBadges = () => {
  headerBadge.value = [
    {
      text: `<b>High level view</b>`,
      icon: documents,
      color: "primary",
      action: () => getHighLevelReport()
    },
    {
      text: `<b>Report filter: <i>${filters.value}</i></b>`,
      icon: filter,
      color: "primary",
      action: async () => {
        const modal = await optionsActionSheet(
          `Select report filter`,
          '',
          Object.keys(ReportFilters),
          [
            { name: 'Cancel', slot: 'start' }, 
            { name: 'Select', slot: 'end', role: 'action' }
          ]
        )
        filters.value = modal?.selection||filters.value
        setHeaderBadges()
      }
    }
  ]
}

const generate = () => wrapGeneration(async () => {
  reportData.value = []
  headerBadge.value = []
  reportData.value = await report.getClinicElectronicAlerts();
  setHeaderBadges()
})

/**
* Loads a dialogue to allow users to configure start and end date
*/
const configure = () => DateSelection({
  onFinish: (sDate: string, eDate: string, periodstr: string, occupation: string) => {
    if (occupation) report.setOccupation(occupation)
    period.value = `${periodstr}`
    report.startDate = sDate
    report.endDate = eDate
    generate()
  }
})

/**
 * Initialization code when the report is empty!
 */
onMounted(() => !reportData.value.length && configure())
</script>