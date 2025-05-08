<template>
    <ion-page>
        <report-template
            reportPrefix="MoH"
            :title="title"
            :period="period"
            :rows="rows" 
            :fields="fields"
            :columns="columns"
            :hasServerSideCaching="true"
            :headerInfoList="headerList"
            :onReportConfiguration="onPeriod">
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { IonPage } from "@ionic/vue"
import { Option } from '@/components/Forms/FieldInterface'
import { MohRegimenReportService } from "@/apps/ART/services/reports/moh_regimen_service"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate, IonPage },
    data: () => ({
        title: 'Regimen Report',
        rows: [] as Array<any>,
        headerList: [] as Option[],
        columns:  [
            [
                table.thTxt('ARV#'),
                table.thTxt('Gender'),
                table.thTxt('DOB'),
                table.thTxt('Drug Name'),
                table.thTxt('Date'),
                table.thTxt('Pack size'),
                table.thTxt('Total pack'),
                table.thTxt('Total pills'),
            ]
        ]
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any, rebuildCache=false) {
            this.rows = []
            this.report = new MohRegimenReportService()
            this.report.setOccupation(config.occupation)
            this.report.setRegenerate(rebuildCache)
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            const data = await this.report.generateReport()
            this.setRows(data)
            this.headerList = [
                { 
                    label: 'Total clients', 
                    value: this.report.clients.length
                }
            ]
        },
        setRows(data: any) {
            const dateThis = (d: string) => d ? table.tdDate(d) : table.td('N/A')
            this.rows = this.sortByArvNumber(data, 'identifier')
                .map(d => [
                    this.tdARV(d.identifier),
                    table.td(this.formatGender(d.gender)),
                    dateThis(d.dob),
                    table.td(d.drugName),
                    dateThis(d.dispensationDate),
                    table.td(d.packSize),
                    table.td(d.packSizes),
                    table.td(d.quantity) 
                ])
        }
    }
})
</script>
