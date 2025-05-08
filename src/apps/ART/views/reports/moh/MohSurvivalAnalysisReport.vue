<template>
    <ion-page>
        <report-template
            :title="title"
            :period="period"
            :rows="rows" 
            :fields="fields"
            :columns="columns"
            :config="{
                showIndex: false
            }"
            reportPrefix="MoH"
            :hasServerSideCaching="true"
            :onReportConfiguration="onPeriod"
            > 
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { SurvivalAnalysisReportService, AGE_GROUP } from "@/apps/ART/services/reports/survival_analysis_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { isEmpty } from 'lodash'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import Validation from "@/components/Forms/validations/StandardValidations"
import { Option } from '@/components/Forms/FieldInterface'
import { FieldType } from "@/components/Forms/BaseFormElements"
import table from "@/components/DataViews/tables/ReportDataTable"
import { IonPage } from "@ionic/vue"

const borderSplitStyle = {
    style: {
        borderRight: '5px solid black !important'
    }
}
export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate, IonPage },
    data: () => ({
        title: 'Survival analysis report',
        totalClients: [],
        rows: [] as Array<any>,
        columns:[ 
            [
                table.thTxt('Reg cohort'),
                table.thTxt('Interval (months)'),
                table.thTxt('Sub group'),
                table.thTxt('Total Reg (database)'),
                table.thTxt('Total Reg (Confirmed)', borderSplitStyle),
                table.thTxt('Alive'),
                table.thTxt('Died'),
                table.thTxt('Defaulted'),
                table.thTxt('Stopped'),
                table.thTxt('TO'),
                table.thTxt('Unknown')
            ]
        ]
    }),
    created() {
        this.fields = [
            ...this.getDateDurationFields(true, false, 17),
            {
                id: 'group',
                helpText: 'Select sub-group',
                type: FieldType.TT_SELECT,
                validation: (val: Option) => Validation.required(val),
                options: () => [
                    {
                        label: 'General',
                        value: AGE_GROUP.GENERAL
                    },
                    {
                        label: 'Children',
                        value: AGE_GROUP.CHILDREN
                    },
                    {
                        label: 'Option B+',
                        value: AGE_GROUP.WOMEN
                    }
                ]
            }
        ]
    },
    methods: {
        async onPeriod({ quarter, group }: any, config: any, shouldRebuildCache=false) {
            this.rows = []
            this.period = quarter.label
            this.report = new SurvivalAnalysisReportService()
            this.report.setOccupation(config.occupation)
            this.report.setRegenerate(shouldRebuildCache)
            this.report.setQuarter(quarter.label)
            this.report.setAgeGroup(group.value)
            const data = await this.report.getSurvivalAnalysis()
            this.title = `Survival analysis report ${group.label}`
            this.rows = this.getRows(data)
        },
        getRows(data: any) {
            return Object.keys(data)
                .filter((d: string) => !isEmpty(data[d]))
                .sort((a: any, b: any) => {
                    const yearA = a.split(' ')[1]
                    const yearB = b.split(' ')[1]
                    return parseInt(yearA) - parseInt(yearB)
                })
                .map((quarter: string) => {
                    const quarterOutcomes = data[quarter]
                    let qInterval = 0
                    let totalRegInQuarter = 0
                    const outcomeRef: any = {
                        'On antiretrovirals': 0,
                        'Defaulted': 0,
                        'Patient died': 0,
                        'Treatment stopped': 0,
                        'Patient transferred out': 0,
                        'unknown': 0
                    }
                    if (isEmpty(quarterOutcomes)) {
                        return
                    }
                    for(const outcome in quarterOutcomes) {
                        const outcomeIntervals =  quarterOutcomes[outcome]
                        for (const interval in outcomeIntervals) {
                            const count = outcomeIntervals[interval]
                            qInterval = parseInt(interval)
                            if (outcome in outcomeRef) {
                                outcomeRef[outcome] = count
                            } else {
                                outcomeRef['unknown'] = count
                            }
                            totalRegInQuarter += count
                        }
                    }
                    return [
                        table.td(quarter),
                        table.td(qInterval),
                        table.td(this.report.getAgeGroup()),
                        table.td(totalRegInQuarter),
                        table.td('', borderSplitStyle), // Must remain blank according to guidelines
                        table.td(outcomeRef['On antiretrovirals']),
                        table.td(outcomeRef['Patient died']),
                        table.td(outcomeRef['Defaulted']),
                        table.td(outcomeRef['Treatment stopped']),
                        table.td(outcomeRef['Patient transferred out']),
                        table.td(outcomeRef['unknown'])
                    ]
                })
        }
    }
})
</script>
