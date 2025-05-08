<template>
  <ion-page> 
    <his-standard-form 
      :fields="fields"
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
import { Field, Option } from '@/components/Forms/FieldInterface'
import Validation from "@/components/Forms/validations/StandardValidations"
import { IonPage } from "@ionic/vue"
import { AncVisitTypeService } from "@/apps/ANC/Services/anc_visit_type_service"

export default defineComponent({
  components: { IonPage },
  mixins: [EncounterMixinVue],
  data: () => ({
    service: {} as AncVisitTypeService,
    helpText: 'ANC Visit Number' as string
  }),
  watch: {
    ready: {
      async handler(ready: boolean) {
        if (ready) {
          this.service = new AncVisitTypeService(this.patientID, this.providerID)
          await this.service.loadLastVisitNumber()
          this.fields = this.getFields()
        }
      },
      immediate: true
    }
  },
  methods: {
    async onFinish(_: any, c: any) {
      await this.service.createEncounter();
      const obs = await this.resolveObs(c);
      await this.service.saveObservationList(obs);
      this.nextTask()
    },
    getFields(): Array<Field> {
      return [
        {
          id: 'visit_number',
          helpText: this.helpText,
          dynamicHelpText: () => {
            if (this.service.lastVisitNumber) {
              return `${this.helpText} (Last visit number: ${this.service.lastVisitNumber})`
            }
            return this.helpText
          },
          defaultValue: () => this.service.lastVisitNumber + 1,
          type: FieldType.TT_NUMBER,
          computedValue: (v: Option) => ({ 
            obs: [
              this.service.buildValueNumber("Type of visit", v.value as number),
              this.service.buildValueCoded("Has extended ANC visits", v.value as number > 8 ? "Yes" : "No")
            ]
          }),
          validation: (v: Option) => this.validateSeries([
            () => Validation.required(v),
            () => Validation.rangeOf(v, this.service.lastVisitNumber + 1, 15)
          ])
        },
        {
          id: 'reasons',
          helpText: "Provide reason for having more than 8 visits",
          type: FieldType.TT_TEXT,
          computedValue: (v: Option) => ({ obs: this.service.buildValueText("Reason for extended ANC visits", v.value as string) }),
          condition: (f: any) => f.visit_number.value > 8,
          validation: (v: Option) =>  Validation.required(v),
        }
      ]
    }
  }
})
</script>
