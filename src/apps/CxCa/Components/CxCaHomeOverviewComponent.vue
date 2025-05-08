<template>
    <div class="los-overview">
        <ion-grid style="height:100%">
            <ion-row>
                <ion-col size="6">

                <his-basic-table :columns="columns" :rows="rows"/>
                </ion-col>
                <ion-col size="6" style="border-left: 5px solid black;">
                <h4>Today's clients booked from HIV/ART program</h4>
                <his-basic-table :columns="screenedColumns" :rows="screenedRows"/>
                </ion-col>
            </ion-row>
        </ion-grid>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { RowInterface} from "@/components/DataViews/tables/ReportDataTable" 
import HisBasicTable from "@/components/DataViews/HisBasicTable.vue";
import {CxCaService} from "@/apps/CxCa/services/cxca_service"

export default defineComponent({
    components: {HisBasicTable},
    data: () => ({
        rows: [] as Array<RowInterface[]>,
        columns: [
                `Today's screening method`,
                `Count`,
        ],
        screenedColumns: ['Age group', 'Booked', 'Screened'],
        screenedRows: [] as Array<RowInterface[]>
    }),
    async created() {
        await this.setRows()
    },
    methods: {
        async setRows() {
            const data = await CxCaService.overviewStats()
            this.rows = [...data]
            const screenedData = await CxCaService.screenedOverviewStats();
            this.screenedRows = [...screenedData];
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