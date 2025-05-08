<template>
  <his-standard-form 
    :fields="fields" 
    :onFinishAction="onFinish" 
    :skipSummary="true"
    :activeField="fieldComponent"
  />
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { Patientservice } from "@/services/patient_service"
import { toastWarning } from "@/utils/Alerts"
import { AppInterface } from "@/apps/interfaces/AppInterface";
import { Field, Option } from "@/components/Forms/FieldInterface"
import Validation from "@/components/Forms/validations/StandardValidations"
import HisApp from "@/apps/app_lib"
import { isEmpty } from "lodash"
import table from "@/components/DataViews/tables/ReportDataTable"
import { ProgramService } from "@/services/program_service";
import { loadingController } from "@ionic/core";
import { GlobalPropertyService } from "@/services/global_property_service";

export default defineComponent({
  components: { HisStandardForm },
  data: () => ({
    app: {} as AppInterface,
    fields: [] as Field[],
    fieldComponent: '' as string,
    people: [] as any[],
    patient: {} as Patientservice,
    assignNewARVNumber: false,
    suggestedARVNumber: '' as string,
  }),
  created() {
    this.setApp()
    this.fields = [
      this.getIdSelectionField(),
      this.getIdSearchField(),
      this.getARVDuplicatesField(),
      this.getReassignARVNumberField()
    ]
  },
  methods: {
    getIdSelectionField(): Field {
      return {
        id: "identifier_type",
        helpText: "Select identifier type",
        type: FieldType.TT_SELECT,
        requireNext: false,
        validation: (val: Option) => Validation.required(val),
        options: async () => {
          const ids = this.app.programPatientIdentifiers
            ? Object.values(this.app.programPatientIdentifiers) 
            : []

          const resolvedProps = await Promise.all(ids.map(async (id) => {
            if (typeof id.visible === 'function') {
              return await id.visible()
            }
            if(id.globalPropertySetting){
              return await GlobalPropertyService.isProp(id.globalPropertySetting)
            }
            return true
          })) 

          return ids
            .filter((id, index) => id.useForSearch && resolvedProps[index]) 
            .map(identifier => ({
              label: identifier.name,
              value: identifier.id,
              other: identifier
          }))
        }
      }
    },
    getIdSearchField(): Field {
      return {
        id: "identifier",
        helpText: "Identifier",
        dynamicHelpText: (f: any) => `Search by ${f.identifier_type.label}`,
        type: FieldType.TT_TEXT,
        validation: (val: Option, f: any) => Validation.validateSeries([
          () => Validation.required(val),
          () => (typeof f.identifier_type.other?.validation === 'function') 
            ? f.identifier_type.other.validation(val)
            : null
        ]),
        config: {
          casing: 'uppercase',
          initialKb: (f: any) => f.identifier_type.other?.keyboardName || '0-9',
          prependValue: (f: any) => f.identifier_type.other?.prefix() || '',
        },
      }
    },
    getARVDuplicatesField(): Field {
      return {
        id: 'arv_duplicates',
        helpText: 'Duplicates',
        dynamicHelpText: (f: any) => `Duplicate patients with identifer ${f.identifier.value}`,
        type: FieldType.TT_DATA_TABLE,
        requireNext: false,
        condition:  async (f: any) => await this.hasDuplicates(f) && f.identifier_type.label === "ARV Number",
        config: {
          hiddenFooterBtns: ["Clear", "Finish"],
          columns: () => [
            [
              table.thTxt('First Name'),
              table.thTxt('Family Name'),
              table.thTxt('Gender'),
              table.thDate('Birthdate'),
              table.thTxt('Current Village'),
              table.thTxt('Actions', {colspan: 2}),
            ]
          ],
          rows: () => this.people.map(p => {
            const patient = new Patientservice(p)
            return [
              table.td(patient.getGivenName()),
              table.td(patient.getFamilyName()),
              table.td(patient.getGender()),
              table.tdDate(patient.getBirthdate()?.toString()),
              table.td(patient.getCurrentVillage()),
              table.tdBtn('Select patient', () => this.selectPatient(patient.getID()), {
                style: {
                  fontSize: '12px',
                  textTransform: 'none'
                }
              }, 'warning'),
              table.tdBtn('Re-assign identifier', () => this.reassignARVNumber(patient), {
                style: {
                  fontSize: '12px',
                  textTransform: 'none'
                }
              }, 'danger')
            ]
          })
        }
      }
    },
    getReassignARVNumberField(): Field {
      return {
        id: "arv_number",
        helpText: "ART number",
        type: FieldType.TT_TEXT,
        computedValue: ({ value }: Option) => {
          return value
        },
        validation: (val: any) => Validation.required(val),
        condition: () => this.fieldComponent === 'arv_number' && this.assignNewARVNumber,
        defaultValue: () => this.suggestedARVNumber,
        config: {
          initialKb: '0-9',
          prependValue: (f: any) => {
            return f.identifier_type.other.prefix()
          }
        },
      }
    },
    setApp() {
      const app = HisApp.getActiveApp()
      if (app) this.app = app
    },
    async hasDuplicates(formData: any) {
      this.people = await Patientservice.findByOtherID(formData.identifier_type.value, formData.identifier.value)
      return this.people.length > 1
    },
    selectPatient(patientId: string | number) {
      this.$router.push(`/patients/confirm?person_id=${patientId}`);
    },
    async reassignARVNumber(patient: Patientservice) {
      const loader = await loadingController.create({})
      loader.present()
      const NextARVNumber = await ProgramService.getNextSuggestedARVNumber()
      this.suggestedARVNumber = NextARVNumber.arv_number.replace(/^\D+|\s/g, "")
      this.patient = patient
      this.assignNewARVNumber = true,
      this.fieldComponent = "arv_number"
      loader.dismiss()
    },
    async onFinish(formData: Record<string, any>) {
      if (isEmpty(this.people)) {
        toastWarning('Client not found')
      } else if(this.assignNewARVNumber && !isEmpty(this.patient)) {
        try {
          await this.patient.updateARVNumber(formData.arv_number.value)
          this.selectPatient(this.patient.getID())
        } catch (error) {
          toastWarning(`${error}`)
        }
      } else {
        const patient = new Patientservice(this.people[0])
        this.selectPatient(patient.getID())
      } 
    },
  }
});
</script>
