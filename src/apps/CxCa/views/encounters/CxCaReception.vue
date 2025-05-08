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
import {ReceptionService} from "@/apps/CxCa/services/CxCaReceptionService"
import { toastSuccess, toastWarning } from "@/utils/Alerts";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    reception: {} as any,
  }),
  watch: {
    patient: {
      async handler() {
        this.reception = new ReceptionService(
          this.patientID,
          this.providerID
        );
        this.fields = this.getFields();
      },
      deep: true,
    },
  },
  methods: {
    async onFinish(formData: any) {
      const encounter = await this.reception.createEncounter();

      if (!encounter) return toastWarning("Unable to create encounter");
      const data = formData['reason_for_visit'];
      const receptionObs = await this.reception.buildValueCoded('Reason for visit', data.value);

      await this.reception.saveObs(receptionObs)
      toastSuccess("Observations and encounter created!");
      this.nextTask();
    },
    
    getFields(): any {
      return [
        {
          id: "reason_for_visit",
          helpText: "Reason for visit",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => this.mapOptions([
            "Initial screening","Postponed treatment","One year subsequent check-up after treatment",
            "Subsequent screening","Problem visit after treatment","Referral"
          ])
        },
      ];
    },
  },
});
</script>