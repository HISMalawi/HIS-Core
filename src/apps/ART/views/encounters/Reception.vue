<template>
  <his-standard-form
    :fields="fields"
    :activeField="activeField"
    :onFinishAction="onFinish"
    :skipSummary="true"
    :cancelDestinationPath="cancelDestination"
  >
  </his-standard-form>
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { Field, Option } from "@/components/Forms/FieldInterface"
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import { ReceptionService } from "@/apps/ART/services/reception_service"
import { PatientTypeService } from "@/apps/ART/services/patient_type_service";
import { ProgramService } from "@/services/program_service";
import { toastWarning, toastSuccess, alertConfirmation } from "@/utils/Alerts"
import EncounterMixinVue from '../../../../views/EncounterMixin.vue'
import HisApp from "@/apps/app_lib"
import { find, isEmpty } from "lodash";
import Store from "@/composables/ApiStore"
import { EncounterService } from "@/services/encounter_service";
import { ConceptService } from "@/services/concept_service";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    reception: {} as any,
    activeField: "",
    hasARVNumber: true,
    suggestedNumber: "" as any,
    patientType: {} as any,
  }),
  watch: {
    ready: {
      handler(ready: any) {
        if (!ready) return
        this.reception = new ReceptionService(this.patientID, this.providerID)
        this.fields = this.getFields();
      },
      immediate: true
    },
  },
  methods: {
    async onFinish(formData: any, computedData: any) {
      const encounter = await this.reception.createEncounter()

      if (!encounter) return toastWarning('Unable to create encounter')

      const registrationObs = await this.resolveObs(computedData, 'obs')

      const obs = await this.reception.saveObservationList(registrationObs)

      if (!obs) return toastWarning('Unable to create Obs')

      if (formData.capture_arv && formData.capture_arv.value === 'Yes') {
        const arv = await this.reception.createArvNumber(computedData.arv_number)
        if (!arv) return toastWarning('Unable to save Arv number')
        Store.invalidate('ACTIVE_PATIENT')
      }
      toastSuccess('Encounter created')
      const guardianPresent = find(formData.who_is_present, { value: 'Yes', label: 'Guardian present?'})
      if (guardianPresent) {
        if (isEmpty((await this.patient.getGuardian()))) {
          return this.$router.push(`/guardian/registration/${this.patientID}`)
        } 
      }
      this.nextTask()
    },
    getFields(): Array<Field> {
      return [
        (() => {
          let patientPresent: string = ""
          return {
            id: "who_is_present",
            helpText: "HIV reception",
            type: FieldType.TT_MULTIPLE_YES_NO,
            init: async () => {
              // Assuming this was a guardian visit if wasnt present
              patientPresent = await this.reception.getFirstValueCoded('Patient present')
              return true
            },
            beforeNext: async (v: any) => {
              const enteredPatientPresent = find(v, { label: "Patient present?" })
              if (enteredPatientPresent?.value === patientPresent && patientPresent === "No") {
                return await alertConfirmation("Last visit was a Guardian Visit. The current visit requires the patient to be present. Do you want to proceed?")
              }
              return true
            },
            validation: (val: any) => Validation.required(val) || Validation.neitherOr(val) || Validation.anyEmpty(val),
            computedValue: (d: Array<Option>) => {
              return {
                tag: 'obs',
                obs: d.map(({ other, value }: Option) => this.reception.buildValueCoded(other.concept, value))
              }
            },
            onValueUpdate: async (options: Option[], active: Option) => {
              return options.map(o => {
                if (active.label != o.label && active.value === 'No') {
                  o.value = "Yes"
                }
                return o
              })
            },
            options: (form: any) => {
              if (form.who_is_present) return form.who_is_present as Option[]
              return [
                {
                  label: "Patient present?",
                  value: "",
                  other: {
                    concept: "Patient Present",
                    property: "patient_present",
                    values: this.yesNoOptions(),
                  },
                },
                {
                  label: "Guardian present?",
                  value: "",
                  other: {
                    concept: "Guardian Present",
                    property: "guardian_present",
                    values: this.yesNoOptions(),
                  },
                }
              ]
            }
          }
        })(),
        {
          id: "capture_arv",
          helpText: "Capture ARV Number?",
          type: FieldType.TT_SELECT,
          requireNext: true,
          init: async() => {
            const ARVNumber = this.patient.getPatientIdentifier(4);
            if (ARVNumber === "") this.hasARVNumber = false;
            this.patientType = new PatientTypeService(this.patientID, this.providerID);
            await this.patientType.loadPatientType()
            return true
          },
          condition: () => !this.hasARVNumber && this.patientType.getType() === "New patient",
          validation: (val: any) => Validation.required(val),
          options: () => this.yesNoOptions(),
        },
        {
          id: "arv_number",
          helpText: "ART number",
          type: FieldType.TT_TEXT,
          init: async() => {
            await this.reception.loadSitePrefix()
            if (!this.hasARVNumber) {
              const j = await ProgramService.getNextSuggestedARVNumber();
              this.suggestedNumber = j.arv_number.replace(/^\D+|\s/g, "");
            }
            return true
          },
          computedValue: ({ value }: Option) => {
            return value
          },
          validation: (val: any) => Validation.required(val),
          condition: (f: any) => !this.hasARVNumber && f.capture_arv.value === "Yes",
          defaultValue: () => this.suggestedNumber,
          config: {
            prependValue: () => {
              const artApp = HisApp.getActiveApp()
              if (artApp && artApp.programPatientIdentifiers) {
                const arvType = artApp.programPatientIdentifiers['ARV Number']
                return arvType.prefix()
              }
              return ''
            }
          }
        }
      ]
    }
  }
});
</script>
