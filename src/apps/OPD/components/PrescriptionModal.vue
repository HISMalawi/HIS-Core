<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Complete prescription details</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content :style="{ overflowY: 'hidden', background: 'grey' }" >
    <ion-grid>
      <ion-row>
        <ion-col size="4">
          <ion-list :style="{overflowY: 'auto', height:'78vh', borderRight: 'solid 1px #ccc'}"> 
            <ion-item
              v-for="(drug, index) in drugs" :key="drug"
              :detail="true"
              @click="() => activeIndex = index"
              :color="activeIndex === index ? 'light' : ''"
            > 
              <ion-label> {{ drug.name }} </ion-label>
            </ion-item>
          </ion-list>
        </ion-col>
        <ion-col :style="{overflowY: 'auto', height:'78vh'}">
          <template v-if="activeIndex >= 0">
            <div class="side-title">{{ instructions }}</div>
            <ion-row class="frequencies">
              <ion-col v-for="key in Object.keys(frequencies)" :key="key">
                <frequency-card 
                  :title="key"
                  :status="frequencies[key]"
                  @click="setFrequency(key)"
                />
              </ion-col>
            </ion-row>
            <interval-keyboard 
              unit="days"
              title="Select Duration"
              @onValue="setDuration"
            />
          </template>
        </ion-col>
      </ion-row>
    </ion-grid> 
  </ion-content>
  <ion-footer>
    <ion-toolbar> 
      <ion-button @click="closeModal" slot="start" color="danger" style="margin-left: 1rem;"> Close </ion-button>
      <ion-button @click="savePrescriptions" slot="end" style="margin-right: 1rem;">Save </ion-button>
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
  IonRow,
} from "@ionic/vue";
import { computed, defineComponent, PropType, ref} from "vue";
import { Option } from "@/components/Forms/FieldInterface";
import FrequencyCard from "./FrequencyCard.vue";
import IntervalKeyboard from "@/components/Keyboard/HisIntervalKeyboard.vue";
import { toastWarning } from "@/utils/Alerts";

export default defineComponent({
  name: "PrescriptionModal",
  props: {
    prescribedDrugs: {
      type: Object as PropType<Option[]>, 
      required: true
    },
  },
  setup (props) {
    const activeIndex = ref(-1)  
    const drugs = computed(() => props.prescribedDrugs.map(d => {
      const drug = d.other
      drug.duration = 0
      drug.frequency = {
        morning: false,
        noon: false,
        evening: false,
        night: false,
      }
      return drug
    }))
    const getFrequencyCount = (frequency: Record<string, boolean>) => {
      return Object.values(frequency).filter(value => value).length
    }
    const instructions = computed(() => {
      if(activeIndex.value < 0) return ''
      const drugname = drugs.value[activeIndex.value].name
      const freq = getFrequencyCount(drugs.value[activeIndex.value].frequency)
      const duration = drugs.value[activeIndex.value].duration
      return `${drugname}, ${freq} time(s) a day, for ${duration} day(s)` 
    })
    const frequencies = computed(() => {
      if(activeIndex.value < 0) return {}
      return drugs.value[activeIndex.value].frequency
    })
    const setFrequency = (index: string) => {
      drugs.value[activeIndex.value].frequency[index] = !drugs.value[activeIndex.value].frequency[index]
    }
    const setDuration = (text: string) => {
      drugs.value[activeIndex.value].duration = parseInt(text)
    }
    const isComplete = () => {
      for (const drug of drugs.value) {
        const freq = getFrequencyCount(drug.frequency)
        const duration: number = drug.duration
        if(!freq  || !duration){
          toastWarning(`complete prescription details for ${drug.name}`)
          return false
        }
      }
      return true
    }
    const savePrescriptions = () => {
      if(isComplete()) {
        modalController.dismiss(drugs.value)
      }
    }
    const closeModal = () => modalController.dismiss()
    return {
      drugs,
      activeIndex,
      instructions,
      frequencies,
      closeModal,
      setFrequency,
      setDuration,
      savePrescriptions,
    }
  },
  components: {
    IonContent,
    IonButton,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonLabel,
    IonList,
    IonItem,
    IonRow,
    FrequencyCard,
    IntervalKeyboard
},
});
</script>
<style scoped>
.frequencies {
  display: flex;
  flex-wrap: wrap;
  margin-top: 2rem;
  margin-bottom: 2rem;
  overflow: hidden;
}
.frequencies ion-col {
  display: flex;
  justify-content: center;
  padding: 0.1rem;
}
.frequencies ion-card {
  text-align: center;
  margin-bottom: 12px;
  margin-top: 12px;
  width: 100%;
}
.side-title {
  width: 100%;
  padding: 0.5em;
  text-align: center;
  background: rgb(233, 232, 232);
  font-size: 1.2em;
}
</style>