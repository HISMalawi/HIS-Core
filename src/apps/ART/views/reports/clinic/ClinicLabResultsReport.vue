<template>
    <ion-page>
        <v2Datatable :header-badge="headerBadge" :default-sorted-column="sortColumn" :default-sort-order="sortOrder" :icon-url="logo"
            title="Lab test result(s)" report-prefix="Clinic" :subtitle="period" :columns="columns"
            :columnData="reportData" :rowsPerPage="50" :onConfigure="configure" />
    </ion-page>
</template>

<script lang='ts' setup>
import { IonPage } from "@ionic/vue"
import { onMounted, ref } from 'vue'
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { formatGender, toDate } from "@/utils/Strs";
import { DateSelection } from "@/utils/ReportDateSelectionPrompt";
import { LabReportService } from "@/apps/ART/services/reports/lab_report_service"
import { FieldType } from '@/components/Forms/BaseFormElements'
import { Option } from '@/components/Forms/FieldInterface'
import { AGE_GROUPS } from "@/apps/ART/services/reports/patient_report_service"
import { addArvColumn, showV2TableModal, wrapGeneration } from "@/utils/v2utils";
import { documents } from "ionicons/icons"
import Img from "@/utils/Img";

const logo = Img('reports.png')
const reportData = ref<any>([])
const period = ref('')
const sortOrder = ref<"asc"|"desc">("asc")
const sortColumn = ref("")
const tests = ref<Option[]>([])
const report = new LabReportService()
const columns = ref<Array<v2ColumnInterface[]>>([])
const reportType = ref<"patient_level"|"disaggregated">("disaggregated")
const headerBadge = ref<any>([])

const buildAvailableTests = (results: any) => {
    const tests: Record<string, any> = {}
    results.forEach((result: any) => {
        result.measures.forEach((measure: any) => {
            if (!(measure.name in tests)) tests[measure.name] = []
            tests[measure.name].push({
                id: result.patient_id,
                arv: result.arv_number,
                gender: result.gender,
                ageGroup: result.age_group,
                birthdate: toDate(result.birthdate),
                ordered: toDate(result.order_date),
                specimen: result.test,
                test:  measure.name,
                result: `${measure.modifier} ${measure.value}`,
                released: toDate(result.result_date)
            })
        })
    })
    return tests
}

const renderReport = () => {
    const patientLevelColumns: Array<v2ColumnInterface[]> = [
        [
            addArvColumn("arv"),
            { label: "Gender", ref: "gender", toValue: (val: string) => formatGender(val) },
            { label: "Birthdate", ref: "birthdate", toValue: (val: string) => `${toDate(val)}` },
            { label: "Ordered", ref: "ordered", toValue: (val: string) => `${toDate(val)}` },
            { label: "Specimen", ref: "specimen" }, 
            { label: "Test", ref: "test" }, 
            { label: "Result", ref: "result" }, 
            { label: "Released", ref: "released", toValue: (val: string) => `${toDate(val)}` }
        ]
    ]
    const data = {
        "disaggregated": {
            sortColumn: "gender",
            sortOrder: "desc",
            columns: [[
                { label: "Age group", ref: "age_group" },
                { label: "Gender", ref: "gender", toValue: (val: string) => formatGender(val) },
                ...tests.value.map((option: any) => ({ 
                    ref: option.label,
                    label: option.label, 
                    toValue: (val: Array<any>) => val.length,
                    tdClick: (row: any) => showV2TableModal({
                        title: `${row.data.age_group} | ${formatGender(row.data.gender)} | ${option.label}`,
                        columns: patientLevelColumns,
                        columnData: row.refData
                    })
                }))
            ]],
            data: () => {
                const get = (gender: "M" | "F") => AGE_GROUPS.reduce((a: any, ageGroup: string) => {
                    const indicators = tests.value.reduce((a: any, c: Option) => {
                        return {...a, [c.label]: c.other.filter((d: any) => d.ageGroup === ageGroup && d.gender === gender) }
                    }, {})
                    return {...a, [ageGroup]: { age_group: ageGroup, gender, ...indicators} }
                }, {})
                const toVal = (gender: "M"|"F") => Object.values(get(gender)).flat(1)
                return [...toVal("F"), ...toVal("M")]
            }
        },
        "patient_level": {
            sortColumn: "arv",
            sortOrder: "asc",
            columns: patientLevelColumns,
            data: () => tests.value.map((t: any) => t.other).flat(1)
        }
    }
    headerBadge.value = [
        {
            text: `<b>View Disaggregated</b>`,
            icon: documents,
            color: reportType.value === 'disaggregated' ? "primary" : "dark",
            action: () => {
                reportType.value = "disaggregated"
                renderReport()
            }
        },
        {
            text: `<b>View Patient Level</b>`,
            icon: documents,
            color: reportType.value === 'patient_level' ? "primary" : "dark",
            action: () => {
                reportType.value = "patient_level"
                renderReport()
            }
        }
    ]
    setTimeout(() => {
        const config: any = data[reportType.value]
        columns.value = config.columns as any
        reportData.value = config.data()
        sortColumn.value = config.sortColumn
        sortOrder.value = config.sortOrder as any
    }, 100)
}

/**
 * Loads a dialogue to allow users to configure start and end date
 */
const configure = () => DateSelection({
    fields: [
        {
            id: 'tests',
            helpText: 'Available test(s) results',
            type: FieldType.TT_MULTIPLE_SELECT,
            options: async (_: any, x: any, config: any) => {
                report.setStartDate(config.start_date)
                report.setEndDate(config.end_date)
                const res = await wrapGeneration(async() => {
                    const data = await report.getLabResultsReport()
                    const availableTests = buildAvailableTests(data)
                    return Object.keys(availableTests).map((k: string) => ({
                        label: k, 
                        value: availableTests[k].length, 
                        other: availableTests[k]
                    }))
                }, false)
                return res ?? []
            }
        },
        {
            id: 'type',
            helpText: 'Select report type',
            type: FieldType.TT_SELECT,
            options: () => [
                { label: 'Disaggregated', value: 'disaggregated'},
                { label: 'Patient level', value: 'patient_level' }
            ]
        }
    ],
    defaultOnFinish: (f: any, c: any) => {
        if (c.occupation) report.setOccupation(c.occupation)
        period.value = `${toDate(c.start_date)} to ${toDate(c.end_date)}`
        report.startDate = c.start_date
        report.endDate = c.end_date
        tests.value = f.tests
        reportType.value = f.type.value
        renderReport()
    }
})

/**
 * Initialization code when the report is empty!
 */
onMounted(() => !reportData.value.length && configure())
</script>