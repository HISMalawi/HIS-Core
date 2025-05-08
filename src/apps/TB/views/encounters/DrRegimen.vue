<template>
    <ion-page>
      <his-standard-form 
        :cancelDestinationPath="patientDashboardUrl"
        @onIndex="fieldComponent=''"
        :activeField="fieldComponent"
        :onFinishAction="onFinish"
        :fields="fields"
        :skipSummary="true"
      />
    </ion-page>
  </template>
  
<script lang="ts" setup>
import { AppEncounterService } from '@/services/app_encounter_service';
import { IonPage } from '@ionic/vue';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import useEncounter from "@/composables/useEncounter";
import Validation from '@/components/Forms/validations/StandardValidations';
import { alertConfirmation, toastWarning } from '@/utils/Alerts';
import { infoActionSheet } from '@/utils/ActionSheets';
import { ref } from 'vue'
import { formatUnderScoreNames, toDate } from '@/utils/Strs';
import { isEmpty } from 'lodash';
import router from '@/router';
import { ActionType, DecisionMeta } from '../../interface';

const fields = ref<Field[]>([]);
const service = new AppEncounterService(-1, -1);
const mdrState = ref<any>({})
const fieldComponent = ref('')
const regimens = ref<any>({})

async function assignRegimen(regimen: string) {
    await AppEncounterService.getJson(`mdr/regimen/create`, { 
        patient_id: service.patientID, 
        program_id: service.programID, 
        regimen,
        date: service.date
    })
    location.reload()
}

async function loadRegimens() {
    regimens.value = await AppEncounterService.getJson(`mdr/regimen/types`, {
        patient_id: service.patientID, 
        program_id: service.programID, 
        date: service.date
    })
}

async function decisionEngine(items: Record<string, DecisionMeta>) {
    for (const k in items) {
        const meta = items[k]
        const pass = Object.keys(meta.conditions)
            .every((condition) => condition in mdrState.value
                ? meta.conditions[condition](mdrState.value[condition])
                : false)
        if (!pass) {
            continue
        }
        switch(meta.type||'') {
            case ActionType.CONFIRM:
                if (meta.action) await meta.action((await alertConfirmation(meta.subtitle||meta.title||'No message', { 
                    header: meta.title||'Alert'
                })))
                break;
            case ActionType.INFO:
                await infoActionSheet(
                    'Information', 
                    meta.title||'',
                    meta.subtitle||meta.title||'No information',
                    [ { name: "Ok", slot: "start", color: "primary" } ]
                )
                if (meta.action) await meta.action()
                break;
            case ActionType.SELECTION:
                if (meta.options) {
                    const action = await infoActionSheet(
                        'Action needed!', 
                        meta.title||'',
                        meta.subtitle||meta.title||'No information',
                        Object.keys(meta.options||{}).map((option: string) => {
                            return {
                                name: option,
                                slot:'start',
                                color: 'primary'
                            }
                        })
                    )
                    if (meta.action) await meta.action(meta.options[action])
                }
                break;
            case ActionType.WARN:
                if (meta.title || meta.subtitle) {
                    toastWarning(meta.title||meta.subtitle||'')
                    if (meta.action) await meta.action()
                } 
                break;
            default:
                if (meta.action) await meta.action()
        }
        if (pass === meta.break) break
    }
}

