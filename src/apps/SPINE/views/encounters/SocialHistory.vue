<template>
  <his-standard-form :cancelDestinationPath="patientDashboardUrl" :fields="fields" :onFinishAction="onSubmit" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from '@/components/Forms/validations/StandardValidations';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { toastWarning } from '@/utils/Alerts';
import { SocialHistoryService } from '@/apps/SPINE/services/social_history_services';
import { mapToYesNoOptions, resolveObs, mapStrToOptions } from '@/utils/HisFormHelpers/commons';
import useEncounter from '@/composables/useEncounter';

let socialService: SocialHistoryService;
const fields = ref<Array<Field>>([]);

const { goToNextTask, patientDashboardUrl } = useEncounter((providerId, patient) => {
  socialService = new SocialHistoryService(patient, providerId);
  fields.value = [
    getSocialActivitiesField(),
    getMaritalStatusField(),
    getReligionField()
  ]
});

async function onSubmit(_: any, computedData: any) {
  const encounter = await socialService.createEncounter()
  if (!encounter) return toastWarning('Unable to create social history encounter')

  const registrationData = await resolveObs({ ...computedData })
  const registrationObs = await socialService.saveObservationList(registrationData)
  if (!registrationObs) return toastWarning('Unable to save observations')

  goToNextTask()
}

function getSocialActivitiesField(): Field {
  return {
    id: "social_acitivites",
    helpText: `Social Activities`,
    type: FieldType.TT_MULTIPLE_YES_NO,
    validation: (data: any) => Validation.validateSeries([
      () => Validation.required(data),
      () => Validation.anyEmpty(data)
    ]),
    computedValue: (options: Option[]) => ({
      obs: options.map(option => socialService.buildValueCoded(
        option.label,
        option.value
      ))
    }),
    summaryMapValue: (option: Option) => ({
      label: option.label,
      value: option.value
    }),
    options: (_: any, checked: Array<Option>) => mapToYesNoOptions([
      "Patient smokes",
      "Patient drinks alcohol"
    ], checked),
  }
}

function getMaritalStatusField(): Field {
  return {
    id: 'marital_status',
    helpText: 'Marital Status',
    type: FieldType.TT_SELECT,
    validation: (value: any) => Validation.required(value),
    computedValue: (v: Option) => ({
      obs: socialService.buildValueText('Marital status', v.label)
    }),
    options: () => mapStrToOptions([
      "Single",
      "Engaged",
      "Married",
      "Separated",
      "Widowed",
      "Other",
    ]),
  }
}

function getReligionField(): Field {
  return {
    id: 'religion',
    helpText: 'Religion',
    type: FieldType.TT_SELECT,
    validation: (value: any) => Validation.required(value),
    computedValue: (v: Option) => ({
      obs: socialService.buildValueText('Religion', v.label)
    }),
    options: () => mapStrToOptions([
      'Catholic',
      'CCAP',
      'SDA',
      'Angelican',
      'Muslim',
      'Pentecostalism',
      'Jehovah witness',
      'Other',
    ])
  }
}
</script>

