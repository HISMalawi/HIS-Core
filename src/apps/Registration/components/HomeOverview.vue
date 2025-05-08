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
import { RegistrationReportService } from "@/apps/Registration/services/registration_report_service"
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
            const stats = new RegistrationReportService()
            const req = stats.requestReport()
            if (typeof req === 'object' && req.then) {
              
                req.then((data) => {
                  ['Newly Registered Patients', 'Returning Patients'].forEach(element => {
                   const newData = data[element];
                    rows.value.push([
                            table.td(element),
                            table.td(newData.me),
                            table.td(newData.total)
                        ])
                    delete data[element]; 
                  });
                  
                    Object.keys(data).forEach((item: any) => {
                        rows.value.push([
                            table.td(item),
                            table.td(data[item].me),
                            table.td(data[item].total)
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