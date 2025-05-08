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
import { toastSuccess, toastWarning } from "@/utils/Alerts";
import PersonField from "@/utils/HisFormHelpers/PersonFieldHelper"
import { Field } from "@/components/Forms/FieldInterface"

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    patientType: {} as any,
  }),
  watch: {
    ready: {
      async handler(ready: boolean) {
        if (ready) {
          this.patientType = new PatientTypeService(this.patientID, this.providerID);
          await this.patientType.loadPatientType()
          this.fields = this.getFields();
        }
      },
      immediate: true
    },
  },
  methods: {
    async onFinish(formData: any) {
      const encounter = await this.patientType.createEncounter();

      if (!encounter) return toastWarning("Unable to create encounter")

      this.patientType.setLocationName(formData?.location?.label)
      this.patientType.setPatientType(formData?.patient_type?.value)

      await this.patientType.save()
      toastSuccess("Observations and encounter created!")
      this.nextTask()
    },
    facilityLocationField(): Field {
       const facility: Field = PersonField.getFacilityLocationField()
       facility.condition = (form: any) => [
           'Emergency supply',
           'External consultation'
       ].includes(form.patient_type.value)
       return facility
    },
    getFields(): any {
      return [
        {
          id: "patient_type",
          helpText: `Current type: ${this.patientType.getType()}`,
          type: FieldType.TT_SELECT,
          validation: (val: any) =>
            Validation.required(val) ||
            Validation.notTheSame(val.value, this.patientType.getType()),
          options: () => PatientTypeService.getPatientTypes()
        },
        this.facilityLocationField()
      ]
    }
  }
});
</script>
