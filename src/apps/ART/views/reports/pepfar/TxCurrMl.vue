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
            reportPrefix="PEPFAR"
            :hasServerSideCaching="true"
            :onReportConfiguration="onPeriod"
            > 
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { TxReportService } from '@/apps/ART/services/reports/tx_report_service'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { IonPage } from "@ionic/vue"
import { AGE_GROUPS } from "@/apps/ART/services/reports/patient_report_service"
import { uniq } from 'lodash'

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate, IonPage },
    data: () => ({
        title: 'PEPFAR Tx ML Report',
        rows: [] as Array<any>,
        drillData: {} as any,
        columns: [
            [
                table.thTxt('Age group'),
                table.thTxt('Gender'),
                table.thTxt('Died'),
                table.thTxt('IIT <3 mo'),
                table.thTxt('IIT 3-5 mo'),
                table.thTxt('IIT 6+ mo'),
                table.thTxt('Transferred out'),
                table.thTxt('Refused (Stopped)')
            ]
        ],
        indexLabel:[
            'Died',
            'IIT <3 mo',
            'IIT 3-5 mo',
            'IIT 6+ mo',
            'Tranferred out',
            'Refused (Stopped)'
        ],
        cohort: {} as any
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any, rebuildCache=false) {
            this.rows = []
            this.report = new TxReportService()
            this.report.setOccupation(config.occupation)
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            this.cohort = await this.report.getTxMlReport(rebuildCache)
            this.setRows('F')
            this.setRows('M')
            this.setTotalMaleRow()
            this.setMaternalRows()
        },
        drilldown(patients: Array<number>, context: string) {
            const columns = [
                [
                    table.thTxt('ARV#'),
                    table.thTxt('DOB'),
                    table.thTxt('Dispensed'),
                    table.thTxt('ARVs'),
                    table.thTxt('Art start date')
                ]
            ]
            const asyncRows = async () => {
                if (context in this.drillData) return this.drillData[context]

                const data = await this.report.getTxMMDClientLevelData(patients)

                if (!data) return []

                const rows = this.report
                    .remapTxClientLevelData(data)
                    .map((d: any) => {
                        const drugs: any = d.drugs.map((drug: any) => {
                            const tableView = `
                                <table style='width: 100%;'> 
                                    <td style='width: 65%;'>${drug.name}</td>
                                    <td style='width: 30%;'>(${drug.quantity}, ${drug.dose} a day)</td>
                                </table>`
                            const dataView = `${drug.name} (Quantity: ${drug.quantity} Dose: ${drug.dose})`
                            return { tableView, dataView }
                        })
                        return [
                            table.td(d.id || 'N/A'),
                            table.tdDate(d.dob),
                            table.tdDate(d.dispenseDate),
                            table.td(drugs.map((d: any) => d.tableView).join('<p/>'), 
                            { 
                                value: drugs.map((d: any) => d.dataView).join('|')
                            }),
                            table.td(d.artStartDate)
                        ]
                    })
                this.drillData[context] = rows
                return rows
            }
            if (patients.length <= 0) {
                return table.td(0)
            }
            return table.tdLink(patients.length, () => this.drilldownAsyncRows(context, columns, asyncRows))
        },
        aggregate(gender: 'M' | 'F', indicator: string): Array<any> {
            return Object.values(this.cohort).reduce((patients: any, c: any) => {
                return c[gender] ? [...c[gender][this.indexLabel.indexOf(indicator)], ...patients] : patients
            }, []) as Array<any>
        },
        setTotalMaleRow() {
            const drill = (label: string) => this.drilldown(this.aggregate('M', label), label)
            this.rows.push([
                table.td('All'),
                table.td('Male'),
                drill('Died'),
                drill('IIT <3 mo'),
                drill('IIT 3-5 mo'),
                drill('IIT 6+ mo'),
                drill('Tranferred out'),
                drill('Refused (Stopped)')
            ])
        },
        async setMaternalRows() {
            const indicators = this.indexLabel.reduce((aggregated: any, indicator: string) => [
                ...aggregated, { indicator, data: this.aggregate('F', indicator)}
            ], [])
    
            const maternalStatus = await this.report.getMaternalStatus(
                uniq(indicators.reduce((totals: any, cur: any) => [...totals, ...cur.data], []).map((id: number) => id))
            )

            const groupBy = (indicator: string) => indicators.reduce(
                (all: any, i: any) => i.indicator === indicator ? [...all, ...i.data] : all, []
            )

            const fP = (s: 'FP' | 'FBf', indicator: string) => {
                return this.drilldown(
                    groupBy(indicator).filter((patient: any) => maternalStatus[s].includes(patient)), `All ${indicator} Female Pregnant`
                )
            }

            const allPregnant = maternalStatus.FBf.concat(maternalStatus.FP)

            const fnP = (indicator: string) => {
                return this.drilldown(
                    groupBy(indicator).filter((patient: any) => !allPregnant.includes(patient)), `All ${indicator} Female not pregnant`
                )
            }

            this.rows.push([
                table.td('All'),
                table.td('FP'),
                fP('FP', 'Died'),
                fP('FP', 'IIT <3 mo'),
                fP('FP', 'IIT 3-5 mo'),
                fP('FP', 'IIT 6+ mo'),
                fP('FP', 'Tranferred out'),
                fP('FP', 'Refused (Stopped)')
            ])
            this.rows.push([
                table.td('All'),
                table.td('FNP'),
                fnP('Died'),
                fnP('IIT <3 mo'),
                fnP('IIT 3-5 mo'),
                fnP('IIT 6+ mo'),
                fnP('Tranferred out'),
                fnP('Refused (Stopped)')
            ])
            this.rows.push([
                table.td('All'),
                table.td('FBF'),
                fP('FBf', 'Died'),
                fP('FBf', 'IIT <3 mo'),
                fP('FBf', 'IIT 3-5 mo'),
                fP('FBf', 'IIT 6+ mo'),
                fP('FBf', 'Tranferred out'),
                fP('FBf', 'Refused (Stopped)')
            ])
        },
        setRows(gender: string) {
            for(const i in AGE_GROUPS) {
                const group = AGE_GROUPS[i]
                const fullGender = this.formatGender(gender);
                try {
                    const cohortData = this.cohort[group][gender]
                    const drillContext = `${fullGender}s ${group}`
                    const drillable = cohortData.map(
                        (d: Array<number>, i: number) => this.drilldown(d, `${drillContext} ${this.indexLabel[i]}`)
                    )
                    this.rows.push([
                        table.td(group),
                        table.td(fullGender),
                        ...drillable
                    ])
                }catch(e) {
                    this.rows.push([
                        table.td(group), 
                        table.td(fullGender), 
                        table.td(0), 
                        table.td(0), 
                        table.td(0), 
                        table.td(0), 
                        table.td(0), 
                        table.td(0) 
                    ])
                }
            }
        }
    }
})
</script>
