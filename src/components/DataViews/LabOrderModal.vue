<template>
  <ion-header>
    <ion-toolbar>
      <ion-title class="his-lg-text" slot="start">
        Lab orders
      </ion-title>
      <ion-icon 
        size="large"
        slot="end"
        :icon="searchIcon"
        :color="searchColor"
      />
      <ion-input 
        :readonly="true"
        :value="searchFilter" 
        :disabled="activeIndex && !isOrderComplete"
        :color="searchColor"
        @click="() => showKeyboard=showKeyboard ? false : true"
        placeholder="Search for tests" 
        style="text-align: left; width: 35%;" 
        class="input_display" 
        slot="end"/>
    </ion-toolbar>
  </ion-header>
  <ion-content style="overflow:hidden;background:grey;height:70vh;">
    <ion-grid>
      <ion-row>
        <ion-col size="6">
          <ion-list :style="{overflowY: 'auto', height:'75vh'}"> 
            <ion-item 
              v-for="(data) in testTypesOnDisplay" 
              class="his-sm-text"
              :key="data.id"
              :color="activeIndex === data.id ? 'primary' : 'none'"
              :disabled="activeIndex != null && activeIndex !== data.id && !isOrderComplete" 
              detail
            > 
              <ion-label text-wrap> 
                <s v-if="testAlreadyDoneToday(data.name)">{{ data.name }}</s> 
                <span v-else>{{ data.name }}</span>
              </ion-label>
              <ion-checkbox 
                slot="start"
                :checked="data.isChecked"
                @ionChange="(e) => onSelectTest(data.name, data.id, e)" />
            </ion-item>
          </ion-list>
        </ion-col>
        <ion-col :style="{overflowY: 'auto', height:'79vh'}" v-if="activeIndex != null && selectedOrders.length > 0">
          <div class="ion-margin-bottom">
            <ion-list v-if="!extendedLabsEnabled">   
              <ion-radio-group v-model="testTypes[activeIndex]['specimen']">
                <div class="his-md-text side-title">
                  Select specimen
                </div>
                  <ion-item v-for="data in specimens" :key="data" > 
                <ion-label>{{data.name}}</ion-label>
                  <ion-radio slot="start" :value="data.name" @click="addSpecimen(data)"></ion-radio>
                </ion-item>
              </ion-radio-group>
            </ion-list>
            <div v-if="dbsBarcodeActivated">
              <div class="his-md-text side-title">
                Barcode ID:  <ion-text :color="testTypes[activeIndex].accessionNumber ? 'success' : 'dark'">
                  <b>{{ testTypes[activeIndex].accessionNumber || 'None' }}</b>
                </ion-text>
              </div>
              <BarcodeInput size="small" @on-scan="onScanEIDbarcode"/>
            </div>
            <ion-radio-group v-model="testTypes[activeIndex]['reason']">
              <div class="his-md-text side-title">
                Main test(s) reason
              </div>
              <ion-item class="his-sm-text" v-for="data in testReasons" :key="data"> 
                <ion-label>{{data}}</ion-label>
                <ion-radio slot="start" :value="data" ></ion-radio>
              </ion-item>
            </ion-radio-group>
          </div>
          <div :style="{background: 'lightyellow', height: '34vh'}">
            <table class="his-sm-text">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Specimen</th>
                  <th>Reason</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(data, index) in finalOrders" :key="index">
                  <td>{{data.name}}</td>
                  <td>{{data.specimen || 'N/A'}}</td>
                  <td>{{data.reason}}</td>
                  <td><ion-button @click="removeOrder(data.id)" slot="end" color="danger">X</ion-button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </ion-col>
      </ion-row>
    </ion-grid> 
    <his-keyboard v-if="showKeyboard" :kbConfig="keyboardLayout" :onKeyPress="onFilter" :disabled="false"/>
  </ion-content>
  <ion-footer>
    <ion-toolbar> 
      <ion-button @click="postActivities" size="large" slot="end" :disabled="isPostingOrder || finalOrders.length === 0"> Place orders </ion-button>
      <ion-button :disabled="isPostingOrder" @click="closeModal([])" size="large" slot="start" color="danger"> Close </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>
<script lang="ts">
import {
  IonContent,
  IonButton,
  IonInput,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonLabel,
  modalController,
  IonList,
  IonItem,
  IonCheckbox,
  IonRadioGroup,
  IonRow,
  IonIcon,
  loadingController,
} from "@ionic/vue";
import { search } from "ionicons/icons"
import { defineComponent, PropType } from "vue";
import { alertConfirmation, toastDanger, toastWarning } from "@/utils/Alerts"
import { ActivityInterface } from "@/apps/interfaces/AppInterface"
import { OrderService } from "@/services/order_service";
import { LabOrderService } from "@/services/lab_order_service";
import ART_GLOBAL_PROP from "@/apps/ART/art_global_props"
import Store from "@/composables/ApiStore"
import { QWERTY } from "@/components/Keyboard/HisKbConfigurations"
import { findIndex } from "lodash";
import BarcodeInput from "@/components/BarcodeInput.vue"
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import Fuse from "fuse.js";
import { printLabOrderBatch } from "@/views/Labels";

