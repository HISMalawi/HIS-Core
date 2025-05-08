<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Scan work-station location</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding-top">
      <barcode-input 
        class="his-card"
        :clearValue="clearValue"
        :virtualText="barcodeText"
        @onValue="onbarcodeText" 
        @onScan="onScan">
      </barcode-input>
    </ion-content>
    <his-keyboard
      v-if="useVirtualKeyboard"
      :kbConfig="NUMBERS" 
      :onKeyPress="onKbClick"> 
    </his-keyboard>
    <ion-footer> 
      <ion-toolbar color="dark"> 
        <ion-button 
          color="danger" 
          size="large" 
          router-link="/login"> 
          Cancel
        </ion-button>
        <ion-button
          slot="end"
          color="success"
          size="large"
          @click="searchLocation"
          v-if="barcodeText"
        > 
          Next 
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import BarcodeInput from "@/components/BarcodeInput.vue"
import {toastWarning} from "@/utils/Alerts"
import router from '@/router/index';
import { Service } from "@/services/service"
import { isEmpty } from 'lodash';
import {
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonButton,
  IonFooter,
} from '@ionic/vue';
import HisKeyboard from '@/components/Keyboard/HisKeyboard.vue';
import {NUMBERS} from "@/components/Keyboard/HisKbConfigurations"
import usePlatform, { ScannerType } from '@/composables/usePlatform';
import kbHandler from '@/components/Keyboard/KbHandler';
import facilities from "@/composables/useFacility"

export default defineComponent({
  name: 'HC location',
  components: {
    BarcodeInput,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButton,
    IonFooter,
    HisKeyboard
  },
  setup() {
    const { activePlatformProfile } = usePlatform()
    const barcodeText = ref('')
    const clearValue = ref('')
    const useVirtualKeyboard = computed(() => activePlatformProfile.value.scanner === ScannerType.CAMERA_SCANNER)
  
    async function searchLocation() {
      if (!barcodeText.value.includes('$')) {
        barcodeText.value += '$'
      }
      const response = await Service.getJson(`locations/${barcodeText.value}`)
      if (isEmpty(response)) {
        toastWarning("Invalid location")
      }else {
        const data = response
        sessionStorage.userLocation = data.name;
        try {
          // Redundancy check to ensure the facility is set properly incase other places dont manage to record it
          await facilities().setLocation()
        } catch (e) {
          return toastWarning("Unable to set facility UUID. Please try again!")
        }
        router.push("/");
      }
      clearValue.value = barcodeText.value
      barcodeText.value = ''
    }

    function onbarcodeText(t: string) {
      barcodeText.value = t
    }

    function onKbClick(t: string) {
      barcodeText.value = kbHandler(t, barcodeText.value)
      console.log("barcode", barcodeText.value)
    }

    async function onScan(t: string) {
      barcodeText.value = t
      await searchLocation()
    }

    return {
      onbarcodeText,
      onScan,
      onKbClick,
      searchLocation,
      useVirtualKeyboard,
      clearValue,
      barcodeText,
      NUMBERS
    }
  }
})
</script>

<style scoped>
.his-floating-keyboard  {
  bottom: 70px!important;
}
.his-card {
  margin: auto;
  width: 95%;
}
</style>