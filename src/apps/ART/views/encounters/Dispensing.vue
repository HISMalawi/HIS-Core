<template>
    <his-standard-form 
        :fields="fields"
        :skipSummary="true" 
        :cancelDestinationPath="cancelDestination" 
    />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field, Option } from "@/components/Forms/FieldInterface"
import { toastWarning, alertConfirmation, toastDanger } from "@/utils/Alerts"
import { DispensationService } from "@/apps/ART/services/dispensation_service"
import {isEmpty } from 'lodash'
import EncounterMixinVue from '../../../../views/EncounterMixin.vue'
import HisDate from "@/utils/Date"
import Store from "@/composables/ApiStore"
import { joinWithCommasAnd } from '@/utils/Arrays'

export default defineComponent({
    mixins: [EncounterMixinVue],
    data: () => ({
        dispensation: {} as DispensationService
    }),
    watch: {
        ready: {
            handler(ready: any){
                if (ready) {
                    this.dispensation = new DispensationService(this.patientID, this.providerID)
                    this.fields = this.getFields()
                }
            },
            immediate: true
        }
    },
    methods: {
        saveDispensations(item: Option) {
            return this.dispensation.saveDispensations(this.buildDispensations(item))    
        },
        buildDispensations(item: Option) {
            if (!isEmpty(item.other?.dispenses)) {
                let dispenses: any = []
                item.other.dispenses.forEach(([tabs, packs]: Array<number>) => {
                    dispenses = [...dispenses, 
                    ...this.dispensation.buildDispensations(
                        item.other.order_id, tabs, packs
                    )]
                })
                return dispenses
            }
            return this.dispensation.buildDispensations(
                item.other.order_id, parseInt(item.value.toString()), 1
            )
        },
        async buildMedicationHistory() {
            await this.dispensation.loadDrugHistory()
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
                    'order': d,
                    'drug_id': d.drug.drug_id,
                    'order_id': d.order.order_id,
                    'available_stock': this.getCumulativeStocks(d.stocks),
                    'amount_needed': this.calculateCompletePack(d),
                    'pack_sizes': this.getPackSizesRows(d.drug.drug_id, d.stocks),
                }
            }))
        },
        getCumulativeStocks(stocks?: Array<any>){
            if(!stocks) return '-'
            return stocks.reduce((acc: number, curr: any) => acc + curr.quantity, 0);
        },
        getPackSizesRows(drugId: number, stocks?: Array<any>) {
            const packs = stocks?.map((s) => [s.packSize, Math.floor(s.quantity / s.packSize) || '-', 0, 0]) || []
            this.dispensation.getDrugPackSizes(drugId).forEach((packSize: any) => {
                const index = packs.findIndex(([p]) => p === packSize);
                if(index === -1) packs.push([packSize, '-', 0, 0]);
            })
            return packs.sort((a, b) => a[0] - b[0]);
        },
        calculateCompletePack(order: any) {
            const units = parseFloat(order.amount_needed) - (order.quantity || 0)
            if(units <= 0) return 0
            return this.dispensation.calcCompletePack(order, units)
        },
        isDoneDispensing(orders: Array<Option>) {
            return orders.map(o => o.value != 0).every(Boolean)
        },
        async isValidDispensation(option: Option) {
            const totalTabs = parseInt(option.value.toString())
            const amountNeeded = option.other['amount_needed']
            const percentageGiven = (totalTabs / amountNeeded) * 100

            if (percentageGiven > 110) {
                const confirmed = await alertConfirmation('Are you sure you want to dispense over 110% of the prescribed pill count?')
                if (!confirmed) return false
            }

            if (percentageGiven < 100) {
                const confirmed = await alertConfirmation('Are you sure you want to dispense less than 100% of the prescribe amount?')
                if (!confirmed) return false
            }

            if(this.dispensation.useDrugManagement) {
                const emptyPacks = option.other?.dispenses.filter(([p]: any) => {
                    return option.other?.pack_sizes.some(([packSize, availableStock, dispensedAmount]: any) => {
                        return packSize === p &&
                            availableStock === "-" &&
                            dispensedAmount > 0
                    })
                })
                .map(([p]: any) => p);

                if(!isEmpty(emptyPacks)) {
                    return alertConfirmation(`Are you sure you want to dispense drugs of ${ joinWithCommasAnd(emptyPacks) } pack size(s) that have no associated stocks available?`)
                }
            }
            return true
        },
        getFields(): Array<Field> {
            return [
                {
                    id: 'dispenses',
                    helpText: 'Dispensation',
                    type: FieldType.TT_DISPENSATION_INPUT,
                    init: async () => {
                        try {
                            this.dispensation.setIsDrugManagementEnabled((await Store.get('IS_ART_DRUG_MANAGEMENT_ENABLED')))
                            await this.dispensation.loadCurrentDrugOrder()
                            return true
                        } catch (e) {
                            toastDanger(`Unable to load current order: ${e}`)
                            return false
                        }
                    },
                    onValueUpdate: async(i: Option, l: Array<Option>) => {
                        if (i.value != -1 && this.isDoneDispensing(l)) {
                            return this.$router.push({name: 'appointment'})
                        }
                        i.other['amount_needed'] = i.other['amount_needed'] - (parseInt(i.value.toString()) || 0)
                        if(i.other['amount_needed'] < 0 ) i.other['amount_needed'] = 0
                        
                        await this.dispensation.loadCurrentDrugOrder()

                        return this.buildOrderOptions()
                    },
                    onValue: async (i: Option, isBarcodeScanned: boolean) => {
                        if (i.value  === -1) {
                            const voided = await this.dispensation.voidOrder(i.other.order_id)
                            return !voided
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
                        isDrugManagementEnabled: () => this.dispensation.useDrugManagement,
                        medicationHistory: () => this.buildMedicationHistory(),
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
