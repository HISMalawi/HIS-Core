<template>
  <his-standard-form
    :fields="fields"
    :onFinishAction="onFinish"
    :skipSummary="true"
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
import { FastTrackService } from "@/apps/ART/services/fast_track_service";
import { toastSuccess, toastWarning } from "@/utils/Alerts";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    fields: [] as any,
    fastTrack: {} as any,
    options: [] as any,
    values: [] as any,
    gender: null as any,
  }),
  watch: {
    ready: {
      async handler(ready: any) {
        if (ready) this.init(this.patient);
      },
      immediate: true
    },
  },
  methods: {
    async onFinish(formData: any) {
      const encounter = await this.fastTrack.createEncounter();
      if (encounter) {
        const obs = await this.buildObs(formData);
        const observations = await this.fastTrack.saveObservationList(obs);
        if (!observations)
          return toastWarning("Unable to save patient observations");

        toastSuccess("Observations and encounter created!");
        this.nextTask();
      } else {
        return toastWarning("Unable to create fast track encounter");
      }
    },
    async init(patient: any) {
      this.gender = patient.getGender();
      this.fastTrack = new FastTrackService(patient.getID(), this.providerID);
      this.values = await this.getYesNo();
      this.options = await this.getOptions();
      this.fields = this.getFields();
    },
    async buildObs(formData: any) {
      const observations = [];
      observations.push(
        await this.fastTrack.buildValueCoded(
          "Assess for fast track",
          formData.ft_assessment.value
        )
      );
      if (formData.ft_questions) {
        await formData.ft_questions.forEach(async (element: any) => {
          observations.push(
            await this.fastTrack.buildValueCoded(element.label, element.value)
          );
        });

        observations.push(
          await this.fastTrack.buildValueCoded(
            "Fast track",
            formData.book_client.value
          )
        );
      }
      return observations;
    },
    async getOptions() {
      const values = this.getYesNo();
      const options = await this.fastTrack
        .getAssessmentValues("fast_track")
        .map((data: any) => {
          return {
            label: data.name,
            value: "",
            other: {
              values: values,
            },
          };
        });
      if (this.gender === "M") {
        return options.filter((data: any) => {
          return !data.label.match(/Pregnant/i);
        });
      }
      return options;
    },
    getYesNo() {
      return [
        {
          label: "yes",
          value: "Yes",
        },
        {
          label: "no",
          value: "No",
        },
      ];
    },
    getFields(): any {
      return [
        {
          id: "ft_assessment",
          helpText: `Assess client for FT`,
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => this.getYesNo(),
        },
        {
          id: "ft_questions",
          helpText: "Assess client for FT",
          type: FieldType.TT_MULTIPLE_YES_NO,
          condition(formData: any) {
            return formData.ft_assessment.value === "Yes";
          },
          validation: (val: any) => Validation.anyEmpty(val),
          options: () => {
            return this.options;
          },
        },
        {
          id: "book_client",
          helpText: "Select type of visit to book",
          type: FieldType.TT_SELECT,
          condition(formData: any) {
            return formData.ft_assessment.value === "Yes";
          },
          validation: (val: any) => Validation.required(val),
          options: () => [
            {
              label: "Fast track",
              value: "No",
            },
            {
              label: "Normal visit",
              value: "No",
            },
          ],
        },
      ];
    },
  },
});
</script>
