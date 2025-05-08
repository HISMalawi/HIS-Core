<template>
    <ion-header> 
        <ion-toolbar> 
            <ion-title class="his-md-text"> {{ title }} </ion-title>
        </ion-toolbar>
    </ion-header>

    <ion-content> 
        <his-basic-table :columns="columns" :rows="rows"> </his-basic-table> 
    </ion-content>
    
    <ion-footer>
      <ion-toolbar>
        <ion-button size="large" @click="closeModal" slot="end"> Close </ion-button>
      </ion-toolbar>
  </ion-footer>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import HisBasicTable from './HisBasicTable.vue'
import {modalController} from '@ionic/vue'
import { 
  IonHeader, 
  IonToolbar, 
  IonContent, 
  IonFooter, 
  IonButton 
} from "@ionic/vue"
export default defineComponent({
  components: { 
    HisBasicTable,
    IonHeader, 
    IonToolbar, 
    IonContent, 
    IonFooter, 
    IonButton 
  },
  props: {
    title: {
      type: String, 
      required: true
    },
    columns: {
      type: Array as PropType<string[]>,
      required: true
    },
    rows: {
      type: Array as PropType<string[]>,
      default: () => []
    }
  },
  methods: {
    async closeModal() {
      await modalController.dismiss({})
    },
  }
})
</script>
