<template>
  <his-standard-form
    :fields="fields"
    :skipSummary="true"
    :onFinishAction="onFinish"
  >
  </his-standard-form>
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { Field, Option } from "@/components/Forms/FieldInterface"
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import EncounterMixinVue from "../../../../views/EncounterMixin.vue";
import { ConsultationService } from "@/apps/ART/services/consultation_service";
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper";
import { ObservationService } from "@/services/observation_service";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    consultation: {} as any
  }),
  watch: {
    ready: {
      handler(ready: boolean) {
        if (ready)  {
          this.consultation = new ConsultationService(this.patientID, this.providerID)
          this.fields = this.getFields()
        }
      },
      immediate: true
    }
  },
  methods: {
    async onFinish(_: any, computedData: any) {
      await this.consultation.createEncounter();
      const obs = await this.resolveObs(computedData)
      await this.consultation.saveObservationList(obs)
      this.$router.back()
    },
    getFields(): Field[] {
      return [
        {
          id: "has_hypertension",
          helpText: "Does the patient have hypertension",
          type: FieldType.TT_SELECT,
          options: () => this.yesNoOptions(),
          validation: (val: any) => Validation.required(val),
          computedValue: (v: Option) => ObservationService.buildValueCoded("Patient has hypertension", `${v.value}`),
        },
        {
          id: "hypertension_diagnosis",
          helpText: "Date the patient was diagnosed with hypertension",
          type: FieldType.TT_FULL_DATE,
          validation: (val: any) => Validation.required(val),
          computedValue: (date: Option) =>  ObservationService.buildValueDate("Hypertension diagnosis date", `${date.value}`)
        }
      ]
    }
  }
})
</script>