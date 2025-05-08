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
import { EncounterType, TbIdentifierType } from "@/apps/TB/meta/constants"
import { IonPage } from '@ionic/vue';
import { ref } from 'vue'
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { getConceptID } from '../../services/util';
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import useEncounter from "@/composables/useEncounter";
import { mapStrToOptions, resolveObs } from '@/utils/HisFormHelpers/commons';
import HisApp from "@/apps/app_lib"
import Validation from '@/components/Forms/validations/StandardValidations';
import { IdentifierService } from '@/services/identifier_service';
import { isEmpty } from 'lodash';
import { toastWarning } from '@/utils/Alerts';
import { PatientIdentifierService } from '@/services/patient_identifier_service';
import { useRoute } from 'vue-router';
import Store from "@/composables/ApiStore"
import TbService from "../../services/tb_service"
import { infoActionSheet } from '@/utils/ActionSheets';
import { ProgramService } from '@/services/program_service';
import { toDate } from '@/utils/Strs';

const app: any = HisApp.getActiveApp()
const fields = ref<Field[]>([]);
const service = new AppEncounterService(-1, EncounterType.TB_REGISTRATION);
const idService = new IdentifierService()
const idData = ref<Record<string, any>>()
const preFix = ref('')

const route = useRoute()

function formatID(id: string) {
    const [value, year] = `${id}`.split('/')
    if (year) return `${(preFix.value)}${value}/${year}`
    const [curYear] = `${service.date}`.split('-')
    return `${(preFix.value)}${value}/${curYear.trim()}`
}

const OUTCOME_ID: Record<string, any> = {
    'Multi drug resistance treatment': {
        type: TbIdentifierType.MDR,
        label: 'Patient DR TB Number',
        indexID: 'DR TB Number',
        concept: 'MDR_NUMBER'
    },
    'Tuberculosis Preventive Treatment (TPT)': {
        type: TbIdentifierType.IPT,
        label: 'Patient IPT Number',
        indexID: 'IPT Number',
        concept: 'TB_NUMBER'
    },
    'Currently in treatment':{
        type: TbIdentifierType.TB,
        label: 'Patient TB Number',
        indexID: 'TB Number',
        concept: 'TB_NUMBER'
    },
    'DEFAULT': {
        type: TbIdentifierType.TB,
        label: 'Patient TB Number',
        indexID: 'TB Number',
        concept: 'TB_NUMBER'
    }
}

const { goToNextTask, patientDashboardUrl, patientId } = useEncounter((provider, patientID, patient, facts) => {
    service.patientID = patientID
    service.providerID = provider

    const reassignmentField = () => {
        let programInfo: any = {}
        const idData = Object.values(OUTCOME_ID).find((o) => {
            return o.indexID === route.query.type
        })
        return {
            id: 'reassign',
            helpText: `Reassign ${route.query.type}: ${route.query.id}`,
            proxyID: "patientIdentifier",
            type: FieldType.TT_NUMBER,
            init: async () => {
                programInfo = await ProgramService.getProgramInformation(patientID)
                if (!route.query.id && TbService.isOnTreatment(programInfo.current_outcome) && 
                    `${programInfo.tb_number}`.split('/').length > 0) {
                    await infoActionSheet(
                        'Caution!', 
                        `Client is currently using program number ${programInfo.tb_number}`,
                        `Current outcome is ${programInfo.current_outcome} updated on ${toDate(programInfo.current_outcome_date)}`,
                        [
                            {
                                name: 'Ok',
                                color: 'primary',
                                slot: 'start'
                            }
                        ])
                }
                const [prefix, program] = `${route.query.id}`.split('/') 
                idService.setIdentifierType(idData?.type)
                preFix.value = `${prefix}/${program}/`
                return true
            },
            beforeNext: async (v: Option) => {
                const identifier = formatID(`${v.value}`)
                const idResult = await idService.getPatientsByIdentifier(identifier)
                if (!isEmpty(idResult)) {
                    toastWarning(`${identifier} is already in use!!`)
                    return false
                }
                return true
            },
            computedValue: (v: Option) => {
                return {
                    obs_datetime: service.date,
                    value_text: formatID(`${v.value}`),
                    concept_id: getConceptID(idData?.concept)
                }
            },
            condition: () => route.query.reassign,
            validation: (v: Option) => Validation.required(v),
        } as Field
    }

    const patientIdentifierField = () => {
        return {
            id: "new",
            helpText: 'Identifier:',
            proxyID: 'patientIdentifier',
            type: FieldType.TT_NUMBER,
            init: async () => {
                if (OUTCOME_ID[facts.outcome]) {
                    idData.value = OUTCOME_ID[facts.outcome]
                } else {
                    idData.value = OUTCOME_ID.DEFAULT
                }
                idService.setIdentifierType(idData.value?.type)
                preFix.value = await app.programPatientIdentifiers[idData.value?.indexID]?.prefix()
                return true
            },
            beforeNext: async (v: Option) => {
                const identifier = formatID(`${v.value}`)
                const idResult = await idService.getPatientsByIdentifier(identifier)
                if (!isEmpty(idResult)) {
                    toastWarning(`${identifier} is already in use!!`)
                    return false
                }
                return true
            },
            computedValue: (v: Option) => {
                return {
                    obs_datetime: service.date,
                    value_text: formatID(`${v.value}`),
                    concept_id: getConceptID(idData.value?.concept)
                }
            },
            condition: (f: any) => !f.reassign?.value,
            validation: (v: Option) => Validation.required(v),
            dynamicHelpText: () => idData.value?.label
        } as Field
    }

    const displayTBNumberField = () => {
        return {
            id: 'idSummary',
            helpText: 'Identifier',
            type: FieldType.TT_TEXT_BANNER,
            options: (f: any) => {
                return mapStrToOptions([`${idData.value?.label}: <br/> <b>${formatID(f.patientIdentifier.value)}</b>`])
            }
        } as Field
    }

    fields.value = [
        reassignmentField(),
        patientIdentifierField(),
        displayTBNumberField()
    ]
});

async function onFinish(f: any, cdata: any) {
    await service.createEncounter();
    await service.saveObservationList(await resolveObs(cdata));
    if (f.new) {
        await PatientIdentifierService.create(
            patientId.value, 
            idService.identifierType, 
            formatID(f.patientIdentifier.value)
        )
    } else {
        await PatientIdentifierService.update(
            parseInt(`${route.query.reassign}`),
            formatID(f.patientIdentifier.value)
        )
    }
    await TbService.printTBNumber(service.patientID)
    Store.invalidate('ACTIVE_PATIENT')
    goToNextTask();
}
</script>
