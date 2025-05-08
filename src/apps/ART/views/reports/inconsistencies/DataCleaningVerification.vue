<template>
  <ion-page>
        <his-standard-form
            :fields="fields"
            :onFinishAction="onFinish"
            :skipSummary="true"
            cancelDestinationPath="/"
        >
        </his-standard-form>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from "vue";
import { DataCleaningReportService, DataCleaningVerificationData } from "@/apps/ART/services/reports/data_cleaning_report_service";
import { FieldType } from "@/components/Forms/BaseFormElements";
import { IonPage } from "@ionic/vue";
import EncounterMixinVue from "@/views/EncounterMixin.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import { Option } from "@/components/Forms/FieldInterface";
import PersonHelper from "@/utils/HisFormHelpers/PersonFieldHelper"

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { IonPage },
  created() {
    this.fields = [
        {
            id: "data_cleaning_datetime",
            helpText: "Date data cleaning done",
            type: FieldType.TT_FULL_DATE,
            computedValue: (v: Option) => v.value,
            validation: (v: Option) => Validation.required(v)
        },
        (() => {
            const field = PersonHelper.getGivenNameField()
            field.helpText = "Verifier's First name"
            field.proxyID = 'supervisors'
            return field
        })(),
        (() => {
            const field = PersonHelper.getFamilyNameField()
            field.helpText = "Verifier's Last name"
            field.proxyID = 'supervisors'
            field.computedValue = (v: Option, f: any) => `${f.given_name.value} ${v.value}`
            return field
        })(),
        {
          id: "has_comment",
          helpText: "Any comments or notes to add?",
          type: FieldType.TT_SELECT,
          validation: (v: Option) => Validation.required(v),
          options: this.yesNoOptions
        },
        {
          id: "comments",
          helpText: "Comments",
          type: FieldType.TT_NOTE,
          validation: (v: Option) => Validation.required(v),
          computedValue: (v: Option) => v.value,
          condition: (f: any) => f.has_comment.value === 'Yes' 
        }
    ]
  },
  methods: {
    async onFinish(_: any, data: DataCleaningVerificationData) {
        const ok = await new DataCleaningReportService().saveDataCleaningVerification(data)
        if (ok) this.$router.back()
    }
  }
})
</script>
