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
import { IonPage } from '@ionic/vue';
import { ref } from 'vue'
import { Field } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import useEncounter from "@/composables/useEncounter";
import { toDate } from '@/utils/Strs';

const fields = ref<Field[]>([]);

const { goToNextTask, patientDashboardUrl } = useEncounter((p, id, patient) => {
    function weightTrailField() {
        let weightTrail: any = []
        let bmi = ''
        return {
            id: 'diagnosisType',
            helpText: 'Patient weight trends:',
            type: FieldType.TT_WEIGHT_CHART,
            init: async () => {
                weightTrail = await patient.getWeightHistory()
                bmi = await patient.getBMI();
                return true
            },
            options: async () => {
                return [
                    {
                        label: "Weight for patient",
                        value: "Weight trail",
                        other: {
                            bmi,
                            values: weightTrail.map((d: any) => ({
                                x: toDate(d.date),
                                y: d.weight,
                            })),
                            age: patient.getAge(),
                        },
                    }
                ];
            }
        }
    }

    fields.value = [
        weightTrailField()
    ]
});

function onFinish() {
    goToNextTask();
}
</script>
