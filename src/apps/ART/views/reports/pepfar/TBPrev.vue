<template>
    <ion-page>
        <report-template
            :title="title"
            :period="period"
            :rows="rows" 
            :fields="fields"
            :columns="columns"
            reportPrefix="PEPFAR"
            :config="{
                showIndex: true
            }"
            :onReportConfiguration="onPeriod"
            > 
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { TbPrevReportService } from '@/apps/ART/services/reports/tb_prev_report_service'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { AGE_GROUPS } from "@/apps/ART/services/reports/patient_report_service"
import { uniq } from 'lodash'

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'TB PREV Report',
        cohort: {} as any,
        rows: [] as Array<any>,
        columns: [
            [
                table.thTxt('', { 
                    colspan: 3,
                    sortable: false,
                    exportable: false 
                }),
                table.thTxt('Started new on ART', { 
                    colspan: 2, 
                    sortable: false,
                    exportable: false 
                }),
                table.thTxt('Started previously on ART', { 
                    colspan: 2, 
                    sortable: false,
                    exportable: false 
                }),
                table.thTxt('Completed New on ART', { 
                    colspan: 2, 
                    sortable: false,
                    exportable: false 
                }),
                table.thTxt('Completed previously on ART', { 
                    colspan: 2, 
                    sortable: false,
                    exportable: false
                })
            ],
            [
                table.thTxt('Age group'),
                table.thTxt('Gender'),
                table.thNum('3HP',{ value: '3HP(Started New on ART)'}),
                table.thNum('6H', { value: '6H(Started New on ART)'}),
                table.thNum('3HP',{ value: '3HP(Started Previously on ART)'}),
                table.thNum('6H', { value: '6H(Started Previously on ART)'}),
                table.thNum('3H', { value: '3HP(Completed New on ART)'}),
                table.thNum('6H', { value: '6H(Completed New on ART)'}),
                table.thNum('3H', { value: '3HP(Completed Previously on ART)'}),
                table.thNum('6H', { value: '6H(Completed Previously on ART)'})
            ]
        ]
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.rows = []
            this.report = new TbPrevReportService()
            this.report.setOccupation(config.occupation)
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            this.cohort = await this.report.getTBPrevReport()
            this.setRows('F')
            this.setRows('M')
            this.setTotalMaleRow()
            this.setMaternityRows()
        },
        makeDrilldown(data: Array<any>, context: string) {
            if (data.length) {
                const columns = [
                    [
                        table.thTxt('ARV#'),
                        table.thTxt('Birthdate'),
                        table.thTxt('TPT Initiation Date'),
                        table.thTxt('Outcome'),
                        table.thTxt('Art start date')
                    ]
                ]
                const asyncRows = () => {
                    return this.sortByArvNumber(data, 'arv_number')
                        .map((p: any) => ([
                            table.td(p.arv_number),
                            table.tdDate(p.birthdate),
                            table.tdDate(p.tpt_initiation_date),
                            table.td(p.outcome),
                            table.tdDate(p.art_start_date)
                        ]))
                }
                return table.tdLink(data.length, () => this.drilldownAsyncRows(context, columns, asyncRows))
            }
            return table.td(0)
        },
        aggregate(gender: 'M' | 'F', group: '6H' | '3HP', indicator: string): Array<any> {
            return Object.values(this.cohort).reduce((patients: any, c: any) => {
                return [...c[gender][group][indicator], ...patients]
            }, []) as Array<any>
        },
        async setMaternityRows() {
            const indicators = [
                'started_new_on_art',
                'started_previously_on_art',
                'completed_new_on_art',
                'completed_previously_on_art'
            ].reduce((aggregated: any, indicator: string) => [
                ...aggregated,
                { group: '3HP', indicator, data: this.aggregate('F', '3HP', indicator) },
                { group: '6H', indicator, data: this.aggregate('F', '6H', indicator) }
            ], [])
            const maternalStatus = await this.report.getMaternalStatus(
                uniq(indicators.reduce((totals: any, cur: any) => [...totals, ...cur.data], []).map((d: any) => d.patient_id))
            )
            const groupBy = (indicator: string, group: '6H' | '3HP') => indicators
                .reduce((all: any, i: any) => {
                    return i.indicator === indicator && group === i.group ? [...all, ...i.data] : all
                }, [])
            const fP = (s: 'FP' | 'FBf', indicator: string, title: string) => {
                return [
                    this.makeDrilldown(
                        groupBy(indicator, '3HP').filter((patient: any) => maternalStatus[s].includes(patient.patient_id)), `All ${title} (3HP)`
                    ),
                    this.makeDrilldown(
                        groupBy(indicator, '6H').filter((patient: any) => maternalStatus[s].includes(patient.patient_id)), `All ${title} (6H)`
                    )
                ]
            }
            const allPregnant = maternalStatus.FBf.concat(maternalStatus.FP)
            const fnP = (indicator: string, title: string) => {
                return [
                    this.makeDrilldown(
                        groupBy(indicator, '3HP').filter((patient: any) => !allPregnant.includes(patient.patient_id)), `All ${title} (3HP)`
                    ),
                    this.makeDrilldown(
                        groupBy(indicator, '6H').filter((patient: any) => !allPregnant.includes(patient.patient_id)), `All ${title} (6H)`
                    )
                ]
            }
            this.rows.push([
                table.td('All'),
                table.td('FP'),
                ...fP('FP', 'started_new_on_art', 'Started new on ART'),
                ...fP('FP', 'started_previously_on_art', 'Started previously on ART'),
                ...fP('FP', 'completed_new_on_art', 'Completed new on ART'),
                ...fP('FP', 'completed_previously_on_art', 'Completed previously on ART')
            ])
            this.rows.push([
                table.td('All'),
                table.td('FNP'),
                ...fnP('started_new_on_art', 'Started new on ART'),
                ...fnP('started_previously_on_art', 'Started previously on ART'),
                ...fnP('completed_new_on_art', 'Completed new on ART'),
                ...fnP('completed_previously_on_art', 'Completed previously on ART')
            ])
            this.rows.push([
                table.td('All'),
                table.td('FBF'),
                ...fP('FBf', 'started_new_on_art', 'Started new on ART'),
                ...fP('FBf', 'started_previously_on_art', 'Started previously on ART'),
                ...fP('FBf', 'completed_new_on_art', 'Completed new on ART'),
                ...fP('FBf', 'completed_previously_on_art', 'Completed previously on ART')
            ])
        },
        setTotalMaleRow() {
            this.rows.push([
                table.td('All'),
                table.td('Male'),
                this.makeDrilldown(this.aggregate('M', '3HP', 'started_new_on_art'), 
                    'All male started new on 3HP'),
                this.makeDrilldown(this.aggregate('M', '6H', 'started_new_on_art'), 
                    `All male started new on ART 6H`),
                this.makeDrilldown(this.aggregate('M', '3HP', 'started_previously_on_art'), 
                    `All male started previously on ART 3HP`),
                this.makeDrilldown(this.aggregate('M', '6H', 'started_previously_on_art'),
                    `All male started previously on ART 6H`),
                this.makeDrilldown(this.aggregate('M', '3HP', 'completed_new_on_art'),
                    `All male completed new on ART 3HP`),
                this.makeDrilldown(this.aggregate('M', '6H', 'completed_new_on_art'),
                    `All male completed new on ART 6H`),
                this.makeDrilldown(this.aggregate('M', '3HP', 'completed_previously_on_art'),
                    `All male completed previously on ART 3HP`),
                this.makeDrilldown(this.aggregate('M', '6H', 'completed_previously_on_art'),
                    `All male completed previously on ART 6H`)
            ])
        },
        async setRows(gender: string) {
            for(const i in AGE_GROUPS) {
                const group = AGE_GROUPS[i]
                const cohortData = this.cohort[group][gender]
                const fullGender =  this.formatGender(gender)
                this.rows.push([
                    table.td(group),
                    table.td(fullGender),
                    this.makeDrilldown(cohortData['3HP']['started_new_on_art'],
                        `${group} started new on ART 3HP (${fullGender}s)`
                    ),
                    this.makeDrilldown(cohortData['6H']['started_new_on_art'],
                        `${group} started new on ART 6H (${fullGender}s)`
                    ),
                    this.makeDrilldown(cohortData['3HP']['started_previously_on_art'],
                        `${group} started previously on ART 3HP (${fullGender}s)`
                    ),
                    this.makeDrilldown(cohortData['6H']['started_previously_on_art'],
                        `${group} started previously on ART 6H (${fullGender}s)`
                    ),
                    this.makeDrilldown(cohortData['3HP']['completed_new_on_art'],
                        `${group} completed new on ART 3HP (${fullGender}s)`
                    ),
                    this.makeDrilldown(cohortData['6H']['completed_new_on_art'],
                        `${group} completed new on ART 6H (${fullGender}s)`
                    ),
                    this.makeDrilldown(cohortData['3HP']['completed_previously_on_art'],
                        `${group} completed previously on ART 3HP (${fullGender}s)`
                    ),
                    this.makeDrilldown(cohortData['6H']['completed_previously_on_art'],
                        `${group} completed previously on ART 6H (${fullGender}s)`
                    )
                ])
            }
        }
    }
})
</script>
