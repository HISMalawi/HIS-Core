<template>
    <his-standard-form :cancelDestinationPath="cancelDestination" :fields="fields" :onFinishAction="onSubmit"/>
</template>

<script lang="ts">
import { defineComponent} from 'vue'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import EncounterMixinVue from '@/views/EncounterMixin.vue';
import { PatientReceptionService } from "@/apps/Registration/services/patient_reception_service"
import Validation from '@/components/Forms/validations/StandardValidations';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { getFacilities } from '@/utils/HisFormHelpers/LocationFieldOptions';
import { toastWarning } from '@/utils/Alerts';

export default defineComponent({
    components: { HisStandardForm },
    mixins: [EncounterMixinVue],
    data: () => ({
        receptionService: {} as any
    }),
    watch: {
        ready: {
            async handler(isReady: boolean) {
                if(isReady){
                    this.receptionService = new PatientReceptionService(this.patient.getID(), this.providerID)
                    this.fields = this.getFields()
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        async onSubmit(formData: any, computedData: any){
            const encounter = await this.receptionService.createEncounter()
            if (!encounter) return toastWarning('Unable to create registration encounter')
            
            const registrationData = await this.resolveObs({...computedData})
            const registrationObs = await this.receptionService.saveObservationList(registrationData)
            if (!registrationObs) return toastWarning('Unable to save observations')

            this.$router.push(`/registration/encounters/patient_services/${this.patientID}`);
        },
        
        getFields(): Array<Field>{
            return [
                {
                    id: 'referral',
                    helpText: 'Is the Patient a Referral Case From Another Health Facility?',
                    type: FieldType.TT_SELECT,
                    validation: (value: any) => Validation.required(value),
                    computedValue: (v: Option) => ({ obs: this.receptionService.buildValueCoded('Is patient referred?', v.value)}),
                    options: () => {
                        return [
                            { label: 'Yes', value: 'Yes' },
                            { label: 'No', value: 'No' },
                        ]
                    }
                },
                {
                    id: 'referring_facility_name',
                    helpText: 'Referred from',
                    type: FieldType.TT_SELECT,
                    validation: (value: any) => Validation.required(value),
                    computedValue: ({ label }: Option) => ({obs: this.receptionService.buildValueText('Referred from', label)}),
                    condition: (fields: any) => fields.referral.value === 'Yes',
                    options: (_: any, filter='') => getFacilities(filter),
                    config: {
                        showKeyboard: true,
                        isFilterDataViaApi: true
                    }
                }
            ]
        }
    }
})
</script>