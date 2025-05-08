<template>
    <ion-page>
        <v2Datatable default-sort-order="asc" :icon-url="logo" title="Lab Audit" :subtitle="period" :columns="columns"
            :columnData="reportData" :rowsPerPage="50" :onConfigure="configure" :onRefresh="generate"
        />
    </ion-page>
</template>

<script lang='ts' setup>
import Img from "@/utils/Img";
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { IonPage } from "@ionic/vue"
import { onMounted, ref } from 'vue'
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { toastWarning } from '@/utils/Alerts';
import { toDate } from "@/utils/Strs";
import { DateSelection } from "@/utils/ReportDateSelectionPrompt";
import { wrapGeneration } from "@/utils/v2utils";
import { LabReportService } from "@/apps/ART/services/reports/lab_report_service";

const logo = Img('reports.png')
const reportData = ref<any>([])
const period = ref('')
const report = new LabReportService()

const columns: Array<v2ColumnInterface[]> = [[
    { label: "Accession number", ref: "accession_number", encrypted: true },
    { label: "Lab encounter", ref: "lab_encounter", encrypted: true },
    { label: "Change date", ref: "change_date", toValue: (val) => `${toDate(val)}` },
    { label: "User", ref: "user", toValue: (val) => `${toDate(val)}` },
    { label: "Change type", ref: "change_type", toValue: (val) => `${toDate(val)}` },
]]

const generate = () => wrapGeneration(async () => {
    if (!(report.startDate && report.endDate)) return toastWarning('Start date and end date required!')
    reportData.value = []
    reportData.value = await report.getLabTrail();
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