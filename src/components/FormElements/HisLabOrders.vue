<template>
  <view-port>
    <div class="view-port-content">
      <table class="his-sm-text">
        <tr>
          <th>Accession #</th>
          <th>Test Name</th>
          <th>Specimen</th>
          <th>Ordered</th>
          <th>Result</th>
          <th>Released</th>
          <th>Given</th>
          <th>Action</th>
        </tr>
        <tr v-for="(data, index) in rows" :key="index">
          <td>{{ data.accession_number }}</td>
          <td>{{ data.test_name }}</td>
          <td>{{ data.specimen }}</td>
          <td>{{ data.ordered }}</td>
          <td>
            <span v-for="(d, i) in data.result" :key="i"> {{ d }} <br /></span>
          </td>
          <td>{{ data.released }}</td>
          <td> 
            <span :style="`color: ${data.result_given === 'Yes' ? 'green;' : 'black;'}`"> 
              {{ data.result_given }} 
            </span>
          </td>
          <td>
            <ion-button @click="printOrder(data)">
              <ion-icon size="large" :icon="print"></ion-icon>
            </ion-button>
            <ion-button :disabled="data.delivery_mode ? data.delivery_mode != 'test_results_delivered_to_site_manually' : false" color="success">
              <ion-icon size="large" :icon="pencil"></ion-icon>
            </ion-button>
            <ion-button
              :disabled="data.delivery_mode != 'test_results_delivered_to_site_manually' && (data.result??[]).length >= 1"
              @click="voidOrder(data)"
              color="danger">
              <ion-icon size="large" :icon="trash"></ion-icon>
            </ion-button>
          </td>
        </tr>
      </table>
    </div>
  </view-port>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { modalController, IonIcon } from "@ionic/vue";
import ViewPort from "@/components/DataViews/ViewPort.vue";
import LabOrderModal from "@/components/DataViews/LabOrderModal.vue"
import { isEmpty } from "lodash";
import FieldMixinVue from "./FieldMixin.vue";
import HisDate from "@/utils/Date"
import { IonButton } from "@ionic/vue"
import { alertConfirmation, toastDanger, toastSuccess, toastWarning } from "@/utils/Alerts";
import { toDate } from "@/utils/Strs";
import { Service } from "@/services/service";
import { trash, pencil, print } from "ionicons/icons"
import popVoidReason from "@/utils/ActionSheetHelpers/VoidReason";
import { PatientLabService } from "@/apps/LOS/services/patient_lab_service";

export default defineComponent({
  components: { ViewPort, IonButton, IonIcon },
  mixins: [FieldMixinVue],
  data: () => ({
    trash: trash,
    print: print,
    pencil: pencil,
    HisDate,
    rows: [] as Array<any>,
    fetchingOrders: false,
    ordersToday: {} as any
  }),
  methods: {
    async init() {
      this.$emit('onFieldActivated', this)
        this.fetchingOrders = true
        let items: any[] = []
        try {
          items = await this.options(this.fdata);
        } catch (e) {
          console.error(`${e}`)
        }
        this.fetchingOrders = false
        const rows = items[0].other.values;
        this.ordersToday = rows.reduce((a: any, c: any) => {
          if (toDate(c.ordered) === toDate(Service.getSessionDate()) && !c.result.length) {
            a[c.test_name] = true
          }
          return a
        }, {})
        this.rows = rows.map((o: any) => {
          o.id = o.order_id
          if (o.ordered) {
            o.ordered = HisDate.toStandardHisDisplayFormat(o.ordered)
          }
          if (o.released) {
            o.released = HisDate.toStandardHisDisplayFormat(o.released)
          }
          return o
      })
    },
    async printOrder(data: any) {
      if (toDate(data.ordered) != toDate(Service.getSessionDate())) {
        return toastWarning(`Printing order #${data.accession_number} is restricted to today. Consider using BDE mode/set session date to the order date`)
      }
      if (typeof this.config?.printOrder === 'function') {
        const ok = await alertConfirmation(`Do you want to print order with accession number ${data.accession_number}?`)
        if (ok) this.config.printOrder(data.id)
      }
    },
    formatOrders(rawOrders: Array<any>) {
      return rawOrders.map((d: any) => ({
          'id': d.order_id,
          'encounter_id': d.encounter_id,
          'result_given': d.result_given,
          'accession_number': d.accession_number,
          'test_name': d.tests[0].name,
          'specimen': d.specimen.name,
          'ordered': HisDate.toStandardHisDisplayFormat(d.order_date),
          'result': [],
          'release': ''
      }))
    },
    async launchOrderSelection(filters=null) {
      if (this.fetchingOrders) return toastWarning("Please wait....")
      const modal = await modalController.create({
        component: LabOrderModal,
        backdropDismiss: false,
        cssClass: 'large-modal',
        componentProps: {
          testFilters: filters,
          ordersToday: this.ordersToday,
          onOrderAdded: (testName: string) => this.ordersToday[testName] = true
        }
      })
      modal.present()
      const { data } = await modal.onDidDismiss()
      if (!isEmpty(data)) {
        this.rows = [...this.formatOrders(data), ...this.rows]
      }
    },
    voidOrder(data: any) {
      popVoidReason(async (reason) => {
        (new PatientLabService(-1)).voidOrder(data.order_id, reason)
          .then(() => {
            this.rows = this.rows.filter((rdata: any) => rdata.order_id != data.order_id)
            toastSuccess("Record has been voided successfully!")
          }).catch((e: any) => {
            toastDanger(`An error has occured while deleting order: ${e}`)
          })
      })
    }
  },
  mounted() {
    this.init()
  },
  activated() {
   this.init()
  }
})
</script>
<style scoped>
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td,
th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #dddddd;
}
</style>