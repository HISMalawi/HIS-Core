<template>
    <view-port>
        <base-input :value="value" @onValue="onKbValue"/>
        <span v-if="errors" style="color:red;font-weight:bold">
            **{{errors}}**
        </span>
    </view-port>
    <his-keyboard :kbConfig="keyboard" :onKeyPress="keypress" :disabled="false"> </his-keyboard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseInput from "@/components/FormElements/BaseTextInput.vue"
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import { MONTHLY_DAYS } from "@/components/Keyboard/HisKbConfigurations"
import ViewPort from '@/components/DataViews/ViewPort.vue'
import { MONTHLY_DAYS_LO } from '../Keyboard/KbLayouts'
import FieldMixinVue from './FieldMixin.vue'

export default defineComponent({
    components: { BaseInput, HisKeyboard, ViewPort },
    mixins: [FieldMixinVue],
    data: ()=>({ 
        value: '',
        errors: '',
        minDays: 1 as number,
        maxDays: 30 as number,
        keyboard: [] as any
    }),
    mounted() {
        this.init()
    },
    activated() {
        this.init()
    },
    methods: {
        async init() {
            this.$emit('onFieldActivated', this)
            let keypad: Array<any> = MONTHLY_DAYS_LO

            if (this.config) {
                // Generate dynamic keypad based on year and month configuration
                if (this.config.year && this.config.month) {
                    keypad = this.generateKeypad(
                        this.config.year(this.fdata), 
                        this.config.month(this.fdata)
                    )
                }
                // Load secondary keyboard buttons if configured
                if (this.config.keyboardActions) {
                    this.keyboard = [
                        keypad, 
                        this.config.keyboardActions
                    ]
                } else {
                    this.keyboard = [
                        keypad, 
                        [
                            ['Unknown']
                        ]
                    ]                
                }
            } else {
                // Use fixed configuration for everything
                this.keyboard = MONTHLY_DAYS
            }

            await this.setDefaultValue()
        },
        onKbValue(value: any) {
            this.value = value
            this.emitValue()
        },
        keypress(text: any){
            this.value = handleVirtualInput(text, '')
            this.emitValue()
        },
        emitValue() {
            this.errors = ''
            let num = this.value as any
            if (!num) {
                this.$emit('onValue', null)
                return
            }

            if (num.toString().match(/unknown/i)) {
                this.$emit('onValue', {label: 'Unknown', value: 'Unknown'})
                return
            }

            if (isNaN(num)) {
                this.errors = 'Invalid number'
                this.$emit('onValue', null)
                return
            }

            num = parseInt(num) as number
    
            if (num < this.minDays || num > this.maxDays) {
                this.errors = 'Value number is out of range'
                this.$emit('onValue', null)
            } else {
                this.$emit('onValue', { label: num, value: num })
            }
        },
        generateKeypad(year: number, month: number) {
            const days: Array<string[]> = [[]]
            this.maxDays = new Date(year, month, 0).getDate()
            let row = 0
            let counter = 0
            for(let i=0; i < this.maxDays; ++i) {
                if (counter > 7) {
                    ++row
                    days[row] = []
                    counter = 0
                }
                days[row].push(`${i + 1}`)
                ++counter
            }
            return days
        },
        async setDefaultValue() {
            if (this.defaultValue && !this.value) {
                const defaults = await this.defaultValue(this.fdata, this.cdata)
                if (defaults){
                    this.value = defaults
                    this.emitValue()
                }
            }
        }
    },
    watch: {
        clear() {
            this.value = ''
        }
    }
})
</script>
