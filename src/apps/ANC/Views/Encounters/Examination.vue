<template>
  <ion-page> 
    <his-standard-form 
      :fields="fields"
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
import { AncExaminationService } from "@/apps/ANC/Services/anc_examination_service"
import { Field, Option } from '@/components/Forms/FieldInterface'
import Validation from "@/components/Forms/validations/StandardValidations"
import { IonPage } from "@ionic/vue"
import { ConceptService } from '@/services/concept_service'
import { isEmpty } from 'lodash'
import { alertConfirmation } from '@/utils/Alerts'
import { NUMBERS_WITH_UNKNOWN } from "@/components/Keyboard/HisKbConfigurations"
import { AncCurrentPregnancyService } from '../../Services/anc_current_pregnancy'

export default defineComponent({
  components: { IonPage },
  mixins: [EncounterMixinVue],
  data: () => ({
    service: {} as AncExaminationService,
    statusService: {} as AncCurrentPregnancyService,
    deliveryObs: undefined as undefined | Array<any>
  }),
  watch: {
    ready: {
      async handler(ready: boolean) {
        if (ready) {
            this.service = new AncExaminationService(this.patientID, this.providerID)
            await this.service.loadPregnancyStatus()
            this.fields = this.getFields() as Field[]
        } 
      },
      immediate: true
    }
  },
  methods: {
    async onFinish(_: any, computedData: any) {
      await this.service.createEncounter()
      await this.service.saveObservationList((await this.resolveObs(computedData)))
      if(this.deliveryObs?.length) {
        await this.statusService.createEncounter();
        await this.statusService.saveObservationList(await Promise.all(this.deliveryObs))
      }
      this.nextTask()
    },
    diagnosisOptions(onMap: (item: Option) => Option) {
        return [...ConceptService.getConceptsByCategory('anc_diagnosis'),{ name: 'None'}]
            .map((c: any) => (onMap({
                ...this.toOption(c.name), isChecked: false 
            })))
    },
    getFields() {
      return [
        {
          id: 'ultrasound',
          helpText: 'Ultrasound scan results available',
          type: FieldType.TT_SELECT,
          validation: (v: Option) => Validation.required(v),
          computedValue: (v: Option) => this.service.buildValueCoded(
            'Ultrasound', v.value
          ),
          options: () => this.yesNoOptions()
        },
        {
            id: 'multiple_gestation',
            helpText: 'Number of fetuses',
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            computedValue: (v: Option) => this.service.buildValueText(
                'Multiple gestation', v.value as string),
            condition: (f: any) => f.ultrasound.value === 'Yes',
            options: () => [
                { label: 'One', value: 1 },
                { label: 'Two', value: 2 },
                { label: 'Three', value: 3 },
                { label: 'Four', value: 4 },
                { label: 'Unknown', value: 'Unknown' }
            ]
        },
        {
            id: 'liquor',
            helpText: 'Liquor',
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            computedValue: (v: Option) => this.service.buildValueText(
                'LIQUOR', v.value as string),
            condition: (f: any) => f.ultrasound.value === 'Yes',
            options: () => this.mapStrToOptions([
                'Adequate',
                'Not adequate',
                'Unknown'
            ])
        },
        {
            id: 'lie',
            helpText: 'Lie',
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            computedValue: (v: Option) => this.service.buildValueText(
                'Lie', v.value as string),
            condition: (f: any) => f.ultrasound.value === 'Yes',
            options: () => this.mapStrToOptions([
                'Longitudinal',
                'Transverse',
                'Unknown'
            ])
        },
        {
            id: 'fetal_heart_movement_seen',
            helpText: 'Fetal heart movement seen',
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            computedValue: (v: Option) => this.service.buildValueCoded(
                'Fetal heart movement seen', v.value),
            condition: (f: any) => f.ultrasound.value === 'Yes',
            options: () => this.yesNoOptions()
        },
        {
            id: 'presentation',
            helpText: 'Presentation',
            type: FieldType.TT_GROUP_SELECTOR,
            validation: (v: Option) => this.validateSeries([
                () => Validation.required(v),
                () => {
                    /**
                     * Validate if Presentation's value is selected
                     */
                    if (v && !v.value) {
                        return [`Presentation cannot be Empty!`]
                    } 
                    return null
                },
                () => {
                    /**
                     * Validate if option has subgroup options but value is not selected
                     */
                    if (v && v?.other?.subGroupOptions && isEmpty(v?.other?.subGroupOptionValue)) {
                        return [`${v?.other?.subgroupTitle || 'Subgroup'} has no value selected`]
                    }
                    return null
                },
                () => {
                    /**
                     * Validate if the subgroup with Options has selected items
                     */
                    if (v && !isEmpty(v?.other?.subGroupOptionValue) 
                        && !isEmpty(v?.other?.subGroupOptionValue?.other?.options)
                        && !v?.other?.subGroupOptionValue?.value) {
                            return [`${v?.other?.subGroupOptionValue?.label}'s value isnt selected`]
                        }
                    return null
                }
            ]),
            computedValue: (v: Option) => {
                const obs = [this.service.buildValueText('Presentation', v.label)]
                if (v?.other?.subGroupOptionValue?.value) {
                    obs.push(this.service.buildValueText(
                        'Position', v?.other?.subGroupOptionValue?.value
                    ))
                }
                return obs
            },
            options: (f: any) => {
                const toOption = (label: string, value='',other={}) => ({
                    label, value, other
                })
                const subGroupOptions = [
                    toOption('Vertex', '', {
                        options: this.mapStrToOptions([
                            'Left Occipito Anterior',
                            'Left Occipito Transverse',
                            'Left Occipito Posterior',
                            'Right Occipito Anterior',
                            'Right Occipito Transverse',
                            'Right Occipito Posterior',
                            'Unknown'
                        ])
                    }),
                    this.toOption('Oblique'),
                    this.toOption('Transverse'),
                    this.toOption('Breech',{
                        options: this.mapStrToOptions([
                            'Left Sacro Anterior',
                            'Left Sacro Transverse',
                            'Left Sacro Posterior',
                            'Right Sacro Anterior',
                            'Right Sacro Transverse',
                            'Right Sacro Posterior',
                            'Unknown'
                        ])
                    }),
                    toOption('Face', '', {
                        concept: 'Position',
                        options: this.mapStrToOptions([
                            'Left Mento Anterior',
                            'Left Mento Transverse',
                            'Left Mento Posterior',
                            'Right Mento Anterior',
                            'Right Mento Transverse',
                            'Right Mento Posterior',
                            'Unknown'
                        ])
                    }),
                    toOption('Shoulder', '', {
                        options: this.mapStrToOptions([
                            'Left Acromion Dorsal Anterior',
                            'Left Acromion Dorsal Transverse',
                            'Left Acromion Dorsal Posterior',
                            'Right Acromion Dorsal Anterior',
                            'Right Acromion Dorsal Transverse',
                            'Right Acromion Dorsal Posterior',
                            'Unknown'
                        ])
                    })
                ]
                return f.presentation  ? f.presentation : [
                    toOption('Cephalic', '', {
                        subGroupOptions,
                        subgroupTitle: 'Cephalic Position',
                        options: this.mapStrToOptions([
                            'Right Occipito Anterior',
                            'Left Occipito Anterior',
                            'Unknown'
                        ])
                    }),
                    toOption('Breech', '', {
                        subGroupOptions,
                        subgroupTitle: 'Breech Position',
                        options: this.mapStrToOptions([
                            'Right Sacro Anterior',
                            'Left Sacro Anterior',
                            'Unknown'
                        ]),
                    }),
                    this.toOption('Ball'),
                    this.toOption('Nil palpable')
                ] as Option[]
            }
        },
        {
            id: 'enter_fundal_height',
            helpText: 'Fundal height (cm)',
            type: FieldType.TT_NUMBER,
            condition: () => this.service.gestationWeeks >= 12,
            dynamicHelpText: () => {
                const title = 'Fundal height (cm)'
                if (this.service.gestationWeeks) {
                    return `${title} (${this.service.gestationWeeks}wks/${this.service.getEquivalentFundalHeight(this.service.gestationWeeks)} cm)`
                }
                return title
            },
            beforeNext: async (v: Option, f: any) => {
                if (v && `${v.value}`.match(/unknown/i) && !['Nil palpable', 'Ball'].includes(f.presentation.value)) {
                    return alertConfirmation(`Do you want to proceed with Unknown Fundal height?`)
                }
                const expectedFundalHeight = this.service.expectedFundalHeightForGestationWeeks()
                const val = parseInt(v.value as string);
                if (this.service.gestationWeeks && (val < expectedFundalHeight || val > expectedFundalHeight)) {
                    const confirmed = await alertConfirmation(`
                        Fundal height is not equal to expected ${expectedFundalHeight} cm from gestation weeks of ${this.service.gestationWeeks}.
                        Are you sure about this value?`
                    );

                    if(!confirmed) return false 
                    if (this.service.isFirstVisit()) {
                        this.statusService = new AncCurrentPregnancyService(this.patientID, this.providerID);
                        const newGestationWeeks = this.service.getEquivalentFundalWeeks(val);
                        const lnmpDate = this.statusService.estimateLnmpDate(newGestationWeeks, this.service.date);
                        this.deliveryObs = this.statusService.buildDelieveryDateObs(lnmpDate);
                    }

                }
                return true
            },
            validation: (v: Option) => this.validateSeries([
                () => Validation.required(v),
                () => v && !`${v.value}`.match(/unknown/i) 
                    ? Validation.rangeOf(v, 10, 45) 
                    : null
            ]),
            computedValue: (v: Option) => {
                return v.value != 'Unknown' 
                    ? this.service.buildValueNumber('Fundus', v.value as number)
                    : this.service.buildObs('Fundus', {
                        'value_coded': v.value,
                        'value_numeric': 0
                    })
            },
            config: {
                keypad: NUMBERS_WITH_UNKNOWN
            }
        },
        {
            id: 'fetal_heart_beat',
            helpText: 'Fetal heart beat',
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            computedValue: (v: Option) => this.service.buildValueText(
                'Fetal Heart Beat', v.value as string),
            options: () => this.mapStrToOptions([
                'Heard',
                'Not heard'
            ])
        },
        {
            id: 'fetal_heart_rate',
            helpText: 'Fetal heart rate',
            type: FieldType.TT_NUMBER,
            validation: (v: Option) => Validation.required(v),
            beforeNext: async (v: Option) => {
                const min = 120
                const max = 140
                const val: string | number = v ? parseInt(v.value as string) : -1
                if (v && typeof val === 'number') {
                    if (val < min || val > max) {
                        const ok = await alertConfirmation(`
                            The value is out of Range of ${min} - ${max}.
                            Are you sure about this value?`
                        )
                        return ok ? true : false
                    }
                }
                return true
            },
            condition: (f: any) => f.fetal_heart_beat.value === 'Heard',
            computedValue: (v: Option) => {
                return v.value != 'Unknown'
                    ? this.service.buildValueNumber('Fetal heart movement seen', v.value as number)
                    : this.service.buildObs('Fetal heart movement seen', {
                        'value_numeric': 0, 'value_coded': v.value
                    })
            },
            config: {
                keypad: NUMBERS_WITH_UNKNOWN
            }
        },
        {
            id: 'enter_fetal_movement',
            helpText: 'Fetal movement heard',
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            computedValue: (v: Option) => this.service.buildValueCoded(
                'Fetal movement heard', `${v.value}`),
            options: () => this.yesNoOptions()
        },
        {
            id: 'fetal_movement_felt',
            helpText: 'Fetal movement felt',
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            condition: (f: any) => !['Ball', 'Nil palpable'].includes(f.presentation.label),
            computedValue: (v: Option) => this.service.buildValueCoded('Fetal movement felt', `${v.value}`),
            options: () => this.yesNoOptions()
        },
        {
            id: 'last_fmf',
            helpText: 'Last fetal movement felt (in Weeks)',
            type: FieldType.TT_NUMBER,
            validation: (v: Option) => Validation.validateSeries([
                () => Validation.required(v),
                () => Validation.rangeOf(v, 0, 42)
            ]),
            condition: (f: any) => f.fetal_movement_felt.value != 'Unknown',
            computedValue: (v: Option) => {
                return v.value != 'Unknown'
                    ? this.service.buildValueNumber('Last Fetal movement felt', v.value as number)
                    : this.service.buildObs('Last Fetal movement felt', {
                        'value_numeric': 0, 'value_coded': v.value
                    })
            },
            options: () => this.yesNoUnknownOptions()
        },
        {
            id: 'diagnosis',
            helpText: 'Diagnosis',
            type: FieldType.TT_MULTIPLE_SELECT,
            validation: (v: Option) => Validation.required(v),
            computedValue: (v: Option[]) => {
                if (v && v.map(d => d.value).includes('None')) {
                    return []
                }
                return v.map(d => this.service.buildValueCoded(d.label, 'Yes'))
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
            options: () => this.diagnosisOptions(o => o),
            config: {
                footerBtns: [
                    {
                        name: "None",
                        slot: "end",
                        onClickComponentEvents: {
                            refreshOptions: () => {
                                return this.diagnosisOptions(o => {
                                    o.isChecked = o.label === 'None'
                                    return o
                                })
                            }
                        },
                        onClick: () => 'None'
                    }
                ]
            }
        }
      ]
    }
  }
})
</script>
