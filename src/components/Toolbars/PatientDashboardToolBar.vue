<template>
    <ion-header :translucent="true">
        <ion-toolbar> 
            <ion-row> 
                <ion-col :size="hasProgramInfo ? 5: 10"> 
                    <info-card :items="patientCardInfo"/> 
                </ion-col>
                <ion-col size="5" v-if="hasProgramInfo">
                    <info-card :items="programCardInfo"/> 
                </ion-col>
                <ion-col size="2">
                    <icon-card :icon="logo"> </icon-card>
                </ion-col>
            </ion-row>
        </ion-toolbar>
    </ion-header>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import InfoCard from "@/components/DataViews/DashboardSecondaryInfoCard.vue"
import IconCard from "@/components/DataViews/DashboardAppIcon.vue"
import { IonHeader, IonToolbar, IonCol, IonRow } from "@ionic/vue"
import Img from "@/utils/Img"

export default defineComponent({
    components: {IonHeader, IonToolbar, IonCol, IonRow, InfoCard, IconCard },
    props: {
       patientCardInfo: {
          type: Array,
          required: true,
       },
       programCardInfo: {
           type: Array,
           required: true
       },
       appIcon: {
           type: String,
           required: true
       }
    },
    computed: {
        hasProgramInfo(): boolean {
            return this.programCardInfo.length >= 1
        },
        logo(): string {
            return Img(this.appIcon)
        }
    }
})
</script>
