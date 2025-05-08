<template>
    <ion-header> 
        <ion-toolbar> 
            <ion-title> {{ title }} </ion-title>
        </ion-toolbar>
    </ion-header>

    <ion-content> 
      <information-header :items="visitData"></information-header>
    </ion-content>
    
    <ion-footer>
      <ion-toolbar>
        <ion-button @click="closeModal" slot="end"> Close </ion-button>
      </ion-toolbar>
  </ion-footer>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import {modalController} from '@ionic/vue'
import InformationHeader from "@/components/InformationHeader.vue";
export default defineComponent({
  components: {  InformationHeader },
  props: {
    title: {
      type: String, 
      required: true
    },
    visitData: {
      type: Object as PropType<any[]>,
      required: true
    },
  },
  methods: {
    async closeModal() {
      await modalController.dismiss({})
    },
  }
})
</script>
