<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-row>
          <ion-col>
            <label class="his-title"> BP Drug management </label>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <view-port>
        <div class="view-port-content" v-if="drugs">
            <table id="main-table" style="width: 100%">
              <tr>
                <th>&nbsp;</th>
                <th v-for="(item, itemIndex) in drugs" :key="itemIndex"> 
                  {{ itemIndex }}
                  <ion-row> 
                    <ion-col class="col-borders" v-for="(drug, drugIndex) in item.drugs" :key="drugIndex"> 
                      {{drug.amount || '0mg'}}
                    </ion-col>
                  </ion-row>
                </th>
              </tr>
              <tr>
                <td class="td-current td-title">
                  <span>Current</span>
                </td>
                <td class="td-current td-value" v-for="(item, itemIndex) in drugs" :key="itemIndex">
                  <ion-row> 
                    <ion-col v-for="(drug, i) in item.drugs" :key="i"> 
                      <ion-checkbox
                        :checked="drug.current"
                        disabled
                        v-if="drug.current"
                      ></ion-checkbox>
                    </ion-col>
                  </ion-row>
                </td>
              </tr>

              <tr>
                <td class="td-remaining td-title">
                  <span>Pills remaining</span>
                </td>
                <td v-for="(item, itemIndex) in drugs" :key="itemIndex"  class="td-current td-value">
                  <ion-row> 
                    <ion-col v-for="(drug, i) in item.drugs" :key="i"> 
                      <ion-input
                        type="number"
                        v-model="drug.remaining"
                        v-if="drug.dispensed"
                        @click="launchKeyPad(itemIndex, i)"
                      ></ion-input>
                    </ion-col>
                  </ion-row>
                </td>
              </tr>
            </table>
            <p/>
            <table id="table-notes" style="width: 100%">
              <caption style="font-size: 1.4em">
                Adherence summary
              </caption>
              <p/>
              <tr>
                <th style="width: 25%">
                  <span>Drug</span>
                </th>
                <th style="width: 25%">
                  <span>Pills dispensed during last visit</span>
                </th>
                <th style="width: 25%">
                  <span>Expected pills remaining</span>
                </th>
                <th style="width: 25%">
                  <span>Adherence for drug</span>
                </th>
              </tr>
              <tr
                v-for="(drug, i) in selectedDrugs"
                :key="i"
                class="dispensation-row"
              >
                <td class="date-td today-td">{{ drug.drugName }}</td>
                <td class="date-td today-td">{{ drug.dispensed }}</td>
                <td class="date-td today-td">{{ drug.expectedRemaining }}</td>
                <td class="date-td today-td">
                  {{ drug.adherence ? `${drug.adherence} %` : "?" }}
                </td>
              </tr>
            </table>
        </div>
      </view-port>
    </ion-content>
    <ion-footer>
      <ion-toolbar color="dark">
        <ion-button
          size="large"
          color="danger"
          slot="start"
          @click="gotoPatientDashboard"
        >
          cancel
        </ion-button>
        <ion-button
          size="large"
          color="primary"
          slot="end"
          @click="goToPrescription"
        >
          Change drugs 
        </ion-button>
        <ion-button size="large" color="success" slot="end" @click="onFinish">
          Continue
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import ViewPort from "@/components/DataViews/ViewPort.vue";
import {
  IonToolbar,
  IonHeader,
  IonContent,
  IonRow,
  IonCol,
  IonInput,
  IonButton,
  modalController,
  IonFooter,
  IonPage,
  IonCheckbox,
} from "@ionic/vue";
import EncounterMixinVue from "../../../../views/EncounterMixin.vue";
import { BPManagementService, HTN_SESSION_KEY } from "../../services/htn_service";
import HisKeypadVue from "@/components/Keyboard/HisKeypad.vue";
import { optionsActionSheet } from "@/utils/ActionSheets"
import { find } from "lodash"
export default defineComponent({
  mixins: [EncounterMixinVue],
  components: {
    ViewPort,
    IonToolbar,
    IonHeader,
    IonContent,
    IonRow,
    IonInput,
    IonButton,
    IonCol,
    IonFooter,
    IonPage,
    IonCheckbox,
  },
  watch: {
    ready: {
      async handler(ready: boolean) {
        if (ready) {
          this.HTN = new BPManagementService(this.patientID, this.providerID);
          this.drugs = this.HTN.getDrugs();
          await this.getCurrentDrugs();
        }
      },
      immediate: true
    },
  },
  data: () => {
    return {
      HTN: {} as any,
      drugs: null as any,
    };
  },
  methods: {
    onFinish() {
      this.selectNextAction()
    },
    goToPrescription() {
      this.$router.push(`/art/encounters/bp_prescription/${this.patientID}`);
    },
    gotoTreatment() {
      const htnDrugs = this.selectedDrugs.map((selected: any) =>  
        find( BPManagementService.htnDrugReferences(), { 'drug_id': selected.drugID})
      )
      const data: any = {}
      data[this.patientID] = htnDrugs
      sessionStorage.setItem(HTN_SESSION_KEY.Prescription, JSON.stringify(data))
      this.$router.push(`/art/encounters/prescriptions/${this.patientID}`)
    },
    async selectNextAction() {
      const modal = await optionsActionSheet(
        'Action confirmation',
        'Please specify how to proceed with patient',
        [
          'Continue with current BP Drugs',
          'Continue without BP Drugs',
          'Change BP drugs'
        ],
        [
          { name: 'Cancel', color: 'danger',  slot:'start'},
          { name: 'Confirm', color: 'primary', slot:'end', role: 'action'}
        ]
      )
      if (modal.selection && modal.action != 'Cancel') {
        switch(modal.selection) {
          case 'Continue without BP Drugs':
            sessionStorage.removeItem(HTN_SESSION_KEY.Prescription)
            return this.nextTask()
          case 'Continue with current BP Drugs':
            return this.gotoTreatment()
          case 'Change BP drugs':
            this.goToPrescription()
        }
      }
    },
    async getCurrentDrugs() {
      const drugs = await this.HTN.getCurrentDrugs();
      const lastDrugs = await this.HTN.getLastDrugs();
      drugs.drugs.forEach((drug: any) => {
        for (const key in this.drugs) {
          this.drugs[key].drugs.forEach((element: any, index: any) => {
            if (drug.drug_id === element.drugID) {
              this.drugs[key].drugs[index].current = true;
              this.drugs[key].drugs[index].selected = true;
              this.drugs[key].selected = drug.drug_id;
            }
            const drugName = this.drugs[key].drugs[index].drugName;
            if (Object.prototype.hasOwnProperty.call(lastDrugs, drugName)) {
              this.drugs[key].drugs[index].expectedRemaining =
                lastDrugs[drugName].remaining;
              this.drugs[key].drugs[index].dispensed =
                lastDrugs[drugName].value_numeric;
            }
          });
        }
      });
    },
    async launchKeyPad(d: any, index: any) {
      const modal = await modalController.create({
        component: HisKeypadVue,
        backdropDismiss: false,
        cssClass: "keypad-modal",
        componentProps: {
          strictNumbers: true,
          onKeyPress: async (data: any) => {
            const adh = await this.HTN.getAdherence(
              this.drugs[d].drugs[index].drugID, data
            )
            this.drugs[d].drugs[index].adherence = adh.adherence;
            this.drugs[d].drugs[index].remaining = data;
          }
        }
      })
      modal.present();
    }
  },
  computed: {
    selectedDrugs(): any {
      return Object.values(this.drugs)
        .map((d: any) => d.drugs)
        .reduce((accum: any, cur: any) => accum.concat(cur), [])
        .filter((d: any) => d.dispensed)
    }
  },
})
</script>
<style scoped>
ion-checkbox {
  --size: 30px;
}
ion-input {
  border-radius: 9px;
  background-color: rgb(247, 248, 198);
  border: solid 2px rgb(117, 117, 117);
}
.col-borders {
  border: 1px dotted lightgray;
  border-radius: 3px;
  padding: 0.3em;
}
.holder {
  width: 99%;
  padding: 1.5%;
}

