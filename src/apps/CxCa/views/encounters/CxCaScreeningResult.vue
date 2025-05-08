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
import {ScreeningResultService} from "@/apps/CxCa/services/CxCaScreeningResultService"
import { toastSuccess, toastWarning } from "@/utils/Alerts";
import { getFacilities } from "@/utils/HisFormHelpers/LocationFieldOptions";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    screeningResult: {} as any,
    obs: [] as any,
    fieldContext: {} as any,
    currentMethod: ''
  }),
  watch: {
    patient: {
      async handler() {
        this.screeningResult = new ScreeningResultService(
          this.patientID,
          this.providerID
        );
        this.currentMethod = await this.getTreatmentOptions(); 
        this.fields = this.getFields();
        
      },
      deep: true,
    },
  },
  methods: {
    async onFinish(formData: any, computed: any) {
      const encounter = await this.screeningResult.createEncounter();
      if (!encounter) return toastWarning("Unable to create encounter");
      if(formData.treatment_option && formData.treatment_option.value === "Referral") {
        this.obs.push(this.screeningResult.buildValueText('Referral location', ScreeningResultService.getLocationName()))
      }
      const vals: any = [];
      Object.keys(computed).forEach(element => {
        vals.push(computed[element].obs);
      });
      const data = await Promise.all([...this.obs, ...vals]);
      await this.screeningResult.saveObservationList(data);
      toastSuccess("Observations and encounter created!");
      this.nextTask();
    },
    getFacilities(filter = "") {
      return getFacilities(filter);
    },
    async getTreatmentOptions() {
      return await this.screeningResult.getFirstValueCoded('CxCa screening method');
    },
    getOptions(method: string) {
      if(!method) {
        
        toastWarning("No screening methods have been selected");
        this.gotoPatientDashboard();

      }
      if(method.match(/via/i)){
        return ["VIA Negative","VIA Positive","Suspect Cancer"];
      }else if(method.match(/smear/i)){
        return ["PAP Smear Normal","PAP Smear Abnormal"];
      }else if(method.match(/HPV DNA/i)){
        return ["HPV positive","HPV negative"];
      }else if(method.match(/Speculum/i)){
        return ["Visible Lesion","No visible Lesion", "Suspect Cancer", "Other Gynae"];
      }
      return []
    },
    getFields(): any {
      return [
        {
          id: "results_available",
          helpText: "Screening result available",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => this.yesNoOptions(),
          computedValue: (value: any) => ({
            obs: this.screeningResult.buildValueCoded('Screening results available', value.value)
          })
        },
        {
          id: "screening_result",
          helpText: "Screening Result",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => this.mapOptions([...this.getOptions(this.currentMethod)]),
          condition(formData: any) {
            return formData.results_available.value === "Yes";
          },
          computedValue: (value: any) => ({
            obs: this.screeningResult.buildValueCoded('Screening results', value.value)
          })
        },
        {
          id: "gynae_options",
          helpText: "Other Gynae treatment",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => {
            return this.mapOptions([
              "STI",
              "Cervicitis",
            ]);
          },
          condition(formData: any) {
            return formData.screening_result.value === "Other Gynae";
          },
          computedValue: (value: any) => ({
            obs: this.screeningResult.buildValueCoded('Screening results', value.value)
          })
        },
        {
          id: "offer_via",
          helpText: "Offer VIA",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => this.yesNoOptions(),
          condition(formData: any) {
            return formData.screening_result.value === "HPV positive";
          },
          computedValue: (value: any) => ({
            obs: this.screeningResult.buildValueCoded('Patient went for VIA?', value.value)
          })
        },
        {
          id: "via_screening_results",
          helpText: "VIA screening results",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => {
            return this.mapOptions([
              "VIA negative",
              "VIA positive",
              "Suspect cancer",
            ]);
          },
          condition(formData: any) {
            return formData.offer_via.value === "Yes";
          },
          computedValue: (value: any) => ({
            obs: this.screeningResult.buildValueCoded('VIA Results', value.value)
          })
        },
        {
          id: "reason_for_not_offering_via",
          helpText: "Reason for NOT offering VIA",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => {
            return this.mapOptions([
              "Client NOT ready",
              "Treatment not available",
              "Other conditions",
            ]);
          },
          condition(formData: any) {
            return formData.offer_via.value === "No";
          },
          computedValue: (value: any) => ({
            obs: this.screeningResult.buildValueCoded('Other reason for not seeking services', value.value)
          })
        },
        // Adding free text field for further details when "Other conditions" & "Treatment not available" are selected
        {
            id: 'further_details',
            helpText: 'Further details',
            type: FieldType.TT_TEXT,
            validation: (val: any) => Validation.required(val),
            computedValue: (value: any) => ({
              obs: this.screeningResult.buildValueText('Other reason for not seeking services', value.label)
            }),
            condition: (f: any) => {
              return f.possible_reasons_why.value === 'Other conditions' || f.possible_reasons_why.value === 'Treatment not available' 
            }
        },
        {
          id: "treatment_option",
          helpText: "Enter treatment option",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => {
            return this.mapOptions([
              "Same day treatment",
              "Postponed treatment",
              "Referral",
            ]);
          },
          condition(formData: any) {
            return !['VIA Negative', 'No visible Lesion', 'PAP Smear Normal', 'HPV negative'].includes(formData.screening_result.value);
          },
          computedValue: (value: any) => ({
            obs: this.screeningResult.buildValueCoded('Directly observed treatment option', value.value)
          })
        },
        {
          id: "postponed_reason",
          helpText: "Select reason for postponing treatment",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => {
            return this.mapOptions([
              "Client not ready",
              "Treatment not available",
              "Other conditions",
            ]);
          },
          condition(formData: any) {
            return formData.treatment_option.value === "Postponed treatment";
          },
          computedValue: (value: any) => ({
            obs: this.screeningResult.buildValueCoded('Postponed reason', value.value)
          })
        },
        {
          id: "referral_rreason",
          helpText: "Referral reason",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => {
            return this.mapOptions([
              "Further Investigation and Management",
              "Large Lesion (Greater than 75 percent)",
              "Unable to treat client",
              "Suspect Cancer",
              "Treatment not available",
              "Other conditions",
            ]);
          },
          condition(formData: any) {
            return formData.treatment_option.value === "Referral";
          },
          computedValue: (value: any) => ({
            obs: this.screeningResult.buildValueCoded('Referral reason', value.value)
          })
        },
        // Adding free text field for further details when "Unable to treat client" & "Other conditions" are selected
        {
            id: 'further_details',
            helpText: 'Further details',
            type: FieldType.TT_TEXT,
            validation: (val: any) => Validation.required(val),
            computedValue: (value: any) => ({
              obs: this.screeningResult.buildValueText('Referral reason', value.label)
            }),
            condition: (f: any) => {
              return f.possible_reasons_why.value === 'Other conditions' || f.possible_reasons_why.value === 'Unable to treat client' 
            }
        },
      ];
    },
  },
});
</script>