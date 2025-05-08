<template>
    <ion-page>
      <his-standard-form 
        :cancelDestinationPath="patientDashboardUrl" 
        :onFinishAction="onFinish"
        :fields="fields"
      />
    </ion-page>
  </template>
  
<script lang="ts" setup>
import { AppEncounterService } from '@/services/app_encounter_service';
import { PatientProgramService } from '@/services/patient_program_service';
import { EncounterType, TbState } from "@/apps/TB/meta/constants"
import { IonPage } from '@ionic/vue';
import { ref } from 'vue'
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import useEncounter from "@/composables/useEncounter";
import { getConceptID } from "../../services/util"
import { mapStrToOptions, resolveObs } from '@/utils/HisFormHelpers/commons';
import Validation from '@/components/Forms/validations/StandardValidations';
import { getFacilities } from '@/utils/HisFormHelpers/LocationFieldOptions';
import Occupations from "../../meta/occupations"
import { infoActionSheet } from '@/utils/ActionSheets';
import { chunk } from 'lodash';
import Fuse from 'fuse.js';

const fields = ref<Field[]>([]);
const service = new AppEncounterService(-1, EncounterType.TB_INITIAL);
 
const { goToNextTask, patientDashboardUrl } = useEncounter((provider, patientID, patient, facts) => {
    service.patientID = patientID
    service.providerID = provider

    const patientTypeField = () => {
        let patientType = ''
        return {
            id: "patientType",
            helpText: "Patient Type:",
            type: FieldType.TT_SELECT,
            requireNext: false,
            init: async () => {
                switch (facts.outcome.toLowerCase()) {
                    case "lost to follow up":
                        patientType = 'Return After Lost To Follow Up'
                        break;
                    case "treatment complete": 
                        patientType = "Relapse";
                        break;
                    case "patient cured": 
                        patientType = "Relapse";
                        break;
                }
                if (patientType) {
                    const action = await infoActionSheet(
                        `Recommendation`, 
                        `Based on previous outcome: ${facts.outcome}`,
                        `Continue patient as ${patientType}?`,
                        [
                            { name: "Yes", slot: "start", color: "success" },
                            { name: "No", slot: "end", color: "danger" }
                        ]
                    )
                    patientType = action === 'No' ? '' : patientType
                }
                return true
            },
            computedValue: (v: Option) => ({
                concept_id: getConceptID('PATIENT_TYPE'),
                value_coded: getConceptID(v.value as string),
                obs_datetime: service.date
            }),
            validation: (v: Option) => Validation.required(v),
            defaultValue: () => patientType,
            options: () => [
                { label: "New Patient", value: "NEW_PATIENT" },
                { label: "Relapse", value: "RELAPSE" },
                { label: "Return After Lost To Follow Up", value: "RETURN_AFTER_LOST_TO_FOLLOW_UP" },
                { label: "Treatment Failure", value: "TREATMENT_FAILURE" },
                { label: "Transfer In DR TB Patient", value: "TRANSFERRED_IN_MDR_PATIENT" },
                { label: "Other", value: "OTHER" },
                { label: "Unknown", value: "UNKNOWN" }
            ]
        } as Field
    }

    const locationField = () => ({
        id: "mdr_refferal",
        helpText: "Transfered In From",
        type: FieldType.TT_SELECT,
        validation: (v: Option) => Validation.required(v),
        condition: (f: any) => f.patientType.value == 'TRANSFERRED_IN_MDR_PATIENT',
        options: (_: any, filter='') => getFacilities(filter),
        config: {
            showKeyboard: true,
            isFilterDataViaApi: true
        }
    } as Field);

    const historyRegistrationField = () => {
        return {
            id: "historyRegistration",
            helpText: "Previous DR TB Treatment:",
            type: FieldType.TT_SELECT,
            condition: (f: any) => f.patientType.value == 'TRANSFERRED_IN_MDR_PATIENT',
            computedValue: (v: Option) => ([
                {
                    concept_id: getConceptID('TRANSFERRED_IN'),
                    value_text: v.label,
                    obs_datetime: service.date
                },
                {
                    concept_id: getConceptID('MDR_TB_REGISTRATION_GROUP'),
                    value_coded: getConceptID(v.value as string),
                    obs_datetime: service.date
                }
            ]),
            validation: (v: Option) => Validation.required(v),
            options: () => [
                { label: "New DR Patient", value: "NEW_MDR_PATIENT" },
                { label: "Previously treated with first line drugs only", value: "TREATED_WITH_FIRST_LINE_DRUGS" },
                { label: "Previously treated with DR TB drugs", value: "TREATED_WITH_SECOND_LINE_DRUGS" }
            ]
        } as Field
    } 

    const treatmentStartDateField = () => {
        return {
            id: "treatmentStartDate",
            type: FieldType.TT_FULL_DATE,
            helpText: "Treatment Start Date:",
            validation: (v: Option) => Validation.validateSeries([
                () => Validation.required(v),
                () => Validation.dateRangeOf(v, `${patient.getBirthdate()}`, service.date) 
            ]),
            computedValue: (v: Option) => ({
                concept_id: getConceptID('MDR_TREATMENT_START_DATE'),
                value_datetime: v.value,
                obs_datetime: service.date
            }),
            condition: (f: any) => f.patientType.value == 'TRANSFERRED_IN_MDR_PATIENT',
        } as Field
    } 

    const tbStatusField = () => {
        return {
            id: "tbStatus",
            helpText: "Current TB Status:",
            type: FieldType.TT_SELECT,
            condition: (f: any) => f.patientType.value == 'TRANSFERRED_IN_MDR_PATIENT',
            computedValue: (v: Option) => ({
                concept_id: getConceptID('TB_STATUS'),
                value_coded: getConceptID(v.value as string),
                obs_datetime: service.date
            }),
            validation: (v: Option) => Validation.required(v),
            options: () => [
                { label: "Positive", value: "POSITIVE" },
                { label: "Negative", value: "NEGATIVE" }
            ]
        } as Field
    } 

    const tbStatusDateField = () => {
        return {
            id: "tbStatusDate",
            type: FieldType.TT_FULL_DATE,
            helpText: "Status date:",
            validation: (v: Option) => Validation.validateSeries([
                () => Validation.required(v),
                () => Validation.dateRangeOf(v, `${patient.getBirthdate()}`, service.date) 
            ]),
            computedValue: (v: Option) => ({
                concept_id: getConceptID('RESULT_DATE'),
                value_datetime: v.value,
                obs_datetime: service.date
            }),
            condition: (f: any) => f.tbStatus.value,
        } as Field
    } 

    const occupationField = () => {
        return {
            id: "occupation",
            helpText: "Occupation:",
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            computedValue: (v: Option) => ({
                concept_id: getConceptID('OCCUPATION'),
                value_text: v.value,
                obs_datetime: service.date
            }),
            condition: () => patient.getAge() > 14,
            options: (_: any, filter: string) => {
                let data: any = []
                if (filter) {
                    const fuse = new Fuse(Occupations, {
                        threshold: 0.3,
                        keys: ['searchIndex'],
                        useExtendedSearch: true
                    })
                    data = fuse.search(filter, { limit: 25 }).map((i: any) => i.item)
                } else {
                    data = chunk(Occupations, 25)[0]
                }
                return mapStrToOptions(data)
            },
            config: {
                showKeyboard: true,
                isFilterDataViaApi: true,
            }
        } as Field
    } 

    const sourceOfReferralField = () => {
        return {
            id: "sourceOfReferral",
            helpText: "Source of Referral",
            type: FieldType.TT_SELECT,
            requireNext: false,
            condition: (f: any) => f.patientType.value === 'NEW_PATIENT',
            validation: (v: Option) => Validation.required(v),
            computedValue: (v: Option) => ({
                concept_id: getConceptID('SOURCE_OF_REFERRAL'),
                value_coded: getConceptID(v.value as string),
                obs_datetime: service.date
            }),
            options: () => [
                { label: "HTS Clinic", value: "HTS_CLINIC" },
                { label: "ART Clinic", value: "ART_CLINIC" },
                { label: "Private Practitioner", value: "PRIVATE_PRACTITIONER" },
                { label: "Sputum Collection Point", value: "SPUTUM_COLLECTION_POINT" },
                { label: "Community Sputum Collection Point", value: "COMMUNITY_SPUTUM_COLLECTION_POINT" },
                { label: "HH TB Screening Sites", value: "HH_TB_SCREENING_SITES" },
                { label: "House to House TB Screening", value: "HOUSE_TO_HOUSE_TB_SCREENING" },
                { label: "PMTCT", value: "PMTCT" },
                { label: "Walk In", value: "WALK_IN" },
                { label: "OPD", value: "OPD" },
                { label: "Ward", value: "WARD" },
                { label: "Mobile Diagnositc Unit", value: "MOBILE_CLINIC" },
                { label: "Other", value: "OTHER_REFERRAL" }
            ]
        } as Field
    } 

    const highRiskGroupField = () => {
        return {
            id: "highRiskGroup",
            helpText: "High Risk Group",
            type: FieldType.TT_MULTIPLE_SELECT,
            validation: (v: Option) => Validation.required(v),
            computedValue: (v: Option[]) => v.map((option) => ({
                concept_id: getConceptID('TB_SCREENING_CRITERIA'),
                value_coded: getConceptID(option.value as string),
                obs_datetime: service.date
            })),
            onValueUpdate: (listData: Option[], val: Option) => {
                return listData.map((i) => {
                    if (val.isChecked) {
                        if (/none|unknown/i.test(`${val.label}`)) {
                            if (i.label != val.label) {
                                i.isChecked = false
                                return i
                            } else {
                                i.isChecked = true
                                return i
                            }
                        }
                        if (!/none|unknown/i.test(`${val.label}`)) {
                            if (/none|unknown/i.test(`${i.label}`)) {
                                i.isChecked = false
                            }
                        }
                        if (val.other?.related) {
                            if (val.other.related.includes(i.value)) {
                                i.isChecked = false
                            }
                        }
                    }
                    return i
                })
            },
            options: () => [
                { label: "OPD", value: "OPD" },
                { label: "MCH Clinic", value: "MCH" },
                { label: "HIV Negative", value: "NEGATIVE" },
                { label: "Mining Communities", value: "MINING_COMMUNITIES" },
                { label: "Current Miners", value: "CURRENT_MINERS" },
                { label: "Ex-Miners", value: "EX_MINERS" },
                { label: "HIV Clinic", value: "ART_CLINIC" },
                { label: "HIV Positive", value: "POSITIVE" },
                { label: "Prisoner", value: "PRISONER" },
                { label: "Health Worker", value: "HEALTH_WORKER" },
                { label: "Previously treated on first-line drugs", value: "PREVIOUSLY_ON_FIRST_LINE_DRUGS" },
                { label: "Symptomatic contacts of a DR TB patient who died while on DOT", value: "SYMPTOMATIC_CONTACT_OF_DR_PATIENT_WHO_DIED" },
                { label: "Extrapulmonary TB patient", value: "EXTRA_PULMONARY_TB" },
                { label: "From area with prevelance of DR TB", value: "AREA_WITH_PREVALENCE_OF_DR_TB" },
                { label: "None", value: "NONE" }
            ]
        } as Field
    } 

    const tbSymptomsField = () => {
        return {
            id: "tbSymptoms",
            helpText: "TB Symptoms",
            type: FieldType.TT_MULTIPLE_SELECT,
            validation: (v: Option[]) => Validation.required(v),
            condition: (f: any) => f.patientType.value === 'NEW_PATIENT',
            computedValue: (v: Option[]) => {
                const unknown = v.filter((o) => /unknown|none/i.test(o.label) && o.isChecked) 
                if (unknown.length) return unknown.map((option) => ({
                    concept_id: getConceptID('TB_SYMPTOMS'),
                    value_coded: getConceptID(option.value as string)
                }))
                return v.map((option) => ({
                    concept_id: getConceptID(option.label as string),
                    value_coded: getConceptID('YES_ANSWER'),
                    obs_datetime: service.date
                }))
            },
            onValueUpdate: (listData: Option[], val: Option) => {
                return listData.map((i) => {
                    if (val.isChecked) {
                        if (/none|unknown/i.test(`${val.label}`)) {
                            if (i.label != val.label) {
                                i.isChecked = false
                                return i
                            } else {
                                i.isChecked = true
                                return i
                            }
                        }
                        if (!/none|unknown/i.test(`${val.label}`)) {
                            if (/none|unknown/i.test(`${i.label}`)) {
                                i.isChecked = false
                            }
                        }
                    }
                    return i
                })
            },
            options: () => [
                { 
                    label: "Cough lasting >1 week", 
                    value: "COUGH_GT_ONE_WK", 
                    other: {
                        related: ['COUGH_ANY_DURATION', 'COUGH_GT_TWO_WKS']
                    }
                },
                { 
                    label: "Cough lasting >2 weeks", 
                    value: "COUGH_GT_TWO_WKS",
                    other: {
                        related: ['COUGH_GT_ONE_WK', 'COUGH_ANY_DURATION']
                    } 
                },
                { 
                    label: "Cough (any duration)", 
                    value: "COUGH_ANY_DURATION",
                    other: {
                        related: ['COUGH_GT_ONE_WK', 'COUGH_GT_TWO_WKS']
                    }
                },
                { 
                    label: "Fever lasting >1 week", 
                    value: "FEVER_GT_ONE_WK",
                    other: {
                        related: ['FEVER_GT_TWO_WKS', 'FEVER_ANY_DURATION']
                    }
                },
                { 
                    label: "Fever lasting >2 weeks", 
                    value: "FEVER_GT_TWO_WKS",
                    other: {
                        related: ['FEVER_GT_ONE_WK', 'FEVER_ANY_DURATION']
                    }
                },
                { 
                    label: "Fever (any duration)", 
                    value: "FEVER_ANY_DURATION",
                    other: {
                        related: ['FEVER_GT_ONE_WK', 'FEVER_GT_TWO_WKS']
                    }
                },
                { 
                    label: "Weight loss", 
                    value: "WEIGHT_LOSS" 
                },
                { 
                    label: "Profuse night sweats lasting >1 week", 
                    value: "NIGHT_SWEAT_GT_ONE_WK",
                    other: {
                        related: ['NIGHT_SWEAT_GT_TWO_WKS', 'NIGHT_SWEAT_ANY_DURATION']
                    }
                },
                { 
                    label: "Profuse night sweats lasting >2 weeks", 
                    value: "NIGHT_SWEAT_GT_TWO_WKS",
                    other: {
                        related: ['NIGHT_SWEAT_GT_ONE_WK', 'NIGHT_SWEAT_ANY_DURATION']
                    }
                },
                { 
                    label: "Profuse night sweats (any duration)", 
                    value: "NIGHT_SWEAT_ANY_DURATION", 
                    other: {
                        related: ['NIGHT_SWEAT_GT_ONE_WK', 'NIGHT_SWEAT_GT_TWO_WKS']
                    }
                },
                { label: "Unknown", value: "UNKNOWN" },
                { label: "None", value: "NONE" }
            ]
        } as Field
    } 

    const coughDurationField = () => {
        return {
            id: "coughDuration",
            helpText: "Number of Days Coughing:",
            type: FieldType.TT_NUMBER,
            validation: (v: Option, f: any) => {
                if (!v) return ['Number of days coughing is required!']
                const coughDuration = parseInt(`${v.value}`)
                const coughValidationsErrors = f.tbSymptoms.reduce((a: any, c: any) => {
                    switch(c.value) {
                        case 'COUGH_GT_ONE_WK':
                            if (coughDuration < 7 || coughDuration >= 14) a.push(
                                `Duration for "${c.label}" should be between 7 or 14 days`
                            )
                            break;
                        case 'COUGH_GT_TWO_WKS':
                            if (coughDuration < 14) a.push(
                                `Duration for "${c.label}" should be more than 14 days`
                            )                                
                            break;
                        case 'COUGH_ANY_DURATION':
                            if (coughDuration <= 0 || coughDuration >=90) a.push(
                                `Duration for "${c.label}" can't between 1 to 90 days`
                            )
                            break;
                    }
                    return a
                }, [])
                return coughValidationsErrors.length ? coughValidationsErrors : null
            },
            computedValue: (v: Option) => ({
                concept_id: getConceptID('COUGH_DURATION'),
                value_numeric: v.value,
                value_modifier: 'd',
                obs_datetime: service.date
            }),
            condition: (f: any) => f.tbSymptoms.some((v: Option) => /cough lasting >/i.test(`${v.label}`))
        } as Field
    } 

    const personIsPregnantField = () => {
        return {
            id: "personIsPregnant",
            helpText: "Is Person Pregnant?",
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            computedValue: (v: Option) => ({
                concept_id: getConceptID('PATIENT_IS_PREGNANT'),
                value_coded: getConceptID(v.value as string),
                obs_datetime: service.date
            }),
            condition: () => patient.isChildBearing(),
            options: () => [
                { label: "Yes", value: "YES_ANSWER" },
                { label: "No", value: "NO_ANSWER" }
            ]
        } as Field
    }

    fields.value = [
        patientTypeField(),
        locationField(),
        historyRegistrationField(),
        treatmentStartDateField(),
        tbStatusField(),
        tbStatusDateField(),
        occupationField(),
        sourceOfReferralField(),
        highRiskGroupField(),
        tbSymptomsField(),
        coughDurationField(),
        personIsPregnantField()
    ]
});

async function onFinish(f: any, cdata: any) {
    if (f.patientType.value == 'TRANSFERRED_IN_MDR_PATIENT') {
        const program = new PatientProgramService(service.patientID)
        await program.enrollProgram()
        program.setStateDate(service.date)
        program.setStateId(TbState.MDR)
        await program.updateState()
    }
    const obs = await resolveObs(cdata)
    await service.createEncounter();
    await service.saveObservationList(obs);
    goToNextTask();
}
</script>
  