<template>
    <ion-card class="his-card">
        <ion-card-header style="background: #708090 !important;">
            <ion-card-title>
                {{ title }}
            </ion-card-title>
        </ion-card-header>
        <ion-card-content>
            <text-skeleton v-if="isLoading" :itemCount="5"/>
            <ul class="card-content" v-if="!isLoading"> 
            <li class='li-item his-sm-text' v-for="(info, id) in items" :key="id" style="display: flex; justify-content: space-between;"> 
                <span v-if="info.label"> {{ info.label }} &nbsp;</span>
                <strong v-html="info.value"></strong>
            </li>
            </ul>
        </ion-card-content>
    </ion-card>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import TextSkeleton from "@/components/TextSkeleton.vue"
import {
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonCardHeader
} from "@ionic/vue";
export default defineComponent({
    components: {
        IonCard,
        IonCardContent,
        IonCardTitle,
        IonCardHeader,
        TextSkeleton
    },
    props: {
        title: {
            type: String
        },
        isLoading: {
            type: Boolean
        },
        items: {
            type: Object
        }
    }
})
</script>
<style scoped>
.card-content {
  padding: 0;
  height: 300px;
  overflow: hidden;
}
.tool-bar-medium-card {
  padding: 0.3em;
}
ul {
  padding: 0;
}
.li-item {
  list-style: none;
  margin: 0;
  padding: 0;
  line-height: 30px;
  border-bottom: .1rem solid #cecece;
}
ion-card-header {
  padding: 0.3em;
  background: #3880ff;
  color: white!important;
}
ion-card-title {
  color: white;
}
ion-col p {
  margin: 0;
}
ion-card {
  height: 35vh;
  padding: 0; 
  border-radius: 6px;
}
</style>