.dispensation-row {
  text-align: center;
  font-size: 1.6em;
}

#main-table,
#table-notes {
  width: 95%;
  margin: auto;
}

#main-table th,
#table-notes th {
  font-size: 20px;
  background-color: firebrick;
  color: white;
}

#main-table th,
#main-table td {
  text-align: center;
  padding: 10px;
}

.td-title {
  font-size: 22px;
  text-shadow: 2px 2px white;
}

.td-title,
.td-current,
.td-remaining {
  padding: 2px !important;
}

.td-current {
  background-color: #eed5d2;
  text-shadow: 2px 2px white;
  height: 40px !important;
}

.td-remaining {
  background-color: #ffe5e5;
  text-shadow: 2px 2px white;
}

.td-value {
  font-size: 22px;
}

#table-notes td {
  background: rgba(210, 220, 240, 0.5);
  border-radius: 5px;
}

#table-notes th {
  background: lightgray;
  color: rgba(0, 0, 0, 0.8);
}

#table-notes td {
  padding-left: 1px;
}

.date-td {
  padding-left: 4px !important;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  font-size: 1em;
  background: rgba(235, 235, 240, 0.5) !important;
  color: rgba(0, 0, 0, 0.9);
  text-align: center;
}

.note-td {
  padding-left: 20px !important;
  color: rgba(0, 0, 0, 0.8);
  text-shadow: 2px 2px 3px rgba(255, 255, 255, 0.1);
}

.today-tr {
  font-style: italic;
  font-weight: bold;
  border-radius: 10px !important;
}
</style>