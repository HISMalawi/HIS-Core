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
import Validation from '@/components/Forms/validations/StandardValidations';
import TbService from '../../services/tb_service';
import { isEmpty } from 'lodash';

const fields = ref<Field[]>([]);
const service = new AppEncounterService(-1, EncounterType.UPDATE_HIV_STATUS );
const artData = ref<any>()

const { goToNextTask, patientDashboardUrl } = useEncounter((provider, patientID, patient) => {
    service.patientID = patientID
    service.providerID = provider

    const artSummary = () => {
        const summaryData: any = []
        return {
            id: "artSummary",
            helpText: "ART Summary",
            type: FieldType.TT_SUMMARY,
            init: async () => {
                artData.value = await TbService.generateArtStatusFromArt(patientID, AppEncounterService.getSessionDate())
                if (artData.value) {
                    Object.keys(artData.value).forEach((i: any) => summaryData.push(artData.value[i]))
                }
                return true
            },
            condition: () => !isEmpty(artData.value),
            options: () => summaryData
        }
    }

    const statusField = () => {
        return {
            id: "hivStatus",
            helpText: "HIV Status",
            type: FieldType.TT_SELECT,
            requireNext: false,
            validation: (v: Option) => Validation.required(v),
            condition: () => isEmpty(artData.value),
            computedValue: (v: Option) => {
                if (v.value === 'NOT_DONE') return {
                    concept_id: getConceptID('HIV_TEST_DONE_TODAY'),
                    value_coded: getConceptID('NO_ANSWER'),
                    obs_datetime: service.date
                }
                return {
                    concept_id: getConceptID('HIV_STATUS'),
                    value_coded: getConceptID(`${v.value}`),
                    obs_datetime: service.date
                }
            },
            options: () => [
                { value: "POSITIVE", label: "Positive" },
                { value: "NEGATIVE", label: "Negative" },
                { value: "NOT_DONE", label: "Not Tested" }
            ]
        }
    }

    const timeOfHIVTestField = () => {
        return {
            id: "timeOfHIVTest",
            helpText: "Time of HIV test",
            type: FieldType.TT_SELECT,
            requireNext: false,
            validation: (v: Option) => Validation.required(v),
            computedValue: (v: Option) => ({
                concept_id: getConceptID('TIME_OF_HIV_TEST'),
                value_coded: getConceptID(`${v.value}`),
                obs_datetime: service.date
            }),
            condition: (f: any) => f.hivStatus.value === 'POSITIVE' || f.hivStatus.value === 'NEGATIVE',
            options: () => [
                { value : "HIV_BEFORE_TB", label: "Before TB Registration" },
                { value : "HIV_AFTER_TB", label: "After TB Registration" }
            ]
        }

    }

    const artStatusField = () => {
        return {
            id: "artStatus",
            helpText: "ART Started",
            type: FieldType.TT_SELECT,
            requireNext: false,
            validation: (v: Option) => Validation.required(v),
            condition: (f: any) => f.hivStatus.value === 'POSITIVE',
            computedValue: (v: Option) => ({
                concept_id: getConceptID('ON_ART'),
                value_coded: getConceptID(`${v.value}`),
                obs_datetime: service.date
            }),
            options: () => [
                { value: "YES_ANSWER", label: "Yes" },
                { value: "NO_ANSWER", label: "No" }
            ]
        }
    }

    const arvStatusField = () => {
        return {
            id: "arvStatus",
            helpText: "ARV Status",
            type: FieldType.TT_SELECT,
            requireNext: false,
            validation: (v: Option) => Validation.required(v),
            condition: (f: any) => f.artStatus.value === 'YES_ANSWER',
            computedValue: (v: Option) => ({
                concept_id: getConceptID('ARV_STATUS'),
                value_coded: getConceptID(`${v.value}`),
                obs_datetime: service.date
            }),
            options: () => [
                { value: "ARV_BEFORE_TB", label: "Started ARV before TB Treatment" },
                { value: "ARV_WHILE_TB", label: "Started ARV while on TB Treatment" },
                { value: "ARV_AFTER_DISCHARGE", label: "ARV not started by the time when discharged from TB treatment" }
            ]
        }
    }

    const cptStatusField = () => {
        return {
            id: "cptStatus",
            helpText: "Started CPT",
            type: FieldType.TT_SELECT,
            requireNext: false,
            validation: (v: Option) => Validation.required(v),
            condition: (f: any) => f.artStatus.value === 'YES_ANSWER',
            computedValue: (v: Option) => ({
                concept_id: getConceptID('ON_CPT'),
                value_coded: getConceptID(`${v.value}`),
                obs_datetime: service.date
            }),
            options: () => [
                { value: "YES_ANSWER", label: "Yes" },
                { value: "NO_ANSWER",  label: "No" }
            ]
        }
    }

    const cptStartDateField = () => {
        return {
            id: "cptStartDate",
            helpText: "CPT Start Date",
            type: FieldType.TT_FULL_DATE,
            validation: (v: Option) => Validation.validateSeries([
                () => Validation.required(v),
                () => Validation.dateRangeOf(v, `${patient.getBirthdate()}`, service.date)
            ]),
            computedValue: (v: Option) => ({
                concept_id: getConceptID('CPT_START_DATE'),
                [/unknown/i.test(`${v.value}`) ? 'value_text' : 'value_datetime']: v.value,
                obs_datetime: service.date
            }),
            condition: (f: any) => f.cptStatus.value === 'YES_ANSWER',
            config: {
                allowUnknown: true
            }
        }
    }

    fields.value = [
        artSummary(),
        statusField(),
        timeOfHIVTestField(),
        artStatusField(),
        arvStatusField(),
        cptStatusField(),
        cptStartDateField()
    ]
});

async function onFinish(_: any, cdata: any) {
    if (!isEmpty(artData.value)) {
        if (!artData.value?.hivStatus?._recordedStatusInTB) {
            await service.createEncounter();
            await service.saveObservationList(
                Object.keys(artData.value).reduce((a: any, k: any) => {
                    return [...a, artData.value[k].obs]
                },[])
            );
        }
    } else {
        await service.createEncounter();
        await service.saveObservationList(await resolveObs(cdata));
    }
    goToNextTask();
}
</script>
  