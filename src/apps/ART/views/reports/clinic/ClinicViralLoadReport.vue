<template>
    <ion-page>
        <v2Datatable default-sort-order="asc" default-sorted-column="arv_number" :icon-url="logo" :title="title" report-prefix="Clinic" :subtitle="period" :columns="columns"
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
import { DateSelection } from "@/utils/ReportDateSelectionPrompt";
import { PatientReportService } from "@/apps/ART/services/reports/patient_report_service"
import { FieldType } from '@/components/Forms/BaseFormElements'
import Validation from "@/components/Forms/validations/StandardValidations"
import { Option } from '@/components/Forms/FieldInterface'
import Img from "@/utils/Img";
import { addArvColumn, addViewPatientColumn, wrapGeneration } from "@/utils/v2utils";

const logo = Img('reports.png')
const title = ref('')
const resultType = ref('')
const reportData = ref<any>([])
const period = ref('')
const report = new PatientReportService()

const columns: Array<v2ColumnInterface[]> = [[
    addArvColumn(),
    { label: "Gender", ref: "gender", toValue: (val) => formatGender(val) },
    { label: "Birthdate", ref: "birthdate", toValue: (val) => `${toDate(val)}` },
    { label: "Specimen", ref: "specimen" },
    { label: "Ordered", ref: "order_date", toValue: (val: any) => `${toDate(val)}` }, 
    { label: "Result", ref: "result", value: (d) => `${d.result_modifier ?? ''} ${d.result}` },
    { label: "Released", ref: "result_date", toValue: (val) => `${toDate(val)}` },
    { label: "Curr. Regimen", ref: "current_regimen", defaultValue: "" },
    addViewPatientColumn()
]]

const generate = () => wrapGeneration(async()=>{
    if (!(report.startDate && report.endDate)) return toastWarning('Start date and end date required!')
    reportData.value = []
    reportData.value = await report.getViralLoadResults(`${resultType.value}`.toLowerCase());
})

/**
 * Loads a dialogue to allow users to configure start and end date
 */
const configure = () => DateSelection({
    fields: [
        {
            id: 'result_type',
            helpText: 'Select result type',
            type: FieldType.TT_SELECT,
            validation: (val: Option) => Validation.required(val),
            options: () => [
                {
                    label: 'Viraemia 1000+',
                    value: 'viraemia-1000'
                },
                {
                    label: 'Suppressed',
                    value: 'suppressed'
                },
                {
                    label: 'Low level viraemia',
                    value: 'low-level-viraemia'
                }
            ]
        }
    ],
    defaultOnFinish: (f: any, c: any) => {
        period.value = `${toDate(c.start_date)} to ${toDate(c.end_date)}`
        report.startDate = c.start_date
        report.endDate = c.end_date
        if (c.occupation) report.setOccupation(c.occupation)
        title.value = `${f.result_type.label} Report`
        resultType.value = f.result_type.value
        generate()
    }
})

/**
 * Initialization code when the report is empty!
 */
onMounted(() => !reportData.value.length && configure())
</script>