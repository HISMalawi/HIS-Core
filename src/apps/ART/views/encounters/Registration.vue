<template>
    <his-standard-form :cancelDestinationPath="cancelDestination" :fields="fields" :onFinishAction="onSubmit"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Option } from "@/components/Forms/FieldInterface"
import Validation from "@/components/Forms/validations/StandardValidations"
import StagingMixin from "@/apps/ART/views/encounters/StagingMixin.vue"
import {ClinicRegistrationService} from "@/apps/ART/services/registration_service"
import { CD4_COUNT_PAD_LO } from "@/components/Keyboard/KbLayouts"
import { toastWarning, toastSuccess} from "@/utils/Alerts"
import { VitalsService } from "@/apps/ART/services/vitals_service";
import { BMIService } from "@/services/bmi_service"
import { generateDateFields, EstimationFieldType } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import { infoActionSheet } from "@/utils/ActionSheets"
import HisDate from "@/utils/Date"
import dayjs from "dayjs";
import { isEmpty } from 'lodash'
import Person from "@/utils/HisFormHelpers/PersonFieldHelper"
import { PatientRegistrationService } from '@/services/patient_registration_service'
import Store from "@/composables/ApiStore"

export default defineComponent({
    mixins: [StagingMixin],
    data: () => ({
        registration: {} as any,
        prescription: {} as any,
        dispensation: {} as any,
        regimens: [] as Option[],
        customRegimens: [] as Option[],
        vitals: {} as any,
    }),
    watch: {
        ready: {
            async handler(ready: any) {
                if (!ready) return
                // Hide staging fields defined in StagingMixin by Default
                this.canShowStagingFields = false
                this.registration = new ClinicRegistrationService(this.patientID, this.providerID)
                this.vitals = new VitalsService(this.patientID, this.providerID)
                this.showStagingWeightChart = false
                this.fields = this.getRegistrationFields()
            },
            immediate: true
        }
    },
    methods: {
        async onSubmit(formData: any, computedData: any) {
            const fObs = {...computedData}

            await this.registration.createEncounter()

            if (this.hasStaging(formData)) {
                await this.submitStaging(computedData)
                await this.vitals.createEncounter()
                await this.vitals.saveObservationList(
                    (await this.resolveObs(fObs, 'vitals'))
                )
            }

            await this.registration.saveObservationList(
                (await this.resolveObs(fObs, 'reg'))
            )

            if (formData?.cell_phone_number?.value) {
                const person = new PatientRegistrationService()
                person.setPersonID(this.patientID) 
                await person.updatePerson(
                    Person.resolvePerson(computedData)
                )
                Store.invalidate('ACTIVE_PATIENT')
            }

            toastSuccess('Clinic registration complete!')

            this.nextTask()
        },
        buildDateObs(conceptName: string, date: string, isEstimate: boolean) {
            let obs = {}
            if (date.match(/unknown/i)) {
                obs = this.registration.buildValueText(conceptName, 'Unknown')
            } else if (isEstimate) {
                obs = this.registration.buildValueDateEstimated(conceptName, date)
            } else {
                obs = this.registration.buildValueDate(conceptName, date)
            }
            return obs
        },
        getRegistrationFields() {
            return [
                {
                    id: 'followup_agreement',
                    helpText: 'Agrees to follow-up',
                    type: FieldType.TT_MULTIPLE_YES_NO,
                    summaryMapValue: ({value, label}: Option) => ({
                        value,
                        label: `${label} followup`
                    }),
                    validation: (v: any) => this.validateSeries([
                       () => Validation.required(v), 
                       () => Validation.anyEmpty(v)
                    ]),
                    computedValue: (d: Array<Option>) => {
                        const obs: any = []
                        d.forEach(({ label, value }: Option) => {
                            obs.push(this.registration.buildValueCoded(label, value))
                            obs.push(this.registration.buildValueCoded('Agrees to followup', label))
                        })
                        return { tag:'reg', obs }
                    },
                    options: (f: any) => {
                        if (!isEmpty(f.followup_agreement)) {
                            return f.followup_agreement
                        } else {
                            return [
                                {
                                    label: 'Phone',
                                    value: '',
                                    other: {
                                        values: this.yesNoOptions(),
                                    }
                                },
                                {
                                    label: 'Home visit',
                                    value: '',
                                    other: {
                                        values: this.yesNoOptions()
                                    }
                                }
                            ] 
                        }
                    }
                },
                (() => {
                    return {
                        ...Person.getCellNumberField(),
                        config: {
                            customKeyboard: [
                                [
                                    ['1', '2', '3'],
                                    ['4', '5', '6'],
                                    ['7', '8', '9'],
                                    ['',  '0', '']
                                ],
                                [ 
                                    [ '+265', '/'],
                                    [ 'Delete' ]
                                ]
                            ]
                        },
                        condition: (f: any) => {
                            const phone = this.patient.getPhoneNumber()
                            return f.followup_agreement.some((l: any) =>
                                l.label === 'Phone' && 
                                l.value === 'Yes' && 
                                (!phone || /unknown|n\/a/i.test(phone))
                            )
                        }
                    }
                })(),
                {
                    id: "has_linkage_code",
                    helpText: 'HTS Linkage number confirmation',
                    type: FieldType.TT_YES_NO,
                    summaryMapValue: (v: any) => {
                        return {
                            label: "Has HTS Linkage number?",
                            value: v
                        }
                    },
                    validation: (v: string) => Validation.required(v),
                    options: () => [
                        {
                            label: "Does client have an HTS Linkage number?",
                            value: "",
                            values: this.yesNoOptions(),
                        }
                    ]
                },
                {
                    id: 'hts_serial_number',
                    helpText: 'HTS Linkage Number',
                    type: FieldType.TT_LINKAGE_CODE,
                    validation: (v: Option) => Validation.validateSeries([
                        () => Validation.required(v),
                        () => {
                            if (!v?.other?.isValidLinkageCode) {
                                return ['Invalid Scanform linkage code']
                            }
                            return null
                        }
                    ]),
                    condition: (f: any) => f.has_linkage_code === 'Yes',
                    computedValue: (v: Option) => {
                        return {
                            tag: 'reg',
                            obs: this.registration.buildValueText('HTC Serial number', v.value)
                        }
                    }
                },
                {
                    id: 'received_arvs',
                    helpText: 'Ever received ARVs for treatment or prophylaxis?',
                    type: FieldType.TT_SELECT,
                    computedValue: ({value}: Option) => ({
                        tag:'reg',
                        obs: this.registration.buildValueCoded(
                            'Ever received ART', value
                        )
                    }),
                    validation: (v: any) => Validation.required(v),
                    options: () => this.yesNoOptions()
                },
                ...generateDateFields({
                    id: 'date_last_taken_arvs',
                    helpText: 'Last taken ARVS',
                    required: true,
                    minDate: () => this.patient.getBirthdate(),
                    maxDate: () => this.staging.getDate(),
                    condition: (f: any) => f.received_arvs.value === 'Yes',
                    estimation: {
                        allowUnknown: true
                    },
                    computeValue: (date: string, isEstimate: boolean) => {
                        return {
                            date,
                            tag:'reg',
                            isEstimate,
                            obs: this.buildDateObs('Date ART last taken', date, isEstimate) 
                        }
                    }
                }),
                {
                    id: 'taken_art_in_last_two_months',
                    helpText: 'Taken ARVs in the last two months?',
                    type: FieldType.TT_SELECT,
                    validation: (v: any) => Validation.required(v),
                    computedValue: ({value}: Option) => {
                        return {
                            tag:'reg',
                            obs: [
                                this.registration.buildValueCoded(
                                    'Has the patient taken ART in the last two months', value
                                )
                            ]
                        }
                    },
                    options: () => this.yesNoUnknownOptions(),
                    condition: (f: any) => f.year_date_last_taken_arvs.value === 'Unknown'
                },
                {
                    id: 'taken_art_in_last_two_weeks',
                    helpText: "Taken ARV's in the last two weeks?",
                    type: FieldType.TT_SELECT,
                    computedValue: ({ value }: Option, f: any) => {
                        let date = ''
                        const obs = []
                        let duration = -1

                        if (value === 'Yes') {
                            duration = 14
                        } else if (f.taken_art_in_last_two_months.value === 'Yes') {
                            duration = 60
                        }

                        if (duration > 0) {
                            date = HisDate.getDateBeforeByDays(this.registration.getDate(), duration)
                            obs.push(this.registration.buildValueDateEstimated('Date ART last taken', date))
                        }
                        return {
                            date,
                            tag:'reg',
                            obs: [
                                ...obs,
                                this.registration.buildValueCoded(
                                    'Has the patient taken ART in the last two weeks', value
                                )
                            ]
                        }
                    },
                    validation: (v: any) => Validation.required(v),
                    condition: (f: any) => f.taken_art_in_last_two_months.value === 'Yes',
                    options: () => this.yesNoUnknownOptions()
                },
                {
                    id: 'ever_registered_at_art_clinic',
                    helpText: 'Ever registered at an ART clinic?',
                    type: FieldType.TT_SELECT,
                    computedValue: ({ value }: Option) => ({
                        tag:'reg',
                        obs: this.registration.buildValueCoded(
                            'Ever registered at ART clinic', value
                        )
                    }),
                    validation: (v: any) => Validation.required(v),
                    condition: (f: any) => f.received_arvs.value === 'Yes',
                    options: () => this.yesNoOptions()
                },
                {
                    id: 'location_of_art_initialization',
                    helpText: 'Location of ART initiation',
                    type: FieldType.TT_SELECT,
                    computedValue: ({label}: Option) => ({
                        tag:'reg',
                        obs: this.registration.buildValueText(
                            'Location of ART initiation', label
                        )
                    }),
                    validation: (val: any) => Validation.required(val),
                    condition: (f: any) => f.ever_registered_at_art_clinic.value === 'Yes',
                    options: (_: any, filter='') => this.getFacilities(filter),
                    config: {
                        showKeyboard: true,
                        isFilterDataViaApi: true
                    }
                },
                ...generateDateFields({
                    id: 'date_started_art',
                    helpText: 'Started ART',
                    required: true,
                    init: async () => {
                        await this.initStaging(this.patient)
                        return true
                    },
                    beforeNext: (date: string) => {
                        const age = dayjs(date).diff(this.patient.getBirthdate(), 'years')
                        this.staging.setAge(age)
                        this.stagingFacts.age = age
                        this.stagingFacts.ageInMonths = age * 12
                        return true
                    },
                    condition: (f: any) => f.ever_registered_at_art_clinic.value === 'Yes',
                    minDate: () => this.patient.getBirthdate(),
                    maxDate: () => this.staging.getDate(),
                    estimation: {
                        allowUnknown: true,
                        estimationFieldType: EstimationFieldType.MONTH_ESTIMATE_FIELD
                    },
                    computeValue: (date: string, isEstimate: boolean) => {
                        this.staging.setDate(date)
                        this.vitals.setDate(date)
                        return {
                            date,
                            tag:'reg',
                            isEstimate,
                            obs: this.buildDateObs('Date ART started', date, isEstimate) 
                        }
                    },
                }),
                {
                    id: 'previous_art_number',
                    helpText: 'ART number at previous location',
                    type: FieldType.TT_TEXT,
                    condition: (f: any) => f.ever_registered_at_art_clinic.value === 'Yes',
                    computedValue: (d: Option) => ({
                        tag:'reg',
                        obs: this.registration.buildValueText(
                            'ART number at previous location', d.value
                        )
                    }),
                    validation: (val: Option) => Validation.required(val)
                },
                {
                    id: 'has_transfer_letter',
                    helpText: 'Has staging information?',
                    type: FieldType.TT_SELECT,
                    validation: (v: any) => Validation.required(v),
                    computedValue: ({ value }: Option) => ({
                        tag:'reg',
                        obs: this.registration.buildValueCoded(
                            'Has transfer letter', value
                        )
                    }),
                    options: () => this.yesNoOptions(),
                    condition: (f: any) => f.ever_registered_at_art_clinic.value === 'Yes',
                },
                {
                    id: 'height',
                    helpText: 'Height (CM)',
                    type: FieldType.TT_NUMBER,
                    condition: (f: any) => f.has_transfer_letter.value === 'Yes',
                    computedValue: ({ value }: Option) => ({
                        tag:'vitals',
                        obs: this.vitals.buildValueNumber('Height', value)
                    }),
                    validation: (val: any) => this.validateSeries([
                        () => Validation.required(val),
                        () => Validation.isNumber(val),
                        () => Validation.rangeOf(val, 40, 222)
                    ])
                },
                {
                    id: 'weight',
                    helpText: 'Weight (Kg)',
                    type: FieldType.TT_TEXT,
                    unload: async (d: any, s: string, f: any) => {
                        const weight = f.weight.value
                        const height = f.height.value
                        const bmi = await BMIService.getBMI(
                            weight, height, 
                            this.patient.getGender(),
                            this.patient.getAge()
                        )

                        this.stagingFacts.bmi = bmi['index']

                        if (!this.staging.isPedaid()) return

                        const medianWh = await this.patient.getMedianWeightHeight()

                        try {
                            //TODO: this calculation is already defined in patient_service.. must refactor it to make it reusable here
                            this.stagingFacts.weightPercentile = parseFloat(weight) / (parseFloat(medianWh["weight"])) * 100
                        } catch (e) {
                            this.stagingFacts.weightPercentile = 0
                        }
                    },
                    computedValue: ({ value }: Option) => ({
                        tag:'vitals',
                        obs: this.vitals.buildValueNumber('weight', value)
                    }),
                    condition: (f: any) => f.has_transfer_letter.value === 'Yes',
                    validation: (val: any) => this.validateSeries([
                        () => {
                            const fullValue = {
                                ...val, other: { modifier: '.' }
                            }
                            return this.vitals.isNotEmptyandFloat(fullValue)
                        },
                        () => Validation.rangeOf(val, 1, 300)
                    ]),
                    config: {
                        customKeyboard: [
                            [
                                ['1', '2', '3', ''],
                                ['4', '5', '6', ''],
                                ['7', '8', '9', '.'],
                                ['',  '0', '' , '']
                            ],
                            [
                                ['Delete']
                            ]
                        ]
                    }
                },
                /*** 
                    Start Staging Fields
                ***/
                ...this.getStagingFields(),
                /** 
                    End Staging Fields
                ***/
                {
                    id: 'new_cd4_percent_available',
                    helpText: 'CD4 percent available',
                    type: FieldType.TT_SELECT,
                    options: () => this.yesNoOptions(),
                    condition: (f: any) => f.has_transfer_letter.value === 'Yes',
                    validation: (val: any) => Validation.required(val)
                },
                {
                    id: 'cd4_percent',
                    helpText: 'CD4 Percent',
                    type: FieldType.TT_TEXT,
                    condition: (f: any) => f.new_cd4_percent_available.value === 'Yes',
                    computedValue: ({ value }: Option) => ({
                        tag:'staging',
                        obs: this.registration.buildValueNumber(
                            'CD4 percent', parseInt(value.toString().substring(1)), '%'
                        )
                    }),
                    onValue: (d: Option) => {
                        if (d.value && !this.staging.cd4CountIsValid(d.value)) {
                            toastWarning('Cd4 percentage invalid. Use one modifier or start with either of these symbols: >, < or =')
                            return false
                        }
                        return true
                    },
                    validation: (val: any) => Validation.required(val),
                    config: {
                        customKeyboard: [
                            CD4_COUNT_PAD_LO,
                            [
                                ['Delete']
                            ]
                        ]
                    }
                },
                {
                    id: 'type_of_confirmatory_hiv_test',
                    helpText: 'Confirmatory HIV test',
                    type: FieldType.TT_SELECT,
                    beforeNext: (v: Option) => {
                        this.stagingFacts.testType = `${v.value}`
                        return true
                    },
                    validation: (val: any) => Validation.required(val),
                    onValue: async (val: Option) => {
                        if (val.value === 'Not done') {
                            await infoActionSheet(
                                'Reminder',
                                'UNKNOWN HIV CONFIRMATORY TEST',
                                'Please arrange for a confirmatory test',
                                [
                                    { name: 'Agreed', color: 'success', slot: 'start'}
                                ]
                            )
                        }
                        return true
                    },
                    computedValue: ({ value }: Option) => ({
                        tag:'reg',
                        obs: this.registration.buildValueCoded(
                            'Confirmatory hiv test type', value
                        )
                    }),
                    options: (f: any) => ([
                        { label: 'Rapid antibody test', value: 'HIV rapid test'},
                        { label: 'DNA PCR', value: 'HIV DNA polymerase chain reaction'},
                        { label: 'Not done', value: 'Not done', disabled: f.has_linkage_code === 'Yes' }
                    ])
                },
                {
                    id: 'confirmatory_hiv_test_location',
                    helpText: 'Location of confirmatory HIV test',
                    type: FieldType.TT_SELECT,
                    defaultValue: (d: any) => (d.ever_registered_at_art_clinic && d.ever_registered_at_art_clinic.value) === "Yes"? '' : ClinicRegistrationService.getLocationName(),
                    computedValue: (d: Option) => ({
                        tag:'reg',
                        obs: this.registration.buildValueText(
                            'Confirmatory HIV test location', d.label
                        ) 
                    }),
                    validation: (val: any) => Validation.required(val),
                    condition: (f: any) => f.type_of_confirmatory_hiv_test.value != 'Not done',
                    options: (_: any, filter='') => this.getFacilities(filter),
                    config: {
                        showKeyboard: true,
                        isFilterDataViaApi: true
                    }
                },
                ...generateDateFields({
                    id: 'date_of_confirmatory_hiv_test',
                    helpText: 'Confirmatory HIV test',
                    beforeNext: async (date: string, formData: any) => {
                        if (formData.received_arvs.value != 'Yes') {
                            const timeElapsed = dayjs(this.staging.getDate()).diff(date, 'days')
                            if (timeElapsed >= 20) {
                                const action = await infoActionSheet(
                                    'Data inconsistency warning',
                                    `Confirmatory Date for newly initiated ART patient is ${timeElapsed} days ago`,
                                    'Are you sure this is accurate?',
                                    [
                                        { name: 'No, Re-enter date', slot: 'start', color: 'success'},
                                        { name: 'Yes, its accurate', slot: 'end', color: 'danger'}
                                    ]
                                )
                                return action === 'Yes, its accurate'
                            }
                        }
                        return true
                    },
                    condition: (f: any) => f.confirmatory_hiv_test_location.value,
                    required: true,
                    minDate: () => this.patient.getBirthdate(),
                    maxDate: () => this.staging.getDate(),
                    estimation: {
                        allowUnknown: true,
                        estimationFieldType: EstimationFieldType.MONTH_ESTIMATE_FIELD
                    },
                    computeValue: (date: string, isEstimate: boolean) => {
                        return {
                            date,
                            tag:'reg',
                            isEstimate,
                            obs: this.buildDateObs('Confirmatory HIV test date', date, isEstimate) 
                        }
                    },
                }),
                this.getStagingSummaryField('Staging summary')
            ]
        }
    }
})
</script>
