

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
import { TreatmentService } from "@/apps/CxCa/services/CxCaTreatmentService";
import { toastWarning } from "@/utils/Alerts";
import { ProgramService } from "@/services/program_service";
import { ProgramWorkflow } from "@/interfaces/program_workflow";
import table from "@/components/DataViews/tables/ReportDataTable";
import { ConceptService } from "@/services/concept_service";
import CXCA_GLOBAL_PROP from "@/apps/CxCa/cxca_global_props";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    reception: {} as any,
    summaryData: {} as any,
    referralReason: "",
    isReferralSiteEnabled: false,
    skipToTreatment: false,
  }),
  watch: {
    patient: {
      async handler() {
        this.reception = new TreatmentService(this.patientID, this.providerID);
        this.summaryData = await this.reception.getSummary();
        this.isReferralSiteEnabled = (await CXCA_GLOBAL_PROP.isReferralSiteEnabled())
        await this.setReason();
        this.fields = this.getFields();
      },
      deep: true,
    },
  },
  methods: {
    // Update treatment options basing on same day treatment
    updateTreatmentOptions(condition: boolean, options: any[]): any[] {
      const disabledOptionLabels = [
        'Hysterectomy',
        'Chemotherapy',
        'Palliative Care',
        'Treatment with antibiotic',
        'Anti-parasitic medication',
        'Conisation'
      ];

      return options.map((option) => ({
        ...option,
        disabled: condition && disabledOptionLabels.includes(option.label),
      }));
    },
    isNotSameDayTreatment(){
      return this.summaryData?.['Treatment Type'] !== "Same day treatment";
    },
    async setReason() {
      const reason = await this.reception.getFirstValueCoded('Referral reason');
      this.referralReason = reason ? reason : "N/A"
    },
    showSampleCollected() {
      const reasons = ['Large Lesion (>75%)','Suspect cancer', 'Further Investigation and Management'];
      return reasons.includes(this.referralReason);
    },
    async onFinish(formData: any, computed: any) {
      const encounter = await this.reception.createEncounter();
      //Using the approach I got from the Diagnosis.vue file
      const cxcaData = await this.resolveObs({...computed})
      //save the data
      await this.reception.saveObservationList(cxcaData)

      if (!encounter) return toastWarning("Unable to create encounter");
      const programID = ProgramService.getProgramID();
      const workflows: ProgramWorkflow[] =
        await ProgramService.getProgramWorkflows(ProgramService.getProgramID());
      const flows = {} as any;
      workflows.forEach((w) => {
        w.states.forEach((f) => {
          const conceptID = f.program_workflow_state_id;
          const conceptName = f.concept.concept_names[0].name;
          flows[conceptName] = conceptID;
        });
      });
      
      const stateValue = formData.patient_outcome ? formData.patient_outcome.value : 'Continue follow-up';
      //getting the concept ID for flow[stateValue] to prevent the bad request bug that occurs when the stateValue is undefined
      const concepid = await ConceptService.getConceptID(stateValue);
      //assigning the concept ID to flow[stateValue] to prevent the undefined bug
      flows[stateValue] = concepid;

      const state = {
        'location_id': ProgramService.getLocationName(),
        state: flows[stateValue],
        date: ProgramService.getSessionDate(),
      };
      console.log("STATE ", state)
      const saveState = await ProgramService.createState(
        this.patientID,
        programID,
        state
      );

      if (!saveState) return toastWarning("Unable to update state");
      this.nextTask();
    },

    getFields(): any {
      return [
        {
          id: "screening_summary",
          helpText: "Screening Summary",
          type: FieldType.TT_DATA_TABLE,
          config: {
            rows: () => {
              return Object.keys(this.summaryData).map((k: string) => {
                return [table.td(k), table.td(this.summaryData[k])];
              });
            },
            dataTableConfig: {
              showIndex: false
            },
          },
        },
        //New referral work flow implemented here
        {
          id: "type_of_referral",
          helpText: "Type of referral visit",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: () => this.isNotSameDayTreatment() && !this.isReferralSiteEnabled,
          options: () => {
            return [
              { label: 'Initial/1st visit to referral facility', value: 'Initial visit' },
              { label: 'Follow-up visit', value: 'Follow-up' }
            ]},
            computedValue: (value: any) => ({
            obs: this.reception.buildValueCoded('Referral reason', value.value)
          })
        },
        /*the following fields are only visible if the location isn't a referral site
         *they will be tagged with a minor description of `non-referral site field`*/
        //non-referral site field
        {
            id: 'returning_client_referral_question',
            helpText: 'Did the returning patient visit the referral facility ?',
            type: FieldType.TT_SELECT,
            validation: (val: any) => Validation.required(val),
            condition: () => this.isNotSameDayTreatment() && this.isReferralSiteEnabled,
            options: () => this.yesNoOptions(),
            computedValue: (value: any) => ({
            obs: this.reception.buildValueCoded('Are Histological results after LLETZ available', value.label)
          })
        },
        //non-referral site field
        //after completing this field skip to Treatment Field
        {
          id: "possible_reasons_why",
          helpText: "Possible reasons why client didn't visit",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: (f: any) => {
            this.skipToTreatment = f.returning_client_referral_question.value === 'No' //assign true to skip to treatment
            return f.returning_client_referral_question.value === 'No' && this.isNotSameDayTreatment() && this.isReferralSiteEnabled
          },
          options: () => {
            return [
              { label: 'Provider unavailable', value: 'Provider NOT available' },
              { label: 'Transport lacking', value: 'Transport problems' },
              { label: 'Other', value: 'Other (Specify)' }
            ]},
            computedValue: (value: any) => ({
            obs: this.reception.buildValueCoded('Reason for no result', value.value)
          })
        },
        {
            id: 'other_reason',
            helpText: 'Other reason',
            type: FieldType.TT_TEXT,
            validation: (val: any) => Validation.required(val),
            computedValue: (value: any) => ({
              obs: this.reception.buildValueText('Other reason for not seeking services', value.label)
            }),
            condition: (f: any) => f.possible_reasons_why.value === 'Other (Specify)'
        },
        {
          id: "cervix_screening_assessment",
          helpText: "Cervix Screening Assessment",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: () => this.isNotSameDayTreatment() && !this.skipToTreatment,
          options: () =>{
            return [
                  { label: 'STI Infection', value: 'STI Infection' },
                  { label: 'VIA Negative', value: 'VIA Negative' },
                  { label: 'VIA Positive', value: 'VIA Positive' },
                  { label: 'PAP Smear Normal', value: 'PAP Smear Normal' },
                  { label: 'PAP Smear Abnormal', value: 'PAP Smear Abnormal' },
                  { label: 'No Visible Lesion (After Speculum)', value: 'No visible Lesion' },
                  { label: 'Suspected Cancer', value: 'Suspected Cancer' }
              ]},
            computedValue: (value: any) => ({
            obs: this.reception.buildValueCoded('Cervix screening assessment', value.value)
          })
        },
        {
            id: 'are_figo_staging_results_available',
            helpText: 'Are FIGO staging results available?',
            type: FieldType.TT_SELECT,
            validation: (val: any) => Validation.required(val),
            condition: () => this.isNotSameDayTreatment() && !this.skipToTreatment,
            options: () => this.yesNoOptions(),
            computedValue: (value: any) => ({
            obs: this.reception.buildValueCoded('Are FIGO staging results available', value.value) //Please build this observation using the buildValueCoded method
          })
        },
        {
          id: "figo_staging_results",
          helpText: "FIGO staging results",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: (f: any) => f.are_figo_staging_results_available.value === 'Yes' && this.isNotSameDayTreatment() && !this.skipToTreatment,
          options: () =>
            this.mapOptions([
              'Cervical stage 1',
              'Cervical stage 2',
              'Cervical stage 3',
              'Cervical stage 4',
            ]),
            computedValue: (value: any) => ({
            obs: this.reception.buildValueCoded('FIGO staging of cervical cancer', value.label)
          })
        },
        {
          id: "type_of_sample_collected",
          helpText: "Type of sample collected",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: () => this.isNotSameDayTreatment() && !this.skipToTreatment,
          options: () =>
            this.mapOptions([
              'Punch Biopsy',
              'LLETZ/LEEP Sample',
              'Cone Biopsy Sample',
            ]),
          computedValue: (value: any) => ({
            obs: this.reception.buildValueCoded('Sample', value.label)
          })
        },
        {
            id: 'are_histological_results_after_lletz_available',
            helpText: ``,
            dynamicHelpText: (f: any) => {
              return `Are Histology results after ${f.type_of_sample_collected.value} available`
            },
            type: FieldType.TT_SELECT,
            validation: (val: any) => Validation.required(val),
            condition: () => this.isNotSameDayTreatment() && !this.skipToTreatment,
            options: () => this.yesNoOptions(),
            computedValue: (value: any) => ({
            obs: this.reception.buildValueCoded('Are Histological results after LLETZ available', value.label)
          })
        },
        {
          id: "histology_results_after_lletz",
          helpText: "Histology Results After LLETZ",
          dynamicHelpText: (f: any) => {
              return `Histology Results After ${f.type_of_sample_collected.value}`
            },
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: (f: any) => f.are_histological_results_after_lletz_available.value === 'Yes' && this.isNotSameDayTreatment() && !this.skipToTreatment,
          options: () =>
            this.mapOptions([
              'Normal',
              'Chronic Cervicitis',
              'Schistosomiasis',
              'Tuberculosis(TB)',
              'CIN 1',
              'CIN 2',
              'CIN 3',
              'Carcinoma in Situ',
              'Invasive cancer of cervix',
              'Benign warts',
            ]),
            computedValue: (value: any) => ({
            obs: this.reception.buildValueCoded('Sample', value.label)
          })
        },
        //Complication fields will not be visible if the site isn't a referral site
        {
          id: "complications_during_lletz_leep_biopsy",
          helpText: "Complications During LLETZ/LEEP Biopsy",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: () => this.isNotSameDayTreatment() && !this.skipToTreatment && !this.isReferralSiteEnabled,
          options: () => {
            return [
                { label: 'None (N/A)', value: 'None' },
                { label: 'Excessive Bleeding or pain', value: 'Excessive Bleeding or pain' }
              ]},
            computedValue: (value: any) => ({
            obs: this.reception.buildValueCoded('Complications During LLETZ/LEEP Biopsy', value.value)
          })
        },
        {
          id: "complications_after_lletz_leep_biopsy",
          helpText: "Complications After LLETZ/LEEP Biopsy",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: () => this.isNotSameDayTreatment() && !this.skipToTreatment && !this.isReferralSiteEnabled,
          options: () => {
            return [
                  { label: 'None (N/A)', value: 'None' },
                  { label: 'Excessive Bleeding or pain', value: 'Excessive Bleeding or pain' }
              ]},
            computedValue: (value: any) => ({
            obs: this.reception.buildValueCoded('Complications After LLETZ/LEEP Biopsy', value.value)
          })
        },
        {
          id: "recommended_care_after_lletz_histology",
          helpText: "Recommended Care After LLETZ Histology",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: () => this.isNotSameDayTreatment() && !this.skipToTreatment,
          options: () => {
            return [
                { label: 'Hysterectomy', value: 'Hysterectomy' },
                { label: 'Chemotherapy', value: 'Chemotherapy' },
                { label: 'Palliative Care', value: 'Palliative Care' },
                { label: 'LLETZ/LEEP', value: 'LLETZ/LEEP' },
                { label: 'Treatment with antibiotic', value: 'Antibiotics' },
                { label: 'Anti-parasitic medication', value: 'Antiparasitic' },
                { label: 'Conisation', value: 'Conisation' },
                { label: 'Other', value: 'Other (Specify)' }
              ]},
            computedValue: (value: any) => ({
            obs: this.reception.buildValueCoded('Treatment', value.value)
          })
        },
        {
          id: "treatment_provided",
          helpText: "Treatment Provided",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: () => !this.skipToTreatment,
          options: () => {
            const treatmentOptions = [
              { label: 'Hysterectomy', value: 'Hysterectomy' },
              { label: 'Chemotherapy', value: 'Chemotherapy' },
              { label: 'Thermocoagulation', value: 'Thermocoagulation' },
              { label: 'Cryotherapy', value: 'Cryotherapy' },
              { label: 'Palliative Care', value: 'Palliative Care' },
              { label: 'LLETZ/LEEP', value: 'LLETZ/LEEP' },
              { label: 'Treatment with antibiotic', value: 'Antibiotics' },
              { label: 'Anti-parasitic medication', value: 'Antiparasitic' },
              { label: 'Conisation', value: 'Conisation' },
              { label: 'Other', value: 'Other (Specify)' }
            ]
            // Disable other treatment options for same day treatment
            return this.updateTreatmentOptions(!this.isNotSameDayTreatment(), treatmentOptions);
            
            },
            computedValue: (value: any) => ({
            obs: this.reception.buildValueCoded('Treatment', value.value)
          })
        },
        // New treatment field for same day treatment

        {
          id: "none_treatment_reasons",
          helpText: "Reasons why treatment was refused",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: (f: any) => f.treatment_provided.value === 'Other (Specify)',
          options: () => {
            return [
                  { label: 'Patient refused treatment', value: 'Patient refused' },
                  { label: 'Provider not available', value: 'Provider NOT available' },
                  { label: 'other', value: 'Other (Specify)' }
              ]},
            computedValue: (value: any) => ({
            obs: this.reception.buildValueCoded('Other reason for not seeking services', value.value)
          })
        },
        {
            id: 'other_reason',
            helpText: 'Other reason',
            type: FieldType.TT_TEXT,
            validation: (val: any) => Validation.required(val),
            computedValue: (value: any) => ({
              obs: this.reception.buildValueCoded('Other reason for not seeking services', value.value)
            }),
            condition: (f: any) => f.none_treatment_reasons.value === 'Other (Specify)'
        },
        {
          id: "patient_denial_outcome",
          helpText: "Patient outcome",
          type: FieldType.TT_SELECT,
          condition: (f: any) => this.isNotSameDayTreatment() && f.returning_client_referral_question.value === 'No',
          validation: (val: any) => Validation.required(val),
          options: () =>
            this.mapOptions([
              'Death',
              'On going follow-up',
              'Denied consultation',
            ]),
        },
        {
          id: "patient_outcome",
          helpText: "Patient outcome",
          type: FieldType.TT_SELECT,
          condition: (f: any) => this.isNotSameDayTreatment() && f.returning_client_referral_question.value === 'Yes',
          validation: (val: any) => Validation.required(val),
          options: () =>
            this.mapOptions([
              'On-going Palliative Care',
              'No Dysplasia/Cancer',
              'Death',
              'On going follow-up',
              'Denied consultation',
            ]),
        },
      ];
    },
  },
});
</script>