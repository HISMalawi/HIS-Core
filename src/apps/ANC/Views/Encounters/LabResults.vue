<template>
  <ion-page> 
    <his-standard-form 
      :fields="formFields"
      :skipSummary="true"
      :onFinishAction="onFinish"
      :cancelDestinationPath="cancelDestination" 
    />
  </ion-page>
</template>

<script lang="ts">
import EncounterMixinVue from '@/views/EncounterMixin.vue'
import { FieldType } from "@/components/Forms/BaseFormElements"
import { defineComponent } from 'vue'
import { AncLabResultService } from "@/apps/ANC/Services/anc_lab_result_service"
import { Field, Option } from '@/components/Forms/FieldInterface'
import Validation from "@/components/Forms/validations/StandardValidations"
import { IonPage } from "@ionic/vue"
import { ObsValue } from '@/services/observation_service'
import { generateDateFields } from '@/utils/HisFormHelpers/MultiFieldDateHelper'
import HisDate from "@/utils/Date"
import ANC_PROP from "@/apps/ANC/anc_global_props"
import { alertConfirmation } from '@/utils/Alerts'
import { find } from 'lodash'
import { FLOAT_KEYPAD } from "@/components/Keyboard/KbLayouts"
import dayjs from 'dayjs'

export default defineComponent({
  components: { IonPage },
  mixins: [EncounterMixinVue],
  data: () => ({
    formFields: [] as any,
    arvNumber: '' as string,
    hivStatus: '' as string,
    artStatus: '' as string,
    arvStartDate: '' as string,
    recencyEssayActivated: false as boolean,
    riskOfPreclampsia: null as boolean | null,
    service: {} as any,
    previousHivDate: '' as string
  }),
  watch: {
    ready: {
      async handler(ready: boolean) {
        if (ready) {
            this.service = new AncLabResultService(this.patientID, this.providerID)
            await this.service.loadSubsequentVisit()
            await this.service.loadArtStatus()
            this.recencyEssayActivated = await ANC_PROP.recencyEssayActivated()
            this.formFields = this.getFields()
        } 
      },
      immediate: true
    }
  },
  methods: {
    async onFinish(_: any, computedData: any) {
      const obs = await this.resolveObs(computedData)
      await this.service.createEncounter()
      await this.service.saveObservationList(obs as ObsValue[])
      await this.service.printLabResults()
      this.nextTask()
    },
    getFields(): Field[] {
        return [
            {
                id: 'art_summary',
                helpText: 'ART Summary',
                type: FieldType.TT_SUMMARY,
                condition: () => this.service.isHivPositive(),
                options: () => {
                    return [
                        {
                            label: 'HIV Status', 
                            value: `
                                <b style="color:${this.service.isHivPositive() ? 'red': 'green'}">
                                    ${this.service.getHivStatus()}
                                </b>
                            `
                        },
                        {
                            label: 'On Art', value: this.service.getArtStatus() || 'N/A'
                        },
                        {
                            label: 'Art Start date', value: HisDate.toStandardHisDisplayFormat(this.service.getArvStartDate()) || 'N/A'
                        },
                        {
                            label: 'ARV Number', value: this.service.getArvNumber() || 'N/A'
                        }
                    ]
                }
            },
            {
                id: 'lab_results',
                helpText: 'Lab Results',
                type: FieldType.TT_MULTIPLE_YES_NO,
                condition: () => !this.service.isPregnancyTestDone && !this.hivStatus,
                options: (f: any) => {
                    if (f.lab_results) {
                        return f.lab_results
                    }
                    const options: Option[] = []
                    if (!this.service.isPrengnacyTestDone) {
                        options.push(this.toYesNoOption('Pregnancy test done', { concept: 'B-HCG'}))
                    }
                    if (!this.service.hivStatus) {
                        options.push(this.toYesNoOption('Previous HIV test done', { concept: 'Previous HIV test done'}))
                    }
                    return options
                },
                validation: (v: Option) => Validation.required(v),
                computedValue: (v: Option[]) => v.map(d => this.service.buildValueCoded(d.other.concept, d.value))
            },
            {
                id: 'prev_hiv_test_result',
                helpText: 'Previous HIV test results',
                type: FieldType.TT_SELECT,
                validation: (v: Option) => Validation.required(v),
                condition: (f: any) => this.inArray(
                    f.lab_results, (v: Option) => v.label === 'Previous HIV test done' && v.value === 'Yes'), 
                options: () => {
                    return this.mapStrToOptions([
                        'Negative',
                        'Positive',
                        'Inconclusive',
                        'Unknown'
                    ])
                },
                computedValue: (v: Option) => this.service.buildValueCoded('Previous HIV Test Results', v.value)
            },
            ...generateDateFields({
                id: 'prev_hiv_test_date',
                helpText: 'Previous HIV test',
                required: true,
                beforeNext: (date: string) => {
                    this.previousHivDate = date
                    return true
                },
                minDate: () => this.patient.getBirthdate(),
                maxDate: () => this.service.getDate(),
                estimation: {
                    allowUnknown: false
                },
                condition: (f: any) => f.prev_hiv_test_result?.value ? true : false,
                computeValue: (date: string) => this.service.buildValueDate('Previous HIV Test Date', date)
            }),
            {
                id: 'on_art',
                helpText: 'Patient on ART',
                type: FieldType.TT_SELECT,
                validation: (v: Option) => Validation.required(v),
                computedValue: (v: Option) => this.service.buildValueCoded('On Art', v.value),
                condition: (f: any) => f.prev_hiv_test_result.value === 'Positive',
                options: () => this.yesNoOptions()
            },
            {
                id: 'arv_number',
                helpText: 'ARV Number',
                type: FieldType.TT_TEXT,
                validation: (v: Option) => Validation.required(v),
                computedValue: (v: Option) => this.service.buildValueText('Art number', v.value),
                condition: (f: any) => f.on_art.value === 'Yes'
            },
            {
                id: 'recency_essay',
                helpText: 'Rapid Recency Essay - Asante Results',
                type: FieldType.TT_MULTIPLE_YES_NO,
                condition: (f: any) => f.prev_hiv_test_result.value === 'Positive' && this.recencyEssayActivated,
                computedValue: (v: Option[]) => v ? v.map(d => this.service.buildValueCoded(d.label, d.value)) : null,
                options: (f: any) => {
                    if (f.recency_essay) return f.recency_essay
                    return [
                        this.toYesNoOption('Line 1. Control Line Present'),
                        this.toYesNoOption('Line 2. Positive Verification Line Present'),
                        this.toYesNoOption('Line 3. Long-Term Line Present')
                    ]
                }
            },
            (() => {
                const isEligibleForHivTest = (f: any) => {
                    return !this.service.isHivPositive() && f.prev_hiv_test_result?.value != 'Positive'
                }
                let hivTestIsMandatory = false
                return {
                    id: 'available_test_results',
                    helpText: 'Available Lab Tests',
                    type: FieldType.TT_MULTIPLE_SELECT,
                    init: async () => {
                        await this.service.loadTimeSinceLastHivTest()
                        return true
                    },
                    validation: (v: Option) => Validation.required(v),
                    computedValue: (v: Option[]) => {
                        if (find(v, { label: 'None'})) {
                            return this.service.buildValueCoded('Lab test done', 'No')
                        }
                        return null
                    },
                    onValueUpdate(listData: Option[], value: Option) {
                        return listData.map(l => {
                            if (value.value === 'None' && l.value !='None') {
                                l.isChecked = false
                            }
                            if (value.value != 'None' && value.isChecked && l.value === 'None') {
                                l.isChecked = false
                            }
                            return l
                        })
                    },
                    options: async (f: any) => {
                        const options: Option[] = []
                        if (isEligibleForHivTest(f)) {
                            let monthsSinceLastTest = this.service.lastHivTestInMonths
                            if (f.prev_hiv_test_result) {
                                monthsSinceLastTest = dayjs(this.service.date).diff(this.previousHivDate, 'months')
                                hivTestIsMandatory = (f.prev_hiv_test_result?.value != 'Positive' && monthsSinceLastTest >= 3)
                            } else {
                                // Last recorded HIV test in the EMR
                                hivTestIsMandatory = (this.service.lastHivTestInMonths <= -1 || this.service.lastHivTestInMonths >= 3)
                            }
                            options.push({
                                ...this.toOption('HIV'),
                                isChecked: hivTestIsMandatory,
                                description: {
                                    color: "danger",
                                    text: `${ 
                                        monthsSinceLastTest <= -1
                                        ? "Consider HIV test because status is not known"
                                        : monthsSinceLastTest >= 3
                                        ? `Consider HIV test (${monthsSinceLastTest} months since last visit)`
                                        : ''
                                    }`
                                }
                            })
                        } 
                        options.push(this.toOption('HB'))
                        options.push(this.toOption('Syphilis'))
                        options.push(this.toOption('Malaria'))
                        options.push(this.toOption('Hepatitis B'))
                        options.push(this.toOption('Blood Group'))
                        const urine: Option = {
                            label: 'Urine',
                            value: 'Urine',
                            isChecked: false
                        }
                        if (this.riskOfPreclampsia === null) {
                            this.riskOfPreclampsia = await this.service.isAtRiskOfPreEclampsia()
                            if (this.riskOfPreclampsia) {
                                const ok: boolean = await alertConfirmation(
                                    'Select urine test to conduct urine protein test', {
                                    header: 'Client is at risk of pre-eclampsia.',
                                    cancelBtnLabel: 'Remind later',
                                    confirmBtnLabel: 'Select Urine Test'
                                })
                                urine.isChecked = ok
                            }
                        }
                        const finalOptions = [...options, urine]
                        return [...finalOptions, this.toOption('None')]
                    },
                    exitsForm: (f: any) => find(f.available_test_results, {label: 'None'}),
                }   
            }) (),
            {
                id: "hepatitis_b",
                type: FieldType.TT_SELECT,
                helpText: "Hepatitis B test results",
                validation: (v: Option) => Validation.required(v), 
                condition: (f: any) => f.available_test_results.map((v: Option) => v.value).includes('Hepatitis B'),
                computedValue: (v: Option) => {
                    return this.service.buildValueCoded('Hepatitis B Test Result', v.value)
                },
                options: () => {
                    return this.mapStrToOptions([
                        'Negative',
                        'Positive'
                    ])
                }
            },
            {
                id: 'hiv_status',
                helpText: 'HIV Test Result',
                type: FieldType.TT_SELECT,
                validation: (v: Option) => Validation.required(v),
                condition: (f: any) => f.available_test_results.map((v: Option) => v.value).includes('HIV'),
                computedValue: (v: Option) => this.service.buildValueCoded('HIV status', v.value),
                options: () => {
                    return this.mapStrToOptions([
                        'Negative',
                        'Positive',
                        'Inconclusive',
                        'Not done'
                    ])
                }
            },
            {
                id: 'on_art_1',
                helpText: 'Patient on ART',
                type: FieldType.TT_SELECT,
                validation: (v: Option) => Validation.required(v),
                condition: (f: any) => f.hiv_status.value === 'Positive',
                computedValue: (v: Option) => this.service.buildValueCoded('On Art', v.value),
                options: () => this.yesNoOptions()
            },
            {
                id: 'arv_number_1',
                helpText: 'ARV Number',
                type: FieldType.TT_TEXT,
                validation: (v: Option) => Validation.required(v),
                computedValue: (v: Option) => this.service.buildValueText('Art number', v.value),
                condition: (f: any) => f.on_art_1.value === 'Yes'
            },
            {
                id: 'recency_essay_1',
                helpText: 'Rapid Recency Essay - Asante Results',
                type: FieldType.TT_MULTIPLE_YES_NO,
                condition: (f: any) => f.hiv_status.value === 'Positive' && this.recencyEssayActivated,
                computedValue: (v: Option[]) => v ? v.map(d => this.service.buildValueCoded(d.label, d.value)) : null,                
                options: () => {
                    return [
                        this.toYesNoOption('Line 1. Control Line Present'),
                        this.toYesNoOption('Line 2. Positive Verification Line Present'),
                        this.toYesNoOption('Line 3. Long-term Line Present')
                    ]
                }
            },
            {
                id: 'hb_result',
                helpText: 'HB Test Result (g/dl)',
                type: FieldType.TT_NUMBER,
                validation: (v: Option) => this.validateSeries([
                    () => Validation.required(v),
                    () => Validation.isFloatingPointNumber(v),
                    () => Validation.rangeOf(v, 2, 16)
                ]),
                config: {
                    keypad: [
                        FLOAT_KEYPAD,
                        [
                            [ 'Delete' ]
                        ]
                    ]
                },
                computedValue: (v: Option) => this.service.buildValueNumber('HB Test Result', v.value),
                condition: (f: any) => f.available_test_results.map((v: Option) => v.value).includes('HB'),
            },
            {
                id: 'syphilis',
                helpText: 'Syphilis Test Result',
                type: FieldType.TT_SELECT,
                validation: (v: Option) => Validation.required(v),
                computedValue: (v: Option) => this.service.buildValueCoded('Syphilis Test Result', v.value),
                condition: (f: any) => f.available_test_results.map((v: Option) => v.value).includes('Syphilis'),
                options: () => {
                    return this.mapStrToOptions([
                        'Negative',
                        'Positive'
                    ])
                }
            },
            {
                id: 'malaria',
                helpText: 'Malaria Test Result',
                type: FieldType.TT_SELECT,
                validation: (v: Option) => Validation.required(v),
                condition: (f: any) => f.available_test_results.map((v: Option) => v.value).includes('Malaria'),
                computedValue: (v: Option) => this.service.buildValueCoded('Malaria Test Result', v.value),
                options: () => {
                    return this.mapStrToOptions([
                        'Negative',
                        'Positive'
                    ])
                }
            },
            {
                id: 'blood_group',
                helpText: 'Blood Group Test Result',
                type: FieldType.TT_SELECT,
                validation: (v: Option) => Validation.required(v),
                condition: (f: any) => f.available_test_results.map((v: Option) => v.value).includes('Blood Group'),
                computedValue: (v: Option) => this.service.buildValueText('Blood group', v.value),
                options: () => {
                    return this.mapStrToOptions([
                        "A+",
                        "A-",
                        "B+",
                        "B-",
                        "AB+",
                        "AB-",
                        "O+",
                        "O-"
                    ])
                }
            },
            {
                id: 'available_urine_tests',
                helpText: 'Available Urine Tests Results',
                type: FieldType.TT_MULTIPLE_SELECT,
                validation: (v: Option) => Validation.required(v),
                condition: (f: any) => f.available_test_results.map((v: Option) => v.value).includes('Urine'),
                options: () => {
                    return this.mapStrToOptions([
                        "Protein",
                        "Glucose",
                        "WBC",
                        "RBC",
                        "Nitrate"
                    ])
                },
                config: {
                    buildOptionsOnce: true
                }
            },
            {
                id: 'protein',
                helpText: 'Urine Protein Test Result',
                type: FieldType.TT_SELECT,
                validation: (v: Option) => Validation.required(v),
                condition: (f: any) => f.available_urine_tests.map((o: Option) => o.value).includes('Protein'),
                computedValue: (v: Option) => this.service.buildValueText('Urine protein', v.value),
                options: () => {
                    return this.mapStrToOptions([
                        "Negative",
                        "(+)",
                        "+",
                        "++",
                        "+++",
                        "++++",
                    ])
                }
            },
            {
                id: 'glucose',
                helpText: 'Glucose Test Result (mg/dl)',
                type: FieldType.TT_SELECT,
                validation: (v: Option) => Validation.required(v),
                condition: (f: any) => f.available_urine_tests.map((o: Option) => o.value).includes('Glucose'),
                computedValue: (v: Option) => this.service.buildValueText('Blood glucose', v.value),
                options: () => {
                    return this.mapStrToOptions([
                        "Normal",
                        "+",
                        "++",
                        "+++"
                    ])
                }
            },
            {
                id: 'wbc',
                helpText: 'White Blood Cells Test Result (cmm)',
                type: FieldType.TT_NUMBER,
                validation: (v: Option) => this.validateSeries([
                    () => Validation.required(v),
                    () => Validation.rangeOf(v, 1, 1000000)
                ]),
                computedValue: (v: Option) => this.service.buildValueNumber('White blood cells', v.value),
                condition: (f: any) => f.available_urine_tests.map((o: Option) => o.value).includes('WBC'),
            },
            {
                id: 'rbc',
                helpText: 'Red Blood Cells Test Result (cmm)',
                type: FieldType.TT_NUMBER,
                validation: (v: Option) => this.validateSeries([
                    () => Validation.required(v),
                    () => Validation.rangeOf(v, 1, 1000000)
                ]),
                computedValue: (v: Option) => this.service.buildValueNumber('Red blood cells', v.value),
                condition: (f: any) => f.available_urine_tests.map((o: Option) => o.value).includes('RBC'),
            },
            {
                id: 'nitrate',
                helpText: 'Nitrate Test Result',
                type: FieldType.TT_SELECT,
                validation: (v: Option) => Validation.required(v),
                computedValue: (v: Option) => this.service.buildValueCoded('Urine Nitrate Test', v.value),
                condition: (f: any) => f.available_urine_tests.map((o: Option) => o.value).includes('Nitrate'),
                options: () => {
                    return this.mapStrToOptions([
                        "Negative",
                        "Trace",
                        "Positive"
                    ])
                }
            }
        ]
    }
  }
})
</script>
