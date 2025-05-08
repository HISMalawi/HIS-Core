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
import { toastWarning } from '@/utils/Alerts';
import { SocialHistoryService } from '@/apps/ART/services/social_history_service';

export default defineComponent({
  components: { HisStandardForm },
  mixins: [EncounterMixinVue],
  data: () => ({
    socialService: {} as any
  }),
  watch: {
    ready: {
      async handler(isReady: boolean) {
        if(isReady){
          this.socialService = new SocialHistoryService(this.patient.getID(), this.providerID)
          this.fields = this.getFields()
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async onSubmit(_: any, computedData: any){
      const encounter = await this.socialService.createEncounter()
      if (!encounter) return toastWarning('Unable to create social history encounter')
      
      const registrationData = await this.resolveObs({...computedData})
      const registrationObs = await this.socialService.saveObservationList(registrationData)
      if (!registrationObs) return toastWarning('Unable to save observations')

      this.nextTask()        
    },
    getFields(): Array<Field>{
      return [
        {
          id: "social_acitivites",
          helpText: `Social Activities`,
          type: FieldType.TT_MULTIPLE_YES_NO,
          validation: (data: any) => this.validateSeries([
            () => Validation.required(data), 
            () => Validation.anyEmpty(data)
          ]),
          computedValue: (options: Option[]) => ({
            obs: options.map(option => this.socialService.buildValueCoded(
              option.label,
              option.value
            ))                     
          }),
          summaryMapValue: (option: Option) => ({
            label: option.label,
            value: option.value
          }),
          options: () => [
            {
              label: "Patient smokes",
              value: "",
              other: {
                values: this.yesNoOptions(),
              },
            },
            {
              label: "Patient drinks alcohol",
              value: "",
              other: {
                values: this.yesNoOptions(),
              },
            },
          ],
        },
        {
          id: 'marital_status',
          helpText: 'Marital Status',
          type: FieldType.TT_SELECT,
          validation: (value: any) => Validation.required(value),
          computedValue: ({ value }: Option) => ({
            obs: this.socialService.buildValueText('Marital status', value)
          }),
          options: () => [
            { label: "Single", value: "Single" },
            { label: "Engaged", value: "Engaged" },
            { label: "Married", value: "Married" },
            { label: "Separated", value: "Separated" },
            { label: "Widowed", value: "Widowed" },
            { label: "Other", value: "Other" },
          ],
        },
        {
          id: 'religion',
          helpText: 'Religion',
          type: FieldType.TT_SELECT,
          validation: (value: any) => Validation.required(value),
          computedValue: ({ value }: Option) => ({
            obs: this.socialService.buildValueText('Religion', value)
          }),
          options: () => ([
            { label: 'Catholic', value: 'Catholic' },
            { label: 'CCAP', value: 'CCAP' },
            { label: 'SDA', value: 'SDA' },
            { label: 'Angelican', value: 'Angelican' },
            { label: 'Muslim', value: 'Muslim' },
            { label: 'Pentecostalism', value: 'Pentecostalism' },
            { label: 'Jehovah witness', value: 'Jehovah witness' },
            { label: 'Other', value: 'Other' },
          ])
        },
      ]
    }
  }
})
</script>

