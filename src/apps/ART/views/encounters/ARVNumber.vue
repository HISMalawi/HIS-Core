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
import { Field } from "@/components/Forms/FieldInterface"
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import { toastWarning } from "@/utils/Alerts"
import EncounterMixinVue from '../../../../views/EncounterMixin.vue'
import HisApp from "@/apps/app_lib"
import { IdentifierService } from "@/services/identifier_service";
import { ProgramService } from "@/services/program_service";
import Store from "@/composables/ApiStore"

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    patientHasARVNumber: false,
    currentArvNumber: "" as any,
    prependValue: "" as any,
  }),
  watch: {
    ready: {
      async handler(ready: any) {
        if (!ready) return
        const arvNumber = this.patient.getArvNumber()
        if(arvNumber !== "Unknown") {
          const a = arvNumber.split('-')
          this.currentArvNumber = a[2].replace(/^\D+|\s/g, "")
          this.prependValue = `${a[0]}-${a[1]}-`
          this.patientHasARVNumber = true
        } else {
          const suggestedNumber =  await ProgramService.getNextSuggestedARVNumber();
          this.currentArvNumber = suggestedNumber.arv_number.replace(/^\D+|\s/g, "");
        }
        this.fields = this.getFields();
      },
      immediate: true
    },
  },
  methods: {
    async onFinish(formData: any) {
      const newArvNumber = formData['arv_number'].value
      if(newArvNumber === this.patient.getArvNumber()) return this.$router.back()
      const exists = await IdentifierService.arvNumberExists(newArvNumber)
      if(exists) toastWarning("ARV number already exists", 5000)
      else {
        try {
          if(this.patientHasARVNumber) 
            await this.patient.updateARVNumber(newArvNumber)
          else await this.patient.createArvNumber(newArvNumber)
          Store.invalidate('ACTIVE_PATIENT')
          this.$router.back()
        } catch (e) {
          toastWarning(`${e}`)
        }
      }   
    },
    getFields(): Array<Field> {
      return [
        {
          id: "arv_number",
          helpText: "Update ARV Number",
          type: FieldType.TT_TEXT,
          validation: (val: any) => Validation.required(val),
          defaultValue: () => this.currentArvNumber,
          config: {
            initialKb: '0-9',
            prependValue: () => {
              if(this.prependValue) return this.prependValue
              const artApp = HisApp.getActiveApp()
              if (artApp && artApp.programPatientIdentifiers) {
                const arvType = artApp.programPatientIdentifiers['ARV Number']
                return arvType.prefix()
              }
              return ''
            },
            footerBtns: [
              {
                name: "Void ARV Number",
                slot: "end",
                color: 'danger',
                onClick: async () => {
                  await this.patient.updateARVNumber("Unknown")
                  Store.invalidate('ACTIVE_PATIENT')
                  this.$router.back()
                }
              }
            ]
          },
        }
      ]
    }
  }
});
</script>
