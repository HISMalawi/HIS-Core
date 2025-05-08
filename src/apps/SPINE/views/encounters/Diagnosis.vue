<template>
  <ion-page>
    <his-standard-form :cancelDestinationPath="patientDashboardUrl" :fields="fields" :onFinishAction="onSubmit" />
  </ion-page>
</template>

<script lang="ts" setup>
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { PatientDiagnosisService } from "@/apps/SPINE/services/patient_diagnosis_service"
import { ClinicalNotesService } from "@/apps/SPINE/services/clinical_notes_service";
import Validation from '@/components/Forms/validations/StandardValidations';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { isEmpty } from 'lodash';
import { OrderService } from '@/services/order_service';
import { alertConfirmation } from '@/utils/Alerts';
import { Service } from "@/services/service";
import { ref } from 'vue';
import useEncounter from '@/composables/useEncounter';
import { mapObjToOptions, resolveObs } from '@/utils/HisFormHelpers/commons';
import { IonPage } from "@ionic/vue";

let notesService: ClinicalNotesService;
let diagnosisService: PatientDiagnosisService;
const malariaTestResult = ref("No");
const fields = ref<Array<Field>>([]);

const { goToNextTask, patientDashboardUrl } = useEncounter((providerId, patientId) => {
  OrderService.getLatestMalariaTestResult(patientId).then(result => malariaTestResult.value = result);
  notesService = new ClinicalNotesService(patientId, providerId)
  diagnosisService = new PatientDiagnosisService(patientId, providerId)
  fields.value = [
    getDiagnosisField("Primary"),
    getDiagnosisField("Secondary"),
    getClinicNotesField(),
  ];
});

async function onSubmit(_: any, computedData: any) {
  await diagnosisService.createEncounter()
  const diagnosisData = await resolveObs({ ...computedData, 'obs_datetime': Service.getSessionDate() }, 'diagnosis')
  await diagnosisService.saveObservationList(diagnosisData)

  const notesData = await resolveObs({ ...computedData }, 'notes')
  if (!isEmpty(notesData)) {
    await notesService.createEncounter()
    await notesService.saveObservationList(notesData)
  }
  goToNextTask()
}

async function checkMalariaResult(data: Array<Option>) {
  const isMalariaSelected = data.some(({ label }) => /Malaria/i.test(label));
  if (isMalariaSelected) {
    if (malariaTestResult.value === "Positive") return true
    return await alertConfirmation(`Patient has ${malariaTestResult.value} malaria test result. Do you want to continue?`)
  }
  return true
}

function getDiagnosisField(type: "Primary" | "Secondary") {
  return {
    id: `${type.toLowerCase()}_diagnosis`,
    helpText: `${type} Diagnosis`,
    type: FieldType.TT_INFINITE_SCROLL_MULTIPLE_SELECT,
    validation: (data: any) => type === "Primary" ? Validation.required(data) : null,
    options: async (_: any, filter = '', page = 1, limit = 10) => {
      const diagnosis = await PatientDiagnosisService.getDiagnosis(filter, page, limit);
      return mapObjToOptions(diagnosis, "name", "concept_id");
    },
    beforeNext: async (data: any) => await checkMalariaResult(data),
    computedValue: (options: Array<Option>) => ({
      tag: 'diagnosis',
      obs: options.map(({ value }) =>
        diagnosisService.buildValueCoded(`${type} Diagnosis`, value as number))
    }),
    config: {
      isFilterDataViaApi: true,
      showKeyboard: true,
    }
  }
}

function getClinicNotesField(): Field {
  return {
    id: 'clinical_notes',
    helpText: 'Clinical notes',
    type: FieldType.TT_TEXT,
    computedValue: (v: Option) => {
      if (isEmpty(v)) return null;
      return {
        tag: 'notes',
        obs: notesService.buildValueText('Clinical notes construct', v.value as string)
      }
    }
  }
}
</script>

