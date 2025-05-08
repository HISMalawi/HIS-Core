<template>
    <his-standard-form :cancelDestinationPath="cancelDestination" :fields="fields" :onFinishAction="onSubmit" />
</template>

<script lang="ts">
import { defineComponent} from 'vue'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import EncounterMixinVue from '@/views/EncounterMixin.vue';
import { PatientVisitRegistrationService } from "@/apps/AETC/services/patient_registration_service"
import Validation from '@/components/Forms/validations/StandardValidations';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { getFacilities } from '@/utils/HisFormHelpers/LocationFieldOptions';
import { toastWarning } from '@/utils/Alerts';
import { Patientservice } from '@/services/patient_service';
import { MALAWI_NATIONAL_ID_TYPE } from '@/constants';
import { CHARACTERS_AND_NUMBERS_LO } from '@/components/Keyboard/KbLayouts';

export default defineComponent({
    components: { HisStandardForm },
    mixins: [EncounterMixinVue],
    data: () => ({
        registrationService: {} as any
    }),
    watch: {
        ready: {
            async handler(isReady: boolean) {
                if(isReady){
                    this.registrationService = new PatientVisitRegistrationService(this.patient.getID(), this.providerID)
                    this.fields = this.getFields()
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        mapToOption(listOptions: Array<string>): Array<Option> {
            return listOptions.map((item: any) => ({ label: item, value: item }))
        },
        async onSubmit(formData: any, computedData: any){
            await this.asignNID(formData)
            const encounter = await this.registrationService.createEncounter()
            if (!encounter) return toastWarning('Unable to create registration encounter')
            
            const registrationData = await this.resolveObs({...computedData})
            const registrationObs = await this.registrationService.saveObservationList(registrationData)
            if (!registrationObs) return toastWarning('Unable to save observations')

            this.nextTask()        
        },
        async asignNID(formData: any) {
            const nidAvailable = formData['national_id_available']
            const nid = formData['national_id']
            if(nidAvailable && nidAvailable.value === 'Yes') {
                await this.patient.updateMWNationalId(nid.value)
            }
        },
        async mwIdExists(nid: string) {
            if(!nid) return false
            const people = await Patientservice.findByOtherID(MALAWI_NATIONAL_ID_TYPE, nid)
            return people.length > 0
        },
        getFields(): Array<Field>{
            return [
                {
                    id: 'visit_type',
                    helpText: 'Type of visit',
                    type: FieldType.TT_SELECT,
                    validation: (value: any) => Validation.required(value),
                    computedValue: (v: Option) => ({ obs: this.registrationService.buildValueCoded('Type of visit', v.value)}),
                    options: () => {
                        return [
                            { label: 'New', value: 'New patient' },
                            { label: 'Referral', value: 'Referral' },
                            { label: 'Re-visiting', value: 'Re-visiting' },
                        ]
                    }
                },
                {
                    id: 'referring_facility_name',
                    helpText: 'Referred from',
                    type: FieldType.TT_SELECT,
                    validation: (value: any) => Validation.required(value),
                    computedValue: ({ label }: Option) => ({obs: this.registrationService.buildValueText('Referred from', label)}),
                    condition: (fields: any) => fields.visit_type.value === 'Referral',
                    options: (_: any, filter='') => getFacilities(filter),
                    config: {
                        showKeyboard: true,
                        isFilterDataViaApi: true
                    }
                },
                {
                    id: 'life_threatening_condition',
                    helpText: 'Life threatening condition',
                    type: FieldType.TT_SELECT,
                    computedValue: (value: Option) => ({obs: this.registrationService.buildValueCoded('Life threatening condition', value.value)}),
                    validation: (val: any) => Validation.required(val),
                    options: () => this.mapToOption([
                                'Airway',
                                'Breathing',
                                'Coma',
                                'Confusion',
                                'Convulsion',
                                'Disability',
                                'none',
                                'other',
                                'Temperatur (The child is very hot)'
                            ])
                },
                {
                    id: 'national_id_available',
                    helpText: 'National ID Available',
                    type: FieldType.TT_SELECT,
                    validation: (value: any) => Validation.required(value),
                    condition: () => this.patient.getMWNationalID() === 'Unknown',
                    options: () => this.yesNoUnknownOptions(),
                    appearInSummary: () => false
                },
                {
                    id: 'national_id',
                    helpText: 'Enter National ID',
                    type: FieldType.TT_TEXT,
                    validation: (value: Option) => Validation.isMWNationalID(value),
                    condition: (fields: any) => fields.national_id_available.value === 'Yes',
                    beforeNext: async (field: Option) => {
                        if(field.value && (await this.mwIdExists(field.value.toString()))){
                            toastWarning('National ID already exists')
                            return false
                        }
                        return true
                    },
                    summaryMapValue: ({ value }: Option) => ({
                        value,
                        label: 'National ID'
                    }),
                    config: {
                        casing: 'uppercase',
                        customKeyboard: [CHARACTERS_AND_NUMBERS_LO, [['Delete']]],
                    }
                },
                {
                    id: 'triage',
                    helpText: 'Select Triage Category',
                    type: FieldType.TT_SELECT,
                    computedValue: (value: Option) => ({obs: this.registrationService.buildValueCoded('Triage category', value.value)}),
                    validation: (val: any) => Validation.required(val),
                    options: () => this.mapToOption([
                                'Emergency',
                                'Priority',
                                'Queue'
                            ])
                }
            ]
        }
    }
})
</script>

