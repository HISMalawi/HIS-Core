<template>
    <action-header :title="title" :subtitle="subtitle" :color="color"> </action-header>
        <ion-content>
            <his-table :columns="columns" :rowColors="rowColors" :rows="rows"/>
        </ion-content>
    <action-footer :buttons="actionButtons"> </action-footer>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import HisTable from "@/components/DataViews/HisBasicTable.vue"
import ActionSheetMixin from "@/components/DataViews/actionsheet/ActionSheetMixin.vue"

export default defineComponent({
    mixins: [ActionSheetMixin],
    components: { HisTable },
    props: {
        rowColors: {
            type: Object as PropType<Array<{indexes: number[];class: string}>>
        },
        columns: {
            type: Object as PropType<Array<string>>,
            required: true
        },
        rows: {
            type: Object as PropType<Array<string>>,
            required: true
        }
    }
})
</script>
