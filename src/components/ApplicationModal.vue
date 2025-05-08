<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Select Module</ion-title>
      <ion-label style="font-weight: bold; padding:0.5em" slot="end">
        Version: {{ appVersion }} 
      </ion-label>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <ion-row>
       <ion-col 
          v-for="app, index in apps" 
          :key="index"
          size-md="4" 
          size-sm="12">
        <application-card 
          :class="{ 
            'inactive' : !app.hasPriviledge, 
            'clickable': app.hasPriviledge
          }"
          @click="setApplication(app)" 
          :name="app.applicationName"
          :version="app.version"
          :releaseDate="app.versionReleaseDate"
          :details="app.applicationDescription" 
          :programID="app.programID" 
          :iconURL="img(app.applicationIcon)">
        </application-card>
       </ion-col>
     </ion-row>
  </ion-content>
  <ion-footer> 
    <ion-toolbar> 
      <ion-button 
        color="danger" 
        size="large"
        @click="closeModal"
        v-if="noAppPriviledges || canClose"> 
        Close
      </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>
<script>
import { defineComponent } from 'vue';
import ApplicationCard from '@/components/ApplicationCard'
import Img from "@/utils/Img"
import { 
  IonContent, 
  IonFooter,
  IonHeader, 
  IonButton,
  IonTitle, 
  IonToolbar, 
  IonCol, 
  IonRow, 
  modalController 
} from '@ionic/vue';
export default defineComponent({
  name: 'Modal',
  props: {
    title: { type: String, default: '' },
    apps: {
      type: Array,
      default: () => []
    },
    appVersion: {
      type: String
    },
    canClose: {
      type: Boolean,
      default: () => false
    }
  },
  computed: {
    noAppPriviledges() {
      return this.apps.every(app => !app.hasPriviledge);
    }
  },
  methods: {
    closeModal() {
      if (this.noAppPriviledges) {
        this.$router.push('/login');
      } else {
        modalController.dismiss();
      }
    },
    img(name) {
      return Img(name)
    },
    setApplication(app) { 
      if (app.hasPriviledge) {
        modalController.dismiss(app) 
      }
    }
  },
  components: { 
    IonFooter, 
    IonContent, 
    IonHeader, 
    IonTitle,
    IonToolbar, 
    ApplicationCard, 
    IonButton,
    IonCol, 
    IonRow
  }
});
</script>
<style scoped>
.inactive {
  opacity: 0.5;
}
</style>