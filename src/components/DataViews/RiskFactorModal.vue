<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Risk Factors</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content :style="{ overflowY: 'hidden', background: 'grey' }" >
  <ion-grid>
  <ion-row>
  <ion-col >
  <ion-list :style="{overflowY: 'auto', height:'78vh'}"> 
      <ion-item
        v-for="(data) in riskFactors" :key="data"
      > 
        <ion-label> {{ data.name }} </ion-label>
        <ion-checkbox v-model="data.isChecked" slot="start"/>
      </ion-item>
    </ion-list>
    </ion-col>
    </ion-row>
</ion-grid> 
  </ion-content>
  <ion-footer>
    <ion-toolbar> 
      <ion-button size="large" @click="exit" slot="start" color="danger"> Close </ion-button>
      <ion-button size="large" v-if="showManageBPButton" @click="manageBP" slot="start"> Manage BP </ion-button>
      <ion-button size="large" color="success" @click="postActivities" slot="end" > Save </ion-button>
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
  IonCheckbox,
  IonFooter,
  IonRow,
  IonCol,
  IonGrid
} from "@ionic/vue";
import { defineComponent, PropType } from "vue";
import { MedicalHistoryService } from "@/apps/ART/services/medical_history";
import { ConceptService } from "@/services/concept_service";

export default defineComponent({
  name: "Modal",
  props: {
    factors: {
      type: Object as PropType<Record<string, any>>,
      required: true
    },
    title: {
      type: String, 
      default: ""
    },
  },
  computed: {
    showManageBPButton(): boolean {
      return this.$route.name != 'bp_management'
    }
  },
  created() {
    this.patientID = parseInt(`${this.$route.params.patient_id}`)
  },
  methods: {
    async postActivities() {
      const history = new MedicalHistoryService(this.patientID, -1)
      const encounter = await history.createEncounter();

      if(encounter) {
        const obs: any = await this.buildObs();
        await history.saveObservationList(obs);
        await this.closeModal();
      }
    },
    manageBP() {
      this.$router.push(`/art/encounters/bp_management/${this.patientID}`)
    },
    exit() {
      modalController.dismiss([])
    },
    async closeModal() {
      await modalController.dismiss(this.riskFactors)
    },
    async buildObs() {
      return this.riskFactors.map((r: any) => {
        const val = r.isChecked === true ? 'Yes' : 'No';
        const valConcept = ConceptService.getConceptID(val, true);
        const con = ConceptService.getConceptID(r.concept, true)
        return {
          'concept_id': con,
          'value_coded': valConcept
        }
      });
    }
  },
  data() {
    return {
      patientID: -1 as number,
      riskFactors: [
        {name: 'Diabetes', isChecked: false, concept: 'Diabetes'},
        {name: 'Cronic kidney disease', isChecked: false, concept: 'CKD'},
        {name: 'Past history of IHD or CVD', isChecked: false, concept: 'history of CVD'},
        {name: 'First degree relative with IHD or CVD <65', isChecked: false, concept: 'relative with CVD'},
        {name: 'Patient currently smokes', isChecked: false, concept: 'patient smokes'}
      ]
    };
  },
  mounted() {
    this.factors.forEach((factor: any) => {
      if(factor.value === "Yes") {
        const ind = this.riskFactors.findIndex(d => d.concept === factor.concept);
        this.riskFactors[ind].isChecked = true;
      }
    });
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
    IonCheckbox,
    IonRow,
    IonFooter,
    IonGrid,
    IonCol,
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
</style>
