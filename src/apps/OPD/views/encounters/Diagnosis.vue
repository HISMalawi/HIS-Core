<template>
  <his-standard-form :key="hisFormKey" :cancelDestinationPath="patientDashboardUrl" :fields="fields" :onFinishAction="onSubmit"/>
</template>

<script lang="ts" setup>
import { ref} from 'vue'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { PatientDiagnosisService } from "@/apps/OPD/services/patient_diagnosis_service"
import { ClinicalNotesService } from "@/apps/OPD/services/clinical_notes_service";
import Validation from '@/components/Forms/validations/StandardValidations';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { isEmpty } from 'lodash';
import { ConceptName } from '@/interfaces/conceptName';
import { alertConfirmation } from '@/utils/Alerts';
import { Service } from "@/services/service";
import useEncounter from '@/composables/useEncounter';
import useLabResultsManager from '@/composables/useLabResultsManager';
import { resolveObs } from '@/utils/HisFormHelpers/commons';

let notesService: ClinicalNotesService;
let diagnosisService: PatientDiagnosisService;
const malariaTestResult = ref('No');
const fields = ref([] as Array<Field>);
  const hisFormKey = ref(Math.random());

const { patientDashboardUrl, goToNextTask } = useEncounter(async (provider, patient) => {
  notesService = new ClinicalNotesService(patient, provider);
  diagnosisService = new PatientDiagnosisService(patient, provider);
  const { getLabFields } = useLabResultsManager(patient, provider, hisFormKey);

  fields.value = [
    ...getLabFields(true),
    ...getFields()
  ];
});

async function onSubmit(_: any, computedData: any){
  await diagnosisService.createEncounter()
  
  const diagnosisData = await resolveObs({...computedData,'obs_datetime':Service.getSessionDate()}, 'diagnosis')      
  await diagnosisService.saveObservationList(diagnosisData)

  const notesData = await resolveObs({...computedData}, 'notes')
  if(!isEmpty(notesData)) {
    await notesService.createEncounter()
    await notesService.saveObservationList(notesData)
  }

  goToNextTask()        
}

function mapListToOptions(list: ConceptName[]){
  if(isEmpty(list)) return []
  return list.map(item => ({
    label: item.name, value: item.name, other: item.concept_id, isChecked: false
  })).sort((a, b) => a.label < b.label ? -1 : a.label > b.label ? 1 : 0)
}

async function checkMalariaResult(data: Array<any>){
  const malaria = data.find(o => o.label === 'Malaria')      
  if(malaria) {
    if(malariaTestResult.value === "Positive") return true
    return await alertConfirmation(`Patient has ${malariaTestResult.value} malaria test result. Do you want to continue?`)
  }
  return true
}
  
function getFields(): Array<Field>{
  return [
    {
      id: 'primary_diagnosis',
      helpText: 'Select primary diagnosis',
      type: FieldType.TT_INFINITE_SCROLL_MULTIPLE_SELECT,
      validation: (data: any) => Validation.required(data),
      options: async (_, filter='', page=1, limit=10) => mapListToOptions(
        await PatientDiagnosisService.getDiagnosis(filter, page, limit)
      ),
      beforeNext: async (data: any) => await checkMalariaResult(data),
      computedValue: (options: Array<Option>) => ({
        tag: 'diagnosis',
        obs: options.map(({other}) => 
          diagnosisService.buildValueCodedFromConceptId('Primary diagnosis', other))
      }),
      summaryMapValue: ({ value }: Option) => ({
        value,
        label: "Primary diagnosis"
      }),
      config: {
        isFilterDataViaApi: true,
        showKeyboard: true,
      }
    },
    {
      id: 'secondary_diagnosis',
      helpText: 'Select secondary diagnosis',
      type: FieldType.TT_INFINITE_SCROLL_MULTIPLE_SELECT,
      options: async (_, filter='', page=1, limit=10) => mapListToOptions(
        await PatientDiagnosisService.getDiagnosis(filter, page, limit)
      ),
      beforeNext: async (data: any) => await checkMalariaResult(data),
      computedValue: (options: Array<Option>) => !isEmpty(options) && ({
        tag: 'diagnosis',
        obs: options.map(({other}) => 
          diagnosisService.buildValueCodedFromConceptId('Secondary diagnosis', other))
      }),
      summaryMapValue: ({ value }: Option) => ({
        value,
        label: "Secondary diagnosis"
      }),
      config: {
        showKeyboard: true,
        isFilterDataViaApi: true,
      }
    },
    {
      id: 'clinical_notes',
      helpText: 'Clinical notes',
      type: FieldType.TT_TEXT,
      computedValue: (v: Option) => v && ({
        tag: 'notes',
        obs: notesService.buildValueText('Clinical notes construct', v.value)
      })
    },
  ]
}
</script>

