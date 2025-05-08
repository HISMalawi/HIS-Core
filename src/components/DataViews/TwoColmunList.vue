<template>
    <ion-list>
        <ion-row>
            <ion-col v-for="(items, index) in multiViewSummaryItems" :key="index" :size="singleView ? 12: 6" >
                <ion-item class="his-sm-text" v-for="(item, index) in items" :key="index">
                    <ion-label> {{item.label}} </ion-label>
                    <ion-label class="lb-value" v-html="item.value" slot="end"></ion-label>
                </ion-item>
            </ion-col>
        </ion-row>
    </ion-list>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Option } from "@/components/Forms/FieldInterface"
import {
    IonList,
    IonLabel,
    IonItem,
} from "@ionic/vue"
import { chunk } from "lodash";

export default defineComponent({
    props: {
       listData: {
        type: Object as PropType<Option[]>,
        },
    },
     data: () => ({
        splitFactor: 10
    }),
    components: { 
        IonList,
        IonLabel,
        IonItem,
    },
    computed: {
        singleView(): boolean {
            let size: any = this.listData?.length
            size = this.listData?.length
            if (size > this.splitFactor) {
                return  false
            }   
            return true
        },
        multiViewSummaryItems(): Array<Option[]>{
            const length: any = this.listData?.length
            const size = this.singleView
              ? this.listData?.length
              : Math.ceil(length/2)
            return chunk(this.listData, size)
        },
    },
})
</script>
<style scoped>
    .view-port-content {
        height: 100%;
    }
    .lb-value {
        font-weight: bold;
        text-align: end;
    }
    .item .sc-ion-label-md-h {
        white-space: normal;
    }
    .list-md {
        height: 100%;
        overflow: auto;
    }
</style>