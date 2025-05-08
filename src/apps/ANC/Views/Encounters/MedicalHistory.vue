<template>
  <ion-page> 
    <his-standard-form 
      :fields="formFields"
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
import { AncMedicalHistoryService } from "@/apps/ANC/Services/anc_medical_history_service"
import { Option } from '@/components/Forms/FieldInterface'
import Validation from "@/components/Forms/validations/StandardValidations"
import { IonPage } from "@ionic/vue"
import { ObsValue } from '@/services/observation_service'

export default defineComponent({
  components: { IonPage },
  mixins: [EncounterMixinVue],
  data: () => ({
    formFields: [] as any,
    service: {} as any
  }),
  watch: {
    ready: {
      handler(ready: boolean) {
        if (ready) this.formFields = this.getFields()
      },
      immediate: true
    }
  },
  methods: {
    async onFinish(_: any, computedData: any) {
      const obs = await this.resolveObs(computedData)
      const anc = new AncMedicalHistoryService(this.patientID, this.providerID)
      await anc.createEncounter()
      await anc.saveObservationList(obs as ObsValue[])
      this.nextTask()
    },
    getFields() {
      return [
        {
          id: 'medical_history',
          helpText: 'Past Medical Complications',
          type: FieldType.TT_MULTIPLE_YES_NO,
          validation: (v: Option[]) => Validation.required(v),
          computedValue: (v: Option[]) => {
            return v.map(i => AncMedicalHistoryService.buildValueCoded(i.label, `${i.value}`))
          },
          options: () => {
            return AncMedicalHistoryService.medicalHistoryOptions().map(h =>({
               label: h.name,
               value: '',
               other: {
                  values: this.yesNoOptions()
               }
            }))
          },
          config : {
            footerBtns: [
              {
                name: "None",
                slot: "end",
                onClickComponentEvents:{
                  refreshOptions: () => {
                    return AncMedicalHistoryService.medicalHistoryOptions().map(h =>({
                      label: h.name,
                      value: 'No',
                      other: {
                        values: this.yesNoOptions()
                      }
                    }))
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
