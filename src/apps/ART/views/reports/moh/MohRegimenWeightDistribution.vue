<template>
    <ion-page>
        <report-template
            :title="title"
            :period="period"
            :rows="rows" 
            :fields="fields"
            :columns="columns"
            reportPrefix="MoH"
            :config="{
                showIndex: false
            }"
            :enabledPDFHorizontalPageBreak="true"
            :onReportConfiguration="onPeriod"
            :hasServerSideCaching="true"
            > 
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { RegimenReportService, WEIGHT_BAND, REGIMEN_WEIGHT_DISTRIBUTION } from "@/apps/ART/services/reports/regimen_report_service"
import { isEmpty } from "lodash"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { IonPage } from "@ionic/vue"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate, IonPage },
    data: () => ({
        rows: [] as Array<any>,
        title: 'Regimen distribution (Weight)',
        columns: [] as Array<any>
    }),
    created() {
        this.columns = [
            [
                table.thTxt('Weight band'),
                table.thTxt('Gender'),
                ...REGIMEN_WEIGHT_DISTRIBUTION.map(r => table.thNum(r)),
                table.thNum('Unknown'),
                table.thNum('Total (regimen)')
            ]
        ] 
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any, shouldRebuildCache = false) {
            this.rows = []
            this.report = new RegimenReportService()
            this.report.setOccupation(config.occupation)
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            const data = await this.report.getRegimensByWeight(shouldRebuildCache)
            await this.setRows(data)
        },
        async setRows(data: any) {
            const mapRegimenRow = (items: any) => 
                [...REGIMEN_WEIGHT_DISTRIBUTION, 'N/A'].map((regimen: any) => {
                    const i = items.filter((d: any) => d[regimen] ? true : false)
                        .map((v: any) => Object.values(v)[0])
                    return table.td(isEmpty(i) ? 0 : i[0])
                })

            const rowTotals = (d: Array<any>) =>
                d.reduce((accum: number, curr: any) => accum + curr.td, 0)

            WEIGHT_BAND.forEach((weightBand: any) => {
                const weightBandData =  data.filter((d: any) => d.weight === weightBand)
                weightBandData.forEach((w: any) => {
                    const mRegimens = mapRegimenRow(w.males)
                    const fRegimens = mapRegimenRow(w.females)
                    const maleRow = [
                        table.td(weightBand), 
                        table.td('Male'), 
                        ...mRegimens, 
                        table.td(rowTotals(mRegimens))
                    ]
                    const femaleRow = [
                        table.td(weightBand),
                        table.td('Female'),
                        ...fRegimens,
                        table.td(rowTotals(fRegimens))
                    ]
                    this.rows.push(maleRow)
                    this.rows.push(femaleRow)
                    if (!isEmpty(w.unknown_gender)) {
                        const uRegimens = mapRegimenRow(w.unknown_gender)
                        const tCount = rowTotals(uRegimens)
                        this.rows.push([
                            table.td(weightBand),
                            table.td('Unknown Gender'),
                            ...uRegimens,
                            table.td(tCount)
                        ]) 
                    }
                })
            })
        }
    }
})
</script>
