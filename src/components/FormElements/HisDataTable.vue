<template>
    <view-port :style="config.viewPortStyle">
        <div class="view-port-content"> 
            <his-table 
                :columns="columns" 
                :rows="rows"
                :config="config.dataTableConfig"
            />
        </div>
    </view-port>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import HisTable from "@/components/DataViews/tables/ReportDataTable.vue"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'

export default defineComponent({
    components: { ViewPort, HisTable },
    mixins: [FieldMixinVue],
    data: () => ({
        columns: [] as Array<string>,
        rows: [] as Array<string>,
    }),
    methods: {
        async init() {
            this.$emit('onFieldActivated', this)
            if (typeof this.config.columns === "function") {
                this.columns = await this.config.columns(this.fdata, this.cdata)
            }
            if (typeof this.config.rows === "function") {
                this.rows = await this.config.rows(this.fdata, this.cdata)
            }
        }
    },
    mounted() {
        this.init()
    },
    activated() {
        this.init()
    }
})
</script>
<style scoped>
    .view-port-content {
        background: white !important;
    }
</style>