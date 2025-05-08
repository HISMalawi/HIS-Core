<template>
    <ion-list> 
        <ion-item v-for="(item, index) in items" :key="index"> 
            <ion-skeleton-text animated style="width: 100%"></ion-skeleton-text>
        </ion-item>
    </ion-list>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import {
    IonSkeletonText,
    IonList,
    IonItem,
} from "@ionic/vue"
export default defineComponent({
    components: {
        IonSkeletonText,
        IonList,
        IonItem,
    },
    props: {
        itemCount: {
            type: Number,
            default: 10
        }
    },
    setup(props) {
        const items = []
        for(let x = 0; x < props.itemCount; ++x) {
            items.push(x)
        }
        return {
            items
        }
    },
})
</script>

<style scoped>
  /* Custom Skeleton Line Height and Margin */
  .custom-skeleton ion-skeleton-text {
    line-height: 13px;
    height: 150px;
  }

  .custom-skeleton ion-skeleton-text:last-child {
    margin-bottom: 5px;
  }
</style>
