<template>
    <view-port> 
        <multi-column-view
            style="width:100%;"
            class="view-port-content"
            :items="listData"
            :numberOfColumns="4"
            v-slot="{ entries }"
            >
            <ion-item lines="none" style="margin-bottom:10px;padding:0px;width:100%;" class="his-card clickable" 
                v-for="(entry, index) in entries" 
                :key="index" 
                @click="entry.isChecked"> 
                <ion-checkbox slot="start" v-model="entry.isChecked"/>
                <ion-label class="ion-text-wrap">
                    {{ entry.label }}
                </ion-label>
            </ion-item>
        </multi-column-view>
    </view-port>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import MultiColumnView from "@/components/containers/MultiColumnView.vue"
import FieldMixinVue from './FieldMixin.vue'
import { Option } from '../Forms/FieldInterface'
import { isEmpty } from 'lodash'
import ViewPort from "@/components/DataViews/ViewPort.vue"
import {
    IonCheckbox,
    IonItem,
    IonLabel,
} from "@ionic/vue"

export default defineComponent({
    name: "HisGridSelector",
    components: {
        ViewPort,
        IonItem,
        IonLabel,
        IonCheckbox,
        MultiColumnView
    },
    mixins: [FieldMixinVue],
    data: () => ({
        listData: [] as Option[]
    }),
    methods: {
        async init () {
            this.$emit('onFieldActivated', this)
            this.listData = await this.options(this.fdata, this.cdata, this.listData)
        }
    },
    watch: {
        clear(){
            this.listData = this.listData.map((item) => {
                item.isChecked = false
                return item
            })
        },
        listData: {
            handler(items: Option[]) {
                if (!isEmpty(items)) {
                    this.$emit('onValue', this.listData.filter(i => i.isChecked))
                }
            },
            immediate: true,
            deep: true
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
