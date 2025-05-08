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
            reportPrefix="Pepfar"
            :onReportConfiguration="onPeriod"
            > 
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { AncPepfarReportService } from '@/apps/ANC/Services/anc_pepfar_report_service'
import table from "@/components/DataViews/tables/ReportDataTable"
import { AncReportComposable } from "@/apps/ANC/composables/AncReports"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
export default defineComponent({
    components: { ReportTemplate },
    setup() {
        const r =  AncReportComposable('PMTCT STAT')
        const { reportData, drill, fd } = r
        reportData.columns = [
            [
                table.thTxt('Age group'),
                table.thTxt('Gender'),
                table.thTxt('Known positive'),
                table.thTxt('Newly Tested Positives'),
                table.thTxt('New Negatives'),
                table.thTxt('Recent negative'),
                table.thTxt('Not Done'),
                table.thTxt('New on ART	'),
                table.thTxt('Already on ART')
            ]
        ]

        const onPeriod = async (_: any, config: any) => {
            reportData.rows = []
            reportData.service = new AncPepfarReportService()
            reportData.service.setStartDate(config.start_date)
            reportData.service.setEndDate(config.end_date)
            reportData.period = `${fd(config.start_date)} to ${fd(config.end_date)}`
            const stats = await reportData.service.generatePmtctStatArt()
            stats.forEach((d: any) => {
                reportData.rows.push([
                    table.td(d.age_group),
                    table.td('Female'),
                    drill(`Known positive ${d.age_group}`, d.known_positive),
                    drill(`Newly Tested Positives ${d.age_group}`, d.newly_tested_positives),
                    drill(`New Negatives ${d.age_group}`, d.new_negatives),
                    drill(`Recent negative ${d.age_group}`, d.recent_negatives),
                    drill(`Not Done ${d.age_group}`, d.not_done),
                    drill(`New on ART ${d.age_group}`, d.new_on_art),
                    drill(`Already on ART ${d.age_group}`, d.already_on_art)
                ])
            })
        }
        return {
            ...r,
            onPeriod
        }
    }
})
</script>
