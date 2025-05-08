<template>
    <ion-page>
        <report-template
            :title="title"
            :period="period"
            :rows="rows" 
            :fields="fields"
            :columns="columns"
            :showtitleOnly="true"
            :customFileName="customFileName"
            :onReportConfiguration="onPeriod"
            > 
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { UserService } from "@/services/user_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import HisDate from "@/utils/Date"
import { IonPage } from "@ionic/vue"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate, IonPage },
    data: () => ({
        title: 'User system usage',
        rows: [] as Array<any>,
        columns: [
            [
                table.thTxt('First name'),
                table.thTxt('Last name'),
                table.thTxt('Role'),
                table.thDate('Registered on'),
                table.thDate('Encounters created')
            ]
        ]
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.rows = []
            const data = await UserService.getSystemUsageByUsers(config.start_date, config.end_date)
            this.period = `${HisDate.toStandardHisDisplayFormat(config.start_date)}-${HisDate.toStandardHisDisplayFormat(config.end_date)}`
            this.title = `User system usage <b>${this.period}</b>`
            this.customFileName = `${UserService.getLocationName()} User system usage ${this.period}` 
            this.setRows(data)
        },
        async setRows(data: Array<any>) {
            data.forEach((data: any) => {
                this.rows.push([
                    table.td(data.given_name),
                    table.td(data.family_name),
                    table.td(data.role),
                    table.tdDate(data.registered_on),
                    table.td(data.encounters)
                ])
            })
        }
    }
})
</script>
