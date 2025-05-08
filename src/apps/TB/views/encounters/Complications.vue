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
import { IonPage, modalController } from '@ionic/vue';
import { ref } from 'vue'
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import useEncounter from "@/composables/useEncounter";
import { getConceptID } from "../../services/util"
import { resolveObs } from '@/utils/HisFormHelpers/commons';
import Validation from "@/components/Forms/validations/StandardValidations";
import { isEmpty } from 'lodash';
import SideEffectsModal from '../../components/SideEffects.vue';
import { toDate } from '@/utils/Strs';

const fields = ref<Field[]>([]);
const service = new AppEncounterService(-1, EncounterType.COMPLICATIONS);
const lastReceivedDrugs = ref([])
const sideEffectReasonData = ref<any>({})

const SIDE_EFFECTS: any = {
    pageOne: {
        'Abnominal pain': 'ABNOMINAL_PAIN',
        'Athralgia': 'ATHRALGIA',
        'Colour body fluids': 'COLOUR_BODY_FLUIDS',
        'Depression': 'DEPRESSION',
        'Fatigue': 'FATIGUE',
        'Gastrointestinal': 'GASTROINTESTINAL',
        'Headache': 'HEADACHE',
        'Hearing Difficulties': 'HEARING_DIFFICULTIES',
        'Hematological': 'HEMATOLOGICAL',
        'Hepatoxicity': 'HEPATOXICITY',
        'Hypothyroidism': 'HYPOTHYROIDISM',
        'Itching': 'SKIN_ITCHING'
    },
    pageTwo: {
        'Jaundice': 'JAUNDICE',
        'Lactic Acidosis': 'LACTIC_ACIDOSIS',
        'Numbness': 'NUMBNESS_IN_HANDS_FEET_LEGS',
        'Optic Neuritis': 'OPTIC_NEURITIS',
        'Pancreatitis': 'PANCREATITIS',
        'Periferal Neuropathy': 'PERIFERAL_NEUROPATHY',
        'Psychosis': 'PSYCHOSIS',
        'QT Prolongation': 'QT_PROLONGATION',
        'Renal failure': 'RENAL_FAILURE',
        'Skin Rash': 'SKIN_RASH',
        'Toxicity': 'TOXICITY'
    }
}

const { goToNextTask, patientDashboardUrl } = useEncounter((provider, patientID) => {
    service.patientID = patientID
    service.providerID = provider

    function historyField () {
        let tableData: any = []
        return {
            id: "history",
            helpText: "Side effects / Contraindications history",
            type: FieldType.TT_TABLE_VIEWER,
            init: async () => {
                const res = await AppEncounterService.getJson(`programs/${service.programID}/patients/${patientID}/medication_side_effects`, {
                    date: service.date
                })
                Object.keys(res).forEach((date: string) => {
                    tableData.push([
                        toDate(date),
                        Object.values(res[date]).flat(1).map((d: any) => {
                            return `<b>${d.name}</b> ${d.drug_induced ? '(Drug-induced)' : ''} : ${d.drug||'Unknown'} `
                        }).join('<p/>')
                    ])
                })
                return true
            },
            condition: () => tableData.length,
            options: () => {
                return [
                    {
                        label: '', value: '',
                        other: {
                            columns: ['Date', 'Condition'],
                            rows: tableData
                        }
                    }
                ]
            }
        }
    }

    function generateContraindicationsFields() {
        return Object.keys(SIDE_EFFECTS).map((pageNumber: string, i: number) => ({
            id: pageNumber,
            helpText: `Page ${i+1}: Contraindications / Side effects`,
            type: FieldType.TT_MULTIPLE_YES_NO,
            init: async () => {
                if (isEmpty(lastReceivedDrugs.value)) {
                    lastReceivedDrugs.value = await AppEncounterService.getJson(
                        `patients/${patientID}/last_drugs_received`, { 
                            program_id: service.programID
                        }
                    )
                }
                return true
            },
            beforeNext: async (v: Option[]) => {
                const sideEffects = v.filter(d => d.value === 'YES_ANSWER')
                if (sideEffects.length) {
                    const modal = await modalController.create({
                        component: SideEffectsModal,
                        backdropDismiss: false,
                        cssClass: "large-modal",
                        componentProps: { sideEffects, drugs: lastReceivedDrugs.value },
                    });
                    modal.present();
                    const { data } = await modal.onDidDismiss();
                    if (!data) return false
                    sideEffectReasonData.value[pageNumber] = data.values
                }
                return true
            },
            validation: (v: any) => Validation.validateSeries([
                () => Validation.required(v),
                () => Validation.anyEmpty(v)
            ]),
            computedValue: (val: Option[]) => val.map((v: Option) => ({
                concept_id: getConceptID('MALAWI_TB_SIDE_EFFECTS'),
                value_coded: getConceptID(`${v.other.concept}`),
                child: [{
                    concept_id: getConceptID(`${v.other.concept}`),
                    value_coded: getConceptID(`${v.value}`),
                    obs_datetime: service.date
                }],
                obs_datetime: service.date
            })),
            options: (f: any) => Object.keys(SIDE_EFFECTS[pageNumber]).map((k: string) => ({
                label: k,
                value: (f[pageNumber]?.find((d: Option) => d.label === k)?.value||'') as any,
                other: {
                    concept: SIDE_EFFECTS[pageNumber][k],
                    values: [
                        { value: "YES_ANSWER", label: "Yes" },
                        { value: "NO_ANSWER", label: 'No' }
                    ]
                }
            })),
            config: {
                footerBtns: [
                    {
                        name: "None",
                        slot: "end",
                        onClickComponentEvents: {
                            refreshOptions: () => Object.keys(SIDE_EFFECTS[pageNumber]).map((k: string) => ({
                                label: k,
                                value: 'NO_ANSWER',
                                other: {
                                    concept: SIDE_EFFECTS[pageNumber][k],
                                    values: [
                                        { value: "YES_ANSWER", label: "Yes" },
                                        { value: "NO_ANSWER", label: 'No' }
                                    ]
                                }
                            }))
                        },
                        onClick: () => "None"
                    }
                ]
            }
        }))
    }

    fields.value = [
        historyField(),
        ...generateContraindicationsFields()
    ]
});

function buildReasonForTestObs() {
    const data = Object.values(sideEffectReasonData.value).flat(1)
    return data.map((d: any) => {
        if (d.other && /drug/i.test(d.other)) {
            return {
                concept_id: getConceptID('DRUG_INDUCED'),
                value_coded: getConceptID(d.concept),
                value_text: 'Past medication history'
            }
        } else if(d.drug) {
            return {
                concept_id: getConceptID('DRUG_INDUCED'),
                value_coded: getConceptID(d.concept),
                value_drug: d.drug.drug.drug_id
            }
        }
        return {
            concept_id: getConceptID('CONTRAINDICATIONS'),
            value_coded: getConceptID(d.concept) 
        }
    })
}

async function onFinish(f: any, cdata: any) {
    await service.createEncounter();
    await service.saveObservationList([...(await resolveObs(cdata)), ...buildReasonForTestObs()]);
    goToNextTask();
}
</script>
  