<template>
  <ion-row class="his-card">
    <ion-col size="2">
      <img id="barcode-img" src="/assets/images/barcode.svg"/>
    </ion-col>
    <ion-col size="10">
      <input 
        ref="barcode" 
        :readonly="isReadOnly" 
        :autofocus="true" 
        id="barcode-inputbox" 
        v-model="barcodeText"
        />
    </ion-col>
  </ion-row>
</template>
<script>
import { defineComponent } from 'vue';
import {IonCol,IonRow, isPlatform} from "@ionic/vue";
import { toastWarning } from "@/utils/Alerts"
import ApiClient from "@/services/api_client"
import Platform, { ScannerType } from "@/composables/usePlatform"

export default defineComponent({
  name: 'BarcodeScan',
  components: {
    IonRow,
    IonCol,
  },
  data: () => ({
    barcodeText: '',
    isReadOnly: true
  }),
  mounted() {
    if (Platform().activePlatformProfile.value.scanner === ScannerType.BARCODE_SCANNER) {
      this.isReadOnly = false
      setTimeout(() => this.$refs.barcode.focus(), 500)
    }
  },
  methods: {
      checkForbarcode(){
        if(this.barcodeText.match(/.+\$$/i) != null){
          this.barcodeText = this.barcodeText.replace(/\$/ig, '');
          this.scanLocation();
        }
      },
      async scanLocation() {
        const response = await ApiClient.get("locations/" + this.barcodeText, {}, {});
        if (!response || response.status !== 200) {
          toastWarning("Invalid location")
        }else {
          const data = await response.json();
          sessionStorage.userLocation = data.name;
          this.$router.push("/");
        }
      },
      loadAttributes() {
        console.log("aaa");
      }
  } ,
  watch: {
    barcodeText: function() {
      this.checkForbarcode();
    }
  }
});
</script>
<style scoped>
input:focus { 
    outline: none !important;
    border-color: #719ECE;
    box-shadow: 0 0 5px #202020;
}
.his-card {
  margin: auto;
  margin-top: 3%;
  width: 90%;
  max-height: 40%;
}
#barcode-img {
  width: 70%;
}
#barcode-inputbox {
  font-weight: bold;
  padding: 5px;
  font-size: 2.9em;
  border-style: solid;
  border-width: 0px 0px 2px 0px;
  border-color: #ccc;
  background-color: white;
  width: 100%;
  height: 90%;
}
@media (min-width: 200px) and (max-width: 900px) { 
  #barcode-img {
    width: 350px;
  }
}
</style>
