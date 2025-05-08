<template>
    <ion-page>
      <his-standard-form 
        :cancelDestinationPath="patientDashboardUrl" 
        :onFinishAction="onFinish"
        :fields="fields"
        :skipSummary="true"
      />
    </ion-page>
  </template>
  
<script lang="ts" setup>
import { AppEncounterService } from '@/services/app_encounter_service';
import { EncounterType } from "@/apps/TB/meta/constants"
import { IonPage } from '@ionic/vue';
import { ref } from 'vue'
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import useEncounter from "@/composables/useEncounter";
import { getConceptID } from "../../services/util"
import { resolveObs } from '@/utils/HisFormHelpers/commons';

const fields = ref<Field[]>([]);
const service = new AppEncounterService(-1, EncounterType.UPDATE_PREGNANCY_STATUS );
 
const { goToNextTask, patientDashboardUrl } = useEncounter((provider, patientID) => {
    service.patientID = patientID
    service.providerID = provider
    fields.value = [
        {
            id: 'personIsPregnant',
            helpText: 'Is Person pregnant?:',
            type: FieldType.TT_SELECT,
            computedValue: (v: Option) => ({
                concept_id: getConceptID('PATIENT_IS_PREGNANT'),
                value_coded: getConceptID(`${v.value}`),
                obs_datetime: service.date   
            }),
            options: () => [
                { value: 'YES_ANSWER', label: 'Yes' },
                { value: 'NO_ANSWER', label: 'No' }
            ]
        }
    ]
});

async function onFinish(f: any, cdata: any) {
    await service.createEncounter();
    await service.saveObservationList((await resolveObs(cdata)));
    goToNextTask();
}
</script>
  