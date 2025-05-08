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
import { Option } from '@/components/Forms/FieldInterface'
import Validation from "@/components/Forms/validations/StandardValidations"
import { IonPage } from "@ionic/vue"
import { AncArtFollowupService } from "@/apps/ANC/Services/anc_art_followup_service"

export default defineComponent({
  components: { IonPage },
  mixins: [EncounterMixinVue],
  data: () => ({
    service: {} as any,
    formFields: [] as any
  }),
  watch: {
    ready: {
      handler(ready: boolean) {
        if (ready) {
          this.service = new AncArtFollowupService(this.patientID, this.providerID)
          this.formFields = this.getFields()
        }
      },
      immediate: true
    }
  },
  methods: {
    async onFinish(_: any, c: any) {
      await this.service.createEncounter()
      await this.service.saveObservationList((await this.resolveObs(c)))
      this.nextTask()
    },
    getFields() {
      return [
        {
          id: 'pmct',
          helpText: 'PMTCT',
          type: FieldType.TT_YES_NO,
          computedValue: (v: string) => this.service.buildValueCoded(
            'PMTCT', v.match(/true/i) ? 'Yes' : 'No'
          ),
          validation: (v: Option) => Validation.required(v),
          options: () => [
            {
              label: 'Proceed to PMTCT',
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
          ] as any
        },
        {
          id: 'reason_for_not_starting_art',
          helpText: 'Reason for not starting ART',
          type: FieldType.TT_SELECT,
          condition: (f: any) => f.pmct === 'false',
          validation: (v: Option) => Validation.required(v),
          computedValue: (v: Option) => this.service.buildValueText(
            'Reason for exiting care',  v.value
          ),
          options: () => this.mapStrToOptions([
            'Already on ART at another facility',
            'To be done in another room',
            'Not willing'
          ])
        }
      ]
    }
  }
})
</script>
