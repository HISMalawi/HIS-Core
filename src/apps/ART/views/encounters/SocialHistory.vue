<template>
  <his-standard-form
    :fields="fields"
    :onFinishAction="onFinish"
    :skipSummary="false"
    :cancelDestinationPath="cancelDestination"
  >
  </his-standard-form>
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import EncounterMixinVue from "../../../../views/EncounterMixin.vue";
import { SocialHistoryService } from "@/apps/ART/services/social_history_service";
import { toastSuccess, toastWarning } from "@/utils/Alerts";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    socialHistory : {} as any,
    obs: [] as any
  }),
  watch: {
    ready: {
      async handler(ready: boolean) {
        if (ready) {
          this.socialHistory = new SocialHistoryService(this.patientID, this.providerID)
          this.fields = await this.getFields()
        }
      },
      immediate: true
    },
  },
  methods: {
    async onFinish() {
      const encounter = await this.socialHistory.createEncounter();

      if (!encounter) return toastWarning("Unable to create encounter");

      const data = await Promise.all([...this.obs]);
      const obs = await this.socialHistory.saveObservationList(data)

      if (!obs) return toastWarning("Unable to save patient observations");

      toastSuccess("Observations and encounter created!");

      this.nextTask();
    },
    getFields(): any {
      return [
        {
          id: "smoking_history",
          helpText: "Have you ever smoked cigarettes?",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => [
            {
              label: "Yes",
              value: "Yes",
            },
            {
              label: "No",
              value: "No",
            },
          ],
          unload: async (value: any) => {
            this.obs.push(this.socialHistory.buildValueCoded('SMOKE_HIS', value.value));
          }
        },
        {
          id: "number_of_cigarettes",
          helpText: "Number of cigarettes smoked per day",
          type: FieldType.TT_NUMBER,
          validation: (val: any) => Validation.rangeOf(val, 1, 90),
          condition(formData: any) {
            return formData.smoking_history.value === "Yes"
          },
          unload: async (value: any) => {
            this.obs.push(this.socialHistory.buildValueNumber('Number of cigarettes smoked per day', value.value));
          }
        },
        {
          id: "smoking_duration",
          helpText: "How long have you been smoking?",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition(formData: any) {
            return formData.smoking_history.value === "Yes"
          },
          options: () => [
            {
              label: "Less than five years",
              value: "Less than five years",
            },
            {
              label: "Five years or more",
              value: "Five years or more",
            },
          ],
          unload: async (value: any) => {
            this.obs.push(this.socialHistory.buildValueText('Smoking duration', value.value));
          }
        },
        {
          id: "current_smoker",
          helpText: "Do you still smoke?",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition(formData: any) {
            return formData.smoking_history.value === "Yes"
          },
          options: () => [
            {
              label: "Yes",
              value: "Yes",
            },
            {
              label: "No",
              value: "No",
            },
          ],
          unload: async (value: any) => {
            this.obs.push(this.socialHistory.buildValueCoded('Current smoker', value.value));
          }
        },
        {
          id: "alcohol_history",
          helpText: "Do you drink alcohol?",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => [
            {
              label: "Yes",
              value: "Yes",
            },
            {
              label: "No",
              value: "No",
            },
          ],
          unload: async (value: any) => {
            this.obs.push(this.socialHistory.buildValueCoded('Does the patient drink alcohol?', value.value));
          }
        },
        {
          id: "number_of_drinks",
          helpText: "How many alcoholic drinks do you have per day?",
          type: FieldType.TT_NUMBER,
          validation: (val: any) => Validation.required(val),
          condition(formData: any) {
            return formData.alcohol_history.value === "Yes"
          },
          unload: async (value: any) => {
            this.obs.push(this.socialHistory.buildValueNumber('Alcoholic drinks per day', value.value));
          }
        },
        {
          id: "number_of_days_drank",
          helpText: "Number of days per week alcohol is used?",
          type: FieldType.TT_NUMBER,
          validation: (val: any) => Validation.rangeOf(val, 1,7),
          condition(formData: any) {
            return formData.alcohol_history.value === "Yes"
          },
          unload: async (value: any) => {
            this.obs.push(this.socialHistory.buildValueNumber('Number of days per week alcohol is used', value.value));
          }
        },
        {
          id: "exercise",
          helpText: "Do you do any physical exercise?",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => [
            {
              label: "Yes",
              value: "Yes",
            },
            {
              label: "No",
              value: "No",
            },
          ],
          unload: async (value: any) => {
            this.obs.push(this.socialHistory.buildValueCoded('Physical Exercises', value.value));
          }
        },
        {
          id: "employment",
          helpText: "Type of employment?",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => [
            {
              label: "Active",
              value: "Active",
            },
            {
              label: "Sedentary",
              value: "Sedentary",
            },
          ],
          unload: async (value: any) => {
            this.obs.push(this.socialHistory.buildValueText('Type of employment', value.value));
          }
        },
      ];
    },
  },
});
</script>
