<template>
  <tool-bar-medium-card class="clickable"  @click="showReleaseNotes">
    <ion-img v-if="icon" :src="icon" id="logo"></ion-img>
    <div style='font-size:0.7em;font-weight:bold;' class="ion-text-center">{{version}}</div>
  </tool-bar-medium-card>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import ToolBarMediumCard from "@/components/Cards/ToolbarMediumCard.vue"
import ReleaseNotesVue from "../ReleaseNotes.vue";
import {
  IonImg, modalController
} from "@ionic/vue"
export default defineComponent({
  name: "AppIcon",
  components: { IonImg, ToolBarMediumCard },
  props: {
    app: {
      type: Object
    },
    icon: {
      type: String,
      required: true
    },
    version: {
      type: String,
      default: '-/-'
    }
  },
  methods: {
    async showReleaseNotes() {
      (await modalController.create({
        component: ReleaseNotesVue,
        backdropDismiss: true,
        cssClass: "large-modal",
        componentProps: {
          app: this.app,
          onCloseAction: modalController.dismiss
        }
      })).present()
    }
  }
});
</script>
<style scoped>
  .tool-bar-medium-card {
    text-align: center;
  }
  #logo {
    margin: auto;
    width: 120px;
    height: 70px;
  }
</style>