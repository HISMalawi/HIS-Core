<template>
    <view-port>
        <ion-grid class='view-port-content'> 
            <ion-row> 
                <ion-col size="4">
                    <ion-list> 
                        <ion-radio-group v-model="selected">
                            <ion-item 
                                detail 
                                lines="none" 
                                class="his-md-text his-card ion-padding" 
                                v-for="(item, index) in listData" :key="index"> 
                                <ion-radio slot="start" :value="item.label"></ion-radio>
                                <ion-label v-html="item.label"></ion-label>
                            </ion-item>
                        </ion-radio-group>
                    </ion-list>
                </ion-col>
                <ion-col>
                    <div v-for="(option, optionIndex) in listData" :key="optionIndex"> 
                        <div v-if="selected === option.label">
                            <ion-grid style="margin-bottom: 10px;" class="his-card" v-for="(rows, mainRowIndex) in option.other.data" :key="mainRowIndex">
                                <ion-row v-if="option?.other?.rowTitles" style="background:#F8F8F8;">
                                    <ion-col class="ion-text-center"> 
                                       <ion-title class="his-md-text" v-html="option?.other?.rowTitles ? option?.other?.rowTitles[mainRowIndex] || '' : ''"> </ion-title>
                                    </ion-col>
                                </ion-row>
                                <p/>
                                <ion-row v-for="(rowItem, rowIndex) in rows" :key="rowIndex">
                                    <ion-col>
                                        <ion-item  v-if="rowItem.disabled"
                                            @click="warn(`Cannot edit ${rowItem.label}`)" 
                                            class="his-sm-text"> 
                                            <ion-label slot='start'>{{rowItem.label}}</ion-label>
                                            <ion-input placeholder="N/A" slot="end"/>
                                        </ion-item>
                                        <ion-item v-if="!rowItem.disabled"
                                            class="his-sm-text"
                                            @click="editField(rowItem, listData[optionIndex].other.data[mainRowIndex])">
                                            <ion-label :color="rowItem?.value?.label ? '' : 'danger'">
                                                <b>{{rowItem.label}}</b>
                                            </ion-label>
                                            <ion-input
                                             class="his-md-text"
                                             slot="end"
                                             :readonly="true"
                                             :value="rowItem?.value?.label"
                                             placeholder="Click to edit"
                                            />
                                        </ion-item>
                                    </ion-col>
                                </ion-row>
                            </ion-grid>
                        </div>
                    </div>
                </ion-col>
            </ion-row>
        </ion-grid>
    </view-port>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Field, Option } from '../Forms/FieldInterface'
import FieldMixinVue from './FieldMixin.vue'
import ViewPort from '../DataViews/ViewPort.vue'
import {
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonRadioGroup,
    IonRadio,
    IonGrid,
    IonInput,
    IonCol,
    IonRow,
    modalController
} from "@ionic/vue"
import {
    arrowUp,
    arrowDown
} from "ionicons/icons"
import { toastWarning } from "@/utils/Alerts"
import TouchField from "@/components/Forms/SIngleTouchField.vue"

export default defineComponent({
    name: "HisSelect",
    mixins: [FieldMixinVue],
    components: {
        IonItem,
        IonLabel,
        IonList,
        IonTitle,
        IonInput,
        IonRadioGroup,
        IonRadio,
        IonGrid,
        IonCol,
        IonRow,
        ViewPort
    },
    setup() {
        return {
            arrowUp,
            arrowDown
        }
    },
    data: () => ({
        selected: '' as string,
        listData: [] as Option[]
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
            this.listData = await this.options(this.fdata)
            if (this.listData.length) this.selected = this.listData[0].label
        },
        warn(message: string) {
           toastWarning(message)
        },
        async launchModal(field: Field, onFinish: (value: Option | Option[]) => void) {
            (await modalController.create({
                component: TouchField,
                backdropDismiss: false,
                cssClass: "full-modal",
                componentProps: {
                    dismissType: 'modal',
                    currentField: field,
                    onFinish
                }
            })).present()
        },
        async editField(option: any, rowItems: any) {
            const onValue = (v: Option | Option[]) => {
                option.value = v
                if (typeof option?.field?.onValueUpdate === 'function') {
                    option.field.onValueUpdate(v, rowItems)
                }
            }
            this.launchModal(option.field, (v: Option | Option[]) => {
                if (!Array.isArray(v)) {
                    // Launch alternative modal to estimate unknown values
                    if (v.label.match(/unknown/i) && 
                        typeof option.field?.config?.onUnknownEstimateField === 'function') {    
                        return this.launchModal(option.field.config.onUnknownEstimateField(), 
                            (v: Option | Option[]) => onValue(v))
                    }
                }
                onValue(v)
            })
       }
    },
    watch: {
        listData: {
            handler(data: Option[]) {
                if (typeof this.onValue === 'function') this.onValue([...data])
                this.$emit('onValue', [...data])
            },
            deep: true
        }
    }
})
</script>
<style scoped>
    ion-radio {
        --size: 48px;
    }
</style>
