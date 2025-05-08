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
import { getConceptID, getConceptNameById, getDrugConceptID } from '../../services/util';
import Validation from '@/components/Forms/validations/StandardValidations';
import { Patientservice } from '@/services/patient_service';
import { LabService } from '../../services/lab_service';
import { ProgramService } from '@/services/program_service';
import router from '@/router';
import TbService from '../../services/tb_service';
import { infoActionSheet } from '@/utils/ActionSheets';
import { useRoute } from 'vue-router';

const fields = ref<Field[]>([]);
const service = new AppEncounterService(-1, EncounterType.LAB_RESULTS);
const patientData = ref<Patientservice>()
const route = useRoute()

const { goToNextTask, facts, patientDashboardUrl } = useEncounter((provider, patientID, patient) => {
    service.patientID = patientID
    service.providerID = provider
    patientData.value = patient

    const xpertSampleOneResultField = () => {
        return {
            id: `xpertSampleOneResult`,
            helpText: `Sample One Result:`,
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            computedValue: (v: Option) => ({
                concept_id: getConceptID(`SAMPLE_ONE_GENEXPERT_RESULT`),
                value_coded: getConceptID(`${v.value}`),
                obs_datetime: service.date
            }),
            options: () => [
                { value: 'MTB_NOT_DETECTED', label: 'MTB not detected' },
                { value: 'MTB_DETECTED', label: 'MTB detected' },
                { value: 'MTB_NO_RESULT', label: 'No result' },
                { value: 'MTB_ERROR', label: 'Error' },
                { value: 'MTB_INVALID', label: 'Invalid' },
            ],
        }
    };

    const sampleOneRifResistancePatternField = () => {
        return {
            id: `sampleOneRifResistancePattern`,
            helpText: `Sample One RIF Resistance:`,
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            condition: (f: any) => f.xpertSampleOneResult.value === 'MTB_DETECTED',
            computedValue: (v: Option) => ({
                concept_id: getConceptID(`SAMPLE_ONE_RIF_RESISTANCE_PATTERN`),
                value_coded: getConceptID(`${v.value}`),
                obs_datetime: service.date
            }),
            options: () =>  [
                { value: 'RIF_RESISTANT_NOT_DETECTED', label: 'RIF resistant not detected' },
                { value: 'RIF_RESISTANT_DETECTED', label: 'RIF resistant detected' },
                { value: 'RIF_RESISTANT_INDETERMINATE', label: 'RIF resistant indeterminate' },
            ],
        } as Field
    };

    const sampleOneResultDateField = () => {
        return {
            id: `sampleOneResultDate`,
            helpText: `Sample One Result Date:`,
            type: FieldType.TT_FULL_DATE,
            validation: (v: Option) => Validation.validateSeries([
                () => Validation.required(v),
                () => Validation.dateRangeOf(v, `${route.query.date}`, service.date)
            ]),
            computedValue: (v: Option) => ({
                concept_id: getConceptID(`SAMPLE_ONE_GENEXPERT_RESULT_DATE`),
                value_datetime: v.value,
                obs_datetime: service.date
            })
        }
    }

    const xpertSampleTwoResultField = () => {
        return {
            id: `xpertSampleTwoResult`,
            helpText: `Sample Two Result:`,
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            computedValue: (v: Option) => ({
                concept_id: getConceptID(`SAMPLE_TWO_GENEXPERT_RESULT`),
                value_coded: getConceptID(`${v.value}`),
                obs_datetime: service.date
            }),
            options: () => [
                { value: 'MTB_NOT_DETECTED', label: 'MTB not detected' },
                { value: 'MTB_DETECTED', label: 'MTB detected' },
                { value: 'MTB_NO_RESULT', label: 'No result' },
                { value: 'MTB_ERROR', label: 'Error' },
                { value: 'MTB_INVALID', label: 'Invalid' },
            ],
            condition: (f: any) => {
                return /invalid|error|no_result/i.test(f.xpertSampleOneResult.value) ||
                  /RIF_RESISTANT_INDETERMINATE|RIF_RESISTANT_DETECTED/i.test(
                    f.sampleOneRifResistancePattern?.value
                    )
            }
        }
    };

    const sampleTwoRifResistancePatternField = () => {
        return {
            id: `sampleTwoRifResistancePattern`,
            helpText: `Sample Two RIF Resistance:`,
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            condition: (f: any) => f.xpertSampleTwoResult.value === 'MTB_DETECTED',
            computedValue: (v: Option, f: any) => ([{
                concept_id: getConceptID(`SAMPLE_TWO_RIF_RESISTANCE_PATTERN`),
                value_coded: getConceptID(`${v.value}`),
                obs_datetime: service.date
            },...(() => {
                if (f.sampleOneRifResistancePattern?.value === 'RIF_RESISTANT_DETECTED' &&
                    v.value === 'RIF_RESISTANT_DETECTED') {
                        return [{
                            concept_id: getConceptID('TB_DRUG_RESISTANT'),
                            value_coded: getDrugConceptID('Rifampicin (300mg)'),
                            obs_datetime: service.date
                        }, {
                            concept_id: getConceptID('Resistance classification'),
                            value_coded: getConceptID('Mono drug resistant'),
                            obs_datetime: service.date
                        }]
                    }
                return []
            })()]),
            options: () =>  [
                { value: 'RIF_RESISTANT_NOT_DETECTED', label: 'RIF resistant not detected' },
                { value: 'RIF_RESISTANT_DETECTED', label: 'RIF resistant detected' },
                { value: 'RIF_RESISTANT_INDETERMINATE', label: 'RIF resistant indeterminate' },
            ],
        } as Field
    };

    const sampleTwoResultDateField = () => {
        return {
            id: `sampleTwoResultDate`,
            helpText: `Sample Two Result Date:`,
            type: FieldType.TT_FULL_DATE,
            condition: (f: any) => f.xpertSampleTwoResult.value,
            validation: (v: Option) => Validation.validateSeries([
                () => Validation.required(v),
                () => Validation.dateRangeOf(v, `${route.query.date}`, service.date)
            ]),
            computedValue: (v: Option) => ({
                concept_id: getConceptID(`SAMPLE_TWO_GENEXPERT_RESULT_DATE`),
                value_datetime: v.value,
                obs_datetime: service.date
            })
        }
    }

    fields.value = [
        xpertSampleOneResultField(),
        sampleOneRifResistancePatternField(),
        sampleOneResultDateField(),
        xpertSampleTwoResultField(),
        sampleTwoRifResistancePatternField(),
        sampleTwoResultDateField()
    ]
});

