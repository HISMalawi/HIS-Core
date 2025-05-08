<template>
  <his-standard-form :cancelDestinationPath="patientDashboardUrl" :fields="fields" :onFinishAction="onSubmit" />
</template>

<script lang="ts" setup>
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { PatientVisitRegistrationService } from "@/apps/SPINE/services/patient_registration_service"
import Validation from '@/components/Forms/validations/StandardValidations';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { getFacilities } from '@/utils/HisFormHelpers/LocationFieldOptions';
import { toastWarning } from '@/utils/Alerts';
import { Patientservice } from '@/services/patient_service';
import { MALAWI_NATIONAL_ID_TYPE } from '@/constants';
import { CHARACTERS_AND_NUMBERS_LO } from '@/components/Keyboard/KbLayouts';
import { ref } from 'vue';
import useEncounter from '@/composables/useEncounter';
import { resolveObs, yesNoUnknownOptions } from '@/utils/HisFormHelpers/commons';
import ApiStore from "@/composables/ApiStore";
import { toDate } from "@/utils/Strs";

let registrationService: PatientVisitRegistrationService;
let patient: Patientservice;
const fields = ref([] as Array<Field>);

const { goToNextTask, patientDashboardUrl } = useEncounter((providerId, patientId, p) => {
  patient = p
  registrationService = new PatientVisitRegistrationService(patientId, providerId);
  fields.value = [
    getVisitTypeField(),
    getReferringFacilityField(),
    getNationalIdAvalailableField(),
    getNationalIdField(),
    getPregnantStatusField(),
  ]
});

async function onSubmit(formData: any, computedData: any) {
  await asignNID(formData)
  const encounter = await registrationService.createEncounter()
  if (!encounter) return toastWarning('Unable to create registration encounter')

  const registrationData = await resolveObs({ ...computedData })
  const registrationObs = await registrationService.saveObservationList(registrationData)
  if (!registrationObs) return toastWarning('Unable to save observations')

  goToNextTask()
}

async function asignNID(formData: Record<string, any>) {
  const nidAvailable = formData['national_id_available']
  const nid = formData['national_id']
  if (nidAvailable && nidAvailable.value === 'Yes') {
    await patient.updateMWNationalId(nid.value);
    ApiStore.invalidate("ACTIVE_PATIENT");
  }
}

async function mwIdExists(nid: string) {
  if (!nid) return false
  const people = await Patientservice.findByOtherID(MALAWI_NATIONAL_ID_TYPE, nid)
  return people.length > 0
}

function getVisitTypeField(): Field {
  return {
    id: 'visit_type',
    helpText: 'Type of visit',
    type: FieldType.TT_SELECT,
    validation: (value: any) => Validation.required(value),
    computedValue: (v: Option) => ({ obs: registrationService.buildValueCoded('Type of visit', v.value) }),
    options: () => ([
      { label: 'New', value: 'New patient' },
      { label: 'Referral', value: 'Referral' },
      { label: 'Re-visiting', value: 'Re-visiting' },
    ])
  }
}

function getReferringFacilityField() {
  return {
    id: 'referring_facility_name',
    helpText: 'Referred from',
    type: FieldType.TT_SELECT,
    validation: (value: any) => Validation.required(value),
    computedValue: ({ label }: Option) => ({ obs: registrationService.buildValueText('Referred from', label) }),
    condition: (fields: any) => fields.visit_type.value === 'Referral',
    options: (_: any, filter = '') => getFacilities(filter),
    config: {
      showKeyboard: true,
      isFilterDataViaApi: true
    }
  }
}

function getNationalIdAvalailableField() {
  return {
    id: 'national_id_available',
    helpText: 'National ID Available',
    type: FieldType.TT_SELECT,
    validation: (value: any) => Validation.required(value),
    condition: () => toDate(patient?.patient?.date_created) != toDate(registrationService.date) &&
      patient.getMWNationalID() === 'Unknown',
    options: () => yesNoUnknownOptions(),
    appearInSummary: () => false
  }
}

function getNationalIdField() {
  return {
    id: 'national_id',
    helpText: 'Enter National ID',
    type: FieldType.TT_TEXT,
    validation: (value: Option) => Validation.isMWNationalID(value),
    condition: (fields: any) => fields.national_id_available.value === 'Yes',
    beforeNext: async (field: Option) => {
      if (field.value && (await mwIdExists(field.value.toString()))) {
        toastWarning('National ID already exists')
        return false
      }
      return true
    },
    summaryMapValue: ({ value }: Option) => ({
      value,
      label: 'National ID'
    }),
    config: {
      casing: 'uppercase',
      customKeyboard: [CHARACTERS_AND_NUMBERS_LO, [['Delete']]],
    }
  }
}

function getPregnantStatusField() {
  return {
    id: 'patient_pregnant',
    helpText: 'Patient pregnant',
    type: FieldType.TT_SELECT,
    validation: (value: any) => Validation.required(value),
    computedValue: ({ value }: Option) => ({ obs: registrationService.buildValueCoded('PATIENT PREGNANT', value) }),
    condition: () => patient.isChildBearing(),
    options: () => yesNoUnknownOptions(),
  }
}
</script>

