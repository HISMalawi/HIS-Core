<template>
    <ion-page> 
        <report-template
            :title="title"
            :period="period"
            :rows="rows" 
            :fields="fields"
            :columns="columns"
            :headerInfoList="headerList"
            :config="{
                showIndex: true
            }"
            :onReportConfiguration="onPeriod"
        />
    </ion-page>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { IonPage } from "@ionic/vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { RadiologyReportService } from "@/apps/RADIOLOGY/services/radiology_report_service"
import { toastDanger } from '@/utils/Alerts'

export default defineComponent({
    mixins: [ReportMixin],
    components: {
        IonPage,
        ReportTemplate
    },
    data: () => ({
        title: 'Referral Report',
        rows: [] as any,
        service: {} as any,
        columns: [
            [
                table.thTxt('Clinic'),
                table.thTxt('Total')
            ]
        ]
    }),
    mounted() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        onPeriod(_: any, config: any) {
            this.service = new RadiologyReportService(
                'REFERRAL REPORT', config.start_date, config.end_date,
            )
            this.period = this.service.periodStr()
            const req = this.service.requestReport()
            if (typeof req === 'object' && req.then) {
                req.then((data: any) => {
                    data.forEach((d: any) => {
                        this.rows.push([
                            table.td(d.clinic),
                            table.td(d.total)
                        ])
                    })
                }).catch((e: any) => toastDanger(`${e}`))
            }
        }
    }
})
</script>
