<template>
  <view-port>
    <his-text-input readonly :value="drugs[selectedDrug]?.label || ''"/> 
    <ion-grid style="background: white;">
      <ion-row>
        <ion-col size="4" class="border-right scroll-list">
          <ion-list v-for="(drug, index) in drugs" :key="index">
            <ion-item
              detail
              :color="index === selectedDrug ? 'lightblue' : ''"
              @click="selectDrug(index)">
              {{ drug.label }}
            </ion-item>
          </ion-list>
        </ion-col>
        <ion-col size="8" class="scroll-list">
          <ion-row v-for="(drug, ind) in drugs[selectedDrug]?.other || []" :key="ind"> 
            <ion-col size="12">
              <h4>Batch Number: {{ drug.batch_number }} ({{ drug.pack_size }}/tin) </h4>
            </ion-col>
            <ion-col size-md="4"> 
              <ion-item>
                <ion-label position="floating">Available Tins</ion-label>
                <ion-input 
                  readonly 
                  placeholder="0"
                  :value="fmtNumber(drug.original_quantity)"
                >
                </ion-input>
              </ion-item>
            </ion-col>
            <ion-col size-md="4"> 
              <ion-item>
                <ion-label position="floating">Verified Tins</ion-label>
                <ion-input 
                  readonly 
                  placeholder="0"
                  :value="fmtNumber(drug.current_quantity)"
                  :color="drug.current_quantity != drug.original_quantity ? 'danger': 'success'"
                  @click="enterAmount(ind)"
                  >
                </ion-input>
              </ion-item>
            </ion-col>
            <ion-col size-md="4" > 
              <ion-item>
                <ion-label position="floating">Reason</ion-label>
                <ion-input 
                  :disabled="drug.current_quantity == drug.original_quantity"
                  placeholder="0"
                  :value="drug.reason ?? 'N/A'"
                  @click="selectReason(ind)"
                  >
                </ion-input>
                <ion-icon :icon="chevronDown" slot="end" class="ion-padding-top" @click="selectReason(ind)"></ion-icon>
              </ion-item>
            </ion-col>
          </ion-row>
        </ion-col>
      </ion-row>
    </ion-grid>
  </view-port>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonGrid,
  IonCol,
  IonRow,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
} from "@ionic/vue";
import ViewPort from "@/components/DataViews/ViewPort.vue";
import FieldMixinVue from "./FieldMixin.vue";
import { Option } from "../Forms/FieldInterface";
import Validation from "@/components/Forms/validations/StandardValidations"
import { FieldType } from "../Forms/BaseFormElements";
import HisTextInput from "@/components/FormElements/BaseTextInput.vue";
import isEmpty from "lodash/isEmpty";
import { toNumString } from "@/utils/Strs";
import { chevronDown } from "ionicons/icons";
import popupKeyboard from "@/utils/PopupKeyboard";

export default defineComponent({
  components: { 
    ViewPort, 
    HisTextInput, 
    IonGrid, 
    IonCol, 
    IonRow, 
    IonIcon, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonInput 
  },
  mixins: [FieldMixinVue],
  data: () => ({
    drugs: [] as Array<Option>,
    selectedDrug: null as any,
    chevronDown,
    previousTinCount: 0,
    newTinCount: 0,
  }),
  mounted() {
    this.init()
  },
  activated() {
    this.init()
  },
  methods: {
    async init() {
      this.$emit("onFieldActivated", this);
      if(isEmpty(this.drugs)) this.drugs = await this.options();
    },
    disableReasonsOptions(condition: boolean, options: any[]): any[] {
      const enabledOptionLabels = [
        'Theft',
        'Took out for training',
        'Accidents',
        'Flooding',
        'Natural disaster'
      ];

      return options.map((option) => ({
        ...option,
        disabled: condition
          ? option.disabled || enabledOptionLabels.includes(option.label)
          : !enabledOptionLabels.includes(option.label),
      }));
    },
    fmtNumber(num: number | string) {
      return toNumString(num)
    },
    getModalTitle(context: string) {
      return `${context} (${this.drugs[this.selectedDrug].label})`
    },
    getDrugValue(index: number, type: string) {
      return this.drugs[this.selectedDrug].other[index][type]
    },
    setDrugValue(index: number, type: string, data: Option | null) {
      this.drugs[this.selectedDrug].other[index][type] = data ? data.value : ''
    },
    async enterAmount(index: number) {
      const batchNumber = this.getDrugValue(index, 'batch_number');
      popupKeyboard({
        id: 'tins',
        helpText: this.getModalTitle(`Enter number of tins for Batch ${batchNumber}`),
        type: FieldType.TT_NUMBER,
        defaultValue: () => {
          this.previousTinCount = this.getDrugValue(index, 'current_quantity') as number // saving the previous tin count
          return this.previousTinCount
        },
        validation: (v: Option) => {
          if (!v || v && !v.value) return null
          return Validation.validateSeries([
            () => Validation.isNumber(v),
            () => v.value as number < 0 ? ['Number of tins must be greater than 1'] : null
          ])
        }
      },
      (v: Option) => {
        this.newTinCount = v.value as number // Saving new Tin count
        return this.setDrugValue(index, 'current_quantity', v)
      })
    },
    async selectReason(index: number) {
      const batchNumber = this.getDrugValue(index, 'batch_number');
      popupKeyboard({
        id: 'reason',
        helpText: this.getModalTitle(`Select reason for Batch ${batchNumber} modification`),
        type: FieldType.TT_SELECT,
        defaultValue: () => this.getDrugValue(index, 'reason'),
        validation: (v: Option) => Validation.required(v),
        options: () => {
          const reasonOptions = [
          { label: "Theft", value: "Theft" },
          { label: "Took out for training", value: "Took out for training" },
          { label: "Accidents", value: "Accidents" },
          { label: "Flooding", value: "Flooding" },
          { label: "Natural disaster", value: "Natural disaster"},
          { label: "Misplaced stock", value: "Misplaced stock"},
          { label: "Incorrect entry", value: "Incorrect entry"}
        ]

        /**
         * Disabling the other reasons if new Tin count is > the previous Tin count
         */
        return this.disableReasonsOptions((this.newTinCount > this.previousTinCount), reasonOptions)
      }
      },
      (v: Option) => {
        this.setDrugValue(index, 'reason', v)
      })
    },
    async selectDrug(index: any) {
      this.selectedDrug = index;
    },
    isBatchUpdated(drug: any) {
      return drug.current_quantity !== drug.original_quantity &&
      !!drug.reason
    },
    isModificationComplete(): boolean {
      return this.drugs.every(drug => drug.other?.every((e: any) => {
        if (e.current_quantity === e.original_quantity) return true;
        return !!e.reason;
      }));
    },
    getUpdatedDrugs(): any {
      const updatedDrugs: any = [];
      this.drugs.forEach(drug => {
        const updatedBatches = drug.other?.filter((e: any) => this.isBatchUpdated(e));
        updatedDrugs.push(...updatedBatches);
      }
      );
      return updatedDrugs;
    },
  },
  watch: {
    clear() {
      this.drugs = this.drugs.map((d: any) => {
        if (!d.other) return d
        d.other = d.other.map((e: any) => {
          e['current_quantity'] = e.original_quantity
          return e
        })
        return d
      })
    },
    drugs: {
      async handler() {
        if(this.isModificationComplete()){
          return this.$emit("onValue", this.getUpdatedDrugs());
        }
        this.$emit("onValue", null);
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