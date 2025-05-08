<template>
  <IonPage>
    <his-standard-form 
      :cancelDestinationPath="patientDashboardUrl" 
      :fields="fields" 
      :onFinishAction="onSubmit"
      skipSummary
    />
  </IonPage>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from '@/components/Forms/validations/StandardValidations';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { getFacilities } from '@/utils/HisFormHelpers/LocationFieldOptions';
import { PatientReferralService } from '@/apps/SPINE/services/patient_referral_service'
import { PatientOutcomeService } from '@/apps/SPINE/services/patient_outcome_service';
import { LocationService } from "@/services/location_service";
import { resolveObs } from '@/utils/HisFormHelpers/commons';
import useEncounter from '@/composables/useEncounter';
import { isEmpty } from 'lodash';
import { alertConfirmation, toastDanger, toastWarning } from '@/utils/Alerts';
import { IonPage } from '@ionic/vue';

let referralService: PatientReferralService;
let dischargeService: PatientOutcomeService;
const fields = ref<Array<Field>>([]);

const { goToNextTask, patientDashboardUrl } = useEncounter((providerId, patientId) => {
  dischargeService = new PatientOutcomeService(patientId, providerId);
  referralService = new PatientReferralService(patientId, providerId)
  fields.value = [
    getOutcomeField(),
    getFacilityField(),
    getInternalSectionsField()
  ];
});


async function onSubmit(_fdata: any, cdata: any) {
  await dischargeService.createEncounter();
  const outcomeObs = await resolveObs({...cdata}, 'outcome');
  await dischargeService.saveObservationList(outcomeObs);
  const referralObs = await resolveObs({...cdata}, 'referral')
  if(!isEmpty(referralObs)) {
    await referralService.createEncounter()
    await referralService.saveObservationList(referralObs);
  }
  goToNextTask() 
}

function getOutcomeField (): Field {
  return {
    id: 'outcome_status',
    helpText: 'Select Discharge Outcome',
    type: FieldType.TT_SELECT,
    validation: (value: any) => Validation.required(value),
    computedValue: (v: Option) => ({
      tag: 'outcome',
      obs: dischargeService.buildValueCoded("outcome", v.value)
    }),
    options: () => [
      { label: "Referred (Within the Facility)", value: "Patient transferred internally"},
      { label: "Dead", value: "Died in treatment"},
      { label: "Abscorded", value: "Absconded"},
      { label: "Alive (Discharged home)", value: "Discharged home"},
      { label: "Transferred (Another health facility)", value: "Discharged to another facility"}
    ]
  }
}

function getFacilityField (): Field {
  return {
    id: 'facility_name',
    helpText: 'Select Facility name',
    type: FieldType.TT_SELECT,
    validation: (value: any) => Validation.required(value),
    computedValue: (v: Option) => ({
      tag: 'referral',
      obs: referralService.buildValueText('Referred', v.label)
    }),
    condition: (f: any) => f.outcome_status.value === "Discharged to another facility",
    options: (_: any, filter='') => getFacilities(filter),
    config: {
        showKeyboard: true,
        isFilterDataViaApi: true
    }
  }
}

function getInternalSectionsField(): Field {
  return {
    id: 'internal_sections',
    helpText: 'Select Ward/internal section',
    type: FieldType.TT_SELECT,
    validation: (value: any) => Validation.required(value),
    computedValue: (v: Option) => ({
      tag: 'referral',
      obs: referralService.buildValueText('Specialist clinic', v.label)
    }),
    condition: (f: any) =>f.outcome_status.value === "Patient transferred internally",
    options: () => LocationService.getInternalSections(),
    config: { 
      showKeyboard: true,
      footerBtns: [{
        name: 'Add Section',
        slot: 'end',
        color: 'success',
        onClick: async (f: any, c: any, field: any) => {
            if (typeof field.filter != 'string' || field.filter.length < 3) {
                return toastWarning(`Please enter a valid section name`)
            }
            if (field.filtered.some((i: Option) => i.label.toLowerCase() === field.filter.toLowerCase())) {
                return toastWarning(`Section already existing`)
            }
            if ((await alertConfirmation(`Do you want to add internal section?`))) {
                const data = await LocationService.createInternalSection(field.filter.toUpperCase())
                if (data) {
                    field.filter = data.name
                    field.listData = [{label: data.name, value: data.id}, ...field.listData]
                } else {
                    toastDanger(`Unable to add ${field.filter}`)
                }
            }
        }
      }]
    }
  }
}
</script>