const { goToNextTask, patientDashboardUrl } = useEncounter((provider, patientID) => {
    service.patientID = patientID
    service.providerID = provider

    const regimenChartField = () => {
        return {
            id: "regimenData",
            helpText: "DR regimen:",
            type: FieldType.TT_SUMMARY,
            init: async () => {
                mdrState.value = await AppEncounterService.getJson(`mdr/regimen/status`, {
                    patient_id: service.patientID, 
                    program_id: service.programID, 
                    date: service.date
                })
                const reg: any = mdrState.value
                const decisionMeta: Record<string, DecisionMeta> = {
                    "Eligible for mdr?": {
                        action: () => router.push(`/patient/dashboard/${patientID}`),
                        title: "Exiting",
                        subtitle: "Patient is not eligible for DR treatment!",
                        type: ActionType.INFO,
                        break: true,
                        conditions: {
                            mdr_status: (onMdr: boolean) => !onMdr
                        }
                    },
                    "On MDR but current regimen has issues and no alternative is available?": {
                        action: () => fieldComponent.value = 'regimentTypes',
                        title: 'Alert',
                        subtitle: `Issues with active regimen: ${reg.issues}`,
                        type: ActionType.INFO,
                        break: true,
                        conditions: {
                            regimen_title: (title: string) => !/individual/i.test(title),
                            fail_state_phase: (alternativeRegimen: any) => !alternativeRegimen,
                            issues: (d: any) => d.length > 0
                        },
                    },
                    "On MDR and current regimen has issues and an alternative is available?" : {
                        title: `${reg.regimen_title} Alert!`,
                        subtitle: `${reg.issues}. Try ${formatUnderScoreNames(reg.fail_state_phase)}?`,
                        type: ActionType.CONFIRM,
                        action: async (confirmed: boolean) => confirmed && await assignRegimen(reg.fail_state_phase),
                        break: true,
                        conditions: {
                            regimen_title: (title: string) => !/individual/i.test(title),
                            fail_state_phase: (alternative: any) => alternative ? true : false,
                            issues: (issues: any) => issues.length
                        }
                    },
                    "Custom regimen has issues, formulate another one?" : {
                        action: () => fieldComponent.value = 'custom_regimen_duration',
                        type: ActionType.CONFIRM,
                        title: `${reg.issues}. Do you want to create another custom regimen?`,
                        break: true,
                        conditions: {
                            regimen_title: (title: string) => /individual/i.test(title),
                            issues: (issues: any) => issues.length
                        }
                    },
                    "Conversion has been successful in this phase, proceed to next phase?": {
                        action: async (confirmed: boolean) => confirmed && await assignRegimen(reg.next_phase),
                        title: `${reg.regimen_title} Complete`,
                        subtitle: `Do you want to proceed to ${formatUnderScoreNames(reg.next_phase)}?`,
                        type: ActionType.CONFIRM,
                        break: true,
                        conditions: {
                            end_of_phase: (phaseEnded: boolean) => phaseEnded,
                            conversion_status: (hasConversion: boolean) => hasConversion,
                            next_phase: (hasNextPhase: any) => hasNextPhase
                        }
                    },
                    "Treatment complete, update outcome?" : {
                        action: () => router.push(`/patient/programs/${service.programID}`),
                        title: 'Treatment complete!',
                        subtitle: `Do you want to update the patient's outcome?`,
                        type: ActionType.CONFIRM,
                        break: true,
                        conditions: {
                            end_of_phase: (phaseHasEnded: any) => phaseHasEnded,
                            conversion_status: (conversionSucceeded: any) => conversionSucceeded,
                            next_phase: (hasNextPhase: any) => !hasNextPhase
                        }
                    },
                    "Conversion was not successful on this regimen, either proceed to the next phase or try an alternative": {
                        action: assignRegimen,
                        title: `Phase complete! previous consecutive results were Positive and Negative respectively. Choose which regimen to proceed with`,
                        subtitle: `Do you want to proceed to ${formatUnderScoreNames(reg.next_phase)} or go for ${formatUnderScoreNames(reg.fail_state_phase)}?`,
                        type: ActionType.SELECTION,
                        options: {
                            "Continue" : reg.next_phase,
                            "Next phase": reg.fail_state_phase
                        },
                        break: true,
                        conditions: {
                            next_phase: (hasNextPhase: string) => hasNextPhase ? true : false,
                            fail_state_phase: (hasFailState: string) => hasFailState ? true : false,
                            issues: (regimenIssues: string[]) => regimenIssues.length <= 0,
                            end_of_phase: (hasEndedPhase: boolean) => hasEndedPhase,
                            conversion_status: (conversionHappened: boolean) => !conversionHappened
                        }
                    },
                    "Conversion was not successful, either update outcome or switch regimens" : {
                        action: (option: any) => typeof option === 'function' ? option() : option,
                        title: 'Treatment complete! Previous consecutive results were Positive and Negative respectively',
                        subtitle: `Do you want to update treatment outcome or switch regimen?`,
                        type: ActionType.SELECTION,
                        options: {
                            "Outcome": () => router.push(`/patient/programs/${service.programID}`),
                            "New regimen": () => fieldComponent.value = 'regimentTypes'
                        },
                        break: true,
                        conditions: {
                            issues: (issues: string[]) => issues.length <= 0,
                            end_of_phase: (hasEndedPhase: boolean) => hasEndedPhase,
                            conversion_status: (conversionHappened: boolean) => !conversionHappened
                        }
                    }, 
                    "Update individualised drugs if non are found": {
                        action: () => fieldComponent.value = 'custom_regimen_duration',
                        break: true,
                        conditions: {
                            regimen_title: (title: string) => /individual/i.test(title),
                            regimen_drugs: (drugs: any[]) => drugs.length <= 0
                        }
                    },
                    "Warn if overdue for examination" : {
                        title: "Patient is overdue for a Lab test",
                        subtitle: "Do you want to order a test now?",
                        type: ActionType.CONFIRM,
                        conditions: {
                            overdue_examination: (overdue: boolean) => overdue
                        },
                        action: (confirmed: boolean) => confirmed && router.push(`/tb/lab/${patientID}`)
                    }
                }
                await decisionEngine(decisionMeta)
                return true
            },
            condition: () => Object.keys(mdrState.value).length > 1,
            dynamicHelpText: () => `${mdrState.value.regimen_title}`,
            config: {
                hiddenFooterBtns: ["Clear"],
                overrideDefaultFooterBtns: {
                    nextBtn: {
                        name: 'Finish',
                        onClick: () => goToNextTask()
                    }
                },
                footerBtns: [
                    {
                        name: "Switch",
                        size: "large",
                        slot: "end",
                        color: "primary",
                        visible: true,
                        onClick: async () => {
                            await loadRegimens()
                            fieldComponent.value = 'regimentTypes'
                        } 
                    }
                ]
            },
            options: () => {
                const labelElement = (text: string, color='#007bff') => `<span style='padding:3px;color: white; background:${color}'> ${text} </span>`
                const createHtmlList = (data: any) => {
                    const li: any = []
                    data.forEach((item: any) => li.push(`<li>${item != '' ? item : 'NONE'}</li>`))
                    return `<ul>${li.join('')}</ul>`
                }
                return [
                    {
                        label: 'Composition', value:  mdrState.value?.regimen_composition ? labelElement(mdrState.value?.regimen_composition) : labelElement('N/A')
                    },
                    {
                        label: 'Required duration', value: `${mdrState.value?.duration_in_months} Month(s)` 
                    }, 
                    {
                        label: 'Current duration', value: `${mdrState.value?.months_on_regimen} Month(s)`
                    },
                    {
                        label: 'Date enrolled', value: `${toDate(mdrState.value?.enrolled_on)}`
                    },
                    {
                        label: 'Next phase',
                        value: mdrState.value?.next_phase ? labelElement(formatUnderScoreNames(mdrState.value?.next_phase)) : labelElement('N/A')
                    },
                    {
                        label: 'Sputum conversion',
                        value: mdrState.value?.conversion_status ? labelElement('DONE', '#5cb85c') : labelElement('NOT DONE', '#d9534f')
                    },
                    {
                        label: 'Conversion status date',
                        value:  mdrState.value?.conversion_date ? toDate(mdrState.value?.conversion_date): labelElement('N/A', '#d9534f')
                    },
                    {
                        label: 'Examination Overdue',
                        value: mdrState.value?.overdue_examination ? labelElement('Yes', '#d9534f') : labelElement('No', '#5cb85c') 
                    },
                    {
                        label: 'Issues',
                        value: !mdrState.value?.issues || isEmpty(mdrState.value?.issues) ? labelElement('NONE', '#5cb85c') : createHtmlList(mdrState.value?.issues)
                    },
                    {
                        label: 'Classification', value: mdrState.value?.resistance_classification
                    },
                    {
                        label: 'Failure risk',
                        value: mdrState.value?.not_risk ? labelElement('Yes', '#d9534f') : labelElement('No', '#5cb85c')
                    },
                    {
                        label: 'Pregnant',
                        value: mdrState.value?.pregnant ? labelElement('Yes', '#d9534f') : labelElement('No', '#5cb85c'),
                    },
                    {
                        label: 'Extrapulmonarly TB',
                        value: mdrState.value?.eptb ? labelElement('Yes', '#d9534f') : labelElement('No', '#5cb85c')
                    },
                    {
                        label: 'End of phase',
                        value: mdrState.value?.end_of_phase ? labelElement('Yes', '#5cb85c') : labelElement('No', '#d9534f')
                    }
                ]
            }
        } as Field
    }

    const regimenTypesField = () => {
        return {
            id: "regimentTypes",
            helpText:"Select regimen type:",
            type: FieldType.TT_SELECT,
            init: async () => {
                if (isEmpty(regimens.value))await loadRegimens()
                return true
            },
            beforeNext: async (v: Option) => {
                if (/individual/i.test(mdrState.value.regimen_title) && v.value === 'individualised_regimen') {
                    if (!(await alertConfirmation(`Do you want to replace custom regimen composition of ${mdrState.value.regimen_composition}?`)))
                        return false
                } else if (mdrState.value.next_phase === v.value && !mdrState.value.end_of_phase) {
                    if (!(await alertConfirmation(`${mdrState.value.regimen_title} is not complete, do you want to proceed to ${v.label}`)))
                        return false
                } else {
                    if(!(await alertConfirmation(`Are you sure you want to prescribe ${v.label} (${v.other.regimen_composition||'N/A'})`))) 
                        return false
                }
                return true
            },
            computedValue: (v: Option) => v.value,
            options: () => {
                return Object.keys(regimens.value).map((r: any) => {
                    const d = regimens.value[r]
                    const option: Option = {
                        label: d.title,
                        value: r,
                        other: {...d, sort: 0},
                        description: {
                            color: 'light',
                            text: `${d.regimen_composition||'Unknown regimen composition'}`
                        }
                    }
                    if (d.title === mdrState.value.regimen_title) return {
                        ...option, other: {...d, sort: -1 }, disabled: !/individual/i.test(d.title), description: {
                            text: `<b style='color:green;'>Currently on this regimen</b>`
                        }
                    }
                    if (d.primary) return {
                        ...option, other: {...d, sort: 1 }, description: {
                            text: `${d.regimen_composition} <br/> <i style='font-weight:bold;color: green;'>Patient meets criteria for this regimen</i>`
                        }
                    }
                    if (d.issues.length) return { 
                        ...option, disabled: true, other: {...d, sort: -1}, description: { 
                            text: `<i style='font-weight: bold;'>${d.issues.join(', ')}</i>` 
                        }
                    }
                    return option
                }).sort((a, b) => b.other.sort > a.other.sort ? 1 : -1);
            },
            validation: (v: Option) => Validation.required(v)
        } as Field
    }

    function customRegimenPeriodField() {
        return {
            id: "custom_regimen_duration",
            helpText: "Custom Duration in months",
            type: FieldType.TT_SELECT,
            proxyID: "regimen_period",
            computedValue: (v: Option) => v.value,
            validation: (v: Option) => Validation.required(v),
            condition: (f: any) => f.regimentTypes.value === 'individualised_regimen',
            options: () => {
                return [
                    { label: "2 Months", value: 2 },
                    { label: "4 Months", value: 4 },
                    { label: "6 Months", value: 6 },
                    { label: "8 Months", value: 8 },
                    { label: "12 Months", value: 12 },
                    { label: "20 Months", value: 20 },
                    { label: "Custom Duration", value: "other" }
                ]
            }
        } as Field
    }

    function customRegimenDurationField() {
        return {
            id: "other_duration",
            helpText: "Custom Duration in months",
            type: FieldType.TT_NUMBER,
            proxyID: "regimen_period",
            computedValue: (v: Option) => v.value,
            validation: (v: Option) => Validation.required(v),
            condition: (f: any) => f.custom_regimen_duration.value === 'other'
        }
    }

    function customRegimenFormulationField() {
        const options: Option[] = []
        return {
            id: "custom_regimen_formulation",
            helpText: "Custom DR Regimen",
            type: FieldType.TT_DR_REGIMEN_INPUT,
            init: async () => {
                const data = await AppEncounterService.getJson('mdr/regimen/custom/options', {
                    program_id: AppEncounterService.getProgramID(),
                    date: AppEncounterService.getSessionDate(),
                    patient_id: patientID
                })
                if (data) Object.keys(data).forEach((group) => options.push({
                    label: data[group].title,
                    value: data[group].description,
                    other: data[group] 
                }))
                return true
            },
            options: () => options,
            computedValue: (v: Option[]) => ({
                drugs: v.map((data: any) => data.value),
                code: v[0].other
            }),
            condition: (f: any) => f.regimen_period.value,
            validation: (v: Option[]) => Validation.validateSeries([
                () => Validation.required(v),
                () => v[0].other.split('-').length < 4 ? ["Create a regimen of atleast 4 or more drugs"] : null
            ])
        }
    }

    fields.value = [
        regimenChartField(),
        regimenTypesField(),
        customRegimenPeriodField(),
        customRegimenDurationField(),
        customRegimenFormulationField(),
    ]
});

async function onFinish(f: any, c: any) {
    if (f?.custom_regimen_formulation?.length) {
        await AppEncounterService.postJson(`mdr/regimen/create`, {
            patient_id: service.patientID,
            program_id: service.programID,
            date: service.date,
            duration: c.regimen_period,
            drugs: c.custom_regimen_formulation.drugs,
            code: c.custom_regimen_formulation.code
        })
        return location.reload()
    } else if (f.regimentTypes?.value) {
        return assignRegimen(f.regimentTypes?.value)
    }
    goToNextTask()
}
</script>
