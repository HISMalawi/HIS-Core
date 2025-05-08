<template>
    <ion-header>
      <ion-toolbar>
        <ion-title>Select Malaria Drugs</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :style="{ overflowY: 'hidden', background: 'grey' }" >
      <ion-list class='view-port-content'>
          <ion-item v-for="(item, index) in items" :key="index" class="items" >
              <ion-label :class="item?.other?.wrapTxt ? 'ion-text-wrap' : ''" v-html="item.label" :onClick="submitData" @click="closeModal('later')"  :value="item.value"></ion-label>
          </ion-item>
      </ion-list>
    </ion-content>
    <ion-footer>
      <ion-toolbar> 
        <ion-button  slot="start" color="danger" size="large" @click="closeModal('later')"> Cancel </ion-button>
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
  
  export default defineComponent({
    name: "Modal",
    props: {
      items: {
        type: Object as PropType<Record<string, any>>,
        required: true
      },
      submitData:{
        type: Function,
      }
      
    },
    async created() {
      console.log("created modal")
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
    color: #333;
    font-size: 1.2rem;
    font-weight: bold;
  }
  ion-item:hover {
    --background: #efefef;
  }
  </style>