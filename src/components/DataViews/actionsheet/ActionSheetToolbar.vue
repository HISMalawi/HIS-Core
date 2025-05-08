<template>
    <ion-header>
        <ion-toolbar>
            <ion-title class="ion-text-center">
                <span class="his-lg-text" :class="color"> {{ title }} </span>
                <h1 v-if="subtitle">{{ subtitle }}</h1>
            </ion-title>
        </ion-toolbar>
  </ion-header>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
    IonToolbar,
    IonTitle,
    IonHeader
} from "@ionic/vue"

export default defineComponent({
    components: { IonToolbar, IonTitle, IonHeader },
    props: {
        title: {
            type: String,
            required: true,
        },
        subtitle: {
            type: String
        },
        color: {
            type: String
        }
    }
})
</script>
<style scoped>
h2 {
    padding-bottom: .2em;
}
</style>
