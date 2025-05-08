<template>
    <ion-page>
        <his-standard-form 
            :cancelDestinationPath="patientDashboardUrl" 
            :onFinishAction="onFinish"
            :activeField="nextField"
            @onIndex="nextField=''"
            :fields="fields"
            :skipSummary="true" />
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
import { mapStrToOptions, resolveObs } from '@/utils/HisFormHelpers/commons';
import Validation from '@/components/Forms/validations/StandardValidations';
import { getConceptID } from '../../services/util';
import dayjs from 'dayjs';
import { STANDARD_DATE_FORMAT } from '@/utils/Date';
import { infoActionSheet } from '@/utils/ActionSheets';
import TbService from "@/apps/TB/services/tb_service"

const nextField = ref('')
const fields = ref<Field[]>([]);
const service = new AppEncounterService(-1, EncounterType.TREATMENT);
const regimenType = ref<'standard'|'custom'>('standard')
const mdrState = ref<any>()

function getSelectedDrugs(form: any) {
    return [
        ...Array.isArray(form.selectedDrugs) 
            ? form.selectedDrugs.map((l: Option) => l.other)
            : [form.selectedDrugs.other],
        ...form.mdrSupplements?.value && form.mdrSupplements?.value != 'NONE' 
            ? [form.mdrSupplements.other]
            : []
    ]
}

