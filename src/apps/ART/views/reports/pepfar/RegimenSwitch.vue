<template>
    <ion-page>
        <report-template
            :title="title"
            :period="period"
            :rows="rows"
            :fields="fields"
            :columns="columns"
            reportPrefix="PEPFAR"
            :onReportConfiguration="onPeriod"
            > 
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { RegimenReportService } from "@/apps/ART/services/reports/regimen_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { IonPage } from "@ionic/vue"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate, IonPage },
    data: () => ({
        title: 'PEPFAR Regimen Switch Report', 
        rows: [] as Array<any>,
        columns:  [
            [
                table.thTxt('ARV#'),
                table.thTxt('Gender'),
                table.thTxt('DOB'),
                table.thTxt('Prev.Reg'),
                table.thTxt('Curr.Reg'),
                table.thTxt('ARVs'), 
                table.thTxt('Curr.reg dispensed date')
            ]
        ]
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.rows = []
            this.report = new RegimenReportService()
            this.report.setOccupation(config.occupation)
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            this.setRows((await this.report.getRegimenSwitchReport(true)))
        },
        setRows(data: any) {
            this.sortByArvNumber(Object.values(data)).forEach((d: any) => {
                let lastDispenseDate = ''
                const medications = d.medication.map((m: any) => {
                    lastDispenseDate = m.start_date
                    return `${m.medication} (${m.quantity})`
                })
                this.rows.push([
                    table.td(d.arv_number),
                    table.td(this.formatGender(d.gender)),
                    table.tdDate(d.birthdate),
                    table.td(d.previous_regimen),
                    table.td(d.current_regimen),
                    table.td(medications.join(', ')),
                    table.tdDate(lastDispenseDate)
                ])
            })
        }
    }
})
</script>
