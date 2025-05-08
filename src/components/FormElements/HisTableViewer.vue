<template>
    <view-port> 
        <div class="view-port-content"> 
            <his-table :columns="columns" :styles="styles" :rows="rows" :rowColors="rowColors" :cellColors="cellColors"/>
        </div>
    </view-port>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import HisTable from "@/components/DataViews/HisBasicTable.vue"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import { isEmpty } from "lodash"
import FieldMixinVue from './FieldMixin.vue'

export default defineComponent({
    components: { ViewPort, HisTable },
    mixins: [FieldMixinVue],
    data: ()=>({
        columns: [] as Array<string>,
        rows: [] as Array<string>,
        rowColors: [] as Array<any>,
        cellColors: [] as Array<any>,
        styles: [] as Array<string>
    }),
    methods: {
        async init() {
            this.$emit('onFieldActivated', this)
            const data = await this.options(this.fdata, this.cdata, this)
            if (isEmpty(data)) return

            const { other } = data[0]
            this.columns = other.columns
            this.rows = other.rows
            this.rowColors = other.rowColors
            this.cellColors = other.cellColors
            this.styles = this.config ? this.config.styles : []
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