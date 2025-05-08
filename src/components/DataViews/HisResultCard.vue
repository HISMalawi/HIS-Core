<template>
    <ion-card>
        <ion-card-header>
            <ion-card-title> 
                <h2> {{title}} </h2>
                <ion-icon :icon="icon" size="medium"></ion-icon> 
                {{ subtitle }}
            </ion-card-title>
        </ion-card-header>
    </ion-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonCard, IonIcon, IonCardTitle, IonCardHeader } from "@ionic/vue"
export default defineComponent({
    name: "HisResultCard",
    components: {IonCard, IonIcon, IonCardTitle, IonCardHeader},
    props: {
        title: {
            required: true,
            type: String
        },
        subtitle: {
            required: true,
            type: String
        },
        icon: {
            required: false
        }
    }
})
</script>
