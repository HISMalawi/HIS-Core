<template>
  <ion-page>
    <his-standard-form :skipSummary="true" :cancelDestinationPath="patientDashboardUrl" :fields="fields" />
  </ion-page>
</template>
<script lang="ts" setup>
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field, Option } from "@/components/Forms/FieldInterface"
import { toastWarning, alertConfirmation } from "@/utils/Alerts"
import { DispensationService } from "@/apps/SPINE/services/dispensation_service"
import HisDate from "@/utils/Date"
import { IonPage } from '@ionic/vue'
import { ref } from 'vue'
import useEncounter from '@/composables/useEncounter'
import { Patientservice } from "@/services/patient_service";

let dispensation: DispensationService;
const fields = ref<Array<Field>>([]);

const { goToPatientDashboard, patientDashboardUrl } = useEncounter(async (providerId, patientId, patient) => {
  dispensation = new DispensationService(patientId, providerId)
  await dispensation.loadCurrentDrugOrder()
  await dispensation.loadDrugHistory()
  fields.value.push(getDispensationField(patient));
});


function isDoneDispensing(orders: Array<Option>) {
  return orders.map(o => o.value != 0).every(Boolean)
}

function calculateCompletePack(order: any) {
  const units = parseFloat(order.amount_needed) - (order.quantity || 0)
  const completePack = dispensation.calcCompletePack(order, units)
  return completePack < 0 ? 0 : completePack
}

function buildOrderOptions() {
  return dispensation.getCurrentOrder().map((d: any) => ({
    label: d.drug.name,
    value: d.quantity || 0,
    other: {
      'drug_id': d.drug.drug_id,
      'order_id': d.order.order_id,
      'amount_needed': calculateCompletePack(d),
    }
  }))
}

function buildMedicationHistory() {
  return dispensation.getDrugHistory()
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
}

async function isValidDispensation(order: Option) {
  let isOk = true
  const totalTabs = parseInt(order.value.toString())
  const amountNeeded = order.other['amount_needed']
  const percentageGiven = (totalTabs / amountNeeded) * 100
  if (percentageGiven > 110) {
    isOk = await alertConfirmation('Are you sure you want to dispense over 110% of the prescribed pill count?')
  }
  if (percentageGiven < 100) {
    isOk = await alertConfirmation('Are you sure you want to dispense less than 100% of the prescribe amount?')
  }
  return isOk
}

async function onValueUpdate(order: Option, orders: Array<Option>) {
  if (order.value != -1 && isDoneDispensing(orders)) {
    return goToPatientDashboard()
  }
  order.other['amount_needed'] = 0
  await dispensation.loadCurrentDrugOrder()
  return buildOrderOptions()
}

async function onValue(order: Option, isBarcodeScanned: boolean) {
  if (order.value === -1) {
    const voided = await dispensation.voidOrder(order.other.order_id)
    return !voided
  }
  if (!isBarcodeScanned && !(await isValidDispensation(order))) return false;
  const dispensations = dispensation.buildDispensations(order.other.order_id, order.value as number);
  const dispensed = await dispensation.saveDispensations(dispensations);
  if (dispensed) return true;
  toastWarning('Unable to save dispensation')
  return false
}

function getDispensationField(patient: Patientservice) {
  return {
    id: 'dispenses',
    helpText: 'Dispensation',
    type: FieldType.TT_DRUG_DISPENSER,
    onValueUpdate,
    onValue,
    config: {
      medicationHistory: buildMedicationHistory(),
      toolbarInfo: [
        { label: 'Name', value: patient?.getFullName() },
        { label: 'Gender', value: patient?.getGender() },
        {
          label: 'Date Of Birth', value: HisDate.toStandardHisDisplayFormat(
            patient?.getBirthdate()
          )
        }
      ],
      hiddenFooterBtns: [
        'Clear',
        'Finish'
      ]
    },
    options: () => buildOrderOptions()
  }
}
</script>
