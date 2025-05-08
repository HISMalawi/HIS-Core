<template>
    <ion-page>
        <v2Datatable 
            title="Clinic Clients due for VL (clients with appointments in specified period)" 
            report-prefix="Clinic" 
            default-sort-order="asc" 
            default-sorted-column="arv_number"
            :icon-url="logo"
            :subtitle="period" 
            :columns="columns"
            :columnData="reportData" :rowsPerPage="50" :onConfigure="configure" :onRefresh="generate" />
    </ion-page>
</template>

<script lang='ts' setup>
import { IonPage } from "@ionic/vue"
import { onMounted, ref } from 'vue'
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { toastWarning } from '@/utils/Alerts';
import { formatGender, toDate } from "@/utils/Strs";
import { PatientReportService } from "@/apps/ART/services/reports/patient_report_service"
import { DateSelection } from "@/utils/ReportDateSelectionPrompt";
import ART_GLOBAL_PROP from "@/apps/ART/art_global_props" 
import dayjs from "dayjs";
import { Service } from "@/services/service";
import Img from "@/utils/Img";
import { addArvColumn, wrapGeneration } from "@/utils/v2utils";

const reportData = ref<any>([])
const logo = Img('reports.png')
const period = ref('')
const report = new PatientReportService()
const columns = ref<Array<v2ColumnInterface[]>>([[]])

/**
 * Initialization code when the report is empty!
 */
onMounted(() => {
    ART_GLOBAL_PROP.filingNumbersEnabled().then((isFn: any) => {
        columns.value = [[
            isFn ? { label: "Filing #", ref: "arv_number" } : addArvColumn(),
            { label: "First name", ref: "given_name", encrypted: true },
            { label: "Last name", ref: "family_name", encrypted: true },
            { label: "Gender", ref: "gender", toValue: (val) => formatGender(val) },
            { label: "Age", ref: "birthdate", toValue: (val) => val ? dayjs(Service.getSessionDate()).diff(val, 'years') : 'N/A' },
            { label: "App.", ref: "appointment_date", toValue: (val) => `${toDate(val)}` },
            { label: "ART started", ref: "start_date", toValue: (val) => `${toDate(val)}` },
            { label: "Months on ART", ref: "months_on_art"},
            { label: "Milestone", ref: "mile_stone"}, 
            { label: "Ordered", ref: "last_result_order_date", toValue: (val) => `${toDate(val)}`},
            { label: "Result", ref: "last_result"},
            { label: "Released", ref: "last_result_date", toValue: (val) =>`${toDate(val)}`}
        ]]
        !reportData.value.length && configure()
    })
})

const generate = () => wrapGeneration(async () => {
    if (!(report.startDate && report.endDate)) return toastWarning('Start date and end date required!')
    reportData.value = []
    reportData.value = await report.getClientsDueForVl();
})

/**
 * Loads a dialogue to allow users to configure start and end date
 */
const configure = () => DateSelection({
    maxDate: "",
    onFinish: (sDate: string, eDate: string, periodstr: string, occupation: string) => {
        if (occupation) report.setOccupation(occupation)
        period.value = `${periodstr}`
        report.startDate = sDate
        report.endDate = eDate
        generate()
    }
})
</script>