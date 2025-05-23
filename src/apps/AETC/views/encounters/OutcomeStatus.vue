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
import { getFacilities, getFacilityWards, getSpecialistClinics } from '@/utils/HisFormHelpers/LocationFieldOptions';
import { PatientReferralService } from '@/apps/AETC/services/patient_referral_service'
import { PatientAdmitService } from '@/apps/AETC/services/patient_admit_service'
import { LocationService } from '@/services/location_service';
import { alertConfirmation, toastDanger, toastWarning } from '@/utils/Alerts';

export default defineComponent({
  components: { HisStandardForm },
  mixins: [EncounterMixinVue],
  data: () => ({
    referralService: {} as any,
    admissionService: {} as any
  }),
  watch: {
    ready: {
      async handler(isReady: boolean) {
        if(isReady){
          this.referralService = new PatientReferralService(this.patientID, this.providerID)
          this.admissionService = new PatientAdmitService(this.patientID, this.providerID)
          this.fields = this.getFields()
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async onSubmit(formData: any, computedData: any){
      if(formData.opd_outcome.value === 'Admission') {
        await this.admissionService.createEncounter()
        const admissionData = await this.resolveObs({...computedData}, 'admission')
        await this.admissionService.saveObservationList(admissionData)
      } else {
        await this.referralService.createEncounter()
        const referralData = await this.resolveObs({...computedData}, 'referral')
        await this.referralService.saveObservationList(referralData)
      }
      
      this.nextTask()        
    },
    getFields(): Array<Field>{
      return [
        {
          id: 'opd_outcome',
          helpText: 'Select outcome',
          type: FieldType.TT_SELECT,
          validation: (value: any) => Validation.required(value),
          options: () => {
            return [
              { label: 'Admit', value: 'Admission' },
              { label: 'Internal referral', value: 'Internal referral' },
              { label: 'Refer to another hospital/clinic', value: 'External referral' },
            ]
          }
        },
        {
          id: 'facility_name',
          helpText: 'Select Facility name',
          type: FieldType.TT_SELECT,
          validation: (value: any) => Validation.required(value),
          computedValue: ({ value }: Option) => ({
            tag: 'referral',
            obs: this.referralService.buildValueText('Referred', value)
          }),
          condition: (fields: any) => fields.opd_outcome.value === 'External referral',
          options: (_: any, filter='') => getFacilities(filter),
          config: {
              showKeyboard: true,
              isFilterDataViaApi: true
          }
        },
        {
          id: 'specialist_clinic',
          helpText: 'Select clinic',
          type: FieldType.TT_SELECT,
          validation: (value: any) => Validation.required(value),
          computedValue: ({ other }: Option) => {
              return this.referralService.buildValueCodedFromConceptId('Specialist clinic', other.concept_id)
          },
          condition: (fields: any) => fields.opd_outcome.value === 'Internal referral',
          options: () => getSpecialistClinics(),
          config: { showKeyboard: true }
        },    
        {
          id: 'wards',
          helpText: 'Select ward',
          type: FieldType.TT_SELECT,
          condition: (fields: any) => fields.opd_outcome.value === 'Admission',
          validation: (value: any) => Validation.required(value),
          computedValue: (value : Option) => ({
            tag: 'admission',
            obs: this.admissionService.buildValueText('Admit to ward', value.label)
          }),
          options: () => LocationService.getInternalSections(),
          config: { 
            showKeyboard: true,
            footerBtns: [{
              name: 'Add Section',
              slot: 'end',
              color: 'success',
              onClick: async (f: any, c: any, field: any) => {
                if (typeof field.filter != 'string' || field.filter.length < 3) {
                  return toastWarning(`Please enter a valid section name`)
                }
                if (field.filtered.some((i: Option) => i.label.toLowerCase() === field.filter.toLowerCase())) {
                  return toastWarning(`Section already existing`)
                }
                if ((await alertConfirmation(`Do you want to add internal section?`))) {
                  const data = await LocationService.createInternalSection(field.filter.toUpperCase())
                  if (data) {
                    field.filter = data.name
                    field.listData = [{label: data.name, value: data.id}, ...field.listData]
                  } else {
                    toastDanger(`Unable to add ${field.filter}`)
                  }
                }
              }
            }]
          }
        },  
      ]
    }
  }
})
</script>

