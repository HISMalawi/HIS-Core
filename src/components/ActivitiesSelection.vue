<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Select activities</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <multi-column-view :items="appActivities" #default="{entries}" :numberOfColumns="2">
      <div class="his-card clickable" v-for="(entry, index) in entries" :key="index" @click="entry.selected = !entry.selected"> 
        <ion-row >
          <ion-col size="1">
            <ion-checkbox v-model="entry.selected" @click="entry.selected = !entry.selected" />
          </ion-col>
          <ion-col class="ion-text-center his-md-text">
            {{ entry.value }}
          </ion-col>
        </ion-row>
      </div>
    </multi-column-view>
  </ion-content>
  <ion-footer>
    <ion-toolbar>
      <ion-button @click="postActivities" color="success" :disabled="selectedActivities.length == 0" size="large" style="float: right;">finish</ion-button>
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
  IonCheckbox,
} from "@ionic/vue";
import { defineComponent, PropType } from "vue";
import { toastWarning } from "@/utils/Alerts"
import { ActivityInterface } from "@/apps/interfaces/AppInterface"
import { Service } from "@/services/service";
import { isEmpty } from "lodash";
import MultiColumnView from "./containers/MultiColumnView.vue";

export default defineComponent({
  name: "Modal",
  props: {
    activities: {
      type: Object as PropType<ActivityInterface[]>,
      required: true
    },
    property: {
      type: String, 
      default: "activities"
    },
  },
  watch: {
    activities: {
      handler(activities: Array<ActivityInterface>){
        if (activities) {
          this.appActivities = [...activities]
          this.getActivities();
        }
      },
      immediate: true
    }
  },
  methods: {
    async getActivities() {
      const data = await Service.getJson('user_properties', {
        property: this.property
      })
      if(isEmpty(data)){
        toastWarning("Activities not found");
      } else {
        this.appActivities = this.appActivities.map((el) => {
        if (data.property_value.search(el.value) >= 0) {
          el.selected = true;
        }
        return el;
      });
      }
    },
    async postActivities() {
      const userActivities = {
        property: this.property,
        'property_value': this.selectedActivities,
      };
      const res = await Service.postJson('user_properties', userActivities)
      if (!res) {
        toastWarning("Could not save activities");
      } else {
        await modalController.dismiss();
      }
    },
  },
  computed: {
    selectedActivities(): string {
      return this.appActivities
        .filter((element) => element.selected == true)
        .map((el) => el.value )
        .join(",");
    },
  },
  data() {
    return {
      content: "Content",
      appActivities: [] as Array<ActivityInterface>,
    };
  },
  components: {
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCheckbox,
    MultiColumnView
},
});
</script>
<style scoped>
 .his-card {
    padding: 0.55em;
    margin: .5em;
 }
</style>
