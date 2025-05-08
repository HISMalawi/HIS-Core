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
import { EncounterType, TbState, TPT_ELIGIBLE_AGE } from "@/apps/TB/meta/constants"
import { IonPage } from '@ionic/vue';
import { ref } from 'vue'
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import useEncounter from "@/composables/useEncounter";
import { getConceptID, getDrugConceptID } from "../../services/util"
import { resolveObs } from '@/utils/HisFormHelpers/commons';
import Validation from '@/components/Forms/validations/StandardValidations';
import { PatientProgramService } from '@/services/patient_program_service';
import router from '@/router';
import { infoActionSheet } from '@/utils/ActionSheets';
import TbService from '../../services/tb_service';
import { Patientservice } from '@/services/patient_service';

const fields = ref<Field[]>([]);
const service = new AppEncounterService(-1, EncounterType.DIAGNOSIS);
const patient = ref<Patientservice>()

const { goToNextTask, patientDashboardUrl, facts } = useEncounter((provider, patientID, patientS) => {
    service.patientID = patientID
    service.providerID = provider
    patient.value = patientS as any
    const procedureTypeField = () => {
        const CLINICAL_XRAY_ASSESSMENTS = [
            ['Infiltration', 'PULMONARY_TB'],
            ['Tuberculosis Miliary', 'PULMONARY_TB'],
            ['Opacification', 'PULMONARY_TB'],
            ['Consolidation', 'PULMONARY_TB'],
            ['Cavitation', 'PULMONARY_TB'],
            ['Hilar Lymphadenopathy', 'EXTRA_PULMONARY_TB'],
            ['Tuberculosis Meningitis', 'EXTRA_PULMONARY_TB'],
            ['Lymphadenitis', 'EXTRA_PULMONARY_TB'],
            ['Osteoarticular', 'EXTRA_PULMONARY_TB'],
            ['Gastrointestinal', 'EXTRA_PULMONARY_TB'],
            ['Pleural Effusion', 'EXTRA_PULMONARY_TB'],
            ['Tuberculosis Spine', 'EXTRA_PULMONARY_TB']
        ]

        return {
            id: 'procedureType',
            helpText: 'Procedure Type:',
            requireNext: false,
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            computedValue: (v: Option) => ([
                {
                    concept_id: getConceptID('PROCEDURE_TYPE'),
                    value_coded: getConceptID(`${v.value}`),
                    obs_datetime: service.date
                },
                {
                    concept_id: getConceptID('CLINICALLY_DIAGNOSED'),
                    value_coded: getConceptID('YES_ANSWER'),
                    obs_datetime: service.date
                }
            ]),
            options: () => [
                { 
                    value: 'ULTRASOUND', 
                    label: 'Ultrasound Scanning',
                    other: {
                        procedures: [
                            ['Pleural Effusion', 'EXTRA_PULMONARY_TB'] ,
                            ['Pericardial Effusion', 'EXTRA_PULMONARY_TB'],
                            ['Abdominal Tuberculosis', 'EXTRA_PULMONARY_TB'],
                            ['Tuberculosis Ascites', 'EXTRA_PULMONARY_TB']
                        ]
                    } 
                },
                { 
                    value: 'X_RAY', 
                    label: 'X-Ray',
                    other: {
                        procedures: CLINICAL_XRAY_ASSESSMENTS
                    }
                },
                { 
                    value: 'CLINICAL', 
                    label: 'Clinical',                    
                    other: {
                        procedures: CLINICAL_XRAY_ASSESSMENTS
                    }
                }
            ]
        } as Field
    }
    
    const tbStatusField = () => {
        return {
            id: 'tbStatus',
            helpText: 'TB Present?',
            type: FieldType.TT_SELECT,
            computedValue: (v: Option) => ({
                concept_id: getConceptID('TB_STATUS'),
                value_coded: getConceptID(v.value as string),
                obs_datetime: service.date
            }),
            validation: (v: Option) => Validation.required(v),
            options: () => [
                { value: 'POSITIVE', label: 'Yes' },
                { value: 'NEGATIVE', label: 'No' },
            ],
            requireNext: false
        } as Field
    }

    const tbStrainField = () => {
        return {
            id: 'tbStrain',
            helpText: 'Type of TB:',
            type: FieldType.TT_MULTIPLE_SELECT,
            computedValue: (v: Option[]) => {
                const strains = v.map((i) => ({
                    concept_id: getConceptID('TUBERCULOSIS_CLASS'),
                    value_coded: getConceptID(`${i.label}`),
                    obs_datetime: service.date
                }))
                return [...strains, {
                    concept_id: getConceptID('TB_TYPE'),
                    value_coded: getConceptID(`${v[0].value}`),
                    obs_datetime: service.date
                }]
            },
            validation: (v: Option) => Validation.required(v),
            condition: (f: any) => f.tbStatus.value === 'POSITIVE' && f.procedureType.other.procedures.length,
            options: (f: any) => f.procedureType.other.procedures.map(
                ([strain, strainType]: any[]) => ({ label: strain, value: strainType })
            )
        } as Field
    }

    const drugResistanceField = () => {
        return {
            id: 'drugResistance',
            helpText: 'Clinically enroll patient for:',
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            condition: (f: any) => f.tbStatus.value === 'POSITIVE',
            options: () => [
                { value: 'NO_ANSWER', label: 'Firstline treatment' },
                { value: 'YES_ANSWER', label: 'DR TB treatment' },
            ]
        } as Field
    }

    const resistantToField = () => {
        return {
            id: 'resistantTo',
            helpText: 'Suspected drug resistance to:',
            type: FieldType.TT_MULTIPLE_SELECT,
            computedValue: (v: Option[]) => {
                const obs = v.map((i) => ({
                    concept_id: getConceptID('TB_DRUG_RESISTANT'),
                    value_coded: getDrugConceptID(`${i.value}`),
                    obs_datetime: service.date
                }))
                if (obs.length > 1) {
                    obs.push({
                        concept_id: getConceptID('Resistance classification'),
                        value_coded: getConceptID('Multi drug resistant'),
                        obs_datetime: service.date
                    })
                } else if (obs.length === 1) {
                    obs.push({
                        concept_id: getConceptID('Resistance classification'),
                        value_coded: getConceptID('Mono drug resistant'),
                        obs_datetime: service.date 
                    })
                }
                return obs
            },
            validation: (v: Option) => Validation.required(v),
            condition: (f: any) => f.drugResistance.value === 'YES_ANSWER',
            options: () => [
                { value: 'Rifampicin', label: 'Rifampicin' },
                { value: 'Isoniazid', label: 'Isoniazid' },
            ]
        } as Field
    }

    fields.value = [
        procedureTypeField(),
        tbStatusField(),
        tbStrainField(),
        drugResistanceField(),
        resistantToField()
    ]
});

