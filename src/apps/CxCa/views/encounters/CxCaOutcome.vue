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
import { toastSuccess, toastWarning } from "@/utils/Alerts";
import { ProgramService } from "@/services/program_service";
import {ProgramWorkflow} from "@/interfaces/program_workflow"
import {OutcomeService} from "@/apps/CxCa/services/CxCaOutcomeService"
export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    outcome: {} as any,
  }),
  watch: {
    patient: {
      async handler() {
        this.outcome = new OutcomeService(
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
      const encounter = await this.outcome.createEncounter();

      if (!encounter) return toastWarning("Unable to create encounter");
      const programID = ProgramService.getProgramID();
      const workflows: ProgramWorkflow[] = await ProgramService.getProgramWorkflows(ProgramService.getProgramID());
      const outcome = formData.select_referral_outcome.value;
      const flows = {} as any;
      workflows.forEach(w => {
        w.states.forEach(f => {
          const conceptID = f.program_workflow_state_id;
          const conceptName = f.concept.concept_names[0].name;
          flows[conceptName] = conceptID;
        })
      })
      console.log(outcome);
      console.log(flows);
      const state = {
        'location_id': ProgramService.getLocationName(),
        state: flows[outcome],
        date: ProgramService.getSessionDate()
      }
      const saveState = await ProgramService.createState(this.patientID, programID, state);
      if(!saveState) return toastWarning('Unable to update state')
      const referralObs = formData.select_referral_outcome.value;
      const rOb = await this.outcome.buildValueCoded('Outcome', referralObs);
      const obList = [rOb];
      

      await this.outcome.saveObservationList(obList);
      toastSuccess("Observations and encounter created!");
      this.nextTask();
    },

    getFields(): any {
      return [
        {
          id: "select_referral_outcome",
          helpText: `Referral outcome`,
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => {
            return [
              
              {
                label: "Continue follow-up",
                value: "Continue follow-up",
              },
              {
                label: "No Dysplasia/Cancer",
                value: "No Dysplasia/Cancer",
              },
              {
                label: "Palliative Care",
                value: "Palliative Care",
              },
              {
                label: "Patient died",
                value: "Patient died",
              },
            ];
          },
        }
      ];
    },
  },
});
</script>