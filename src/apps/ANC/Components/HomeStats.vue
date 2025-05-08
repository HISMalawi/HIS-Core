<template>
    <report-data-table 
        :asyncRows="getRows"
        :columns="columns"
        :config="{
            tableCssTheme: 'art-report-theme', 
            skeletonTextRows: 5,
            showIndex: false
        }"
    />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import table from "@/components/DataViews/tables/ReportDataTable"
import { AncService } from "@/apps/ANC/Services/anc_service"
import ReportDataTable from "@/components/DataViews/tables/ReportDataTable.vue"

export default defineComponent({
    components: { ReportDataTable },
    setup() {
        const columns = [
            [
                table.thTxt('Total with:'),
                table.thTxt('Me'),
                table.thTxt('Today'),
                table.thTxt('This Year')
            ]
        ]

        async function getRows() {
            const data = await AncService.getStats()
            const keys = [1, 2, 3, 4, '>5']
            return keys.map((i: string | number) => [
                table.td(`${i} ${i === 1 ? 'visit' : 'visits'}`), 
                table.td(data.user[i]),
                table.td(data.today[i]),
                table.td(data.year[i])
            ])
        }        
        return {
            getRows,
            columns
        }
    } 
})
</script>
