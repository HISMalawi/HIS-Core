<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>VL milestone has been reached</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content :style="{ overflowY: 'hidden', background: 'grey' }" >
    <p>ART start date : {{artStartDate}}</p>
    <p>Months on ART: {{monthsOnART}}</p>
    <p>Last VL order date {{lastOrder}}</p>
    <p>Current regimen / start date: {{currentRegimen}} - {{regimenStartDate}}</p>
  </ion-content>
  <ion-footer>
    <ion-toolbar> 
      <ion-button  slot="end" color="success" size="large" @click="closeModal('order')"> Order VL</ion-button>
      <ion-button  slot="end" size="large" @click="closeModal('wait')"> Wait till next milestone</ion-button>
      <ion-button  slot="start" color="danger" size="large" @click="closeModal('later')"> Remind me later </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>
<script lang="ts">
import {
  IonContent,
  IonButton,
  IonHeader,
  IonTitle,
  IonToolbar,
  modalController,
  IonFooter
} from "@ionic/vue";
import { defineComponent, PropType } from "vue";
import HisDate from "@/utils/Date";

export default defineComponent({
  name: "Modal",
  props: {
    VLData: {
      type: Object as PropType<Record<string, any>>,
      required: true
    },
    
  },
  async created() {
    this.artStartDate = HisDate.toStandardHisDisplayFormat(this.VLData.earliest_start_date);
    this.monthsOnART = this.VLData.period_on_art;
    this.lastOrder = this.VLData.last_order_date ? HisDate.toStandardHisDisplayFormat(this.VLData.last_order_date) : 'N/A';
    this.currentRegimen = this.VLData.current_regimen.name ? this.VLData.current_regimen.name : 'Other';
    this.regimenStartDate = HisDate.toStandardHisDisplayFormat(this.VLData.current_regimen.date_started);
  },
  methods: {
   async closeModal(val: string) {
    await modalController.dismiss(val);
   } 
  },
  data() {
    return {
      content: "Content",
      artStartDate: "",
      monthsOnART: "",
      lastOrder: "",
      currentRegimen: "",
      regimenStartDate: "" 
    };
  },
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonFooter,
    IonButton,
  },
});
</script>
<style scoped>
p {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
}
ion-title{
  text-align: center;
  color: green;
  font-size: 2rem;
  font-weight: bold;
}
</style>