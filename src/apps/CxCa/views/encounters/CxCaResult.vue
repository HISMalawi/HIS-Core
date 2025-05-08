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
import { PatientTypeService } from "@/apps/ART/services/patient_type_service";
import { getFacilities } from "@/utils/HisFormHelpers/LocationFieldOptions";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    patientType: {} as any,
  }),
  watch: {
    patient: {
      async handler() {
        this.patientType = new PatientTypeService(
          this.patientID,
          this.providerID
        );
        await this.patientType.loadPatientType();
        this.fields = this.getFields();
      },
      deep: true,
    },
  },
  methods: {
    async onFinish(/*formData: any*/) {
      //       const encounter = await this.patientType.createEncounter();
      //       if (!encounter) return toastWarning("Unable to create encounter");
      //       this.patientType.setLocationName(formData?.location?.label);
      //       this.patientType.setPatientType(formData?.patient_type?.value);
      //       await this.patientType.save();
      //       toastSuccess("Observations and encounter created!");
      //       this.nextTask();
    },
    getFacilities(filter = "") {
      return getFacilities(filter);
    },
    getFields(): any {
      return [
        {
          id: "via_test_results",
          helpText: "VIA test results",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => {
            return this.mapOptions([
              "Negative",
              "Positive",
              "Suspect",
            ]);
          },
        },
        {
          id: "pap_smear",
          helpText: "PAP Smear Results",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => {
            return this.mapOptions([
              "PAP Smear normal",
              "PAP Smear abnormal"
            ]);
          },
        },
        {
          id: "hpv_dna",
          helpText: "HPV DNA Test Results",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => {
            return this.mapOptions([
              "HPV negative",
              "HPV positive"
            ]);
          },
        },
        {
          id: "speculum_exam",
          helpText: "Speculum Exam Results",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => {
            return this.mapOptions([
              "Visible Lesion",
              "No Visible lesion",
              "Other gynaecological condition",
            ]);
          },
        },
      ];
    },
  },
});
</script>