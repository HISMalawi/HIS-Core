<template>
    <ion-page>
        <report-template
            :title="title"
            :period="period"
            :rows="rows" 
            :fields="fields"
            :columns="columns"
            :config="{
                showIndex: true
            }"
            reportPrefix="MOH"
            :onReportConfiguration="onPeriod"
            > 
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { AGE_GROUPS } from "@/apps/ART/services/reports/patient_report_service";
import { TptReportService } from '@/apps/ART/services/reports/tpt_report_service'
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { find } from 'lodash';

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'MOH TPT Cohort',
        cohort: {} as any,
        rows: [] as Array<any>,
        index: 0,
        columns: [
            [       
                table.thTxt('Age group'),
                table.thTxt('Gender'),
                table.thTxt('Initiated ART'),
                table.thTxt('Initiated TPT'),
                table.thTxt('Completed TPT'),
                table.thTxt('Not Completed TPT'),
                table.thTxt('Died'),
                table.thTxt('Defaulted'),
                table.thTxt('Stopped ART'),
                table.thTxt('TO'),
                table.thTxt('Confirmed TB '),
                table.thTxt('Pregnant')
            ]
        ]
    }),
    created() {
        this.preGenerateRows()
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.rows = []
            this.preGenerateRows()
            this.report = new TptReportService()
            this.report.setOccupation(config.occupation)
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            this.cohort = (await this.report.getCohort() || [])
            this.index = 0
            this.setRows('F')
            this.setRows('M')
        },
        preGenerateRows() {
            this.rows = []
            const sectionsByGender = (gender: 'Male' | 'Female') => {
                AGE_GROUPS.forEach((group: string) => {
                    this.rows.push([
                        table.td(group),
                        table.td(gender),
                        table.td('...'),
                        table.td('...'),
                        table.td('...'),
                        table.td('...'),
                        table.td('...'),
                        table.td('...'),
                        table.td('...'),
                        table.td('...'),
                        table.td('...'),
                        table.td('...')
                    ])
                })
            }
            sectionsByGender('Female')
            sectionsByGender('Male')
        },
        setRows(gender: 'F' | 'M') {
            AGE_GROUPS.forEach((group: string) => {
                const data = find(this.cohort, { 'age_group': group, gender })
                this.rows[this.index] = [
                    table.td(group),
                    table.td(this.formatGender(data.gender)),
                    this.drill(data['initiated_art'], `Initiate ART ${group} ${gender}`),
                    this.drill(data['started_tpt'], `Started TPT ${group} ${gender}`),
                    this.drill(data['completed_tpt'], `Completed TPT ${group} ${gender}`),
                    this.drill(data['not_completed_tpt'], `Not completed TPT ${group} ${gender}`),
                    this.drill(data['died'], `Died ${group} ${gender}`),
                    this.drill(data['defaulted'], `Defaulted ${group} ${gender}`),
                    this.drill(data['stopped'], `Stopped ${group} ${gender}`),
                    this.drill(data['transfer_out'], `Transfer out ${group} ${gender}`),
                    this.drill(data['confirmed_tb'], `Confirmed TB ${group} ${gender}`),
                    this.drill(data['pregnant'], `Pregnant ${group} ${gender}`)
                ]
                ++this.index
            })
        }
    }
})
</script>
