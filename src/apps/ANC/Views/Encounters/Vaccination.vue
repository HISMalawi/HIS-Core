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
import { AncDispensationService} from "@/apps/ANC/Services/anc_dispensing_service"
import { AncTreatmentService } from "@/apps/ANC/Services/anc_treatment_service"
import { IonPage } from "@ionic/vue"

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
        if (ready) {
          this.formFields = this.getFields()
        }
      },
      immediate: true
    }
  },
  methods: {
    async onFinish(f: any, computedData: any) {
      await computedData['prescription'].action()
      this.nextTask()
    },
    getFields() {
      return [
        {
          id: 'prescription',
          helpText: 'Vaccination',
          type: FieldType.TT_YES_NO,
          validation: (v: string) => !v ?  ['Value is required'] : null,
          computedValue: (v: string) => {
            if (v.match(/true/i)) {
              return {
                action: async () => {
                  const service = new AncTreatmentService(this.patientID, this.providerID)
                  await service.createEncounter()
                  await service.updateVaccinationOrder()
                }
              }
            }
            return {
              action: async () => {
                const service = new AncDispensationService(this.patientID, this.providerID)
                await service.createEncounter()
                await service.saveNoDispensationObs()
              }
            }
          },
          options: () => ([
            {
              label: 'TD given today?',
              values: [
                {
                  label: "yes",
                  value: "true"
                },
                {
                  label: "no",
                  value: "false"
                }
              ]
            }
          ])
        }
      ]
    }
  }
})
</script>