export default defineComponent({
  name: "Lab-modal",
  props: {
    activities: {
      type: Object as PropType<ActivityInterface[]>,
      required: true
    },
    ordersToday: {
      type: Object
    },
    onOrderAdded: {
      type: Object as PropType<(testName: string) => void>,
      required: false
    },
    testFilters: {
      type: Array
    },
    title: {
      type: String, 
      default: ""
    },
  },
  watch: {
    activities: {
      handler(activities: Array<ActivityInterface>){
        if (activities) {
          this.appActivities = [...activities]
          this.getActivities();
        }
      },
      immediate: true
    }
  },
  async created() {
    this.printCopies = (await ART_GLOBAL_PROP.labOrderPrintCopies()) ?? 1
    this.extendedLabsEnabled = await ART_GLOBAL_PROP.extendedLabEnabled()
    this.canScanDBS = await ART_GLOBAL_PROP.canScanDBS()
  },
  methods: {
    onFilter(text: any) {
      this.searchFilter = handleVirtualInput(text, this.searchFilter)
    },
    testAlreadyDoneToday(testName: string) {
      return (this.ordersToday||{})[testName] ? true : false
    },
    async onScanEIDbarcode(barcode: string) {
      (await loadingController.create({ message: `Checking ${barcode}`})).present()
      this.testTypes[this.activeIndex]['accessionNumber'] = null
      // // Expected barcode examples: L5728043 or 57280438
      // const barcodeOk = /^([A-Z]{1})?[0-9]{7,8}$/i.test(`${barcode}`.trim())
      if (`${barcode||''}`.length <= 0) {
        toastWarning("Barcode is required")
        loadingController.getTop().then(v => v && loadingController.dismiss())
        return ;
      }
      /**
       * Verify with API if barcode was already used:
      */
      try {
        if (!(await OrderService.accessionNumExists(barcode))) {
          this.testTypes[this.activeIndex]['accessionNumber'] = barcode
        } else {
          toastWarning(`Barcode ${barcode} was already used`)
        }
      } catch (e) {
        toastDanger("Failed to confirm barcode " + barcode + ", Please try again later", 8000)  
      }
      loadingController.getTop().then(v => v && loadingController.dismiss())
    },
    async onSelectTest(testName: string, index: number, event: any) {
      if (this.testAlreadyDoneToday(testName)) return toastWarning(
        "Test was already ordered today, please void and try again!"
      )
      this.searchFilter = ''
      this.showKeyboard = false
      this.testTypes[index]['isChecked'] = event.target.checked;
      if(this.testTypes[index]['isChecked']){
          this.activeIndex = index;
          await this.setSpecimens(index);
      } else {
          this.removeOrder(index)
      }
    },
    async setSpecimens(index: number) {
      this.specimens = await OrderService.getSpecimens(this.testTypes[index].name);
    },
    async getActivities() {
      const tests: Array<any> = await OrderService.getTestTypes();
      const vlIndex = findIndex(tests, {name: "HIV viral load"})
      const viralLoad = vlIndex !== -1 ? tests.splice(vlIndex, 1) : null;
      const sorted = tests.sort((a: any, b: any) => `${a.name}`.toUpperCase() > `${b.name}`.toUpperCase() ? 1: -1)
        .filter((t: any) => Array.isArray(this.testFilters) ? this.testFilters.includes(t.name) : true)
      this.testTypes = (viralLoad ? [...viralLoad, ...sorted] : sorted).map((test, id) => ({...test, id}))
    },
    async removeOrder(index: number) {
      this.testTypes[index]['isChecked'] = false;
      this.testTypes[index]['reason'] = null;
      this.testTypes[index]['specimen'] = null;
      this.testTypes[index]['specimenConcept'] = null
      this.testTypes[index]['accessionNumber'] = null
      const lastOrder = this.finalOrders.reverse()
      if (lastOrder[0]) {
        this.activeIndex = lastOrder[0].id
        await this.setSpecimens(this.activeIndex)
      } else {
        this.activeIndex = null
        this.specimens = []
      }
    },
    addSpecimen(data: any) {
      this.testTypes[this.activeIndex]['specimenConcept'] = data.concept_id;
    },
    async postActivities() {
      this.isPostingOrder = true
      try {
        const patientID= `${this.$route.params.patient_id}`;
        const orders = new LabOrderService(parseInt(patientID), -1); //TODO: get selected provider for this encounter
        const encounter = await orders.createEncounter();
  
        if(encounter) {
          const formattedOrders = await OrderService.buildLabOrders(encounter, this.finalOrders);
          const d =await  OrderService.saveOrdersArray(encounter.encounter_id, formattedOrders);
          
          if(!d) return toastWarning('Unable to save lab orders')
  
          Store.invalidate('PATIENT_LAB_ORDERS')
          const hasPrintableOrders = this.finalOrders.some((order: any) => !order.accessionNumber)
          const invalids = d.every((o: any) => o.tests.some((test: any) => ['FBS', 'RBS'].includes(test.name)))
          const canPrintOrders = !invalids && hasPrintableOrders && (await alertConfirmation('Lab orders and encounter created!, print out your last orders?', { 
            confirmBtnLabel: 'Yes',
            cancelBtnLabel: 'No'
          }))
          if (typeof this.onOrderAdded === 'function') {
            this.finalOrders.forEach((o: any) => this.onOrderAdded && this!.onOrderAdded(o.name))
          }
          await this.closeModal(d)
          if(canPrintOrders) await this.onPrintOrder(d)
        }
      } catch (e) {
        toastWarning("Unable to save order: " + `${e}`)
      }
      this.isPostingOrder = false
    },
    async closeModal(orders: []) {
      await modalController.dismiss(orders)
    },
    async onPrintOrder(orders: any) {
      const orderIDs = this.getOrdersToPrint(orders)
      await printLabOrderBatch(orderIDs)
    },
    getOrdersToPrint(orders: any) {
      const havebarcodesAlready = this.finalOrders.map((order: any) => `${order.accessionNumber}`.toUpperCase())
      return orders.reduce((all: any, element: any) => {
        const invalidOrder = [
          element.tests.some((test: any) => ['FBS', 'RBS'].includes(test.name)),
          havebarcodesAlready.includes(`${element.accession_number}`.toUpperCase())
        ]
        return !invalidOrder.every(Boolean) ? [...all, element.order_id] : all
      }, [])
    },
  },
  computed: {
    searchIcon() {
      return search
    },
    searchColor(): string {
      return this.showKeyboard ? 'primary' : 'dark'
    },
    testTypesOnDisplay(): any[] {
      if (this.searchFilter) {
        const fuse = new Fuse(this.testTypes, {
            threshold: 0.3,
            keys: ['name'],
            useExtendedSearch: true
        })
        return fuse.search(this.searchFilter).map((i: any) => i.item)
      }
      return this.testTypes
    },
    dbsBarcodeActivated(): boolean {
      return this.canScanDBS && 
        /dbs|plasma/i.test(`${this.testTypes[this.activeIndex]?.specimen}`) &&
        /hiv viral load/i.test(`${this.testTypes[this.activeIndex]?.name}`)
    },
    isOrderComplete(): boolean {
      if (typeof this.activeIndex != 'number') {
        return false
      }
      if (this.dbsBarcodeActivated && /dbs/i.test(this.testTypes[this.activeIndex]['specimen']) && 
        !this.testTypes[this.activeIndex]['accessionNumber']) {
        return false
      }
      if(this.extendedLabsEnabled){
        return !!this.testTypes[this.activeIndex]['reason'] 
      }
      return (this.testTypes[this.activeIndex]['specimenConcept'] || this.testTypes[this.activeIndex]['specimen']) 
        && this.testTypes[this.activeIndex]['reason']
    },
    selectedOrders(): any {
      return this.testTypes.filter((data: any) => data.isChecked === true);
    },
    finalOrders(): any {
      return this.selectedOrders.filter((data: any) => {
        if (this.dbsBarcodeActivated && /dbs/i.test(data.specimen) && !data.accessionNumber) {
          return false
        }
        return data.reason && (data.specimen && !this.extendedLabsEnabled 
          || this.extendedLabsEnabled)
      })
    },
    testReasons(): Array<string> {
      let reasons = this.reasons;
      if (this.testTypes[this.activeIndex].name.match(/Viral load/i)) {
         reasons = reasons.filter((r: string) => r !== 'Stat')
         reasons = reasons.concat(['Follow up after Low Level Viremia', 'Follow up after High Viral Load'])
      }
      return reasons    
    }
  },
  mounted() {
    this.getActivities();
  },
  data() {
    return {
      printCopies: 1, 
      isPostingOrder: false,
      searchFilter: '',
      showKeyboard: false,
      keyboardLayout: QWERTY,
      canScanDBS: false,
      content: "Content",
      extendedLabsEnabled: false as boolean,
      appActivities: [] as Array<ActivityInterface>,
      testTypes: [] as Array<any>,
      specimens: [] as Array<any>,
      reasons: ['Routine', 'Targeted', 'Confirmatory', 'Stat', 'Repeat / Missing'],
      activeIndex: null as any
    };
  },
  components: {
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonInput,
    IonToolbar,
    IonLabel,
    IonList,
    IonItem,
    BarcodeInput,
    IonCheckbox,
    IonRadioGroup,
    IonRow,
    HisKeyboard,
    IonIcon
  },
});
</script>
<style scoped>
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}
ion-col {
  border-right: solid 1px #ccc;
}
.side-title {
  width: 100%;
  padding: 0.3em;
  text-align: center;
  background: rgb(233, 232, 232);
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