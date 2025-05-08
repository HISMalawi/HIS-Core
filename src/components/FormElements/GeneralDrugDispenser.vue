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
          <div class="prescription-tab" v-if="tab === 'prescribe'">
            <div class='prescription-table-section his-card'> 
              <table class="his-table">
                <tr>
                  <th> Medication</th>
                  <th> Amount needed</th>
                  <th> Amount dispensed </th>
                  <th> Reset </th>
                </tr>
                <tr v-for="(data, index) in listData" :key="index">
                  <td> {{ data.label }} </td>
                  <td> {{ data.other.amount_needed }} </td>
                  <td> 
                    <ion-input 
                      :disabled="data.value > 0" 
                      :value="data.value" 
                      @click="data.value <= 0 ? launchDispenser(data) : null" 
                      class='dosage-input'
                    /> 
                  </td>
                  <td> 
                    <reset-button 
                      :disabled="data.value <= 0" 
                      @click="data.value > 0 ? onReset(data): null"> 
                    </reset-button> 
                  </td>
                </tr>
              </table>
            </div> 
            <div class='barcode-section'> 
              <barcode @onScan="onScan" class="his-card" />
            </div>
          </div>
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
import FieldMixinVue from './FieldMixin.vue'
import { IonRow, IonCol } from "@ionic/vue"
import GeneralDispenserModalVue from '../DataViews/GeneralDispenserModal.vue'

export default defineComponent({
  components: { 
    ViewPort, 
    Barcode, 
    NavButton, 
    ResetButton,
    IonRow,
    IonCol
  },
  mixins: [FieldMixinVue],
  data: () => ({
    isDispensing: false,
    tab: 'prescribe',
    listData: [] as any
  }),
  mounted() {
    this.init()
  },
  activated() {
    this.init()
  },
  computed: {
    medicationHistory(): Array<any> {
      if (this.config && this.config.medicationHistory) {
        return this.config.medicationHistory
      }
      return []
    }
  },
  methods: {
    async init() {
      this.$emit('onFieldActivated', this)
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
      if (this.isDispensing) {
        return
      }
      this.isDispensing = true
      const modal = await modalController.create({
        component: GeneralDispenserModalVue,
        backdropDismiss: false,
        cssClass: 'custom-modal',
        componentProps: {
          drugName: item.label,
          amountNeeded: item.other.amount_needed,
          onDispense: async (quantity: string) => {
            const ok = await this.updateOnValue(item, quantity)
            if (ok) {
              await modalController.dismiss({})
            }
          }
        }
      })
      modal.present()
      await modal.onDidDismiss()
      this.isDispensing = false
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