function generateExtraObs(f: any) {
    const positive = f.xpertSampleOneResult?.value === 'MTB_DETECTED' || 
        f.xpertSampleTwoResult?.value === 'MTB_DETECTED'
    const observations: any = [
        {
            concept_id: getConceptID('PROCEDURE_TYPE'),
            value_coded: getConceptID('XPERTRIF'),
            obs_datetime: service.date
        },
        {
            concept_id: getConceptID('BACTERIOLOGICALLY_DIAGNOSED'),
            value_coded: getConceptID('YES_ANSWER'),
            obs_datetime: service.date
        },
        {
            concept_id: getConceptID('TB_STATUS'),
            value_coded: getConceptID( positive ? 'POSITIVE' : 'NEGATIVE'),
            obs_datetime: service.date
        },
        ...(() => {
            if (positive) {
                return [
                    {
                        concept_id: getConceptID('TB_TYPE'),
                        value_coded: getConceptID('PULMONARY_TB'),
                        obs_datetime: service.date
                    },
                    {
                        concept_id: getConceptID('TUBERCULOSIS_CLASS'),
                        value_coded: getConceptID('All Other'),
                        obs_datetime: service.date
                    }
                ]
            }        
            return []
        })()
    ]
    return observations
}

async function getRecentReasonForTest() {
    return (await LabService.getRecentOrders(service.patientID))
        .observations
        .reduce((currentReason: any, c: any) => {
            return getConceptID('REASON_FOR_TEST') === c.concept_id 
                ? c.value_text || c.value_coded
                : currentReason
        }, '')
}

