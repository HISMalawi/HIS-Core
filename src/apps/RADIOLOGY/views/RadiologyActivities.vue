<template>
  <his-standard-form
    :fields="fields"
    :skipSummary="true"
    @onFinish="onFinish">
  </his-standard-form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import EncounterMixinVue from "@/views/EncounterMixin.vue";
import table from "@/components/DataViews/tables/ReportDataTable"
import { RadiologyExaminationService } from "../services/radiology_examination_service";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  watch: {
    ready: {
      handler(ready: boolean) {
        if (ready) {
            const service = new RadiologyExaminationService(this.patientID, this.providerID)
            this.fields = [
                {
                    id: "patient_radiology_orders",
                    helpText: "Radiology activities",
                    type: FieldType.TT_DATA_TABLE,
                    config: {
                        columns: () => [
                            [
                                table.thTxt('Accession Number'),
                                table.thTxt('Examination'),
                                table.thTxt('Date'),
                                table.thTxt('Action')
                            ]
                        ],
                        rows: async () => {
                            return (await service.getPatientExaminations() || []).map((order: any) => {
                                return [
                                    table.td(order.accession_number),
                                    table.td(order.examination_name),
                                    table.tdDate(order.order_date),
                                    table.tdBtn('Print', () => service.printExamination(order.accession_number))
                                ]
                            })
                        },
                        hiddenFooterBtns: ["Clear", 'Cancel'],
                    }
                }
            ]
            }
        }
    }
  },
  methods: {
    onFinish() {
        this.gotoPatientDashboard()
    }
  }
})
</script>
