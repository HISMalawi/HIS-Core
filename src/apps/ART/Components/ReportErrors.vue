<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{title}}</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-grid class="selector">
    <ion-list> 
        <ion-item class="his-md-text ion-padding" v-for="(error, index) in errors" :key="index"> 
          <span v-html="`(${index + 1}) ${error}`"></span>
        </ion-item>
    </ion-list>
  </ion-grid>
  <ion-footer>
    <ion-toolbar> 
      <ion-button class="close-btn" color="danger" size="large" @click="closeModal" slot="end"> 
        Close 
      </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonList,
  IonItem,
  IonButton,
  IonGrid,
  IonFooter,
  IonToolbar,
  IonHeader,
  IonTitle,
  modalController 
} from "@ionic/vue"; 

export default defineComponent({
  components: { 
    IonGrid, 
    IonList,
    IonItem, 
    IonFooter,
    IonButton,
    IonToolbar,
    IonHeader,
    IonTitle,
  },
  props: {
    title: {
      type: String,
      default: 'Report Errors'
    },
    errors: {
      type: Array,
      required: true
    }
  },
  methods: {
    async closeModal() {
      await modalController.dismiss({})
    }
  }
})
</script>
<style scoped>
  ion-item {
    color: red;
  }
</style>