async function onFinish(f: any, cdata: any) {
    await service.createEncounter();
    await service.saveObservationList([
        ...generateExtraObs(f), 
        ...(await resolveObs(cdata))
    ]);
    const testReason = await getRecentReasonForTest()
    const programData = await ProgramService.getProgramInformation(service.patientID)
    const store: any = {
        testReason,
        isConfirmatoryTest: [
            'Confirmatory Rifampicin Resitance test',
            'Rifampicin Resistance confirmation test',
            getConceptNameById('Confirmatory Rifampicin Resitance test')
        ].includes(testReason),
        age: programData.age,
        eptb: programData.eptb,
        hiv: programData.hiv,
        onTreatment: TbService.isOnTreatment(facts.outcome),
        onMdr: /multi drug resistance treatment/i.test(facts.outcome),
        isTbPositive: [
            f.xpertSampleOneResult?.value,
            f.xpertSampleTwoResult?.value
        ].some((sample) => sample === 'MTB_DETECTED'),
        sampleResultsAreInvalid: [
            f.xpertSampleOneResult?.value,
            f.xpertSampleTwoResult?.value
        ].every((sample) => sample === 'MTB_INVALID'),
        samplesAreRifResistant: [
            f.sampleOneRifResistancePattern?.value,
            f.sampleTwoRifResistancePattern?.value
        ].every((sample) => sample === 'RIF_RESISTANT_DETECTED'),
    }
    const decisionMeta: any =  {
        "prompt when results are invalid": {
            title: 'Sample one and sample two results are invalid',
            message: 'Do you want to Order another GeneXpert test?',
            yes: () => router.push(`/tb/lab/${service.patientID}?test=XPERT_MTB_RIF`),
            no: goToNextTask,
            mandatoryCondition: {
                sampleResultsAreInvalid: (yes: boolean) => yes 
            }
        },
        "Continue if already on mdr": {
            action: goToNextTask,
            mandatoryCondition: {
                onMdr: (yes: boolean) => yes
            }
        },
        "ask for confirmatory test if resistance is detected": {
            title: "Rifampcin Resistance Detected!",
            message: "Do you want to order confirmatory test?",
            yes: () => router.push(`/tb/lab/${service.patientID}?reason=Confirmatory Rifampicin Resitance test`),
            no: async () => {
                await TbService.enrollMDR(service.patientID)
                goToNextTask()
            },
            mandatoryCondition: {
                samplesAreRifResistant: (yes: boolean) => yes,
                isConfirmatoryTest: (yes: boolean) => !yes
            }
        },
        "enroll in mdr if confirmatory test detects drug resistance": {
            action: async () => {
                await TbService.enrollMDR(service.patientID)
                goToNextTask()
            },
            mandatoryCondition: {
                samplesAreRifResistant: (yes: boolean) => yes,
                isConfirmatoryTest: (yes: boolean) => yes
            }
        },
        "Offer Culture and pDST test if MTB is detected without RIF and if patient falls into risk category": {
            title: 'High risk patient',
            message: `MTB Detected without RIF and patient is a high risk category. Do you want to request Culture and pDST test?`,
            yes: () => router.push(`/tb/lab/${service.patientID}?test=CULTURE_AND_DST`),
            no: goToNextTask,
            mandatoryCondition: {
                isTbPositive: (yes: boolean) => yes,
                samplesAreRifResistant: (yes: boolean) => !yes,
            },
            eitherConditionMatch: {
                eptb: (yes: boolean) => yes,
                hiv: (yes: boolean) => yes,
                age: (age: number) => age < 14
            }
        },
        "offer to try a different examination if client is negative" : {
            title: 'Negative patient',
            message: 'Do you want to try a different examination?',
            yes: goToNextTask,
            no: () => router.push(patientDashboardUrl.value),
            mandatoryCondition: {
                isTbPositive: (yes: boolean) => !yes,
                onTreatment: (yes: boolean) => !yes,
                age: (age: number) => age > 14
            }
        },
    }
    for(const k of Object.keys(decisionMeta)) {
        const meta = decisionMeta[k]
        let optionalMatched = true
        let requiredMatched = false

        if (meta.mandatoryCondition) {
            requiredMatched = Object.keys(meta.mandatoryCondition)
                .every((attr) => meta.mandatoryCondition[attr](store[attr]))
        }
        if (meta.eitherConditionMatch) {
            optionalMatched = Object.keys(meta.eitherConditionMatch||{})
                .some((attr) => meta.eitherConditionMatch[attr](store[attr]))
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
    goToNextTask()
}
</script>
