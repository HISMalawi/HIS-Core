<template>
    <report-template
        :title="title"
        :period="period"
        :rows="rows" 
        :fields="fields"
        :columns="columns"
        :canExportCsv="true"
        :canExportPDf="true"
        :reportReady="reportReady"
        :onReportConfiguration="onPeriod"
        > 
    </report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { LabReportService } from "@/apps/ART/services/reports/lab_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import { AGE_GROUPS } from "@/apps/ART/services/reports/patient_report_service"
import { FieldType } from '@/components/Forms/BaseFormElements'
import { Field } from '@/components/Forms/FieldInterface'
import { Option } from '@/components/Forms/FieldInterface'
import table from "@/components/DataViews/tables/ReportDataTable"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'Lab test result(s)',
        rows: [] as Array<any>,
        cohort: [] as Array<any>,
        reportType: '' as string,
        reportReady: false as boolean,
        columns: [] as Array<any>,
        patientLevelColumns:[ 
            [
                table.thTxt('ARV#'), 
                table.thTxt('Gender'), 
                table.thTxt('Birthdate'), 
                table.thTxt('Ordered'), 
                table.thTxt('Specimen'), 
                table.thTxt('Test'), 
                table.thTxt('Result'), 
                table.thTxt('Released')
            ]
        ],
        disaggregatedColumns: [
            table.thTxt('Age group'), 
            table.thTxt('Gender')
        ]
    }),
    created() {
        this.report = new LabReportService()
        this.fields = this.getFormFields()
    },
    methods: {
        async onPeriod({type, tests}: any) {
            this.reportReady = true
            this.rows = []
            this.period = this.report.getDateIntervalPeriod()
            this.reportType = type.value
            if (this.reportType === 'disaggregated') {
                this.setDisaggregatedRows(tests)
            } else if (this.reportType === 'patient_level') {
                this.setPatientLevelRows(tests)
            }
        },
        getFormFields(): Array<Field> {
            return [
                ...this.getDateDurationFields(),
                {
                    id: 'tests',
                    helpText: 'Available test(s) results',
                    type: FieldType.TT_MULTIPLE_SELECT,
                    options: async (_: any, x: any, config: any) => {
                        this.report.setStartDate(config.start_date)
                        this.report.setEndDate(config.end_date)
                        const data = await this.report.getLabResultsReport()
                        const availableTests = this.buildAvailableTests(data)
                        return this.buildAvailableTestOptions(availableTests)
                    } 
                },
                {
                    id: 'type',
                    helpText: 'Select report type',
                    type: FieldType.TT_SELECT,
                    options: () => [
                        {
                            label: 'Disaggregated',
                            value: 'disaggregated',
                        },
                        {
                            label: 'Patient level',
                            value: 'patient_level',
                        }
                    ]
                }
            ]
        },
        buildAvailableTests(results: any) {
            const tests: Record<string, any> = {}
            this.sortByArvNumber(results).forEach((result: any) => {
                result.measures.forEach((measure: any) => {
                    if (!(measure.name in tests)) {
                        tests[measure.name] = []
                    }
                    tests[measure.name].push({
                        id: result.patient_id,
                        arv: result.arv_number,
                        gender: result.gender,
                        ageGroup: result.age_group,
                        birthdate: this.toDate(result.birthdate),
                        ordered: this.toDate(result.order_date),
                        specimen: result.test,
                        test:  measure.name,
                        result: `${measure.modifier} ${measure.value}`,
                        released: this.toDate(result.result_date)
                    })
                })
            })
            return tests
        },
        buildAvailableTestOptions(availableTests: Record<string, any>) {
            const options: Array<Option> = []
            for(const test in availableTests) {
                const result = availableTests[test]
                options.push({
                    label: test,
                    value: result.length,
                    other: result
                })
            }
            return options
        },
        setDisaggregatedRows(results: Array<Option>) {
            const males = []
            const females = []
            this.columns = [this.disaggregatedColumns.concat(results.map((i: any) => table.thTxt(i.label)))]
            for(const ageGroupIndex in AGE_GROUPS) {
                const group = AGE_GROUPS[ageGroupIndex]
                const maleRow: any = [table.td(group), table.td('M')]
                const femaleRow: any = [table.td(group), table.td('F')]
                results.forEach(({other}: Option) => {
                    const filterByGender = (gender: 'F' | 'M') => {
                        return other.filter((i: any) => i.gender === gender && i.ageGroup === group)
                                    .map((i: any) => i.id)
                    }
                    maleRow.push(this.drill(filterByGender('M')))
                    femaleRow.push(this.drill(filterByGender('F')))
                })
                males.push(maleRow)
                females.push(femaleRow)
                this.rows = [...females, ...males]
            }
        },
        setPatientLevelRows(results: Array<Option>) {
            this.columns = this.patientLevelColumns
            results.forEach(({other}: Option)  => {
                other.forEach((d: any) => {
                    this.rows.push([
                        this.tdARV(d.arv),
                        table.td(d.gender),
                        table.tdDate(d.birthdate),
                        table.tdDate(d.ordered),
                        table.td(d.specimen),
                        table.td(d.test),
                        table.td(d.result),
                        table.tdDate(d.released)
                    ])
                })
            })
        }
    }
})
</script>
