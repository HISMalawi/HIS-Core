<template>
    <view-port :showFull="!showKeyboard">
        <his-text-input :readonly="!showKeyboard" :value="selected" @onValue="(value) => onKbValue(value, showKeyboard)" /> 
        <ion-list class='view-port-content'>
            <ion-item 
                class="his-md-text"
                button v-for="(item, index) in filtered" 
                :color="item.label === selected ? 'lightblue': ''"
                :lines="item.isChecked ? 'none':''" 
                :key="index"
                :disabled="'disabled' in item && item.disabled ? true: false"
                @click="onselect(item)"> 
                <ion-label> 
                    {{item.label}}
                    <p class="his-sm-text" v-if="item.description" v-html="item.description.text"></p>
                </ion-label>
            </ion-item>
        </ion-list>
    </view-port>
    <his-keyboard v-if="showKeyboard" :kbConfig="keyboard" :onKeyPress="keypress"/>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { Option } from '../Forms/FieldInterface'
import SelectMixin from "@/components/FormElements/SelectMixin.vue"
import { find } from "lodash"
export default defineComponent({
    name: "HisSelect",
    mixins: [SelectMixin],
    data: () => ({
        isInit: false as boolean
    }),
    watch: {
        clear() { 
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
            if (!this.isInit) {
                await this.setDefaultValue()
            }
            this.isInit = true
        },
        async setDefaultValue() {
            if(this.defaultValue) {
                const defaults: string = await this.defaultValue(this.fdata, this.cdata, this.selected)
                if (defaults) {
                    const found = find(this.listData, {label: defaults}) || find(this.listData, {value: defaults}) 
                    if (found) {
                        this.onselect(found)
                    } else {
                        this.selected = defaults
                        this.filter = defaults
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
            this.$emit('onValue', item)
        }
    }
})
</script>
<style scoped>
   .half .view-port-content {
        height: 85%;
        padding-bottom: 0px;
    }
    .view-port-content {
        height: 91%;
        padding-bottom: 0px;
    }
    #view-port {
        height: 82vh;
    }
</style>