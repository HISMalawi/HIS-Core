<template>
    <view-port>
        <ion-list class='view-port-content'>
            <ion-grid> 
                <ion-row> 
                    <ion-col
                        size="4"
                        v-for="(item, index) in filtered"
                        :key="index"> 
                        <div class="his-card clickable"
                            :class="{'active-card-color': selected === item.label}"
                            @click="onselect(item)">
                            <ion-list> 
                                <ion-item v-for="(l, lIndex) in item.other.list" :key="lIndex"> 
                                    <ion-label> 
                                        <b>{{l.label}}</b> 
                                    </ion-label>
                                    <span :style="l.style || {}"> 
                                        {{l.value}} 
                                    </span>
                                </ion-item>
                            </ion-list> 
                        </div>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-list>
    </view-port>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Option } from '../Forms/FieldInterface'
import SelectMixin from "@/components/FormElements/SelectMixin.vue"
import { find } from "lodash"
export default defineComponent({
    name: "HisSelect",
    mixins: [SelectMixin],
    watch: {
        clear(){ 
            this.clearSelection() 
        }
    },
    mounted() {
        this.init()
    },
    activated() {
        this.init()
    },
    methods: {
        async init() {
            this.$emit('onFieldActivated', this)
            this.listData = await this.options(this.fdata)
            await this.setDefaultValue() 
        },
        async setDefaultValue() {
            if(this.defaultValue) {
                const defaults: string = await this.defaultValue(this.fdata, this.cdata, this.selected)
                if (defaults) {
                    const found = find(this.listData, {label: defaults}) || find(this.listData, {value: defaults}) 
                    if (found) {
                        this.onselect(found)
                    }
                }
            }
        },
        async onselect(item: Option) {
            this.selected = item.label
            if (this.onValue) {
                const ok = await this.onValue(item, this)
                if (!ok) {
                    this.selected = ''
                    return
                }
            }
            if (this.onValueUpdate) {
                this.listData = await this.onValueUpdate(item, this.listData)
            }
            this.$emit('onValue', item)
        }
    }
})
</script>
<style scoped>
    .view-port-content {
        height: 99%;
    }
</style>