async function onFinish(f: any, cdata: any) {
    if (f?.drugResistance?.value == 'YES_ANSWER') {
        const program = new PatientProgramService(service.patientID)
        const action = await infoActionSheet(
            "Drug resistance detected",
            "Client is resistant to one or more standard TB drugs",
            `Do you want to enroll client in the Drug resistance program?`,
            [
                { name: "Yes", slot: "start", color: "success" },
                { name: "No", slot: "end", color: "danger" }
            ]
        )
        if (action === 'Yes') {
            try {
                await program.enrollProgram()
            } catch (e) {
                console.warn(`${e}`)
            }
            program.setStateDate(service.date)
            program.setStateId(TbState.MDR)
            await program.updateState()
        }
    }
    const obs = await resolveObs(cdata)
    await service.createEncounter();
    await service.saveObservationList(obs);
    if (f.tbStatus?.value === 'NEGATIVE' && !TbService.isOnTreatment(facts.outcome) && patient.value!.getAge() > TPT_ELIGIBLE_AGE) {
        const action = await infoActionSheet(
            "Notice", 
            "Client is TB Negative!",
            `Would you like to retest client?`,
            [
                { name: "Yes", slot: "start", color: "success" },
                { name: "No", slot: "end", color: "danger" }
            ]
        )
        return action === 'No' 
            ? router.push(patientDashboardUrl.value)
            : location.reload()
    }  
    goToNextTask()
}
</script>
  