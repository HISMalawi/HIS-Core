<template>
  <his-standard-form
    :fields="fields"
    @onFinish="onFinish"
    :skipSummary="true"
    :cancelDestinationPath="cancelDestination">
  </his-standard-form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import EncounterMixinVue from "../../../../views/EncounterMixin.vue";
import { isEmpty } from "lodash";
import { OrderService } from "@/services/order_service";
import { printLabOrderLbl } from "@/views/Labels";
import dayjs from "dayjs";
import { ObservationService } from "@/services/observation_service";
import { infoActionSheet } from "@/utils/ActionSheets";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    fields: [] as any,
    fieldContext: {} as any,
  }),
  watch: {
    ready: {
      handler(ready: boolean) {
        if (ready) {
          this.fields = this.getFields() 
        }
      }
    }
  },
  methods: {
    onFinish() {
        this.nextTask()
    },
    getFields(): any {
      return [
        {
          id: "patient_lab_orders",
          helpText: "Lab orders",
          type: FieldType.TT_LAB_ORDERS,
          onload: (fieldContext: any) => {
            this.fieldContext = fieldContext
          },
          options: async () => {
            const orders: any = await OrderService.getOrdersIncludingGivenResultStatus(this.patientID);
            const VLOrders = OrderService.formatLabs(orders);
            return [
              {
                label: "Lab orders",
                value: "order trail",
                other: {
                  values: VLOrders,
                }
              }
            ]
          },
          config: {
            printOrder: (orderID: number) => {
              return printLabOrderLbl(orderID)
            },
            hiddenFooterBtns: ["Clear"],
            footerBtns: [
              {
                name: "Order",
                size: "large",
                slot: "end",
                color: "primary",
                visible: true,
                onClick: async () => {
                  if (!isEmpty(this.fieldContext)) {
                    if ((OrderService as any).getProgramName() != 'ART') {
                      return this.fieldContext.launchOrderSelection();
                    }
                    const isGuardianVisit = await (async () => {
                      const patientID = parseInt(`${this.$route.params.patient_id}`);
                      const obs = await (ObservationService as any).getFirstObs(patientID, 'Patient present')
                      if (!obs) return false
                      const lastVisitDate = dayjs(obs.obs_datetime)
                      const currentDate = dayjs((ObservationService as any).getSessionDate())
                      return lastVisitDate.isSame(currentDate, 'day') && obs.value_coded === 'No'
                    })()
                    if (isGuardianVisit) {
                      return infoActionSheet(
                          'Guardian visit warning',
                          'Doing lab orders on a guardian only visit is strictly forbidden.',
                          'Please arrange for a patient visit and update the HIV Reception encounter to proceed...',
                          [
                            { 
                                name: 'Close', 
                                slot: 'start', 
                                color: 'primary',
                            }
                          ],
                          'his-danger-color'
                      )
                    }
                    await this.fieldContext.launchOrderSelection();
                  }
                }
              }
            ]
          }
        }
      ]
    }
  }
});
</script>
