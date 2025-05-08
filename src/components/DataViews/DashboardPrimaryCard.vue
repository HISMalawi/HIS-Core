<template>
    <div class="card" 
        :class="{ 
            'inactive' : !isEnabled, 
            'clickable': isEnabled
        }">
        <ion-item :color="titleColor" lines="none" class="his-md-text title-card"> 
            <ion-badge slot="start" class="his-sm-text" color="light"><b>{{ counter }}</b></ion-badge>
            <ion-label> {{title}} </ion-label> 
        </ion-item>
        <text-skeleton v-if="isLoading" :itemCount="5"/>
        <ion-list v-if="!isLoading">
            <ion-item v-for="(item, index) in items" :key="index">
                <ion-label :class="item?.other?.wrapTxt ? 'ion-text-wrap' : ''" v-html="item.label" />
                <ion-chip  class="his-sm-text ion-no-margin" v-if="item.value" slot='end'>
                  <ion-icon :icon="icon"></ion-icon>
                <ion-label>{{ item.value }}</ion-label>
                </ion-chip>
                <ion-chip class="his-sm-text ion-no-margin" v-if="item.other?.isBDE" slot='end' color="danger" style="margin-left: .2rem;">
                    <ion-label>BDE</ion-label>
                </ion-chip>
            </ion-item>
        </ion-list>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Option } from "@/components/Forms/FieldInterface"
import { time } from "ionicons/icons";
import TextSkeleton from "@/components/TextSkeleton.vue"
import { 
    IonLabel, 
    IonList, 
    IonItem,
    IonChip,
    IonIcon,
    IonBadge
} from "@ionic/vue";
export default defineComponent({
    components: {
        TextSkeleton,
        IonLabel, 
        IonList, 
        IonItem,
        IonChip,
        IonIcon,
        IonBadge
    },
    data: () => ({
        time
    }),
    props: {
        isEnabled: {
            type: Boolean,
            default: () => true
        },
        counter: {
            type: Number,
            required: false
        },
        isLoading: {
            type: Boolean
        },
        icon: {
            type: String   
        },
        title: {
            type: String,
            required: true
        },
        items: {
            type: Object as PropType<Option[]>
        },
        titleColor: {
            type: String,
            required: false,
            default: () => '#337ab7'
        }
    }
})
</script>
<style scoped>
.card {
  width: 100%;
  border-radius: 6px;
  border: 1px solid #ccc;
  height: 32.8vh;
  background-color: rgb(255, 255, 255);
  overflow: hidden;
  -webkit-box-shadow: 0px -2px 19px -2px rgba(196, 190, 196, 1);
  -moz-box-shadow: 0px -2px 19px -2px rgba(196, 190, 196, 1);
  box-shadow: 0px -2px 19px -2px rgba(196, 190, 196, 1);  
}
.card:active {
    transform: translateY(4px);
}
.title-card {
    padding: 5px;
    width: 100%;
    color: white;
}
.inactive {
  opacity: 0.5;
}
</style>