const { goToNextTask, patientDashboardUrl, facts } = useEncounter((provider, patientID) => {
    service.patientID = patientID
    service.providerID = provider

    const regimenShortCodeField = () => {
        let regimenOptions: Option[] = []
        return {
            id: 'regimenShortCode',
            helpText: 'DR regimen',
            type: FieldType.TT_DR_PRESCRIPTION_INPUT,
            proxyID: 'selectedDrugs',
            dynamicHelpText: () => mdrState.value.regimen_title,
            computedValue: (v: Option[]) => v.map((d) => ({
                concept_id: getConceptID('MEDICAL_ORDERS'),
                value_coded: d.value,
                obs_datetime: service.date
            })),
            beforeNext: async (v: Option[]) => {
                const drugValidation = v.every((d: any) => d.other ? true : false)
                if (!drugValidation) {
                    const invalidDrugs = v.filter((d: any) => !d.other).map((d: any) => d.label)
                    await infoActionSheet(
                        'System ERROR',
                        'Please report this issue to resume using the system:',
                        `Some drugs are missing weight band information: ${invalidDrugs}`,
                        [ 
                            {
                                name: "Ok",
                                slot: "start",
                                color: 'danger'
                            }
                        ]
                    ) 
                    return false
                }
                return true
            },
            init: async () => {
                mdrState.value = await AppEncounterService.getJson(`mdr/regimen/status`, {
                    patient_id: service.patientID, 
                    program_id: service.programID,
                    date: service.date
                })
                if (mdrState.value?.mdr_status && (mdrState.value?.regimen_drugs||[]).length) {
                    const dmap = mdrState.value.regimen_drugs.reduce((a: any, c: any) => ({ ...a, [c.abbreviation]: c }), {})
                    regimenOptions = mdrState.value.regimen_composition.split('-').reduce((a: any, c: any) => {
                        return [...a, {
                            label: c,
                            value: c.split('/')[0],
                            other: c.split('/').map((abbreviation: string) => dmap[abbreviation])
                        }]
                    }, [])
                }
                return true
            },
            condition: () => mdrState.value.mdr_status,
            options: () => regimenOptions
        } as Field
    }

    const regimensField = () => {
        let regimenOptions: Option[] = []
        return {
            id: 'regimens',
            helpText: 'Recommended regimens (weight-band adjusted):',
            type: FieldType.TT_SELECT,
            requireNext: false,
            proxyID: 'selectedDrugs',
            init: async () => {
                const res = await AppEncounterService.getJson(`programs/${service.programID}/regimens`, {
                    patient_id: patientID, 
                    date: service.date
                })
                regimenOptions = res.map((r: any) => ({
                    label: r.drug.name,
                    value: r.drug_id,
                    other: r
                }))
                return true
            },
            computedValue: (v: Option) => [{
                concept_id: getConceptID('MEDICAL_ORDERS'),
                value_coded: v?.other?.drug?.concept_id,
                obs_datetime: service.date
            }],
            onload: () => regimenType.value = 'standard',
            validation: (v: Option) => Validation.required(v),
            condition: () => !mdrState.value?.mdr_status,
            options: () => regimenOptions,
            config: {
                hiddenFooterBtns: ['Back'],
                footerBtns: [
                    {
                        name: 'Custom Regimen',
                        slot: 'end',
                        onClick: () => {
                            regimenType.value = 'custom'
                            nextField.value = 'customRegimen'
                        }
                    }
                ]
            }
        };
    } 

    const customRegimenField = () => {
        let regimens: any = []
        return {
            id: 'customRegimen',
            helpText: 'Custom regimens:',
            type: FieldType.TT_MULTIPLE_SELECT,
            proxyID: 'selectedDrugs',
            validation: (v: Option) => Validation.required(v),
            condition: () => regimenType.value === 'custom',
            computedValue: (v: Option[]) => v.map((opt: Option) => ({
                concept_id: getConceptID('MEDICAL_ORDERS'),
                value_coded: opt.other.drug.concept_id,
                obs_datetime: service.date
            })),
            options: async () => {
                if (!regimens.length) {
                    const res = await AppEncounterService.getJson(
                        `programs/${service.programID}/custom_tb_ingredients`, {
                        patient_id: patientID
                    })
                    regimens = res.map((r: any) => ({
                        label: r.drug.name,
                        value: r.drug_id,
                        other: r
                    }))
                } 
                return regimens
            }
        }
    } 

    const mdrSupplementsField = () => {
        let supplementOptions: Option[] = []
        return {
            id: 'mdrSupplements',
            helpText: 'Supplements:',
            requireNext: true,
            type: FieldType.TT_SELECT,
            init: async () => {
                try {
                    const res = await AppEncounterService.getJson(
                        `programs/${service.programID}/tb_regimen_group`, {
                        patient: patientID, regimen_group: 'secondline-supplements'
                    })
                    supplementOptions = res.map((r: any) => ({
                        label: r.drug.name,
                        value: r.drug_id,
                        other: r
                    }))
                } catch (e) {
                    console.error(e)
                }
                return true
            },
            computedValue: (v: Option) => {
                if (v.value != 'NONE') {
                    return {
                        concept_id: getConceptID('MEDICAL_ORDERS'),
                        value_coded: v.other.drug.concept_id,
                        obs_datetime: service.date
                    }
                }
            },
            validation: (v: Option) => Validation.required(v),
            condition: (f: any) => f.regimenShortCode.length >= 1,
            options: () => [
                { label: "NONE", value: "NONE" },
                ...supplementOptions
            ]
        };
    } 
    
    const drugsViewField = () => {
        return {
            id: 'drugsView',
            helpText: 'Dosages:',
            type: FieldType.TT_TABLE_VIEWER,
            options: (f: any) => {
                return [{
                    label: '', 
                    value: '',
                    other: { 
                        columns: ['Name', 'AM', 'NOON', 'PM'],
                        rows: getSelectedDrugs(f).map((r: any) => [ 
                            r.name|| r?.drug?.name, r.am_dose, r.noon_dose, r.pm_dose 
                        ])
                    }
                }]
            }
        };
    } 
    
    const recommendedNumberOfDaysField = () => {
        return {
            id: 'recommendedNumberOfDays',
            helpText: 'Duration of Drug Supply in Days:',
            type: FieldType.TT_SELECT,            
            validation: (v: Option) => Validation.required(v),
            computedValue: (v: Option) => {
                if (v.value != 'Other') return {
                    concept_id: getConceptID('REGIMEN_SUPPLY_DAYS'),
                    value_numeric: parseInt(`${v.value}`),
                    obs_datetime: service.date
                }
            },
            options: () => [
                { value: 1, label: '1' },
                { value: 2, label: '2' },
                { value: 3, label: '3' },
                { value: 14, label: '14' },
                { value: 28, label: '28' },
                { value: 56, label: '56' },
                { value: 84, label: '84' },
                { value: 'Other', label: 'Other' },
            ],
            requireNext: false,
        };
    } 
    
    const otherDaysField = () => {
        return {
            id: 'otherDays',
            helpText: 'Custom Duration of Drug Supply in Days:',
            type: FieldType.TT_NUMBER,
            computedValue: (v: Option) => ({
                concept_id: getConceptID('REGIMEN_SUPPLY_DAYS'),
                value_numeric: parseInt(`${v.value}`),
                obs_datetime: service.date
            }),
            validation: (v: Option) => Validation.required(v),
            condition: (f: any) => f.recommendedNumberOfDays.value === 'Other'
        };

    }

    const dotField = () => {
        return {
            id : 'dot',
            helpText: 'DOT and Adherence Support Technique',
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            computedValue: (v: Option) => ({
                concept_id: getConceptID('TYPE_OF_SUPPORT'),
                value_coded: getConceptID(`${v.value}`),
                obs_datetime: service.date
            }),
            options: () => [
                { value: "GUARDIAN", label: "Guardian" },
                { value: "HEALTH_CARE_WORKER", label: "Health Care Worker" },
                { value: "VOLUNTEER", label: "Volunteer" },
                { value: "HSA", label: "Health Surveillance Assistant" }
            ]
        }
    }

    const useHangingPillsField = () => {
        let hangingPillsMayExist = false
        return {
            id: 'useHangingPills',
            helpText: 'Use Hanging Pills:',
            type: FieldType.TT_SELECT,
            init: async () => {
                const obs = await AppEncounterService.getObs({
                    person_id: patientID, 
                    date: service.date,
                    page_size: 1,
                    concept_id: getConceptID('TB_ADHERENCE')
                })
                hangingPillsMayExist = (obs||[]).length ? true : false
                return true
            },
            condition: () => hangingPillsMayExist,
            validation: (v: Option) => Validation.required(v),
            computedValue: (v: Option, f: any) => {
                if (v.value === 'Yes') getSelectedDrugs(f).map((d: any) =>({
                    concept_id: getConceptID('APPOINTMENT_REASON'),
                    value_drug: d.drug_id,
                    value_text: 'Optimize - including hanging pills',
                    obs_datetime: service.date
                }))
            },
            options: () => mapStrToOptions(['Yes', 'No'])
        }
    } 

    fields.value = [
        regimenShortCodeField(),
        regimensField(),
        customRegimenField(),
        mdrSupplementsField(),
        drugsViewField(),
        recommendedNumberOfDaysField(),
        otherDaysField(),
        useHangingPillsField(),
        dotField()
    ]
});

async function onFinish(f: any, cdata: any) {
    await service.createEncounter();
    await service.saveObservationList((await resolveObs(cdata)));
    await AppEncounterService.postJson('drug_orders', {
        encounter_id: service.encounterID,
        drug_orders: getSelectedDrugs(f).map((drug: any) => ({
            drug_inventory_id: drug?.drug_id||drug?.id||drug?.drug?.drug_id,
            start_date: service.date,
            am_dose: drug.am_dose,
            noon_dose: drug.noon_dose,
            pm_dose: drug.pm_dose,
            auto_expire_date: dayjs(service.date).add(
                f.recommendedNumberOfDays.value != 'Other'
                    ? f.recommendedNumberOfDays.value
                    : f.otherDays.value
                , 'days').format(STANDARD_DATE_FORMAT),
            name: drug.drug.name,
            concept_id: drug.drug.concept_id,
            equivalent_daily_dose: drug.am_dose + drug.noon_dose + drug.pm_dose
        }))
    })
    if (!TbService.isOnTreatment(facts.outcome)) await TbService.enrollTb(service.patientID)
    goToNextTask();
}
</script>
