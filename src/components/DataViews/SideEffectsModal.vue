<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Side effects suspected causes</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content :style="{ overflowY: 'hidden', background: 'grey' }" >
  <ion-grid>
  <ion-row>
  <ion-col size="4">
  <ion-list :style="{overflowY: 'auto', height:'78vh'}"> 
      <ion-item
        v-for="(data, index) in sides" :key="data"
        @click="selectSideEffect(index)"
        :detail="true"
        :style="activeIndex === index ? 'color: green': 'color: black'"
      > 
        <ion-label> {{ data.label }} </ion-label>
      </ion-item>
    </ion-list>
    </ion-col>
    <ion-col 
      :style="{overflowY: 'auto', height:'78vh'}"
      >
    <div style="">
    <ion-list >   
      <ion-radio-group v-if="activeIndex !== null" v-model="sides[activeIndex]['reason']">
        <div class="side-title">
          Select reason
        </div>
          <!-- :color="isActive(item) ? 'primary' : ''" -->
          <!-- <ion-item v-for="data in reason" :key="data" > 
        <ion-label>{{data.name}}</ion-label>
          <ion-radio slot="start" :value="data.name" @click="addSpecimen(data)"></ion-radio>
        </ion-item> -->
        <p>Current Medication</p>
        <ion-item  v-for="drug, i in drugs" :key="i"> 
        <ion-label>{{drug.drug.name}}</ion-label>
          <ion-radio slot="start" :value="drug.drug_inventory_id"></ion-radio>
        </ion-item> 
        <p>Previous Medication</p>
        <ion-item  > 
        <ion-label>Other, not drug related</ion-label>
          <ion-radio slot="start" value="other" ></ion-radio>
        </ion-item> 
         <ion-item  > 
        <ion-label>Drug side effect</ion-label>
          <ion-radio slot="start" value="drug"></ion-radio>
        </ion-item> 
      </ion-radio-group>
    </ion-list>
      </div>
      <p/>
    </ion-col>
  </ion-row>
</ion-grid> 
  </ion-content>
  <ion-footer>
    <ion-toolbar> 
      <ion-button @click="closeModal" slot="end" color="danger"> Close </ion-button>
      <ion-button @click="postSideEffects" slot="end" :disabled="!allSelected"> Save </ion-button>
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
  IonLabel,
  modalController,
  IonList,
  IonItem,
  IonRadioGroup,
  IonRow,
} from "@ionic/vue";
import { defineComponent, PropType } from "vue";
import { ActivityInterface } from "@/apps/interfaces/AppInterface"

export default defineComponent({
  name: "Modal",
  props: {
    sideEffects: {
      type: Object as PropType<ActivityInterface[]>,
      required: true
    },
    drugs: {
      type: Array as PropType<Array<any>>, 
      default: () => []
    },
  },
  methods: {
    closeModal() {
      modalController.dismiss()
    },
    async postSideEffects() {
      await modalController.dismiss(this.sides);
    },
    selectSideEffect(index: number) {
      this.activeIndex = index;
    },
    
  },
  computed: {
    allSelected(): any {
      return this.sides.filter((side: any) => side['reason']).length === this.sides.length
    }
  },
  mounted() {
    this.sides = this.sideEffects;
  },
  data() {
    return {
      content: "Content",
      extendedLabsEnabled: false as boolean,
      appActivities: [] as Array<ActivityInterface>,
      sides: [] as any,
      specimens: [],
      reasons: ['Routine', 'Targeted', 'Confirmatory', 'Stat', 'Repeat / Missing'],
      activeIndex: null as any
    };
  },
  components: {
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonLabel,
    IonList,
    IonItem,
    IonRadioGroup,
    IonRow,
  },
});
</script>
<style scoped>
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}
ion-col {
  border-right: solid 1px #ccc;
}
.side-title {
  width: 100%;
  padding: 0.5em;
  text-align: center;
  background: rgb(233, 232, 232);
  font-size: 1.2em;
}
td,
th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #dddddd;
}
p {
  font-weight: bold;
}
</style>