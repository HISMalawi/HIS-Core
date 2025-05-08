<template>
    <view-port>
        <base-input :value="value" @onValue="onKbValue"/>
        <ion-list class="view-port-content">
            <ion-radio-group v-model="selectedTimeUnit">
                <ion-item class="his-md-text" v-for="(timeUnit, index) in timeUnits" :key="index"> 
                    <ion-radio slot="start" :value="timeUnit"></ion-radio>
                    <ion-label>{{timeUnit}}</ion-label>
                </ion-item>
            </ion-radio-group>
        </ion-list>
    </view-port>
    <his-keyboard :kbConfig="keyboard" :onKeyPress="keypress"> </his-keyboard>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseInput from "@/components/FormElements/BaseTextInput.vue"
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import { NUMBERS_ONLY } from "@/components/Keyboard/HisKbConfigurations"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'
import {
    IonItem,
    IonList,
    IonLabel,
    IonRadio,
    IonRadioGroup
} from "@ionic/vue"

export default defineComponent({
    components: { 
        BaseInput, 
        HisKeyboard, 
        ViewPort,
        IonItem,
        IonList,
        IonLabel,
        IonRadio,
        IonRadioGroup
    },
    mixins: [FieldMixinVue],
    data: ()=> ({
        value: '',
        selectedTimeUnit: '' as '' 
            | 'Days'
            | 'Hours' 
            | 'Weeks' 
            | 'Months' 
            | 'Years',
        timeUnits: [
           'Hours',
           'Days',
           'Weeks',
           'Months',
           'Years'
        ],
        keyboard: NUMBERS_ONLY,
    }),
    mounted() {
        this.$emit('onFieldActivated', this)
    },
    activated() {
        this.$emit('onFieldActivated', this)
    },
    methods: {
        onKbValue(text: any) { 
            this.value = text
        },
        keypress(text: any){
            this.value = handleVirtualInput(text, this.value)
        },
        emitValue(value: string | number, unit: string){
            if (!value || !unit) {
                this.$emit('onValue', null)
            } else {
                const v = `${value} ${unit}`
                this.$emit('onValue', !value ? null : { 
                    label: v,
                    value: v,
                    other: {
                        value,
                        timeUnit: unit 
                    }
                })
            }
        }
    },
    watch: {
        value(value: string) {
            this.emitValue(value, this.selectedTimeUnit)
        },
        selectedTimeUnit(unit: string) {
            this.emitValue(this.value, unit)
        },
        clear() { 
            this.value = ''
            this.selectedTimeUnit = ''
        }
    }
})
</script>
