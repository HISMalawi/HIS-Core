<template>
    <view-port :showFull="false">
        <ion-grid>
            <ion-row>
                <ion-col v-if="prependValue" size-md="4">
                    <ion-input :readonly="isReadOnly" :value="prependValue" class="input_display" :disabled="true"/>
                </ion-col>
                <ion-col size-md="">
                    <base-input :type="inputType" :value="value" @onValue="onKbValue"/>
                </ion-col>
            </ion-row>
        </ion-grid>
        <ion-list v-if="listData.length > 0" class='view-port-content'>
            <ion-item class="his-md-text" button v-for="(item, index) in listData" :key="index" @click="onselect(item)"> 
                <ion-label> {{item.label}} </ion-label>
            </ion-item>
        </ion-list>
    </view-port>   
    <his-keyboard :initalKeyboardName="initalKeyboardName" :kbConfig="keyboard" :onKeyPress="keypress" :disabled="false"> </his-keyboard>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseInput from "@/components/FormElements/BaseTextInput.vue"
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import { Option } from '../Forms/FieldInterface'
import { QWERTY } from "@/components/Keyboard/HisKbConfigurations"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'
import { isPlainObject } from 'lodash'
import { 
    IonInput,
    IonRow,
    IonCol,
    IonGrid,
    IonList, 
    IonItem, 
    IonLabel,
} from "@ionic/vue"

export default defineComponent({
    components: { 
        IonInput, 
        IonRow,
        IonCol,
        IonGrid,
        BaseInput, 
        HisKeyboard, 
        ViewPort, 
        IonList, 
        IonItem, 
        IonLabel 
    },
    mixins: [FieldMixinVue],
    data: ()=>({
        value: '' as string,
        prependValue: '' as string,
        initalKeyboardName: '' as string,
        keyboard: {} as Array<any>,
        listData: [] as Array<Option>
    }),
    computed: {
        inputType(): string {
            if (this.config && 'inputType' in this.config) {
                return this.config.inputType
            }
            return 'text'
        }
    },
    mounted() {
        this.init()
    },
    activated(){
        this.init()
    },
    methods: {
        async init() {
            this.keyboard = this.config?.customKeyboard || QWERTY
            this.initalKeyboardName = typeof this.config?.initialKb === 'function' 
                ? this.config?.initialKb(this.fdata, this.cdata)
                : this.config?.initialKb || ''

            this.$emit('onFieldActivated', this)
            if (this.config && this.config.prependValue) {
                this.prependValue = await this.config.prependValue(this.fdata)
            }
            await this.setDefaultValue()
        },
        async setDefaultValue() {
            if (this.defaultValue && !this.value) {
                const defaults: any = await this.defaultValue(this.fdata, this.cdata)
                if (defaults) {
                    if (isPlainObject(defaults)) {
                        this.emitValue(defaults)
                        this.value = defaults.value.toString()
                    } else {
                        this.value = defaults
                        this.emitValue({label: defaults, value: defaults})
                    }
                }
            }
        },
        async emitValue(v: Option) {
            if (v.value === '') {
                this.value = ''
                return this.$emit('onValue', null)
            }

            if (this.onValue) {
                const ok = await this.onValue(v)
                if (!ok) {
                    return
                }
            }
         
            //Automatically concat prepended value with input
            v.value = this.prependValue 
                ? `${this.prependValue}${v.value}`
                : v.value
            this.value = v.label
            this.$emit('onValue', v)
        },
        async onselect(item: Option){
            await this.emitValue(item)
        },
        async onKbValue(text: any) {
            await this.emitValue({ label: text, value: text })
        },
        async keypress(text: any){
            const input = handleVirtualInput(text, this.value, this.config?.casing)
            await this.emitValue({ label: input, value: input })
        }
    },
    watch: {
        value: {
            async handler() {
              if (this.options) {
                this.listData = await this.options(this.fdata)
              }
            },
            deep: true
        },
        clear() {
            this.value = ''
        }
    }
})
</script>
<style scoped> 
#view-port {
    height: 53vh;
}
.view-port-content {
    height: 80%;
}
</style>