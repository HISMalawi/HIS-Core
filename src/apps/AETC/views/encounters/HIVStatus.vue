<template>
    <his-standard-form :cancelDestinationPath="cancelDestination" :fields="fields" :onFinishAction="onSubmit"/>
</template>

<script lang="ts">
import { defineComponent} from 'vue'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import EncounterMixinVue from '@/views/EncounterMixin.vue';
import Validation from '@/components/Forms/validations/StandardValidations';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { getFacilities } from '@/utils/HisFormHelpers/LocationFieldOptions';
import { EstimationFieldType, generateDateFields } from '@/utils/HisFormHelpers/MultiFieldDateHelper';
import { toastWarning } from '@/utils/Alerts';
import { HIVStatusService } from '../../services/hiv_status_service';

export default defineComponent({
    components: { HisStandardForm },
    mixins: [EncounterMixinVue],
    data: () => ({
        hivService: {} as any
    }),
    watch: {
        ready: {
            async handler(isReady: boolean) {
                if(isReady){
                    this.hivService = new HIVStatusService(this.patient.getID(), this.providerID)
                    this.fields = this.getFields()
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        async onSubmit(formData: any, computedData: any){
            const encounter = await this.hivService.createEncounter()
            if (!encounter) return toastWarning('Unable to create encounter') 
            const data = await this.resolveObs({...computedData})
            const obs = await this.hivService.saveObservationList(data)
            if (!obs) return toastWarning('Unable to save observations')
            this.nextTask()        
        },
        buildDateObs(conceptName: string, date: string, isEstimate: boolean) {
            let obs = {}
            if (date.match(/unknown/i)) {
                obs = this.hivService.buildValueText(conceptName, 'Unknown')
            } else if (isEstimate) {
                obs = this.hivService.buildValueDateEstimated(conceptName, date)
            } else {
                obs = this.hivService.buildValueDate(conceptName, date)
            }
            return obs
        },
        getFields(): Array<Field>{
            return [
                {
                    id: 'hiv_status',
                    helpText: 'HIV status',
                    type: FieldType.TT_SELECT,
                    validation: (value: any) => Validation.required(value),
                    computedValue: ({ value }: Option) => ({
                        obs: this.hivService.buildValueText('HIV status', value)
                    }),
                    options: () => ([
                        { label: 'Positive not ART', value: 'Positive not ART' },
                        { label: 'Posititve on ART', value: 'Positive on ART' },
                        { label: 'Previous negative', value: 'Previous negative' },
                        { label: 'New positive', value: 'New positive' },
                        { label: 'New negative', value: 'New negative' },
                        { label: 'Never tested', value: 'Never tested' },
                    ])
                },
                ...generateDateFields({
                    id: 'hiv_test_date',
                    helpText: 'HIV Test',
                    required: true,
                    minDate: () => this.patient.getBirthdate(),
                    maxDate: () => HIVStatusService.getSessionDate(),
                    condition: (fields: any) => fields.hiv_status.value !== 'Never tested',
                    summaryLabel: 'HIV test date',
                    estimation: {
                        allowUnknown: true,
                        estimationFieldType: EstimationFieldType.MONTH_ESTIMATE_FIELD
                    },
                    computeValue: (date: string, isEstimate: boolean) => this.buildDateObs('HIV test date', date, isEstimate)
                    
                }),
                {
                    id: 'test_location',
                    helpText: 'HIV test location',
                    type: FieldType.TT_SELECT,
                    validation: (value: any) => Validation.required(value),
                    defaultValue: () => HIVStatusService.getLocationName(),
                    computedValue: ({ label }: Option) => ({obs: this.hivService.buildValueText('HIV test location', label)}),
                    condition: (fields: any) => fields.hiv_status.value !== 'Never tested',
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

