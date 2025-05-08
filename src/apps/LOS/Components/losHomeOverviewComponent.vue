<template>
    <div class="los-overview">
        <report-table
            :rows="rows"
            :columns="columns">
        </report-table>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import ReportTable from "@/components/DataViews/tables/ReportDataTable.vue"
import { ColumnInterface, RowInterface} from "@/components/DataViews/tables/ReportDataTable" 
import table from "@/components/DataViews/tables/ReportDataTable"
import {LosService} from "@/apps/LOS/services/los_service"
import { isEmpty } from 'lodash'

export default defineComponent({
    components: {ReportTable},
    data: () => ({
        rows: [] as Array<RowInterface[]>,
        columns: [
            [
                table.thTxt('Test'),
                table.thTxt('Ordered'),
                table.thTxt('Drawn'),
            ] as ColumnInterface[]
        ]
    }),
     created() {
        this.setRows()
    },
    methods: {
        async setRows() {
            const data = await LosService.overviewStats()
            if (!isEmpty(data)) {
                for(const test in data) {
                    const stat: any = data[test]
                    this.rows.push([
                        table.td(test),
                        table.td(stat.ordered),
                        table.td(stat.drawn)
                    ])
                }
            }
        }
    }
})
</script>
<style scoped>
    .los-overview {
        margin: 10px;
        max-height: 60vh;
        overflow-x: auto;
    }
</style>