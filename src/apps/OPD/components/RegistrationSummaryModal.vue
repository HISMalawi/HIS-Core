<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Clinic Registration  Report Summary</ion-title>
      <ion-button color="danger" slot="end" @click="closeModal()">X</ion-button>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-grid>
      <ion-row>
        <ion-col><h3>Type of Visit</h3></ion-col>
        <ion-col><h3> &lt; 5yrs </h3></ion-col>
        <ion-col><h3> > 5yrs</h3></ion-col>
        <ion-col><h3>Total</h3></ion-col>
      </ion-row>
      <ion-list>
        <ion-item v-for="item in list" :key="item">
          <ion-col>
            {{ item.label }}
          </ion-col>
          <ion-col>
            {{ item.under5}}
          </ion-col>
          <ion-col>
            {{ item.over5}}
          </ion-col>
          <ion-col>
            {{ item.value}}
          </ion-col>
        </ion-item>
      </ion-list>
    </ion-grid>
  </ion-content>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { modalController } from '@ionic/core'

export default defineComponent({
  props: {
    list: Object as PropType<any[]>
  },
  setup() {
    const closeModal = async () => await modalController.dismiss()
    
    return {
      closeModal
    }
  },
})
</script>
