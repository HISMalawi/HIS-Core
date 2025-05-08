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
import { AssessmentService } from "@/apps/CxCa/services/CxCaAssessmentService";
import { toastSuccess, toastWarning } from "@/utils/Alerts";
import { generateDateFields, EstimationFieldType } from "@/utils/HisFormHelpers/MultiFieldDateHelper";
import { getFacilities } from "@/utils/HisFormHelpers/LocationFieldOptions";
import { ConceptService } from "@/services/concept_service";
import { ObservationService } from '@/services/observation_service';

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    assessment: {} as any,
    obs: [] as any,
    showHIVQuestions: true,
    alreadyOnTreatment: false,
    offerCxCa: false,
    patientPreviousTreatment: "",
    patientPreviousVisitHIVStatus: "",
  }),
  watch: {
    patient: {
      async handler() {
        this.assessment = new AssessmentService(
          this.patientID,
          this.providerID
        );
        // Retrieving previous treatment if available
        this.patientPreviousTreatment = await ObservationService.getFirstValueCoded(this.patientID, 'Treatment')
        // Retrieving HIV Status if available
        this.patientPreviousVisitHIVStatus = await ObservationService.getFirstValueCoded(this.patientID, 'HIV status')

        // patient already enrolled
        this.alreadyOnTreatment = this.patientAlreadyOnTreatment()

        ConceptService.getConceptsByCategory("reason_for_no_cxca")

        await this.assessment.loadArtStatus();
        
        if (this.assessment.getHivStatus() !== '') {
          this.showHIVQuestions = false;
        }

        if(this.assessment.getHivStatus() === "Positive"){
          this.showHIVQuestions = false;
        }

        await this.setOfferCxCa();
        this.fields = await this.getFields();
      },
      deep: true,
    },
  },
  methods: {
    // Used to skip treatment field for a client on any of the three below
    skipTreatmentSelection(): boolean {
      const medicalProcedures = ["Chemotherapy", "Hysterectomy", "Palliative Care"];
      if (this.patientPreviousTreatment) {
        const normalizedTreatment = this.patientPreviousTreatment;
        return medicalProcedures.includes(normalizedTreatment);
      }else{
        return false;
      }
    },
    // Used to skip HIV Status field for a client who's positive
    skipHIVStatusSelection(): boolean {
      const medicalProcedures = ["positive on art", "positive not on art"];
      if (this.patientPreviousVisitHIVStatus) {
        const normalizedPatientHIVStatus = this.patientPreviousVisitHIVStatus.toLowerCase();
        return medicalProcedures.includes(normalizedPatientHIVStatus.toLowerCase());
      } else {
        return false;
      }
    },
    
    patientAlreadyOnTreatment(){
      return !(this.isNullOrUndefined(this.patientPreviousTreatment))
    },
    isNullOrUndefined(str: string | null | undefined): boolean {
      return typeof str === 'undefined' || str === null;
    },

    async onFinish(_formData: any, computed: any) {
      
      const encounter = await this.assessment.createEncounter();

      if (!encounter) return toastWarning("Unable to create encounter");
      const vals: any = [];
      Object.keys(computed).forEach(element => {
        vals.push(computed[element].obs);
      });
      const data = await Promise.all([...this.obs, ...vals]);

      const obs = await this.assessment.saveObservationList(data);

      if (!obs) return toastWarning("Unable to save patient observations");

      toastSuccess("Observations and encounter created!");

      this.nextTask();
    },
    async setOfferCxCa() {
      const data = await this.assessment.getFirstValueCoded("Offer CxCa");
      this.offerCxCa = data && data === "Yes";
      if (!this.offerCxCa) {
        this.obs.push(this.assessment.buildValueCoded("Ever had CxCa", "No"));
      }
      return true;
    },
    hasHIVStatus() {
      return this.assessment.getHivStatus !== ""
    },
    enterPreviousCxCaData(formData: any) {
      const everHadCxCa = formData.ever_had_cxca.value === "Yes";
      const resultsAvailable = formData.results_available.value === "Yes";
      return everHadCxCa && resultsAvailable;
    },
    getFacilities(filter = "") {
      return getFacilities(filter);
    },
    getReasonsForNoCxcaOptions() {
      return ConceptService.getConceptsByCategory("reason_for_no_cxca")
        .map((c: any) => ({
          label: c.name,
          value: c.name,
          other: {
            c
          }
        }))
    },
    getFields(): any {
      return [
        {
          id: "reason_for_visit",
          helpText: "Reason for visit",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => [
            {
              label: "Initial screening",
              value: "Initial screening",
            },
            {
              label: "Postponed treatmment",
              value: "Postponed treatment",
            },
            {
              label: "One year subsequent check-up after treatment",
              value: "One year subsequent check-up after treatment",
            },
            {
              label: "Subsequent screening",
              value: "Subsequent screening",
            },
            {
              label: "Problem visit after treatment",
              value: "Problem visit after treatment",
            },
            {
              label: "Referral",
              value: "Referral",
            },
          ],
          computedValue: (value: any) => ({
            obs: this.assessment.buildValueCoded("Reason for visit", value.value)
          })
        },
        {
          id: "hiv_status",
          helpText: "HIV status",
          type: FieldType.TT_SELECT,
          condition: () => this.showHIVQuestions && !this.skipHIVStatusSelection(),
          validation: (val: any) => Validation.required(val),
          options: () => [
            {
              label: "Positive on ART",
              value: "Positive on ART",
            },
            {
              label: "Positive Not on ART",
              value: "Positive Not on ART",
            },
            {
              label: "Negative",
              value: "Negative",
            },
            {
              label: "Never tested",
              value: "Never tested",
            },
            {
              label: "Prefers Not to disclose",
              value: "Undisclosed",
            },
          ],
          computedValue: (value: any) => ({
            obs: this.assessment.buildValueCoded("HIV status", value.value)
          })
        },
        ...generateDateFields(
          {
            id: "hiv_test_date",
            helpText: "HIV test result date",
            required: true,
            condition: (formData: any) =>
              formData.hiv_status.value.match(/Negative|ART/i),
            minDate: () => this.patient.getBirthdate(),
            maxDate: () => this.assessment.getDate(),
            //I've allowed for unknown dates to address the issue of the date picker not allowing for unknown dates
            //this was a requirement from the client and analyst team
            estimation: {
              allowUnknown: true,
              estimationFieldType: EstimationFieldType.MONTH_ESTIMATE_FIELD
            },
            computeValue: (date: string, isEstimate: boolean) => {
              return {
                date,
                tag: "cxca screening",
                isEstimate,
                obs: this.assessment.buildValueDate("HIV test date", date, isEstimate),
              };
            },
          }
        ),
        {
          id: "ever_had_cxca",
          helpText: "Ever had CxCa screening",
          type: FieldType.TT_SELECT,
          condition: (formData: any) =>
            formData.reason_for_visit.value !== "Initial screening" && !this.alreadyOnTreatment,
          options: () => this.yesNoOptions(),
          validation: (val: any) => Validation.required(val),
          computedValue: (value: any) => ({
            obs: this.assessment.buildValueCoded("Ever had CxCa", value.value)
          })
        },
        {
          id: "results_available",
          helpText: "Results available?",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          
          condition: (formData: any) =>
            formData.reason_for_visit.value !== "Initial screening" && formData.ever_had_cxca.value !== "No",
          options: () => this.yesNoOptions(),
          computedValue: (value: any) => ({
            obs: this.assessment.buildValueCoded("CxCa test results", value.value)
          })
        },
        {
          id: "location",
          helpText: "CxCa screening location",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: (_: any, filter = "") => this.getFacilities(filter),
          config: {
            showKeyboard: true,
            isFilterDataViaApi: true,
          },
          condition: (formData: any) => this.enterPreviousCxCaData(formData),
          computedValue: (value: any) => ({
            obs: this.assessment.buildValueText("Previous CxCa location", value.value)
          })
        },
        ...generateDateFields(
          {
            id: "cxca_date",
            helpText: "Previous CxCa test",
            required: true,
            minDate: () => this.patient.getBirthdate(),
            maxDate: () => this.assessment.getDate(),
            estimation: {
              allowUnknown: false,
            },
            condition: (formData: any) => this.enterPreviousCxCaData(formData),
            computeValue: (date: string, isEstimate: boolean) => {
              return {
                date,
                tag: "cxca screening",
                isEstimate,
                obs: this.assessment.buildValueDate("cxca test date", date),
              };
            },
          }
        ),
        {
          id: "previous_screening_method",
          helpText: "Previous screening method",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: (formData: any) => this.enterPreviousCxCaData(formData),
          options: () => [
            {
              label: "VIA",
              value: "VIA",
            },
            {
              label: "PAP Smear",
              value: "PAP Smear",
            },
            {
              label: "HPV DNA",
              value: "HPV DNA",
            },
            {
              label: "Speculum Exam",
              value: "Speculum Exam",
            },
          ],
          computedValue: (value: any) => ({
            obs: this.assessment.buildValueCoded("Previous CxCa screening method", value.value)
          })
        },
        {
          id: "offer_CxCa",
          helpText: "Offer CxCa screening today",
          type: FieldType.TT_SELECT,
          condition: this.skipTreatmentSelection(),
          validation: (val: any) => Validation.required(val),
          options: () => this.yesNoOptions(),
          computedValue: (value: any) => ({
            obs: this.assessment.buildValueCoded("Offer CxCa", value.value)
          })
        },
        {
          id: "screening_method",
          helpText: "Screening method being offered",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: (formData: any) => formData.offer_CxCa.value === "Yes",
          options: () => [
            {
              label: "VIA",
              value: "VIA",
            },
            {
              label: "PAP Smear",
              value: "PAP Smear",
            },
            {
              label: "HPV DNA",
              value: "HPV DNA",
            },
            {
              label: "Speculum Exam",
              value: "Speculum Exam",
            },
          ],
          computedValue: (value: any) => ({
            obs: this.assessment.buildValueCoded("CxCa screening method", value.value)
          }),
        },
        /*added new fields for family planning
        */
        {
          id: 'offer_family_planning',
          helpText: 'Offer Family Planning ?',
          type: FieldType.TT_SELECT,
          condition: (formData: any) => formData.offer_CxCa.value !== "No",
          validation: (val: any) => Validation.required(val),
          options: () => this.yesNoOptions(),
          computedValue: (value: any) => ({
          obs: this.assessment.buildValueCoded('Family planning', value.label)
          })
        },
        {
          id: "reason_for_no_cxca",
          helpText: "Reason for NOT offering CxCa screening",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: (formData: any) => formData.offer_CxCa.value === "No",
          options: () => this.getReasonsForNoCxcaOptions(),
          computedValue: (value: any) => ({
            obs: this.assessment.buildValueCoded("Reason for NOT offering CxCa", value.value)
          }),
        },
      ];
    },
  },
});
</script>