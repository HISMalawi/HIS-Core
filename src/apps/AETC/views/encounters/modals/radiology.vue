<template>
  <ion-header>
    <ion-toolbar>
      <ion-title class="his-lg-text">Radiology Examination</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content style="overflow:hidden;background:grey;height:70vh;">
    <his-radiology-picker @onValue="onValue"/>
  </ion-content>
  <ion-footer>
    <ion-toolbar> 
      <ion-button @click="onSubmit()" size="large" slot="end" :disabled="emitedSelectedOptions.length === 0"> Place orders </ion-button>
      <ion-button @click="closeModal()" size="large" slot="start" color="danger"> Close </ion-button>
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
  IonFooter,
} from "@ionic/vue";
import { defineComponent } from 'vue'
import EncounterMixinVue from '@/views/EncounterMixin.vue';
import { PatientRadiologyService } from "@/apps/AETC/services/patient_radiology_service";
import HisRadiologyPicker from '@/components/FormElements/HisRadiologyPicker.vue'
import AETC_GLOBAL_PROP from "@/apps/AETC/aetc_global_props";
import { isEmpty } from "lodash";

export default defineComponent({
  name: "Modal",
  components: { 
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonFooter,
    HisRadiologyPicker
  },
  mixins: [EncounterMixinVue],
  data: () => ({
    radiologyService: {} as any,
    isPacsEnabled: false,
    emitedSelectedOptions: {} as any
  }),
  watch: {
    ready: {
      async handler(isReady: boolean) {
        if(isReady){
          this.radiologyService = new PatientRadiologyService(this.patientID, this.providerID)
          this.isPacsEnabled = (await AETC_GLOBAL_PROP.isPACsEnabled())
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async onValue(selected: any) {
      this.emitedSelectedOptions = selected
    },
    async getSelected() {
      return this.emitedSelectedOptions.map(async (option: any) => ({
        ...(await this.radiologyService.buildValueCoded('Radiology Orders', option.other.parent)),
        child: [await this.radiologyService.buildValueCodedFromConceptId(option.other.parent, option.other.concept_id)]
      }))
    },
    async onSubmit(){
      if(!isEmpty(this.emitedSelectedOptions)) {
        this.closeModal()
        let data = await this.getSelected()
        data = await Promise.all(data)
        await this.radiologyService.createEncounter()
        const obsObj = await this.radiologyService.obsObj(data) 
        const savedObsData = await this.radiologyService.saveObservationList(obsObj)
        await this.radiologyService.printOrders(savedObsData, this.patient)
        if(this.isPacsEnabled) {
          try {
            await this.radiologyService.submitToPacs(savedObsData, this.patient)
          } catch (error) {
            console.log(error)
          }
        }
      }
    },
    async closeModal() {
      await modalController.dismiss([])
    }
  },
})
</script>

