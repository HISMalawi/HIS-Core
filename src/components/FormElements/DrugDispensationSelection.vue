<template>
    <view-port>
        <div class='view-port-content'>
            <ion-row> 
                <ion-col size="2">
                    <nav-button
                        @click="tab='prescribe'"
                        :isActive="tab === 'prescribe'"
                        image='prescription/rx'
                        label='Prescribed'
                    />
                    <nav-button
                        @click="tab='history'"
                        :isActive="tab === 'history'"
                        image='prescription/history'
                        label='History'
                    />             
                </ion-col>
                <ion-col size="10"> 
                    <!--- HISTORY START--->
                    <div class="his-card history" v-if="tab === 'history'">
                        <table class="his-table">
                            <tr>
                                <th> Medication</th>
                                <th> Date</th>
                                <th> Amount dispensed </th>
                            </tr>
                            <tr v-for="(history, hindex) in medicationHistory" :key="hindex">
                                <td> {{ history.medication }} </td>
                                <td> {{ history.date }} </td>
                                <td> {{ history.amount }}</td>
                            </tr>
                        </table>
                    </div>
                    <!-- HISTORY END --->

                    <!--- PRESCRIPTION START --->
                    <div class="prescription-tab" v-if="tab === 'prescribe'">
                        <div class='prescription-table-section his-card'> 
                            <table class="his-table">
                                <tr>
                                    <th> Medication</th>
                                    <th> Amount in stock</th>
                                    <th> Amount needed</th>
                                    <th> Amount dispensed </th>
                                    <th> Reset </th>
                                </tr>
                                <tr v-for="(data, index) in listData" :key="index">
                                    <td> {{ data.label }} </td>
                                    <td> {{ fmtNumber(data.other.available_stock) }} </td>
                                    <td> {{ data.other.amount_needed }} </td>
                                    <td> <ion-input 
                                            :disabled="dispensingLockEnabled || data.value > 0" 
                                            :value="data.value" 
                                            @click="data.value <= 0 && !dispensingLockEnabled ? launchDispenser(data) : null" 
                                            class='dosage-input'/> 
                                        </td>
                                    <td> <reset-button 
                                            label = ''
                                            :disabled="data.value <= 0" 
                                            @click="data.value > 0 ? onReset(data): null"> 
                                        </reset-button> 
                                    </td>
                                </tr>
                            </table>
                        </div> 
                        <div class='barcode-section'> 
                            <barcode @onScan="onScan" class="his-card"/>
                        </div>
                    </div>
                    <!-- PRESCRIPTION END -->
                </ion-col>
            </ion-row>
        </div>
    </view-port>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ViewPort from '../DataViews/ViewPort.vue'
import { modalController } from '@ionic/vue'
import { Option } from '@/components/Forms/FieldInterface'
import Barcode from '@/components/BarcodeInput.vue'
import NavButton from "@/components/Buttons/ActionSideButton.vue"
import ResetButton from "@/components/Buttons/ResetButton.vue"
import ArtDispensationModal from "@/components/DataViews/ArtDispensationModal.vue"
import FieldMixinVue from './FieldMixin.vue'
import {
    IonInput,
    IonRow,
    IonCol
} from "@ionic/vue"
import { isEmpty } from 'lodash'
import { toastDanger } from '@/utils/Alerts'
import { toNumString } from '@/utils/Strs'

export default defineComponent({
  components: {
    IonInput,
    ViewPort, 
    Barcode, 
    NavButton, 
    ResetButton,
    IonRow,
    IonCol
  },
  mixins: [FieldMixinVue],
  data: () => ({
    dispensingLockEnabled: false,
    tab: 'prescribe' as 'prescribe' | 'history',
    listData: [] as any,
    medicationHistory: [] as any,
    isStockManagementEnabled:false
  }),
  mounted() {
    this.init()
  },
  activated() {
    this.init()
  },
  watch: {
    tab : {
        handler(tab: string) {
            if (tab === 'history' && isEmpty(this.medicationHistory)) {
                if (typeof this.config.medicationHistory === 'function') {
                    this.config.medicationHistory().then((data: any) => {
                        if (data) {
                            this.medicationHistory = data
                        } 
                    }).catch((e: any) => {
                        toastDanger(`${e}`)
                    })
                }
            }
        }
    }
  },
  methods: {
    async init() {
        this.$emit('onFieldActivated', this)
        if (typeof this.config?.isDrugManagementEnabled === 'function') {
            this.isStockManagementEnabled = this.config?.isDrugManagementEnabled()
        }
        this.listData = await this.options(this.fdata)
    },
    async onScan(barcode: string) {
        const [ drugId, quantity ] = barcode.split('-')
        /** Find the drug matching the one detected on the barcode */
        const data = this.listData.map(async (i: Option) => {
            if (i.other.drug_id === parseInt(drugId)) {
                const prevQuantity = parseInt(i.value.toString())
                const curQuantity = parseInt(quantity)
                const ok = await this.updateOnValue(i, curQuantity, [], true)
                // continously increment barcode values for presentation purposes only
                if (ok) {
                    i.value = curQuantity + prevQuantity
                }
            }
            return i
        })
        this.listData = await Promise.all(data)
    },
    async onReset(item: Option) {
        await this.updateOnValue(item, -1)
    },
    fmtNumber (value: string){
        if(!this.isStockManagementEnabled || /-/i.test(value)) return '-'
        return toNumString(value);
    },
    async updateOnValue(item: Option, quantity: any, dispenses=[] as Array<any>, isBarcode=false) {
        if (this.onValue) {
            const ok = await this.onValue({
                label: item.label, 
                other: {
                    dispenses, ...item.other
                },
                value: quantity
            }, isBarcode)
            if (!ok) return false
        }
        item.value = quantity < 0 ? 0 : quantity
        this.$emit('onValue', item)
        if (this.onValueUpdate) {
            this.listData = await this.onValueUpdate(item, this.listData)
        }
        return true
    },
    async launchDispenser(item: Option) {
        this.dispensingLockEnabled = true
        const modal = await modalController.create({
            component: ArtDispensationModal,
            backdropDismiss: false,
            cssClass: 'custom-modal',
            componentProps: {
                drugName: item.label,
                tabsNeeded: item.other.amount_needed,
                items: item.other.pack_sizes,
                onClose: async () => {
                    this.dispensingLockEnabled = false
                    await modalController.dismiss({})
                },
                onDispense: async (values: Array<any>) => {
                   const tabsIndex = 0
                   const quantity = values.reduce((a: number, c: Array<number>) => a + c[tabsIndex], 0)
                   const ok = await this.updateOnValue(item, quantity, values)
                   if (ok) {
                        this.dispensingLockEnabled = false
                        await modalController.dismiss({})
                   } 
                }
            }
        })
        modal.present()
    }
  }
})
</script>
<style scoped>
    .view-port-content {
        height: 100%;
    }
    .prescription-tab {
        position: relative;
        height: 75vh;
    }
    .prescription-table-section {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 76%;
        overflow-x: auto;
    }
    .barcode-section {
        position: absolute;
        left: 0;
        right: 0;
        bottom: -20px;
    }
    .dosage-input {
        text-align: center;
        font-weight: bold;
        border: solid 1px #ccc;
        height: 50px;
        width: 80%;
        margin: auto;
        background-color: rgb(255, 248, 221);
    }
    table {
        width: 100%;
    }
    td, th {
        border: 1px solid #ccc;
        padding: 0.6em !important;
    }
</style>
