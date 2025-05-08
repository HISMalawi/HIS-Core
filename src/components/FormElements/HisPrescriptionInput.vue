<template>
  <ion-grid>
    <ion-row class="his-card section drug-section-style">
      <ion-col>
        <table>
          <thead>
            <tr>
              <th>Drug</th>
              <th>Frequency</th>
              <th>Dosage</th>
              <th>Duration</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(drug, drugIndex) in drugs" :key="drugIndex">
              <td>
                <b>{{ drug.label }}</b>
              </td>
              <td>
                <ion-input
                  readonly
                  @click="selectFrequency(drug)"
                  :value="drug.other.frequency"
                  class="dosage-input"
                  placeholder="Add frequency.."
                />
              </td>
              <td>
                <ion-input
                  readonly
                  @click="launchKeyPad(drug, 'dosage')"
                  :value="drug.other.dosage"
                  placeholder="Add dosage.."
                  class="dosage-input"
                />
              </td>
              <td>
                <ion-input
                  readonly
                  @click="launchKeyPad(drug, 'duration')"
                  :value="drug.other.duration"
                  placeholder="Add duration.."
                  class="dosage-input"
                />
              </td>
              <td>
                <ion-button @click="removeDrug(drug)" color="danger">
                  <ion-icon :icon="trash"></ion-icon>
                </ion-button>
              </td>
            </tr>
          </tbody>
        </table>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import FieldMixinVue from "./FieldMixin.vue";
import {
  IonGrid,
  IonCol,
  IonRow,
  IonButton,
  IonInput,
  IonIcon,
  modalController,
} from "@ionic/vue";
import { Option } from "../Forms/FieldInterface";
import HisKeypad from "@/components/Keyboard/HisKeypad.vue";
import { trash } from "ionicons/icons";
import { DRUG_FREQUENCIES } from "@/apps/OPD/services/drug_prescription_service";
import RadioSheet from "@/components/DataViews/actionsheet/RadioActionSheet.vue";

export default defineComponent({
  components: {
    IonInput,
    IonGrid,
    IonCol,
    IonIcon,
    IonRow,
    IonButton,
  },
  mixins: [FieldMixinVue],
  data: () => ({
    trash,
    drugs: [] as Option[],
  }),
  activated() {
    this.init()  
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      this.$emit("onFieldActivated", this);
      const drugs: Option[] = await this.options(this.fdata, this.cdata);
      this.drugs = drugs.map((d) => {
        d.other.frequency = this.getFrequency(d)
        d.other.dosage = this.getDosage(d)
        if(d.other.duration === undefined) d.other.duration ='' 
        return d;
      });
    },
    getFrequency(drug: Option) {
      if(drug.other.frequency) {
        const frequency = DRUG_FREQUENCIES.find(f => f.value === parseInt(drug.other.frequency))
        if(frequency) return frequency.label
      }
      return ''
    },
    getDosage(drug: Option) {
      if (drug.other.dosage) return drug.other.dosage
      if(drug.other['dose_strength']) return drug.other['dose_strength']
      return ''
    },
    removeDrug(drug: Option) {
      this.drugs = this.drugs.filter((d) => d.label != drug.label);
    },
    async selectFrequency(drug: Option) {
      const modal = await modalController.create({
        component: RadioSheet,
        backdropDismiss: false,
        componentProps: {
          title: `${drug.label} Frequency`,
          list: DRUG_FREQUENCIES.map(f => f.label),
          actionButtons: [
            { name: "Cancel", color: "danger", slot: "start", role: "default" },
            { name: "Ok", slot: "end", role: "action" },
          ],
        },
      });
      modal.present();
      const { data } = await modal.onDidDismiss();
      if (data.action !== "Cancel") {
        drug.other.frequency = data.selection;
      }
    },
    async launchKeyPad(drug: Option, field: string) {
      const modal = await modalController.create({
        component: HisKeypad,
        backdropDismiss: false,
        cssClass: "keypad-modal",
        componentProps: {
          title: `${drug.label} ${field}`,
          preset: drug.other[field],
          strictNumbers: true,
          onKeyPress(val: string) {
            drug.other[field] = val;
          },
        },
      });
      modal.present();
    },
  },
  computed: {},
  watch: {
    clear() {
      this.drugs = this.drugs.map((d: any) => {
        d.frequency = "";
        d.duration = "";
        d.dose = "";
        d.units = "";
        return d;
      });
    },
    drugs: {
      async handler() {
        this.$emit("onValue", this.drugs);
      },
      immediate: true,
      deep: true,
    },
  },
});
</script>
<style scoped>
ion-label {
  font-weight: bold;
}
.border-right {
  border-right: solid 1px #ccc;
}
.scroll-list {
  height: 70vh;
  overflow: auto;
}
.input_display {
  font-size: 1.3em;
}
</style>
<style scoped>
.dosage-input {
  text-align: center;
  border: solid 1px #ccc;
  height: 50px;
  width: 100%;
  background-color: rgb(252, 252, 241);
}
table {
  width: 100%;
}
.drug-section-style {
  padding: 0;
  background: #ffffff;
}
td,
th {
  border: solid 1px #3333;
}
th {
  padding: 0.8em;
}
td {
  padding: 0.4em;
  font-size: 0.9rem;
}
</style>