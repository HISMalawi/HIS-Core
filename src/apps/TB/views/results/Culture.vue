<template>
    <ion-page>
        <his-standard-form :cancelDestinationPath="patientDashboardUrl" :onFinishAction="onFinish" :fields="fields"
            :skipSummary="true" />
    </ion-page>
</template>
  
<script lang="ts" setup>
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import useEncounter from "@/composables/useEncounter";
import { AppEncounterService } from '@/services/app_encounter_service';
import { IonPage } from '@ionic/vue';
import { ref } from 'vue'
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { EncounterType, TPT_ELIGIBLE_AGE } from "@/apps/TB/meta/constants"
import { resolveObs } from "@/utils/HisFormHelpers/commons";
import { getConceptID, getDrugConceptID } from "../../services/util";
import Validation from '@/components/Forms/validations/StandardValidations';
import { Service } from "@/services/service";
import router from "@/router";
import TbService from "../../services/tb_service";
import { infoActionSheet } from "@/utils/ActionSheets";
import { Patientservice } from "@/services/patient_service";
import { useRoute } from 'vue-router';

const fields = ref<Field[]>([]);
const service = new AppEncounterService(-1, EncounterType.LAB_RESULTS);
const patientData = ref<Patientservice>()
const route = useRoute()

const { goToNextTask, patientDashboardUrl, facts } = useEncounter((provider, patientID, patientD) => {
    service.patientID = patientID
    service.providerID = provider
    patientData.value = patientD
    const sampleResultField = () => {
        return {
            id: 'sampleResult',
            helpText: 'Sample Result:',
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
                        value_coded: getConceptID('CULTURE_AND_DST'),
                        obs_datetime: service.date
                    },
                    ...(() => {
                        if (v.value === 'POSITIVE') {
                            return [{
                                concept_id: getConceptID('TB_TYPE'),
                                value_coded: getConceptID('PULMONARY_TB'),
                                obs_datetime: service.date
                            }]
                        }
                        return []
                    })()
                ]
            },
            options: () => [
                { value: 'POSITIVE', label: 'Culture Positive' },
                { value: 'NEGATIVE', label: 'Culture Negative' },
            ]
        }
    } 

    const treatmentTypeField = () => {
        return {
            id: 'treatmentType',
            helpText: 'Select treatment drugs:',
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            condition: (f: any) => f.sampleResult.value === 'POSITIVE',
            options: () => [
                { value: 'FIRST_LINE', label: 'Firstline Drugs' },
                { value: 'SECOND_LINE', label: 'DR TB Drugs' },
            ]
        };
    } 

    const sampleResistanceField = () =>  {
        return {
            id: 'sampleResistance',
            helpText: 'Firstline Drug Resistance:',
            type: FieldType.TT_MULTIPLE_SELECT,
            condition: (f: any) => f.treatmentType.value === 'FIRST_LINE',
            computedValue: (v: Option[]) => {
                const obs = []
                if (v.length === 1) {
                    obs.push({
                        concept_id: getConceptID('Resistance classification'),
                        value_coded: getConceptID('Mono drug resistant'),
                        obs_datetime: service.date
                    })
                } else if (v.length > 1) {
                    obs.push({
                        concept_id: getConceptID('Resistance classification'),
                        value_coded: getConceptID('Multi drug resistant'),
                        obs_datetime: service.date
                    })
                }
                if (v.some((i) => /rif/i.test(i.label))) {
                    obs.push({
                        concept_id: getConceptID('Rifampicin resistance confirmed'),
                        value_coded: getConceptID('YES_ANSWER'),
                        obs_datetime: service.date
                    })
                }
                return [...obs, ...v.filter((opt) => !/no resistance/i.test(`${opt.value}`)).map((opt) => {
                    return {
                        concept_id: getConceptID('TB_DRUG_RESISTANT'),
                        value_coded: getDrugConceptID(`${opt.value}`),
                        obs_datetime: service.date
                    }
                })]
            },
            onValueUpdate: (listData: Option[], val: Option) => {
                return listData.map((i) => {
                    if (val.isChecked) {
                        if (/no resistance/i.test(`${val.label}`)) {
                            if (i.label != val.label) {
                                i.isChecked = false
                                return i
                            }
                        }
                        if (!/no resistance/i.test(`${val.label}`)) {
                            if (/no resistance/i.test(`${i.label}`)) {
                                i.isChecked = false
                            }
                        }
                    }
                    return i
                })
            },
            options: () => [
                {
                    value: 'Rifampicin (300mg)',
                    label: 'Rifampicin Resistant'
                },
                {
                    value: 'Isoniazid (300mg)',
                    label: 'Isoniazid Resistant'
                },
                {   value: 'No Resistance', label: 'No Resistance' },
            ]
        }
    };

    const sampleSecondlineDrugsField = () => {
        const drugs: Option[] = []
        return {
            id: 'sampleSecondlineDrugs',
            helpText: 'DR TB Drug Resistance:',
            type: FieldType.TT_MULTIPLE_SELECT,
            init: async () => {
                try {
                    const cachedConcepts: any = []
                    const res = await Service.getJson(`programs/${service.programID}/tb_regimen_group`, {
                        patient: patientID, regimen_group: 'second-line-concepts'
                    })
                    res.forEach((drug: any) => {
                        if (!cachedConcepts.includes(drug.concept_id) && !/none|other non-coded/i.test(drug.name)) {
                            cachedConcepts.push(drug.concept_id)
                            drugs.push({ label: drug.name, value: drug.concept_id })
                        }
                    })
                } catch (e) {
                    return false
                }
                return true
            },
            condition: (f: any) => f.treatmentType.value === 'SECOND_LINE',
            onValueUpdate: (listData: Option[], val: Option) => {
                return listData.map((i) => {
                    if (val.isChecked) {
                        if (/no resistance/i.test(`${val.label}`)) {
                            if (i.label != val.label) {
                                i.isChecked = false
                                return i
                            }
                        }
                        if (!/no resistance/i.test(`${val.label}`)) {
                            if (/no resistance/i.test(`${i.label}`)) {
                                i.isChecked = false
                            }
                        }
                    }
                    return i
                })
            },
            computedValue: (v: Option[]) => {
                const obs = []
                if (v.length === 1) {
                    obs.push({
                        concept_id: getConceptID('Resistance classification'),
                        value_coded: getConceptID('Mono drug resistant'),
                        obs_datetime: service.date
                    })
                } else if (v.length > 1) {
                    obs.push({
                        concept_id: getConceptID('Resistance classification'),
                        value_coded: getConceptID('Multi drug resistant'),
                        obs_datetime: service.date
                    })
                }
                return [...obs,...v.filter((opt: Option) => !/no resistance/i.test(`${opt.value}`))
                    .map((opt) => ({
                        concept_id: getConceptID('TB_DRUG_RESISTANT'),
                        value_coded: opt.value,
                        obs_datetime: service.date
                    }))]
            },
            options: () => [
                ...drugs,
                { value: 'No Resistance', label: 'No Resistance' }
            ]
        };
    }

    const sampleResultDateField = () => {
        return {
            id: 'sampleResultDate',
            helpText: 'Sample Result Date:',
            type: FieldType.TT_FULL_DATE,
            validation: (v: Option) => Validation.validateSeries([
                () => Validation.required(v),
                () => Validation.dateRangeOf(v, `${route.query.date}`, service.date)
            ]),
            computedValue: (v: Option) => ({
                concept_id: getConceptID('RESULT_DATE'),
                value_datetime: v.value,
                obs_datetime: service.date
            })
        }
    };

    fields.value = [
        sampleResultField(),
        treatmentTypeField(),
        sampleResistanceField(),
        sampleSecondlineDrugsField(),
        sampleResultDateField()
    ]
});

