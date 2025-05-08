<template>
  <view-port>
    <his-text-input readonly :value="fullSelectedDrugName"/> 
    <ion-grid style="background: white;">
      <ion-row>
        <ion-col size="4" class="border-right scroll-list">
          <ion-list v-for="(drug, index) in drugs" :key="index">
            <ion-item
              detail
              :color="index === selectedDrug ? 'secondary' : ''"
              @click="selectDrug(index)"
            >
              {{ drug.label }}
            </ion-item>
          </ion-list>
        </ion-col>
        <ion-col>
          <ion-grid v-if="selectedDrug !== null" class="scroll-list"> 
            <ion-row> 
              <ion-col size="12" class=" ion-margin-bottom"> 
                <ion-item>
                  <ion-label position="floating">Available Tins/Pallets (pack size: {{ drugs[selectedDrug].other?.pack_size }}):</ion-label>
                  <ion-input readonly disabled :value="fmtNumber(drugs[selectedDrug].other?.quantity)" />
                </ion-item>
              </ion-col>
              <ion-col size="12"> 
                <ion-item>
                  <ion-label position="floating">Total Tins Relocated/Disposed</ion-label>
                  <ion-input 
                    readonly
                    color="primary"
                    :value="fmtNumber(drugs[selectedDrug].other?.tins || 0)" 
                    @click="enterTins">
                  </ion-input>
                </ion-item>
              </ion-col>
              <ion-col size="12"> 
                <ion-item>
                  <ion-label position="floating">Reason for Relocating/Disposing</ion-label>
                  <ion-input 
                    readonly
                    color="primary"
                    placeholder="select reason"
                    :value="drugs[selectedDrug].other?.reason || ''" 
                    @click="selectReason">
                  </ion-input>
                </ion-item>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-col>
      </ion-row>
    </ion-grid>
  </view-port>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ViewPort from "@/components/DataViews/ViewPort.vue";
import FieldMixinVue from "./FieldMixin.vue";
import {
  IonGrid,
  IonCol,
  IonRow,
  IonList,
  IonItem,
  IonInput,
  IonLabel,
} from "@ionic/vue";
import { FieldType } from "../Forms/BaseFormElements";
import Validation from "@/components/Forms/validations/StandardValidations"
import { Option } from "../Forms/FieldInterface";
import HisTextInput from "@/components/FormElements/BaseTextInput.vue";
import { toNumString } from "@/utils/Strs";
import popupKeyboard from "@/utils/PopupKeyboard";

export default defineComponent({
  components: { 
    ViewPort, 
    IonGrid,
    IonList,
    IonCol, 
    IonRow,
    IonItem ,
    IonLabel,
    IonInput,
    HisTextInput
  },
  mixins: [FieldMixinVue],
  data: () => ({
    drugs: [] as Array<Option>,
    selectedDrug: null as any,
  }),
  async activated() {
    this.init()
  },
  methods: {
    async init() {
      this.$emit("onFieldActivated", this);
      this.drugs = await this.options();
      if (this.drugs.length >= 1) this.selectDrug(0)
    },
    fmtNumber(num: number | string) {
      return toNumString(num)
    },
    getModalTitle(context: string) {
      return `${context} (${this.drugs[this.selectedDrug].label})`
    },
    getDrugValue(type: string) {
      return this.drugs[this.selectedDrug].other[type]
    },
    setDrugValue(type: string, data: Option | null) {
      this.drugs[this.selectedDrug].other[type] = data ? data.value : ''
    },
    enterTins() {
      popupKeyboard({
        id: 'tins',
        helpText: this.getModalTitle('Enter number of tins'),
        type: FieldType.TT_NUMBER,
        defaultValue: () => this.getDrugValue('tins'),
        validation: (v: Option) => {
          if (!v || v && !v.value) {
            return null
          } 
          return Validation.validateSeries([
            () => Validation.isNumber(v),
            () => v.value as number <= 0 ? ['Number of tins must be greater than 1'] : null,
            () => v.value as number > this.getDrugValue('quantity') 
              ? ["You cannot dispose/relocate more than available tins"]
              : null
          ])
        }
      }, 
      (v: Option) => this.setDrugValue('tins', v))
    },
    async selectReason() {
      const batchNumber = this.getDrugValue('batch_number');
      popupKeyboard({
        id: 'reason',
        helpText: this.getModalTitle(`Select reason for disposing/relocating Batch ${batchNumber}`),
        type: FieldType.TT_SELECT,
        defaultValue: () => this.getDrugValue('reason'),
        validation: (v: Option) => Validation.required(v),
        options: () => this.config?.getReasons(this.drugs[this.selectedDrug],this.fdata) || []
      },
      (v: Option) => {
        this.setDrugValue('reason', v)
      })
    },
    selectDrug(index: number) {
      this.selectedDrug = index;
    },
  },
  computed: {
    fullSelectedDrugName(): string {
      try {
        const [code, batch, , expire] = this.drugs[this.selectedDrug]?.description?.text.split("-") ?? "";
        const name = this.drugs[this.selectedDrug].label;
        return `${name} (${code}-${batch}-${expire})`
      } catch (e) {
        return 'N/A'
      }
    },
    updatedDrugs(): Array<Option> {
      return this.drugs.filter(drug => {
        return !!drug.other?.tins && !!drug.other?.reason
      });
    },
  },
  watch: {
    clear() {
      this.drugs = this.drugs.map((d: any) => {
        d.other = {
          ...d.other,
          tins: null,
          quantity: (d.current_quantity / d.pack_size || 1) || 0,
          reason: ''
        }
        return d
      })
    },
    drugs: {
        async handler() {
          this.$emit("onValue", this.updatedDrugs);
        },
        immediate: true,
        deep: true
    }
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