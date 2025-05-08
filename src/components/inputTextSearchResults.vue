<template>
  <div id="inputs-container">
      <ion-grid class="main-table">
        <ion-row>
            <!--ion-col class="ion-align-items-center" size="12" size-md="3"-->
            <ion-col size-md="12">
                <input type="text" id="touchscreenInput" v-bind:value="passedKey" 
                  autofocus ref="barcodeInputbox" />
            </ion-col>
        </ion-row>
      </ion-grid>

  </div>

</template>

<script>
import { toastController } from '@ionic/vue';
import { defineComponent } from 'vue';

export default defineComponent({
  props: ["passedKey"],
  name: 'InputSearchResult',
  components: {

  },
  data() {
    return {
      barcodeText: this.passedKey
    }
  },
  methods: {
  } ,
  mounted(){
    //this.setInputFocus();
  },
  watch: {
    barcodeText: function() {
    //  this.checkForbarcode();
    }
  }
});
</script>

<style scoped>
#touchscreenInput {
    border-top: none;
    border-left: none;
    border-right: none;
    border-bottom: 1px solid silver;
    width: 99.5%;
    font-family: "Nimbus Sans L","Arial Narrow",sans-serif;
    font-size: 2.2em;
    background: none;
    padding-left: 5px;
}

 @media only screen and (max-width: 900px) {
 }

.main-table {
  width: 100% !important;
  border-style: solid;
  border-width: 1px;
  border-radius: 9px;
  height: 40vh;
  background-color: #F0F0F0;
}

</style>