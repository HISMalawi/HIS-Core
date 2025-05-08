<template>
    <ion-page>
        <v2Datatable default-sort-order="asc" default-sorted-column="arv_number" :icon-url="logo" :subtitle="period" title="Clinic Missed Appointments" report-prefix="Clinic" :columns="columns"
            :onConfigure="configure" :columnData="reportData" :rowsPerPage="50" :onRefresh="generate" />
    </ion-page>
</template>

<script lang='ts' setup>
import { IonPage } from "@ionic/vue"
import { onMounted, ref } from 'vue'
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { formatGender, toDate } from "@/utils/Strs";
import { PatientReportService } from '@/apps/ART/services/reports/patient_report_service'
import { DateSelection } from "@/utils/ReportDateSelectionPrompt";
import Img from "@/utils/Img";
import { addArvColumn, wrapGeneration } from "@/utils/v2utils";

const logo = Img('reports.png')
const reportData = ref([])
const period = ref('')
const report = new PatientReportService()
const columns: Array<v2ColumnInterface[]> = [[
    addArvColumn(),
    { label: "First name", ref: "given_name", encrypted: true },
    { label: "Last name", ref: "family_name", encrypted: true }, 
    { label: "Gender", ref: "gender", toValue: (val) => formatGender(val) },
    { label: "DOB", ref: "birthdate", toValue: (val) => `${toDate(val)}` },
    { label: "Appointment", ref: "appointment_date", toValue: (val) => `${toDate(val)}` },
    { label: "Days missed", ref: "days_missed" },
    { label: "Current outcome", ref: "current_outcome" },
    {
        label: "Contact details",
        ref: "district",
        encrypted: true,
        value: (d) => `
            CELL: ${d.cell_number} <br/>
            District: ${d.district} <br/>
            Village: ${d.village} <br/>
            TA: ${d.ta}
        ` 
    }
]]

const generate = () => wrapGeneration(async () => {
    reportData.value = []
    reportData.value = await report.getMissedAppointments();
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