async function onFinish(f: any, cdata: any) {
    await service.createEncounter();
    await service.saveObservationList((await resolveObs(cdata)));
    const decisionFacts: Record<string, boolean> = {
        tbPositive: f.sampleResult?.value === 'POSITIVE',
        onTreatment: TbService.isOnTreatment(facts.outcome),
        tptEligible: !TbService.isOnTreatment(facts.outcome) && 
            patientData.value!.getAge() >=0 && 
            patientData.value!.getAge() < TPT_ELIGIBLE_AGE,
        inhResistance: (f.sampleResistance||[]).some((opt: Option) => opt.label === 'Isoniazid Resistant'),
        rrResistance: (f.sampleResistance||[]).some((opt: Option) => opt.label === 'Rifampicin Resistant'),
    }
    const decisionRules: any = {
        'try a different examination when negative result': {
            title: 'Negative patient',
            message: `Do you want to try a different examination?`,
            yes: () => router.push(`/tb/lab/${service.patientID}`),
            no: () =>  router.push(patientDashboardUrl.value),
            mandatoryCondition: {
                tbPositive: (yes: boolean) => !yes,
                onTreatment: (yes: boolean) => !yes,
                tptEligble: (yes: boolean) => !yes
            }
        },
        'go to other encounters if no drug resistance was found': {
            action: () => goToNextTask(),
            mandatoryCondition: {
                inhResistance: (yes: boolean) => !yes,
                rrResistance: (yes: boolean) => !yes
            }
        },
        'enroll in MDR program if drug resistance is found': {
            title: 'Start drug resistance program',
            message: 'Drug resistance has been detected, do you want to enroll patient is Drug Resistance program?',
            yes: async () => {
                await TbService.enrollMDR(service.patientID)
                goToNextTask() 
            },
            no: () => goToNextTask(),
            eitherConditionMatch: {
                inhResistance: (yes: boolean) => yes,
                rrResistance: (yes: boolean) => yes
            }
        }
    }
    for(const k of Object.keys(decisionRules)) {
        const meta = decisionRules[k]
        let optionalMatched = true
        let requiredMatched = true

        if (meta.mandatoryCondition) {
            requiredMatched = Object.keys(meta.mandatoryCondition)
                .every((attr) => meta.mandatoryCondition[attr](decisionFacts[attr]))
        }
        if (meta.eitherConditionMatch) {
            optionalMatched = Object.keys(meta.eitherConditionMatch||{})
                .some((attr) => meta.eitherConditionMatch[attr](decisionFacts[attr]))
        }
        if (optionalMatched && requiredMatched) {
            if (typeof meta.yes === 'function' && typeof meta.no === 'function') {
                const action = await infoActionSheet(
                    meta.title,
                    '',
                    meta.message,
                    [
                        {
                            name: 'Yes',
                            slot: 'start',
                            color: 'success'
                        },
                        {
                            name: 'No',
                            slot: 'start',
                            color: 'primary'
                        }
                    ]
                )
                return action === 'Yes' ? meta.yes() : meta.no()
            }
            if (typeof meta.action === 'function') return meta.action()
        }
    }
    goToNextTask();
}
</script>
