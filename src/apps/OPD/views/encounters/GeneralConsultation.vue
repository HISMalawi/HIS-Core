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
import Validation from '@/components/Forms/validations/StandardValidations';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { IonPage } from '@ionic/vue';
import { infoActionSheet } from '@/utils/ActionSheets';
import { ConceptService } from '@/services/concept_service';
import { AppEncounterService } from '@/services/app_encounter_service';
import { toastWarning } from '@/utils/Alerts';
import { ConceptName } from '@/interfaces/conceptName';
import useEncounter from '@/composables/useEncounter';
import { mapStrToOptions, mapToYesNoOptions, resolveObs, yesNoOptions } from '@/utils/HisFormHelpers/commons';
import { Patientservice } from '@/services/patient_service';

const weightLossPercentageNum = ref(0);
const lostTenPercentBodyWeight = ref(false);
let consultation: AppEncounterService;
const fields = ref<Array<Field>>([]);

const { patientDashboardUrl, goToNextTask } = useEncounter((provider, patientId, patient) => {
  consultation = new AppEncounterService(patientId, 168, provider);
  fields.value = getFields(patient);
});
 
async function onSubmit(_: any, computedData: any){     
  try {
    const obs = await resolveObs(computedData, 'consultation');
    await consultation.createEncounter()
    await consultation.saveObservationList(obs)
    goToNextTask()
  } catch (error) {
    console.error(error)
    toastWarning('An error occurred while saving the complaints');
  }        
}

    
async function checkIfWeightLossIsControlled(val: any) {
  if (lostTenPercentBodyWeight.value
    && `${val.label}`.match(/malnutrition/i)
    && `${val.value}`.match(/no/i)) {
    const action = await infoActionSheet(
      'Recommendation',
      `Patient's weight has dropped by ${weightLossPercentageNum.value}% , is this controlled weight loss??`,
      'Please verify',
      [
        { name: 'Confirm weight loss', slot: 'start', color: 'success'},
        { name: 'Confirm controlled', slot: 'end', color: 'primary'}
      ]
    )
    val.value = action === 'Confirm weight loss' ? 'Yes' : 'No'
  }
}

function getTBSymptoms(preValues: Array<Option>) {
  const contraIndications = ConceptService.getConceptsByCategory("tb_symptom", true )
    .map(({ name }: ConceptName) => name)
    
  return mapToYesNoOptions([...contraIndications], preValues);
}
    
function getFields(patient: Patientservice): Array<Field>{
  return [
    {
      id: "on_tb_treatment",
      helpText: "On TB Treatment?",
      type: FieldType.TT_SELECT,
      validation: (data: any) => Validation.required(data),
      computedValue: (data: any) => {
        const obsData = {
          tag: "consultation",
          obs: [ consultation.buildValueCoded("TB treatment", data.value) ]
        }
        if (/yes/i.test(data.value)) {
          obsData.obs.push(consultation.buildValueCoded("TB Status", "Confirmed TB on treatment"))
        }
        return obsData
      },
      options: yesNoOptions
    },
    {
      id: "tb_side_effects",
      helpText: "TB Associated symptoms",
      type: FieldType.TT_MULTIPLE_YES_NO,
      init: async () => {
        const weightTrail = await patient.getWeightHistory()
        weightLossPercentageNum.value = patient.getWeightLossPercentageFromTrail(weightTrail) as number
        lostTenPercentBodyWeight.value = Number(weightLossPercentageNum.value) >= 10
        return true
      },
      onValue: async (val: any) => {
        await checkIfWeightLossIsControlled(val)
        return true
      },
      validation: (data: any) =>Validation.validateSeries([
          () => Validation.required(data),
          () => Validation.anyEmpty(data)
      ]), 
      condition: (formData: any) => formData.on_tb_treatment.value.match(/no/i),
      options: (_: any, checked: Array<Option>) => getTBSymptoms(checked),
      computedValue: (vals: Option[]) => ({
        tag: "consultation",
        obs: vals.map(async (data: Option) => ({
          ...(await consultation.buildValueCoded("Routine TB Screening", data.label)),
          child: [await consultation.buildValueCoded(data.label, data.value)]
        }))
      })
    },
    {
      id: "tb_status",
      helpText: "TB Status",
      type: FieldType.TT_SELECT,
      validation: (data: any) => Validation.required(data),
      condition: (f: any) => f.tb_side_effects.value.some((v: Option) => /yes/i.test(v.value as string)),
      options: () => mapStrToOptions([
        "TB NOT suspected",
        "TB Suspected",
        "Confirmed TB Not on treatment",
      ]),
      computedValue: (data: Option) => ({
        tag: "consultation",
        obs: consultation.buildValueCoded("TB Status", data.value)
      })
    },
  ]
}
</script>
