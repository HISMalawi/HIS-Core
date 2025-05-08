<template>
    <report-template
        :title="title"
        :period="period"
        :rows="rows" 
        :fields="fields"
        :columns="columns"
        :config="{
            showIndex: true
        }"
        :reportReady="reportReady"
        :isLoading="isLoading"
        reportPrefix="PEPFAR"
        :hasServerSideCaching="true"
        :onReportConfiguration="onPeriod"
        > 
    </report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { RegimenReportService } from "@/apps/ART/services/reports/regimen_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'SC ARV dispensation report',
        rows: [] as Array<any>,
        reportReady: false as boolean,
        isLoading: false as boolean,
        columns: [
            [
                table.thTxt('ARV drug category'), 
                table.thTxt('# of bottles (units) dispensed')
            ]
        ]
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        drilldown(name: string, number: string, patients: Array<any>) {
            const columns = [
                [
                    table.thTxt('ARV #'),
                    table.thTxt('Drug'),
                    table.thTxt('Quantity'),
                    table.thDate('Date')
                ]
            ]
            const sortedPatients = patients.sort((a: any, b: any) => {
                return this.getArvInt(a[3]) > this.getArvInt(b[3]) ? 1 : -1
            })
            const asyncRows = () => sortedPatients.map(
                (p: any) => ([
                   table.td(p[3]),
                   table.td(p[0]),
                   table.td(p[1]),
                   table.tdDate(p[2])
               ])
            )
            if (patients.length <= 0) return table.td(0)

            return table.tdLink(number, () => this.drilldownAsyncRows(name, columns, asyncRows))
        },
        async onPeriod(_: any, config: any, rebuildCache = false) {
            this.reportReady = true
            this.isLoading = true
            this.rows = []
            const isPepfarReport = true;
            this.report = new RegimenReportService()
            this.report.setOccupation(config.occupation)
            this.report.setReportType('pepfar')
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            this.setRows((await this.report.getSCReport(isPepfarReport, rebuildCache)))
            this.isLoading = false
        },
        setRows(data: any) {
            data.forEach((element: any) => {
                 this.rows.push([
                    table.td(element.name),
                    this.drilldown(element.name, element.units, element.dispensations),
                ])
            });
        }
    }
})
</script>
