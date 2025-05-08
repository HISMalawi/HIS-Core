<template>
    <ion-page>
        <his-standard-form :cancelDestinationPath="patientDashboardUrl" :onFinishAction="onFinish" :fields="fields"
            :skipSummary="true" />
    </ion-page>
</template>
  
<script lang="ts" setup>
import { AppEncounterService } from '@/services/app_encounter_service';
import { EncounterType, TPT_ELIGIBLE_AGE, TbState } from "@/apps/TB/meta/constants"
import { IonPage } from '@ionic/vue';
import { ref } from 'vue'
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import useEncounter from "@/composables/useEncounter";
import { getConceptID } from "../../services/util"
import { resolveObs } from '@/utils/HisFormHelpers/commons';
import Validation from '@/components/Forms/validations/StandardValidations';
import { getFacilities } from '@/utils/HisFormHelpers/LocationFieldOptions';
import { PatientProgramService } from '@/services/patient_program_service';
import router from '@/router';
import { ProgramService } from '@/services/program_service';

const fields = ref<Field[]>([]);
const service = new AppEncounterService(-1, EncounterType.TB_RECEPTION);

const { goToNextTask, patientDashboardUrl } = useEncounter((provider, patientID, patient) => {
    service.patientID = patientID
    service.providerID = provider

    const treatForIptField = () => {
        let programInfo: any = {}
        return {
            id: 'treatForIpt',
            helpText: 'Enroll in TPT program?',
            type: FieldType.TT_SELECT,
            requireNext: false,
            init: async () => {
                programInfo = await ProgramService.getProgramInformation(patientID)
                return true
            },
            options: () => [
                { value: 'YES_ANSWER', label: 'Yes' },
                { value: 'NO_ANSWER', label: 'No' },
            ],
            validation: (v: Option) => Validation.required(v), 
            condition: () => !programInfo.tb_positive && patient.getAge() >= 0 && patient.getAge() < TPT_ELIGIBLE_AGE
        };
    } 

    const catchmentAreaField = () => {
        return {
            id: 'catchmentArea',
            helpText: 'Patient living within catchment area?',
            type: FieldType.TT_SELECT,
            requireNext: false,
            Validation: (v: Option) =>  Validation.required(v),
            computedValue: (v: Option) => ({
                concept_id: getConceptID('LIVES_NEAR'),
                value_coded: getConceptID(`${v.value}`),
                obs_datetime: service.date
            }),
            options: () => [
                { value: 'YES_ANSWER', label: 'Yes' },
                { value: 'NO_ANSWER', label: 'No' },
            ]
        }
    } 

    const livesNearTBField = () => {
        return {
            id: 'livesNearTB',
            helpText: 'Patient living near a TB registration centre?',
            type: FieldType.TT_SELECT,
            requireNext: false,
            computedValue: (v: Option) => ({
                concept_id: getConceptID('TRANSFERRED_OUT_EXTERN'),
                value_coded: getConceptID(`${v.value}`),
                obs_datetime: service.date
            }),
            options: () => [
                { value: 'YES_ANSWER', label: 'Yes' },
                { value: 'NO_ANSWER', label: 'No' },
            ],
            validation: (v: Option) => Validation.required(v),
            condition: (f: any) => f.catchmentArea.value === 'NO_ANSWER'
        };
    } 

    const locationIdField = () => {
        return {
            id: 'locationId',
            type: FieldType.TT_SELECT,
            helpText: 'Select TB Registration Centre:',
            computedValue: (v: Option) => ({
                concept_id: getConceptID('FACILITY_NAME'),
                value_text: v.label,
                obs_datetime: service.date
            }),
            options: (_: any, filter='') => getFacilities(filter),
            config: {
                showKeyboard: true,
                isFilterDataViaApi: true
            },
            validation: (v: Option) => Validation.required(v),
            condition: (f: any) => f.livesNearTB.value === 'YES_ANSWER',
            requireNext: false,
        };
    }

    fields.value = [
        treatForIptField(),
        catchmentAreaField(),
        livesNearTBField(),
        locationIdField()
    ]
});

async function onFinish(f: any, cdata: any) {
    if (f.treatForIpt?.value === 'NO_ANSWER') return router.push(patientDashboardUrl.value)
    await service.createEncounter();
    await service.saveObservationList((await resolveObs(cdata)));
    const program = new PatientProgramService(service.patientID)
    program.setStateDate(service.date)
    try {
        await program.enrollProgram()
    } catch (e) {
        console.warn(`${e}`)
    }
    if (f.treatForIpt?.value === 'YES_ANSWER') {
        program.setStateId(TbState.TPT)
    }
    if (program.stateId != -1) await program.updateState()
    goToNextTask();
}
</script>
  