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

    const samplePhysicalAppearanceField = (sampleType: 'One'|'Two') => {
        return {
            id: `sample${sampleType}PhysicalAppearance`,
            helpText: `Sample ${sampleType} Physical Appearance:`,
            type: FieldType.TT_SELECT,
            computedValue: (v: Option) => ({
                concept_id: getConceptID(`SAMPLE_${sampleType.toUpperCase()}_MICROSCOPY_PHYSICAL_APPEARANCE`),
                value_coded: getConceptID(`${v.value}`),
                obs_datetime: service.date
            }),
            validation: (v: Option) => Validation.required(v),
            options: () => [
                { value: 'MUCO_PURULENT', label: 'Muco-purulent' },
                { value: 'BLOOD_STAINED', label: 'Blood-stained' },
                { value: 'SALIVA', label: 'Saliva' },
                { value: 'OTHER', label: 'Other' },
            ]
        }
    };

    const sampleProcedureField = (sampleType: 'One'|'Two') => {
        return {
            id: `sample${sampleType}Procedure`,
            helpText: `Sample ${sampleType} Procedure:`,
            type: FieldType.TT_SELECT,
            computedValue: (v: Option) => ({
                concept_id: getConceptID(`SAMPLE_${sampleType.toUpperCase()}_MICROSCOPY_PROCEDURE`),
                value_coded: getConceptID(`${v.value}`),
                obs_datetime: service.date
            }),
            validation: (v: Option) => Validation.required(v),
            options: () => [
                { value: 'ZIEHL_NEELSEN', label: 'Ziehl-Neelsen' },
                { value: 'FLUORESCENCE', label: 'Fluorescence' },
            ],
        }
    };

    const sampleResultField = (sampleType: 'One'|'Two') => {
        return {
            id: `sample${sampleType}Result`,
            helpText: `Sample ${sampleType} Result:`,
            type: FieldType.TT_SELECT,
            computedValue: (v: Option) => ({
                concept_id: getConceptID(`SAMPLE_${sampleType.toUpperCase()}_MICROSCOPY_RESULT`),
                value_coded: getConceptID(`${v.value}`),
                obs_datetime: service.date
            }),
            validation: (v: Option) => Validation.required(v),
            options: () => [
                { value: 'AFB_POSITIVE', label: 'AFB Positive' },
                { value: 'AFB_NEGATIVE', label: 'AFB Negative' },
            ]
        }
    };
    
    const sampleGradingField = (sampleType: 'One'|'Two') => {
        return {
            id: `sample${sampleType}Grading`,
            helpText: `Sample ${sampleType} Grading:`,
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            condition: (f: any) => f[`sample${sampleType}Result`].value === 'AFB_POSITIVE',
            computedValue: (v: Option) => ({
                concept_id: getConceptID(`SAMPLE_${sampleType.toUpperCase()}_MICROSCOPY_GRADING`),
                value_text: v.value,
                obs_datetime: service.date
            }),
            options: () => [
                { value: '1+', label: '1+' },
                { value: '2+', label: '2+' },
                { value: '3+', label: '3+' },
                { value: 'OTHER', label: 'Other' },
            ]
        }
    };
    
    const sampleOtherGradingField = (sampleType: 'One'|'Two') => {
        return {
            id: `sample${sampleType}OtherGrading`,
            helpText: `Sample ${sampleType} Other Grading:`,
            type: FieldType.TT_TEXT,
            computedValue: (v: Option) => ({
                concept_id: getConceptID(`SAMPLE_${sampleType.toUpperCase()}_MICROSCOPY_GRADING`),
                value_text: v.value,
                obs_datetime: service.date
            }),
            validation: (v: Option) => Validation.required(v),
            condition: (f: any) => f[`sample${sampleType}Grading`].value === 'OTHER'
        }
    };

    const sampleBaciliSeenField = (sampleType: 'One'|'Two') => {
        return {
            id: `sample${sampleType}BaciliSeen`,
            type: FieldType.TT_NUMBER,
            helpText: `Sample ${sampleType} no. Of Bacilli Seen:`,
            computedValue: (v: Option) => ({
                concept_id: getConceptID(`SAMPLE_${sampleType.toUpperCase()}_NUMBER_OF_BACILI_SEEN`),
                value_numeric: v.value,
                obs_datetime: service.date
            }),
            validation: (v: Option) => Validation.required(v),
            condition: (f: any) => f[`sample${sampleType}Grading`].value === 'OTHER',
        }
    };

    const sampleResultDateField = (sampleType: 'One'|'Two') => {
        return {
            id: `sample${sampleType}ResultDate`,
            helpText: `Sample ${sampleType} Result Date:`,
            type: FieldType.TT_FULL_DATE,
            computedValue: (v: Option) => ({
                concept_id: getConceptID(`SAMPLE_${sampleType.toUpperCase()}_MICROSCOPY_RESULT_DATE`),
                value_datetime: v.value,
                obs_datetime: service.date
            }),
            validation: (v: Option) => Validation.validateSeries([
                () => Validation.required(v),
                () => Validation.dateRangeOf(v, `${route.query.date}`, service.date)
            ])
        }
    };

    fields.value = [
        samplePhysicalAppearanceField('One'),
        sampleProcedureField('One'),
        sampleResultField('One'),
        sampleGradingField('One'),
        sampleOtherGradingField('One'),
        sampleBaciliSeenField('One'),
        sampleResultDateField('One'),
        samplePhysicalAppearanceField('Two'),
        sampleProcedureField('Two'),
        sampleResultField('Two'),
        sampleGradingField('Two'),
        sampleOtherGradingField('Two'),
        sampleBaciliSeenField('Two'),
        sampleResultDateField('Two')
    ]
});

function generateExtraObs(f: any) {
    const observations: any = []
    if (f.sampleOneResult.value === 'AFB_POSITIVE' || f.sampleTwoResult.value === 'AFB_POSITIVE') {
        observations.push({
            concept_id: getConceptID('TB_TYPE'),
            value_coded: getConceptID('PULMONARY_TB'),
            obs_datetime: service.date
        })
        observations.push({
            concept_id: getConceptID('TB_STATUS'),
            value_coded: getConceptID('POSITIVE'),
            obs_datetime: service.date
        })
        observations.push({
            concept_id: getConceptID('TUBERCULOSIS_CLASS'),
            value_coded: getConceptID('All Other'),
            obs_datetime: service.date
        })
    } else {
        observations.push({
            concept_id: getConceptID('TB_STATUS'),
            value_coded: getConceptID('NEGATIVE'),
            obs_datetime: service.date
        })
    }
    observations.push({
      concept_id: getConceptID('BACTERIOLOGICALLY_DIAGNOSED'),
      value_coded: getConceptID('YES_ANSWER'),
      obs_datetime: service.date
    })
    observations.push({
      concept_id: getConceptID('PROCEDURE_TYPE'),
      value_coded: getConceptID('MICROSCOPY'),
      obs_datetime: service.date
    })
    return observations
}

async function onFinish(f: any, cdata: any) {
    await service.createEncounter();
    await service.saveObservationList([
        ...generateExtraObs(f),
        ...(await resolveObs(cdata))
    ]);
    goToNextTask();
}
</script>
