<template>
  <ion-page>
    <his-standard-form 
      :cancelDestinationPath="patientDashboardUrl" 
      :fields="fields" 
      :onFinishAction="onSubmit" 
      :skipSummary="true" 
    />
  </ion-page>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { IonPage } from '@ionic/vue';
import useEncounter from "@/composables/useEncounter";
import { mapStrToOptions, mapToYesNoOptions, resolveObs } from '@/utils/HisFormHelpers/commons';
import { ChronicConditionsService } from '../../services/chronic_conditions_service';
import isEmpty from 'lodash/isEmpty';

const fields = ref<Array<Field>>([]);
let conditionsService: ChronicConditionsService;

const { goToNextTask, patientDashboardUrl } = useEncounter((provider, patient) => {
  conditionsService = new ChronicConditionsService(patient, provider);
  fields.value = [
    getConditionsField(),
    getAdditionalConditionsField(),
    getBMIField(),
    getOtherConditionsField(),
  ]
});

async function onSubmit(_fdata: any, cdata: any) {
  await conditionsService.createEncounter();
  const obs = await resolveObs(cdata);
  await conditionsService.saveObservationList(obs);
  goToNextTask();
}

function getConditionsField(): Field {
  return {
    id: 'conditions',
    helpText: "Condition",
    type: FieldType.TT_MULTIPLE_YES_NO,
    computedValue: (options: Array<Option>) => buildConditionObs(options),
    options: (_fdata: any, checkedOptions: Array<Option>) => mapToYesNoOptions(
      [
        "Cancer",
        "Diabetes",
        "HIV",
        "Chronic Heart condition",
        "Chronic liver disease",
      ],
      checkedOptions,
      true
    )
  }
}

function getAdditionalConditionsField(): Field {
  return {
    id: 'additional_conditions',
    helpText: "Condition continued...",
    type: FieldType.TT_MULTIPLE_YES_NO,
    options: (_fdata: any, checkedOptions: Array<Option>) => mapToYesNoOptions(
      [
        "TB",
        "Asthma",
        "Epilepsy",
        "Kidney Disease",
      ], 
      checkedOptions,
      true
    ),
    computedValue: (options: Array<Option>) => buildConditionObs(options)
  }
}

function getBMIField(): Field {
  return {
    id: 'bmi',
    helpText: "Select BMI range",
    type: FieldType.TT_SELECT,
    computedValue: (o: Option) => ({ obs: conditionsService.buildValueText("BMI", o.label) }),
    options: () => mapStrToOptions([
        "< 18.5",
        "18.5 - 24.9",
        "25 - 29.9",
        ">= 30"
      ]),
  }
}

function getOtherConditionsField(): Field {
  return {
    id: 'other',
    helpText: "Other (Specify)",
    type: FieldType.TT_TEXT,
    computedValue: (v: Option) => {
      if(isEmpty(v)) return null;
      return { obs: conditionsService.buildValueText("Other (specify)", v.label) }
    },
  }
}

function buildConditionObs(options: Array<Option>) {
  if(isEmpty(options)) return null;
  return {
    obs: options.map(async (option) => ({
      ...(await conditionsService.buildValueCoded("Condition", option.label)),
      child: [await conditionsService.buildValueCoded(option.label, option.value)]
    }))
  }
}
</script>
