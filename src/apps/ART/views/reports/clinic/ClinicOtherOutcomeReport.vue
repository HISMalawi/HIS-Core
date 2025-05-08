<template>
    <ion-page>
        <v2Datatable default-sort-order="asc" default-sorted-column="identifier" :icon-url="logo" :subtitle="period" :title="`${outcome ?? 'N/A'} Report`" report-prefix="Clinic" :columns="columns"
            :onConfigure="configure" :columnData="reportData" :rowsPerPage="50" :onRefresh="generate" />
    </ion-page>
</template>

<script lang='ts' setup>
import { IonPage } from "@ionic/vue"
import { onMounted, ref } from 'vue'
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { formatGender, toDate } from "@/utils/Strs";
import { PatientReportService } from '@/apps/ART/services/reports/patient_report_service'
import { DateSelection } from "@/utils/ReportDateSelectionPrompt";
import { FieldType } from "@/components/Forms/BaseFormElements";
import { Option } from '@/components/Forms/FieldInterface'
import Validation from "@/components/Forms/validations/StandardValidations"
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import Img from "@/utils/Img";
import { addArvColumn, addViewPatientColumn, wrapGeneration } from "@/utils/v2utils";

const logo = Img('reports.png')
const reportData = ref([])
const period = ref('')
const outcome = ref('')
const report = new PatientReportService()
const columns = ref<Array<v2ColumnInterface[]>>([])
const defaultColumns = [
    addArvColumn("identifier"),
    { label: "First name", ref: "given_name", encrypted: true },
    { label: "Last name", ref: "family_name", encrypted: true },
    { label: "Birthdate", ref: "birthdate", toValue: (val: string) => toDate(val) },
    { label: "Gender", ref: "gender", toValue: (val: string) => formatGender(val) },
    { label: "Outcome date", ref: "outcome_date", toValue: (val: string) => toDate(val) },
    addViewPatientColumn()
]

const generate = () => wrapGeneration(async () => {
    reportData.value = []
    reportData.value = await report.getOtherOutcome(outcome.value);
})

/**
 * Loads a dialogue to allow users to configure start and end date
 */
const configure = () => DateSelection({
    fields: [
        {
            id: 'outcome',
            helpText: 'Select outcome',
            type: FieldType.TT_SELECT,
            validation: (val: Option) => Validation.required(val),
            options: () => [
                {
                    label: 'Transfer Out', value: 'Transfer Out',
                    other: {
                        columns: [
                            addArvColumn('identifier'),
                            { label: "First name", ref: "given_name", encrypted: true },
                            { label: "Last name", ref: "family_name", encrypted: true }, 
                            { label: "Birthdate", ref: "birthdate", toValue: (val: string) => toDate(val) },
                            { label: "Gender", ref: "gender", toValue: (val: string) => formatGender(val) },
                            { label: "Outcome date", ref: "outcome_date", toValue: (val: string) => toDate(val) },
                            { label: "TO Location", ref: "transferred_out_to" },
                            addViewPatientColumn()
                        ]
                    }
                },
                { label: 'Died', value: 'Died', other: { columns: defaultColumns } },
                { label: 'Stopped', value: 'Stopped', other: { columns: defaultColumns } }
            ]
        }
    ],
    defaultOnFinish: (f: any, c: any) => {
        if (c.occupation) report.setOccupation(c.occupation)
        period.value = `${toDate(c.start_date)} to ${toDate(c.end_date)}`
        report.startDate = c.start_date
        report.endDate = c.end_date
        outcome.value = `${f.outcome.value}`
        columns.value = [f.outcome.other?.columns ?? [] as any]
        generate()
    }
})

/**
 * Initialization code when the report is empty!
 */
onMounted(() => !reportData.value.length && configure())
</script>