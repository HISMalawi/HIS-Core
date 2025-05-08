<template>
  <his-standard-form :cancelDestinationPath="cancelDestination" :fields="fields" :onFinishAction="onSubmit"/>
</template>

<script lang="ts">
import { defineComponent} from 'vue'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import EncounterMixinVue from '@/views/EncounterMixin.vue';
import { PatientDiagnosisService } from "@/apps/AETC/services/patient_diagnosis_service"
import { ClinicalNotesService } from "@/apps/AETC/services/clinical_notes_service";
import Validation from '@/components/Forms/validations/StandardValidations';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { isEmpty } from 'lodash';
import { ConceptName } from '@/interfaces/conceptName';
import { OrderService } from '@/services/order_service';
import { alertConfirmation } from '@/utils/Alerts';
import { Service } from "@/services/service";

export default defineComponent({
  components: { HisStandardForm },
  mixins: [EncounterMixinVue],
  data: () => ({
    activeField: '',
    notesService: {} as any,
    diagnosisService: {} as any,
    malariaTestResult: 'No' as string
  }),
  watch: {
    ready: {
      async handler(isReady: boolean) {
        if(isReady){
          this.malariaTestResult = await OrderService.getLatestMalariaTestResult(this.patientID)
          this.notesService = new ClinicalNotesService(this.patientID, this.providerID)
          this.diagnosisService = new PatientDiagnosisService(this.patientID, this.providerID)
          this.fields = this.getFields()
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async onSubmit(_: any, computedData: any){
      await this.diagnosisService.createEncounter()
      
      const diagnosisData = await this.resolveObs({...computedData,'obs_datetime':Service.getSessionDate()}, 'diagnosis')      
      await this.diagnosisService.saveObservationList(diagnosisData)

      const notesData = await this.resolveObs({...computedData}, 'notes')
      if(!isEmpty(notesData)) {
        await this.notesService.createEncounter()
        await this.notesService.saveObservationList(notesData)
      }

      this.nextTask()        
    },
    mapListToOptions(list: ConceptName[]){
      if(isEmpty(list)) return []
      return list.map(item => ({
        label: item.name, value: item.name, other: item.concept_id, isChecked: false
      })).sort((a, b) => a.label < b.label ? -1 : a.label > b.label ? 1 : 0)
    },
    async checkMalariaResult(data: Array<any>){
      const malaria = data.find(o => o.label === 'Malaria')      
      if(malaria) {
        if(this.malariaTestResult === "Positive") return true
        return await alertConfirmation(`Patient has ${this.malariaTestResult} malaria test result. Do you want to continue?`)
      }
      return true
    },
    getFields(): Array<Field>{
      return [
        {
          id: 'primary_diagnosis',
          helpText: 'Select primary diagnosis',
          type: FieldType.TT_INFINITE_SCROLL_MULTIPLE_SELECT,
          validation: (data: any) => Validation.required(data),
          options: async (_, filter='', page=1, limit=10) => this.mapListToOptions(
            await PatientDiagnosisService.getDiagnosis(filter, page, limit)
          ),
          beforeNext: async (data: any) => await this.checkMalariaResult(data),
          computedValue: (options: Array<Option>) => ({
            tag: 'diagnosis',
            obs: options.map(({other}) => 
              this.diagnosisService.buildValueCodedFromConceptId('Primary diagnosis', other))
          }),
          summaryMapValue: ({ value }: Option) => ({
            value,
            label: "Primary diagnosis"
          }),
          config: {
            isFilterDataViaApi: true,
            showKeyboard: true,
          }
        },
        {
          id: 'secondary_diagnosis',
          helpText: 'Select secondary diagnosis',
          type: FieldType.TT_INFINITE_SCROLL_MULTIPLE_SELECT,
          options: async (_, filter='', page=1, limit=10) => this.mapListToOptions(
            await PatientDiagnosisService.getDiagnosis(filter, page, limit)
          ),
          beforeNext: async (data: any) => await this.checkMalariaResult(data),
          computedValue: (options: Array<Option>) => !isEmpty(options) && ({
            tag: 'diagnosis',
            obs: options.map(({other}) => 
              this.diagnosisService.buildValueCodedFromConceptId('Secondary diagnosis', other))
          }),
          summaryMapValue: ({ value }: Option) => ({
            value,
            label: "Secondary diagnosis"
          }),
          config: {
            showKeyboard: true,
            isFilterDataViaApi: true,
          }
        },
        {
          id: 'clinical_notes',
          helpText: 'Clinical notes',
          type: FieldType.TT_NOTE,
          computedValue: (v: Option) => v && ({
            tag: 'notes',
            obs: this.notesService.buildValueText('Clinical notes construct', v.value)
          })
        },
      ]
    }
  }
})
</script>

