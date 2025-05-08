<template>
    <ion-page>
        <v2Datatable default-sort-order="asc" default-sorted-column="arv_number" :icon-url="logo" title="Regimen Formulation: Patient level report" report-prefix="Clinic" :subtitle="period" :columns="columns"
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
import { REGIMENS, FORMULATIONS } from "@/apps/ART/services/reports/regimen_report_service"
import { RegimenReportService } from "@/apps/ART/services/reports/regimen_report_service"
import { FieldType } from '@/components/Forms/BaseFormElements'
import Validation from "@/components/Forms/validations/StandardValidations"
import { Option } from '@/components/Forms/FieldInterface'
import Img from "@/utils/Img";
import { addArvColumn, wrapGeneration } from "@/utils/v2utils";

const logo = Img('reports.png')
const reportData = ref<any>([])
const period = ref('')
const formulationValue = ref('')
const regimenValue = ref('')
const report = new RegimenReportService()

const columns: Array<v2ColumnInterface[]> = [[
    addArvColumn(),
    { label: "Gender", ref: "gender", toValue: (val) => formatGender(val) },
    { label: "Date of Birth", ref: "birthdate", toValue: (val) => `${toDate(val)}` },
    { label: "Reg. name", ref: "regimen" },
    { label: "Formulation", ref: "drugs" }
]]

const generate = () => wrapGeneration(async () => {
    if (!(report.startDate && report.endDate)) return toastWarning('Start date and end date required!')
    reportData.value = []
    reportData.value = await report.getRegimenFormulationReport(regimenValue.value, formulationValue.value);
})

/**
 * Loads a dialogue to allow users to configure start and end date
 */
const configure = () => DateSelection({
    fields: [
        {
            id: 'regimen',
            helpText: 'Select regimen',
            type: FieldType.TT_SELECT,
            validation: (val: Option) => Validation.required(val),
            options: () => REGIMENS.map((r: string) => ({ label: r, value: r }))
        },
        {
            id: 'formulation',
            helpText: 'Select formulation',
            type: FieldType.TT_SELECT,
            validation: (val: Option) => Validation.required(val),
            options: () => FORMULATIONS.map((f: string) => ({ label: f, value: f }))
        }
    ],
    defaultOnFinish: (f: any, c: any) => {
        period.value = `${toDate(c.start_date)} to ${toDate(c.end_date)}`
        report.startDate = c.start_date
        report.endDate = c.end_date
        if (c.occupation) report.setOccupation(c.occupation)
        formulationValue.value = f.formulation.value
        regimenValue.value = f.regimen.value
        generate()
    }
})

/**
 * Initialization code when the report is empty!
 */
onMounted(() => !reportData.value.length && configure())
</script>