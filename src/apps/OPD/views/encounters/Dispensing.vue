<template>
  <his-standard-form :skipSummary="true" :cancelDestinationPath="cancelDestination" :fields="fields"/>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field, Option } from "@/components/Forms/FieldInterface"
import { toastWarning, alertConfirmation } from "@/utils/Alerts"
import { DispensationService } from "@/apps/OPD/services/dispensation_service"
import EncounterMixinVue from '@/views/EncounterMixin.vue'
import HisDate from "@/utils/Date"

export default defineComponent({
  mixins: [EncounterMixinVue],
  data: () => ({
    dispensation: {} as any
  }),
  watch: {
    patient: {
      async handler(patient: any){
        this.dispensation = new DispensationService(patient.getID(), this.providerID)
        await this.dispensation.loadCurrentDrugOrder()
        await this.dispensation.loadDrugHistory()
        this.fields = this.getFields()
      },
      deep: true
    }
  },
  methods: {
    saveDispensations(item: Option) {
      const dispensations = this.buildDispensations(item)
      return this.dispensation.saveDispensations(dispensations)    
    },
    buildDispensations(item: Option) {
      return this.dispensation.buildDispensations(
        item.other.order_id, item.value
      )
    },
    buildMedicationHistory() {
      return this.dispensation.getDrugHistory()
      .sort((a: any, b: any) => {
        const dateA: any = new Date(a.order.start_date)
        const dateB: any = new Date(b.order.start_date)
        return dateB - dateA
      })
      .map((d: any) => ({
        medication: d.drug.name,
        date: HisDate.toStandardHisDisplayFormat(d.order.start_date),
        amount: d.quantity
      }))
    },
    buildOrderOptions() {
      return this.dispensation.getCurrentOrder().map((d: any) => ({
        label: d.drug.name,
        value: d.quantity || 0,
        other: {
          'drug_id': d.drug.drug_id,
          'order_id': d.order.order_id,
          'amount_needed': this.calculateCompletePack(d),
        }
      }))
    },
    getPackSizesRows(drugId: number, availableStock: number) {
      const packs = this.dispensation.getDrugPackSizes(drugId)
      return packs.map((packSize: number) => {
        const packs = availableStock > 0 ? (availableStock / packSize) : '-'
        return [packSize, packs, 0, 0]
      })
    },
    calculateCompletePack(order: any) {
      const units = parseFloat(order.amount_needed) - (order.quantity || 0)
      const completePack = this.dispensation.calcCompletePack(order, units)
      return completePack < 0 ? 0 : completePack
    },
    isDoneDispensing(orders: Array<Option>) {
      return orders.map(o => o.value != 0).every(Boolean)
    },
    async isValidDispensation(option: Option) {
      let isOk = true
      const totalTabs = parseInt(option.value.toString())
      const amountNeeded = option.other['amount_needed']
      const percentageGiven = (totalTabs / amountNeeded) * 100
      if (percentageGiven > 110) {
        isOk = await alertConfirmation('Are you sure you want to dispense over 110% of the prescribed pill count?')
      }
      if (percentageGiven < 100) {
        isOk = await alertConfirmation('Are you sure you want to dispense less than 100% of the prescribe amount?')
      }
      return isOk
    },
    getFields(): Array<Field> {
      return [
        {
          id: 'dispenses',
          helpText: 'Dispensation',
          type: FieldType.TT_DRUG_DISPENSER,
          onValueUpdate: async(i: Option, l: Option[]) => {
            if(i.value != -1 && this.isDoneDispensing(l)) {
              return this.gotoPatientDashboard()
            }
            i.other['amount_needed'] = 0
            await this.dispensation.loadCurrentDrugOrder()
            return this.buildOrderOptions()
          },
          onValue: async (i: Option, isBarcodeScanned: boolean) => {
            if (i.value  === -1) {
              const voided = await this.dispensation.voidOrder(i.other.order_id)
              return voided? true : false
            }
            if (!isBarcodeScanned) {
              const isValidDispensation = await this.isValidDispensation(i)
              if (!isValidDispensation) return false
            }
            const dispensed = await this.saveDispensations(i)
            if (dispensed) return true
            toastWarning('Unable to save dispensation')
            return false
          },
          config: {
            medicationHistory: this.buildMedicationHistory(),
            toolbarInfo: [
              { label: 'Name', value: this.patient.getFullName() },
              { label: 'Gender', value: this.patient.getGender() },
              { label: 'Date Of Birth', value: HisDate.toStandardHisDisplayFormat(
                this.patient.getBirthdate()
              )}
            ],
            hiddenFooterBtns: [ 
              'Clear',
              'Finish'
            ]
          },
          options: () => this.buildOrderOptions()
        }
      ]
    }
  }
})
</script>
