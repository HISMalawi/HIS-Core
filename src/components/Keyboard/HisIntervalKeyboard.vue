<template>
  <ion-row class="ion-margin-vertical border">
    <ion-col size="4">
      <ion-list>
        <ion-item>
          <ion-label>{{ title }}</ion-label>
        </ion-item>
        <ion-item
          v-for="(range, index) in ranges"
          :key="range"
          :color="activeIndex === index ? 'light': ''"
          :detail="true"
          @click="generateKeypad(range)"
        >
          <ion-label> {{ range.start + ' - ' + range.end + ' ' + unit }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-col>
    <ion-col v-if="keyboard">
      <his-keyboard :kbConfig="keyboard" :onKeyPress="onKeyPress" :disabled="false" style="border: 0;"/>
    </ion-col>
  </ion-row>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue";
import { IonRow, IonCol, IonList, IonItem, IonLabel } from "@ionic/vue";

export default defineComponent({
  props: {
    unit: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: 'Select Numbers'
    }
  },
  components: { 
    HisKeyboard, 
    IonRow, 
    IonCol, 
    IonList, 
    IonItem, 
    IonLabel
  },
  emits: ['onValue'],
  setup(_, { emit }) {
    const ranges = ref([
      {start: 1, end: 20},
      {start: 21, end: 40},
      {start: 41, end: 60},
      {start: 61, end: 80}
    ])
    const activeIndex = ref(0)
    const keyboard = ref<Array<any>>()
    const onKeyPress = (text: any) => emit('onValue', text)
    const generateKeypad = (range: any) => {
      const numbers: string[][] = [[]]
      let row = 0
      let counter = 0     
      for (let i = range.start; i <= range.end; i++){
        if(counter > 4) {
          ++row
          numbers[row] = [],
          counter = 0
        }
        numbers[row].push(`${i}`)
        ++counter
      }
      keyboard.value =  [numbers, []]
      activeIndex.value = ranges.value.findIndex(r => r.start === range.start)
    }
    onMounted(() => generateKeypad(ranges.value[0]))
    return {
      keyboard,
      onKeyPress,
      generateKeypad,
      ranges,
      activeIndex,
    }
  },
})
</script>
<style scoped>
.border {
  border: 1px solid #c2c2c2;
}
</style>
