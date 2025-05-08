<template>
    <view-port :showFull="false">
        <ion-input class="input_display" :readonly="true" :value="value"/>
        <slot :date="value"> </slot>
    </view-port>
    <ion-grid class="his-floating-keyboard">
        <ion-row> 
            <ion-col sm-size="12"> 
                <picker-selector
                    :value="getYear"
                    @onIncrement="add('year')"
                    @onDecrement="subtract('year')"
                    @onValue="selectYear"
                />
            </ion-col>
            <ion-col sm-size="12"> 
                <picker-selector
                    :value="getMonth"
                    @onIncrement="add('month')"
                    @onDecrement="subtract('month')"
                    @onValue="selectMonth"
                />
            </ion-col>
            <ion-col sm-size="12"> 
                <picker-selector
                    :value="getDay"
                    @onIncrement="add('day')"
                    @onDecrement="subtract('day')"
                    @onValue="selectDay"
                />
            </ion-col>
        </ion-row>
        <ion-row>
            <ion-col v-if="canShowToday" class="ion-text-center" > 
                <ion-button color="success" style="width:100%; height:6vh;" @click="today"> 
                    <b>TODAY</b>
                </ion-button>
            </ion-col>
            <ion-col> 
                <ion-button :disabled="!config.allowUnknown" color="warning" style="width:100%; height:6vh;" @click="value='Unknown'"> 
                    <b>Unknown</b>
                </ion-button>
            </ion-col>
        </ion-row>
    </ion-grid>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'
import HisDate from "@/utils/Date"
import { Service } from '@/services/service'
import PickerSelector from "@/components/Selectors/PickerSelector.vue"
import { IonGrid, IonInput, IonCol, IonRow, IonButton, modalController } from '@ionic/vue'
import DateMonthSelector from '../DateMonthSelector.vue'
import DateDayPicker from '../DateDayPicker.vue'
import DateYearPicker from '../DateYearPicker.vue'

export default defineComponent({
    components: { 
        PickerSelector, 
        IonInput, 
        ViewPort, 
        IonGrid, 
        IonCol, 
        IonRow, 
        IonButton
    },
    mixins: [FieldMixinVue],
    data: ()=>({ 
        value: '',
        date: '' as any,
        isInit: true as boolean,
        canShowToday: true as boolean,
        showMonthSelector: false,
        showDaySelector: false,
        showYearSelector: false
    }),
    mounted() {
        this.init()
    },
    activated(){
        this.init()
    },
    methods: {
        async init() {
            this.$emit('onFieldActivated', this)
            if (typeof this.config.initialDate === 'function') {
                this.date = new Date(this.config.initialDate())
            } else {
                this.date = new Date()
            }
            this.canShowToday = typeof this.config?.addTodayBtn === 'function' 
                ? this.config.addTodayBtn(this.fdata, this.cdata)
                : this.config?.addTodayBtn ?? true

            await this.setDefaultValue()
            this.isInit = false
        },
        async setDefaultValue() {
            if(this.value) {
                this.date = new Date(this.value)
            } else if (this.defaultValue) {
                const defaults = await this.defaultValue(this.fdata, this.cdata)
                if (defaults) {
                    this.isInit = false
                    this.date = new Date(defaults)
                } 
            }
        },
        add(unit: string) {
            this.date = HisDate.add(this.fmt(this.date), unit, 1)
        },
        subtract(unit: string) {
           this.date = HisDate.subtract(this.fmt(this.date), unit, 1)
        },
        today() {
            this.date = new Date(Service.getSessionDate())
        },
        fmt(d: any) {
            return HisDate.toStandardHisFormat(d)
        },
        async selectDay() {
            const modal = await modalController.create({
                component: DateDayPicker,
                backdropDismiss: true,
                cssClass: "custom-modal-backdrop",
                componentProps: {
                    date: this.fmt(this.date),
                    onDay: (day: number) => {
                        const [year, month] = this.fmt(this.date).split('-')
                        this.date = new Date(`${year}-${month}-${day}`)
                        modal.dismiss()
                    }
                }
            })
            modal.present()
        },
        async selectMonth() {
           const modal = await modalController.create({
                component: DateMonthSelector,
                backdropDismiss: true,
                cssClass: "custom-modal-backdrop",
                componentProps: {
                    date: this.fmt(this.date),
                    onMonth: (month: number) => {
                        const [year, _, day] = this.fmt(this.date).split('-')
                        _
                        this.date = new Date(`${year}-${month}-${day}`)
                        modal.dismiss()
                    }
                }
            })
            modal.present()
        },
        async selectYear() {
            const modal = await modalController.create({
                component: DateYearPicker,
                backdropDismiss: true,
                cssClass: "custom-modal-backdrop",
                componentProps: {
                    date: this.fmt(this.date),
                    onYear: (year: number) => {
                        const [_, month, day] = this.fmt(this.date).split('-')
                        _
                        this.date = new Date(`${year}-${month}-${day}`)
                        modal.dismiss()
                    }
                }
            })
            modal.present()
        }
    },
    computed: {
        getYear(): any {
            return HisDate.getYear(this.fmt(this.date));
        },
        getMonth(): any {
            return HisDate.getMonth(this.fmt(this.date));
        },
        getDay(): any {
            return HisDate.getDay(this.fmt(this.date));
        }
    },
    watch: {
        date(newDate: string) {
            if (!this.isInit) { // avoid setting initial date unless otherwise
                this.value = HisDate.toStandardHisFormat(newDate)
            }
        },
        value(value) {
            if (!value) {
                this.$emit('onValue', null)
                return
            }
            this.$emit('onValue', { label: value, value: this.value })
        },
        clear() {
            this.value = ''
        }
    }
})
</script>
