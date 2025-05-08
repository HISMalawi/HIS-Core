<template>
    <his-standard-form :cancelDestinationPath="cancelDestination" :fields="fields" :onFinishAction="onSubmit"/>
</template>

<script lang="ts">
import { defineComponent} from 'vue'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import EncounterMixinVue from '@/views/EncounterMixin.vue';
import { PatientServicesService } from '@/apps/Registration/services/patient_services_service'; 
import Validation from '@/components/Forms/validations/StandardValidations';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { toastWarning } from '@/utils/Alerts';

export default defineComponent({
    components: { HisStandardForm },
    mixins: [EncounterMixinVue],
    data: () => ({
        patientServicesService: {} as any
    }),
    watch: {
        ready: {
            async handler(isReady: boolean) {
                if(isReady){
                    this.patientServicesService = new PatientServicesService(this.patient.getID(), this.providerID)
                    this.fields = this.getFields()
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        async onSubmit(formData: any, computedData: any){
            const encounter = await this.patientServicesService.createEncounter()
            if (!encounter) return toastWarning('Unable to create registration encounter')
            
            const registrationData = await this.resolveObs({...computedData})
            const registrationObs = await this.patientServicesService.saveObservationList(registrationData)
            if (!registrationObs) return toastWarning('Unable to save observations')

            this.nextTask()        
        },
        
        getFields(): Array<Field>{
            return [
                {
                    id: 'referral',
                    helpText: 'Select service',
                    type: FieldType.TT_SELECT,
                    validation: (value: any) => Validation.required(value),
                    computedValue: (v: Option) => ({ obs: this.patientServicesService.buildValueText('Services ordered', v.value)}),
                    options: ()=> this.mapOptions(['Casualty', 'Dental', 'Eye', 'Family Planing', 'Medical', 'OB/Gyn', 'Orthopedics',
                        'Pediatrics', 'Skin', 'STI Clinic', 'Surgical', 'Other'
                    ]) 
                }
            ]
        }
    }
})
</script>