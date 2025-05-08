<template>
    <view-port>
        <div class='view-port-content'>
            <ion-grid> 
                <ion-row> 
                    <ion-col size="6"><b> Drugs </b> </ion-col>
                    <ion-col size="3"><b> Quantity</b> </ion-col>
                    <ion-col size="3"><b> Frequency </b> </ion-col>
                </ion-row>
                <ion-row v-for="(data, index) in listData" :key="index"> 
                    <ion-col size="6">  
                       <div class="his-card" :style="{textAlign:'left'}"> {{ data.label }} </div>
                    </ion-col>
                    <ion-col size="3"> 
                        <ion-input readonly :value="data.other.quantity" @click="editQuantity(data)" class="his-card"/>
                    </ion-col>
                    <ion-col size="3"> 
                        <ion-input readonly :value="data.other.frequency" @click="editFrequency(data)" class="his-card"/>
                    </ion-col>
                </ion-row>
            </ion-grid>   
        </div>
    </view-port>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import ViewPort from '../DataViews/ViewPort.vue'
import { modalController } from '@ionic/vue'
import { Field, Option, SingleFieldFormOnFinishAction } from '@/components/Forms/FieldInterface'
import FieldMixinVue from './FieldMixin.vue'
import TouchField from "@/components/Forms/SIngleTouchField.vue"
import Validation from "@/components/Forms/validations/StandardValidations"
import {
    IonGrid,
    IonCol,
    IonRow,
    IonInput
} from "@ionic/vue"
import { FieldType } from '../Forms/BaseFormElements'
import { isEmpty } from 'lodash'
export default defineComponent({
  components: { 
    ViewPort,
    IonGrid,
    IonCol,
    IonRow,
    IonInput
  },
  mixins: [FieldMixinVue],
  data: () => ({
    listData: [] as any
  }),
  watch: {
    clear: {
        handler() {
            this.listData = this.listData.filter((item: Option) => {
                item.other.frequency = ''
                item.other.quantity = ''
                return true
            })
        },
        immediate: true
    },
    listData: {
        handler() {
            this.$emit('onValue', this.listData)
        },
        deep: true,
        immediate: true
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
        this.listData = await this.options(this.fdata, this.cdata, this.listData)
    },
    async launchEditor(field: Field, callback: SingleFieldFormOnFinishAction) {
        const modal = await modalController.create({
            component: TouchField,
            backdropDismiss: false,
            cssClass: "full-modal",
            componentProps: {
                dismissType: 'modal',
                currentField: field,
                onFinish: callback,
            }
        })
        modal.present()
    },
    editFrequency(item: Option) {
        this.launchEditor({
            id: 'edit_frequency',
            helpText: `Edit Frequency for ${item.label}`,
            type: FieldType.TT_SELECT,
            defaultValue: () => item.other.frequency,
            options: () => {
                if (!isEmpty(this.config.drugFrequencies)) {
                    return this.config.drugFrequencies
                }
                return []
            },
            validation: (v: Option) => Validation.required(v)
        }, (v: Option) => {
            item.other.frequency = v.value
        })
    },
    editQuantity(item: Option) {
        this.launchEditor({
            id: 'edit_quantity',
            helpText: `Edit quantity for ${item.label}`,
            type: FieldType.TT_NUMBER,
            defaultValue: () => item.other.quantity,
            validation: (v: Option) => Validation.required(v)
        }, (v: Option) => {
            item.other.quantity = parseInt(`${v.value}`)
        })
    }
  }
})
</script>
<style scoped>
    .his-card {
        text-align: center;
        font-weight: bold;
        border: solid 1px #ccc;
        height: 75px;
        width: 100%;
    }
    .view-port-content {
        height: 100%;
    }
</style>
