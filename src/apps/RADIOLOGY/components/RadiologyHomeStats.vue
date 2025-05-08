<template>
    <div class="overview">
        <report-table
            :rows="rows"
            :columns="columns"
            :config="{
                tableCssTheme: 'art-report-theme',
                skeletonTextRows: 5,
                showIndex: false
            }"
        />
    </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import ReportTable from "@/components/DataViews/tables/ReportDataTable.vue"
import { ColumnInterface } from "@/components/DataViews/tables/ReportDataTable" 
import table from "@/components/DataViews/tables/ReportDataTable"
import { RadiologyReportService } from "@/apps/RADIOLOGY/services/radiology_report_service"
import { toastDanger } from '@/utils/Alerts'

export default defineComponent({
    components: { ReportTable },
    setup() {
        const columns =  [
            [
                table.thTxt('Task'),
                table.thTxt('Me'),
                table.thTxt('Today'),
            ] as ColumnInterface[]
        ]
        const rows = ref([] as any)
        onMounted(() => {
            const date = RadiologyReportService.getSessionDate()
            const stats = new RadiologyReportService(
                'DASHBOARD STATISTICS', date, date
            )
            const req = stats.requestReport()
            if (typeof req === 'object' && req.then) {
                req.then((data) => {
                    data.forEach((item: any) => {
                        rows.value.push([
                            table.td(item.name),
                            table.td(item.me),
                            table.td(item.clinic)
                        ])
                    })
                })
                .catch(e => toastDanger(`${e}`))
            }
        })
        return {
            columns,
            rows
        }
    }
})
</script>
<style scoped>
    .overview {
        margin: 10px;
        max-height: 60vh;
        overflow-x: auto;
    }
</style>