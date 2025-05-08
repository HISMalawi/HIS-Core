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
import { AncObstericService } from "@/apps/ANC/Services/anc_obsteric_service"
import { Field, Option } from '@/components/Forms/FieldInterface'
import Validation from "@/components/Forms/validations/StandardValidations"
import { IonPage } from "@ionic/vue"
import { ObsValue } from '@/services/observation_service'
import { alertConfirmation } from '@/utils/Alerts'
import { getNumberOrdinal } from "@/utils/Strs"
import { isEmpty } from 'lodash'

export default defineComponent({
  components: { IonPage },
  mixins: [EncounterMixinVue],
  data: () => ({
    service: {} as any,
	delieveryOptionData: {} as any,
	abortionOptionData: {} as any
  }),
  watch: {
    ready: {
      async handler(ready: boolean) {
        if (ready) {
            this.service = new AncObstericService(this.patientID, this.providerID)
			await this.service.initData()
            this.fields = this.getFields()
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
      this.nextTask()
    },
	buildAbortionFields() {
		return [
			{
				label: 'Year of abortion',
				value: '',
				required: true,
				field: {
					id: 'year',
					helpText: 'Year of abortion',
					type: FieldType.TT_NUMBER,
					computedValue: (v: Option) => {
						return this.service.buildValueNumber('Year of abortion', v.value)
					},
					validation: (v: Option) => this.validateSeries([
						() => Validation.required(v),
						() => {
							const [minY] = this.patient.getBirthdate().split('-')
							const [maxY] = this.service.getDate().split('-')
							return Validation.rangeOf(v, minY, maxY)
						}
					])
				}
			},
			{
				label: 'Place of abortion',
				value: '',
				required: true,
				field: {
					id: 'place_of_abortion',
					helpText: 'Place of abortion',
					type: FieldType.TT_SELECT,
					computedValue: (v: Option) => {
						// concept taken as is from old anc system
						return this.service.buildValueText('Place of birth', v.value)
					},
					validation: (v: Option) => this.validateSeries([
						() => Validation.required(v)
					]),
					options: () => {
						return this.mapStrToOptions([
							"Health facility", 
							"In transit", 
							"TBA", 
							"Home", 
							"Other"
						])
					}
				}
			},
			{
				label: 'Type of abortion',
				value: '',
				required: true,
				field: {
					id: 'type_of_abortion',
					helpText: 'Type of abortion',
					type: FieldType.TT_SELECT,
					computedValue: (v: Option) => {
						return this.service.buildValueCoded('Type of Abortion', v.value)
					},
					validation: (v: Option) => this.validateSeries([
						() => Validation.required(v)
					]),
					options: () => {
						return this.mapStrToOptions([
							"Complete abortion", 
							"Incomplete abortion"
						])
					}
				}
			},
			{
				label: 'Procedure done',
				value: '',
				required: true,
				field: {
					id: 'procedure_done',
					helpText: 'Procedure done',
					type: FieldType.TT_SELECT,
					validation: (v: Option) => this.validateSeries([
						() => Validation.required(v)
					]),
					computedValue: (v: Option) => {
						return this.service.buildValueText('Procedure done', v.value)
					},
					options: () => {
						return this.mapStrToOptions([
							"Manual Vacuum Aspiration (MVA)", 
							"Evacuation", 
							"None"
						])
					}
				}
			},
			{
				label: 'Gestation (weeks)',
				value: '',
				required: true,
				field: {
					id: 'gestation_weeks',
					helpText: 'Gestation (weeks)',
					type: FieldType.TT_NUMBER,
					computedValue: (v: Option) => {
						return this.service.buildValueNumber('Gestation', v.value)
					},
					validation: (v: Option) => this.validateSeries([
						() => Validation.required(v),
						() => Validation.rangeOf(v, 0, 28)
					])
				}
			}
		]
	},
	buildBirthDelieveryFields() {
		return [
			{
				label: 'Year of birth',
				value: '',
				required: true,
				field: {
					id: 'year',
					helpText: 'Year of birth',
					type: FieldType.TT_NUMBER,
					computedValue: (v: Option) => {
						return this.service.buildValueNumber('Year of Birth', v.value)
					},
					validation: (v: Option) => this.validateSeries([
						() => Validation.required(v),
						() => {
							const [minY] = this.patient.getBirthdate().split('-')
							const [maxY] = this.service.getDate().split('-')
							return Validation.rangeOf(v, minY, maxY) 
						}
					])
				}
			},
			{
				label: 'Place of birth',
				value: '',
				required: true,
				field: {
					id: 'place_of_birth',
					helpText: 'Place of birth',
					type: FieldType.TT_SELECT,
					computedValue: (v: Option) => {
						return this.service.buildValueText('Place of birth', v.value)
					},
					validation: (v: Option) => Validation.required(v), 
					options: () => {
						return this.mapStrToOptions([
							"Health facility", 
							"In transit", 
							"TBA", 
							"Home"
						])
					}
				}
			},
			{
				label: 'Gestation (weeks)',
				value: '',
				required: true,
				field: {
					id: 'gestation_weeks',
					helpText: 'Gestation (weeks)',
					type: FieldType.TT_NUMBER,
					computedValue: (v: Option) => {
						return this.service.buildValueNumber('Gestation', v.value)
					},
					validation: (v: Option) => this.validateSeries([
						() => Validation.required(v),
						() => Validation.rangeOf(v, 24, 42)
					])
				}
			},
			{
				label: 'Method of delivery',
				value: '',
				required: true,
				field: {
					id: 'method_of_delivery',
					helpText: 'Method of delivery',
					type: FieldType.TT_SELECT,
					computedValue: (v: Option) => {
						return this.service.buildValueText('Method of delivery', v.value)
					},
					validation: (v: Option) => Validation.required(v),
					options: () => {
						return this.mapStrToOptions([
							"Spontaneous Vertex", 
							"Caesarean Section", 
							"Vacuum extraction delivery", 
							"Breech", 
							"Forceps", 
							"Others"
						])
					}
				}
			},
			{
				label: 'Condition at birth',
				value: '',
				required: true,
				field: {
					id: 'condition_at_birth',
					helpText: 'Condition at birth',
					type: FieldType.TT_SELECT,
					computedValue: (v: Option) => {
						return this.service.buildValueText('Condition at Birth', v.value)
					},
					onValueUpdate: (v: Option, rowItems: any) => {
						rowItems.forEach((i: any) => {
							if (i.label === 'Alive now') {
								i.required = v.value === 'Alive'
								i.disabled = v.value != 'Alive'
							}
						})
					},
					validation: (v: Option) => Validation.required(v),
					options: () => {
						return this.mapStrToOptions([
							"Alive", 
							"Macerated Still Birth (MSB)", 
							"Fresh Still Birth (FSB)"
						])
					}
				}
			},
			{
				label: 'Birth weight',
				value: '',
				required: true,
				field: {
					id: 'birth_weight',
					helpText: 'Birth weight',
					type: FieldType.TT_TEXT,
					computedValue: (v: Option) => {
						return this.service.buildValueText('Birth weight', v.value)
					},
					validation: (v: Option) => this.validateSeries([
						() => Validation.required(v),
						() => {
							if (v.value != 'Unknown' && !(`${v.value}`.match(/^\d{1,3}\.\d{1,5}$/))) {
								return [`Invalid weight ${v.value}. Don't forget decimal point`]
							}
							return null
						},
						() => !['N/A', 'Unknown'].includes(`${v.value}`) 
							? Validation.rangeOf(v, 1, 5) 
							: null,
					]),
					config: {
						customKeyboard: [
							[
								['1', '2', '3'],
								['4', '5', '6'],
								['7', '8', '9'],
								['', '0', '.']
							],
							[
								['Unknown', 'Delete']
							]
						],
						onUnknownEstimateField: () => { 
							return {
								id: 'birth_weight_estimate',
								helpText: 'Birth weight estimate',
								type: FieldType.TT_SELECT,
								validation: (v: Option) => Validation.required(v),
								options: () => {
									return this.mapOptions([
										'Normal',
										'Big baby',
										'Small baby'
									])
								}
							}
						},
						noChars: false
					}
				}
			},
			{
				label: 'Alive now',
				value: '',
				disabled: true,
				required: false,
				field: {
					id: 'alive_now',
					helpText: 'Alive now',
					type: FieldType.TT_SELECT,
					computedValue: (v: Option) => {
						return this.service.buildValueCoded('Alive', v.value)
					},
					onValueUpdate: (v: Option, rowItems: any) => {
						rowItems.forEach((i: any) => {
							if (i.label === 'Age at death') {
								i.required = v.value === 'No'
								i.disabled = v.value === 'Yes'
							}
						})
					},
					validation: (v: Option) => this.validateSeries([
						() => Validation.required(v)
					]),
					options: () => {
						return this.yesNoOptions()
					}
				}
			},
			{
				label: 'Age at death',
				value: '',
				disabled: true,
				required: false,
				field: {
					id: 'age_at_death',
					helpText: 'Age at death',
					type: FieldType.TT_AGE_INPUT,
					computedValue: (v: Option) => {
						return this.service.buildValueText('Age at Death', v.value)
					},
					validation: (v: Option) => this.validateSeries([
						() => Validation.required(v)
					])
				}
			}
		]
	},
	constructOptionData(obj: Record<number, any>, elementCount: number|string, defaultValue: any) {
		const count = parseInt(`${elementCount}`)
		const objCopy: any = {...obj}
		Object.keys(objCopy).forEach((i) => {
			if ((parseInt(i)+1) > count) delete objCopy[i]
		})
		for(let i=0; i < count; ++i) {
			if (!objCopy[i]) objCopy[i] = defaultValue
		}
		return objCopy
	},
    getFields(): Field[] {
        return [
			{
				id: 'gravida',
				helpText: 'Gravida',
				type: FieldType.TT_NUMBER,
				defaultValue: () => this.service.nextGravida > 0 ? this.service.nextGravida : null,
				beforeNext: async (v: Option) => {
					const gravida = parseInt(`${v.value}`)
					if (gravida <= 1) {
						this.abortionOptionData = {}
						this.delieveryOptionData = {}	
					}
					if (gravida > 9) {
						if (!(await alertConfirmation(
							'The value is greater than maximum 9. Are you sure about this value?'
							))) {
							return false
						}
					}
					return true
				},
				computedValue: (v: Option) => this.service.buildValueNumber('Gravida', v.value),
				validation: (v: Option) => this.validateSeries([
					() => Validation.required(v),
					() => Validation.rangeOf(v, this.service.nextGravida || 1, 19)
				])
			},
			{
				id: 'para',
				helpText: 'Para',
				type: FieldType.TT_NUMBER,
				beforeNext: (v: Option, f: any) => {
					this.delieveryOptionData = this.constructOptionData(
						this.delieveryOptionData, 
						v.value,
						{})
					const abortionCount = (parseInt(`${f.gravida.value}`) - parseInt(`${v.value}`)) - 1
					this.abortionOptionData = this.constructOptionData(
						this.abortionOptionData, 
						abortionCount,
						this.buildAbortionFields()
					)
					return true
				},
				condition: (f: any) => f.gravida.value > 1,
				computedValue: (v: Option) => this.service.buildValueNumber('Parity', v.value), 
				validation: (v: Option, f: any) => this.validateSeries([
					() => Validation.required(v),
					() => Validation.rangeOf(v, this.service.para, f.gravida.value - 1)
				])
			},
			{
				id: 'known_pregnancies',
				helpText: 'Pregnancies with available information',
				type: FieldType.TT_ANC_PREGNANCY_INPUT_CONFIG,
				onValue: (val: Option[]) => {
					val.forEach((o: Option, i) => {
						if (!o.isChecked) {
							this.delieveryOptionData[i] = {}
							return
						}
						this.delieveryOptionData[i] = this.constructOptionData(
							this.delieveryOptionData[i], 
							o.value,
							this.buildBirthDelieveryFields()
						)
					})
					return true
				},
				condition: (f: any) => f.gravida.value > 1 && f.para.value > 0,
				options: (f: any) => {
					return Object.keys(this.delieveryOptionData).map((i: any) => {
						const num = parseInt(i) + 1
						return {
							label: `${num} <sup>${getNumberOrdinal(num)}</sup>`,
							value: Object.keys(this.delieveryOptionData[i]).length||1,
							isChecked: (f.known_pregnancies||[]).length 
								? !isEmpty(this.delieveryOptionData[i])
								: true
						}
					})
				},
				config: {
					hiddenFooterBtns: ['Clear'],
					pregnancyCount: (f: any) => f.para.value
				}
			},
			(() => {
				const toPregnancyDetailObs = (data: Option[]) => {
					return data.map((i: any) => i.other.data)
						.flat(2)
						.filter((i: any) => {
							if (i.required && !`${i.value}`.length) {
								return false
							} else if (!i.required) {
								return false
							}
							return true
						})
						.map((i: any) => {
							return typeof i.field?.computedValue === 'function' 
								? i.field?.computedValue(i.value)
								: undefined
						})
				} 
				return {
					id: 'pregnancy_details',
					helpText: 'Pregnancy details',
					type: FieldType.TT_ANC_PREGNANCY_DETAILS_INPUT,
					condition: (f: any) => {
						const abortionCount = (parseInt(`${f.gravida.value}`) - parseInt(`${f.para.value}`)) - 1
						return f.gravida.value > 1 && (abortionCount >= 1 || f.known_pregnancies.some((p: Option) => p.isChecked))
					},
					validation: (v: Option[]) => this.validateSeries([
						() => Validation.required(v),
						() => {
							const isset = v.map((i: any) => i.other.data)
								.flat(2)
								.every((i: any) => {
									if (typeof i.required === 'boolean' && i.required && !`${i.value}`.length) {
										return false
									}
									return true
								})
							return !isset ? ['Pregnancy details incomplete'] : null
						}
					]),
					config: {
						hiddenFooterBtns: ['Clear']
					},
					onValue: (data: Option[]) => {
						data.forEach((i: any) => {
							switch(i.other.type) {
								case 'delieveryOptionData':
									this.delieveryOptionData[i.other.index] = i.other.data 
									break;
								case 'abortionOptionData':
									this.abortionOptionData[i.other.index] = i.other.data[0]
									break;
							}
						})
					},
					computedValue: (v: Option[]) => toPregnancyDetailObs(v).filter((d) => d),
					options: () => {
						const data: Option[] = []
						Object.keys(this.delieveryOptionData).forEach((k: any) => {
							if (isEmpty(this.delieveryOptionData[k])) return
							const num = parseInt(k)+1
							const option: any = {
								label: `${num} <sup>${getNumberOrdinal(num)}</sup> delivery`, 
								value: -1,
								other: {
									type: 'delieveryOptionData', 
									index: k,
									data: [], 
									rowTitles: []
								}
							}
							Object.keys(this.delieveryOptionData[k]).forEach((i: any) => {
								const count = parseInt(i) + 1
								option.other.rowTitles.push(`${count}<sup>${getNumberOrdinal(count)}</sup> born in ${option.label} pregnancy`)
								option.other.data.push(this.delieveryOptionData[k][i])
							})
							data.push(option)
						})
						Object.keys(this.abortionOptionData).forEach((k: any) => {
							const num = parseInt(k) + 1
							data.push({
								label: `${num} <sup>${getNumberOrdinal(num)}</sup> abortion`,
								value: -1,
								other: {
									type: 'abortionOptionData',
									index: k,
									data: [this.abortionOptionData[k]]
								}
							})
						})
						return data
					}
				}
			})(),
			{
				id: 'previous_complications',
				helpText: 'Previous complications',
				type: FieldType.TT_MULTI_SELECT_GRID,
				condition: (f: any) => f.gravida.value > 1,
				validation: (v: Option[]) => this.validateSeries([
					() => Validation.required(v),
					() => {
						const hasMissingValues = v.map(v => v.value==='').some(Boolean)
						return hasMissingValues 
							? ['Please complete Complication selection!!'] 
							: null
					}
				]),
				computedValue: (v: Option[]) => {
					return v.filter(d => d.value != '')
						.map(d => this.service.buildValueCoded(d.label, d.value))
				},
				config: {
					hiddenFooterBtns: ['Clear']
				},
				options: () => {
					return [
						{ 
							label: 'Episiotomy', 
							value: '',
							other: {
								options: this.yesNoOptions()
							}
						},
						{ 
							label: 'Hemorrhage', 
							value: '',
							other: {
								options: this.mapStrToOptions([
									'No',
									'APH',
									'PPH'
								])
							}
						},
						{ 
							label: 'Pre-eclampsia', 
							value: '',
							other: {
								onClick: (option: Option, listData: Option[]) => {
									listData.forEach(l => {
										if (l.label === 'Eclampsia') {
											l.other.visible = option.value === 'Yes'
										}
									})
								},
								options: this.yesNoOptions()
							}
						},
						{
							label: 'Eclampsia',
							value: '',
							other: {
								visible: false,
								options: this.yesNoOptions()
							}
						}
					]
				}
			}
        ]
    }
  }
})
</script>
