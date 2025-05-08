<template>
  <ion-footer>
    <ion-toolbar color="dark">
      <ion-button @click="onCancel" color="danger" size="large">Cancel</ion-button>
      <ion-button slot="end" v-show="showClear" @click="onClear" color="warning" size="large">Clear</ion-button>
      <ion-button slot="end" v-show="showBack" @click="onBack" color="primary" size="large">Back</ion-button>
      <ion-button slot="end" v-show="showNext" @click="onNext" color="primary" size="large">Next</ion-button>
      <ion-button slot="end" v-show="showFinish" @click="onFinish" color="success" size="large">Finish</ion-button>
    </ion-toolbar>
  </ion-footer>
</template>

<script lang="ts">

import {IonButton, IonFooter, IonToolbar} from "@ionic/vue";

export default {
  name: "HisNavFooter",
  props: {
    showNext: {
      type: Boolean,
      default: () => true
    },
    showClear: {
      type: Boolean,
      default: () => false
    },
    showBack: {
      type: Boolean,
      default: () => false
    },
    showFinish: {
      type: Boolean,
      default: () => false
    }
  },
  components: {
    IonButton,
    IonFooter,
    IonToolbar
  },
  methods: {
    onClear(){
      this.$emit('onClear')
    },
    onCancel() {
      this.$emit('onCancel')
    },
    onNext() {
      this.$emit('onNext')
    },
    onBack() {
      this.$emit('onBack')
    },
    onFinish() {
      this.$emit('onFinish')
    }
  }
}
</script>

<style scoped>

</style>