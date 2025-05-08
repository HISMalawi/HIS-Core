<template>
    <ion-page>
        <his-standard-form :cancelDestinationPath="patientDashboardUrl" :onFinishAction="onFinish" :fields="fields"
            :skipSummary="true" />
    </ion-page>
</template>
  
<script lang="ts" setup>
import { AppEncounterService } from '@/services/app_encounter_service';
import { IonPage } from '@ionic/vue';
import { ref } from 'vue'
import { Field, Option } from '@/components/Forms/FieldInterface';
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import useEncounter from "@/composables/useEncounter";
import { FieldType } from '@/components/Forms/BaseFormElements';
import { EncounterType } from "@/apps/TB/meta/constants"
import { resolveObs } from '@/utils/HisFormHelpers/commons';
import Validation from '@/components/Forms/validations/StandardValidations';
import { getConceptID } from '../../services/util';
import { useRoute } from 'vue-router';

const fields = ref<Field[]>([]);
const service = new AppEncounterService(-1, EncounterType.LAB_RESULTS);
const route = useRoute()

const { goToNextTask, patientDashboardUrl } = useEncounter((provider, patientID) => {
    service.patientID = patientID
    service.providerID = provider

    const sampleResultField = () => {
        return {
            id: 'sampleResult',
            helpText: 'LAM Result:',
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            computedValue: (v: Option) => {
                return [
                    {
                        concept_id: getConceptID('TB_STATUS'),
                        value_coded: getConceptID(`${v.value}`),
                        obs_datetime: service.date
                    },
                    {
                        concept_id: getConceptID('BACTERIOLOGICALLY_DIAGNOSED'),
                        value_coded: getConceptID('YES_ANSWER'),
                        obs_datetime: service.date
                    },
                    {
                        concept_id: getConceptID('PROCEDURE_TYPE'),
                        value_coded: getConceptID('LAM'),
                        obs_datetime: service.date
                    },
                    ...(() => {
                        if (v.value === 'POSITIVE') {
                            return [
                                {
                                    concept_id: getConceptID('TB_TYPE'),
                                    value_coded: getConceptID('EXTRA_PULMONARY_TB'),
                                    obs_datetime: service.date
                                },
                                {
                                    concept_id: getConceptID('TUBERCULOSIS_CLASS'),
                                    value_coded: getConceptID('LAM'),
                                    obs_datetime: service.date
                                }
                            ]
                        }
                        return []
                    })()
                ]
            },
            options: () => [
                { value: 'POSITIVE', label: 'Positive' },
                { value: 'NEGATIVE', label: 'Negative' }
            ]
        }
    };

    const resultDateField = () => {
        return {
            id: 'resultDate',
            field_type: 'date',
            helpText: 'Sample Result Date:',
            type: FieldType.TT_FULL_DATE,
            computedValue: (v: Option) => ({
                concept_id: getConceptID('RESULT_DATE'),
                value_datetime: v.value,
                obs_datetime: service.date
            }),
            validation: (v: Option) => Validation.validateSeries([
                () => Validation.required(v),
                () => Validation.dateRangeOf(v, `${route.query.date}`, service.date)
            ])
        }
    }

    fields.value = [
        sampleResultField(),
        resultDateField()
    ]
});

async function onFinish(f: any, cdata: any) {
    await service.createEncounter();
    await service.saveObservationList((await resolveObs(cdata)));
    goToNextTask();
}
</script>
