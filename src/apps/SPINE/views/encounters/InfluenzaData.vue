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
import { mapToYesNoOptions, resolveObs } from '@/utils/HisFormHelpers/commons';
import { InfluenzaDataService } from '../../services/influenza_service';
import { isEmpty } from 'lodash';

const fields = ref<Array<Field>>([]);
let influenzaService: InfluenzaDataService;

const { goToNextTask, patientDashboardUrl } = useEncounter((providerId, patientId, patient) => {
  influenzaService = new InfluenzaDataService(patientId, providerId);
  fields.value = [
    getBackgroundInformationField(patient.isChildBearing()),
    getSymptomField(),
    getFluLikeIllnessField(),
    getAdmissionCriteriaField(),
    getRecruitmentField(),
  ]
});

async function onSubmit(_fdata: any, cdata: any) {
  await influenzaService.createEncounter();
  const obs = await resolveObs(cdata);
  await influenzaService.saveObservationList(obs);
  goToNextTask();
}

function getBackgroundInformationField(isChildBearing: boolean): Field {
  return {
    id: 'background_information',
    helpText: "Background Information",
    type: FieldType.TT_MULTIPLE_YES_NO,
    computedValue: (options: Array<Option>) => buildObs('Background information', options),
    options: (_fdata: any, checkedOptions: Array<Option>) => {
      const options = [
        "Influenza vaccine in the last 1 year",
        "Currently (or in the last week) taking antibiotics",
        "Current Smoker",
        "Were you a smoker 3 months ago",
        "RDT or blood smear positive for malaria"
      ];        
      if(isChildBearing) options.push("Pregnant?")
      return mapToYesNoOptions(options, checkedOptions )
    }
  }
}

function getSymptomField(): Field {
  return {
    id: 'symptoms',
    helpText: "Symptoms",
    type: FieldType.TT_MULTIPLE_YES_NO,
    options: (_fdata: any, checkedOptions: Array<Option>) => mapToYesNoOptions(["Fever greater than 38 degrees celsius"], checkedOptions),
    computedValue: (options: Array<Option>) => buildObs('Symptom', options)
  }
}

function getFluLikeIllnessField(): Field {
  return {
    id: 'flulike_illness',
    helpText: "Flu-like Illness",
    type: FieldType.TT_MULTIPLE_YES_NO,
    computedValue: (options: Array<Option>) => buildObs('Flu-like illness', options),
    options: (_fdata: any, checkedOptions: Array<Option>) => mapToYesNoOptions(
      [
        "Cough",
        "Sore throat",
        "Headache",
        "Rhinorrhea",
        "Limb or joint-pain",
        "Vomiting or diarrhoea"
      ],
      checkedOptions
    ),
  }
}

function getAdmissionCriteriaField(): Field {
  return {
    id: 'admission_criteria',
    helpText: "Admission Criteria",
    type: FieldType.TT_MULTIPLE_YES_NO,
    computedValue: (options: Array<Option>) => buildObs('Admission Criteria', options),
    options: (_fdata: any, checkedOptions: Array<Option>) => mapToYesNoOptions(
      [
        "Patient confused (newly disoriented in place, person or time)",
        "Respiratory rate greater than or equal to 30",
        "Oxygen saturation less than or equal to 90 percent",
        "Blood pressure systolic less than 90 MMHG",
        "Heart rate greater than 120 per minute",
        "Inability to Stand"
      ],
      checkedOptions
    )
  }
}

function getRecruitmentField(): Field {
  return {
    id: 'recruitment',
    helpText: "Influenza recruitment",
    type: FieldType.TT_MULTIPLE_YES_NO,
    options: (_fdata: any, checkedOptions: Array<Option>) => mapToYesNoOptions(
      [
        "Influenza like illness",
        "Severe Acute Respiratory Infection"
      ],
      checkedOptions
    ),
    condition: (f: any) => canRecruitPatient(f),
    computedValue: (options: Array<Option>) => buildObs('Influenza', options) 
  }
}

function buildObs(concept: string, options: Array<Option>) {
  if(isEmpty(options)) return null;
  return {
    obs: options.map(async (option) => ({
      ...(await influenzaService.buildValueCoded(concept, option.label)),
      child: [await influenzaService.buildValueCoded(option.label, option.value)]
    }))
  }
}

function canRecruitPatient(formData: Record<string, any>) {
  return Object.values(formData).some(Boolean);
}
</script>
