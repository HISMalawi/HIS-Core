<template>
  <ion-card class="his-card clickable" :class="{ active: status }">
    <img :src="icon" :alt="title" height="65">
    <ion-card-content>
      <ion-card-subtitle :color="status ? 'primary': ''">
        {{ cardTitle }}
      </ion-card-subtitle>
    </ion-card-content>
  </ion-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import Strings from '../utils/Strings'
import { IonCard, IonCardContent, IonCardSubtitle } from "@ionic/vue";

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true
    },
    status: {
      type: Boolean,
      default: false
    }
  },
  components: { IonCard, IonCardContent, IonCardSubtitle },
  setup(props) {
    const cardTitle = computed(() => Strings.capitalizeFirstLetter(props.title))
    const icon = computed(() => `/assets/images/prescription/${props.title}.png`)

    return {
      cardTitle,
      icon,
    }
  },
})
</script>

<style scoped>
.active {
  background: rgb(240, 255, 251);
  /* background: lightgreen; */
}
</style>
