<template>
    <ion-page>
        <report-template
            :title="title"
            :period="period"
            :rows="rows"
            :fields="fields"
            :columns="columns"
            :showtitleOnly="true"
            reportPrefix="PEPFAR"
            :encryptPDF="true"
            :onReportConfiguration="onPeriod"
            >
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { DefaulterReportService } from "@/apps/ART/services/reports/defaulters_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { IonPage } from "@ionic/vue"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate, IonPage },
    data: () => ({
        title: 'Defaulters report',
        rows: [] as Array<any>,
        columns: [
            [
                table.thTxt('ARV#'),
                table.thTxt('First name', { csvExportable: false, pdfExportable: true }),
                table.thTxt('Last name' , { csvExportable: false, pdfExportable: true }),
                table.thTxt('Gender'),
                table.thDate('Birthdate'),
                table.thDate('Date defaulted'),
                table.thTxt('Address', { csvExportable: false, pdfExportable: true })
            ]
        ]
    }),
    created() {
        this.fields = this.getDateDurationFields(false, false, 5, null)
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.rows = []
            this.report = new DefaulterReportService()
            this.report.setOccupation(config.occupation)
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            const data = await this.report.getDefaulters()
            this.setRows(data)
            this.title = `PEPFAR Defaulters report <b>(${data.length} Defaulters)</b>`
        },
        async setRows(data: Array<any>) {
            this.sortByArvNumber(data).forEach((data: any) => {
                this.rows.push([
                    table.td(data.arv_number),
                    table.td(data.given_name),
                    table.td(data.family_name),
                    table.td(this.formatGender(data.gender)),
                    table.tdDate(data.birthdate),
                    table.tdDate(data.defaulter_date),
                    table.td(
                        (data.cell_number ? `CELL: ${data.cell_number} <br/>`: '') +
                        (data.village ? `VILLAGE: ${data.village} <br/>` : '') +
                        (data.district ? `DISTRICT: ${data.district} <br/>`: '') +
                        (data.ta ? `TA: ${data.ta} <br/>`: '') + 
                        (data.landmark ? `Landmark: ${data.landmark}` : '')
                    )
                ])
            })
        }
    }
})
</script>
