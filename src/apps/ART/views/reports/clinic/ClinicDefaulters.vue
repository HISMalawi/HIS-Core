<template>
    <ion-page>
        <v2Datatable default-sort-order="asc" default-sorted-column="arv_number" :icon-url="logo" title="Clinic Defaulters Report" report-prefix="Clinic" :subtitle="period" :columns="columns"
            :columnData="reportData" :rowsPerPage="50" :onConfigure="configure" :onRefresh="generate"
            :headerBadge="headerBadge"/>
    </ion-page>
</template>

<script lang='ts' setup>
import { IonPage } from "@ionic/vue"
import { onMounted, ref } from 'vue'
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { v2ColumnDataInterface, v2ColumnInterface, v2TableBadge } from '@/components/DataViews/tables/v2PocDatatable/types';
import { toastWarning } from '@/utils/Alerts';
import { formatGender, toDate } from "@/utils/Strs";
import { DefaulterReportService } from "@/apps/ART/services/reports/defaulters_report_service"
import { DateSelection } from "@/utils/ReportDateSelectionPrompt";
import { barChart } from "ionicons/icons"
import Img from "@/utils/Img";
import { addArvColumn, wrapGeneration } from "@/utils/v2utils";

const logo = Img('reports.png')
const reportData = ref<any>([])
const period = ref('')
const headerBadge = ref<v2TableBadge[]>([])
const report = new DefaulterReportService()
report.setIsPepfar(false)

const columns: Array<v2ColumnInterface[]> = [[
    addArvColumn(),
    { label: "First name", ref: "given_name", encrypted: true },
    { label: "Last name", ref: "family_name", encrypted: true },
    { label: "Gender", ref: "gender", toValue: (val) => formatGender(val) },
    { label: "Birthdate", ref: "birthdate", toValue: (val) => `${toDate(val)}` },
    { label: "Appointment date", ref: "appointment_date", toValue: (val) => `${toDate(val)}` },
    { label: "Date defaulted", ref: "defaulter_date", toValue: (val) => `${toDate(val)}` },
    { 
        label: "Address",
        ref: "district",
        encrypted: true,
        exportedValue: {
            dataValue: (v: v2ColumnDataInterface) => `
                Cell: ${v.data?.cell_number ?? '-'},
                Village: ${v.data?.village ?? '-'}, 
                District: ${v.data?.district ?? '-'}, 
                TA: ${v.data?.ta ?? '-'}, 
                Landmark: ${v.data?.land_mark ?? '-'} 
            ` 
        },
        value: (data) => (data.cell_number ? `CELL: ${data.cell_number} <br/>`: '') +
            (data.village ? `VILLAGE: ${data.village} <br/>` : '') +
            (data.district ? `DISTRICT: ${data.district} <br/>`: '') +
            (data.ta ? `TA: ${data.ta} <br/>`: '') + 
            (data.landmark ? `Landmark: ${data.landmark}` : '')
    }
]]

const generate = () => wrapGeneration(async () => {
    if (!(report.startDate && report.endDate)) return toastWarning('Start date and end date required!')
    headerBadge.value = []
    reportData.value = []
    reportData.value = await report.getDefaulters();
    headerBadge.value = [{
        text: `Total defaulters: <b>${reportData.value.length}</b>`, 
        icon: barChart,
        color: "primary"
    }]
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