<template>
  <ion-grid>
    <ion-row>
      <ion-col 
        v-for="(entries, index) in computedItems" 
        :key="index" 
        :size="grid[numberOfColumns]" 
      >
        <slot :entries="entries"></slot>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { IonGrid, IonRow, IonCol } from "@ionic/vue";
import { chunk } from "lodash";

export default defineComponent({
  name: "MultiColumnView",
  components: {
    IonGrid,
    IonRow,
    IonCol,
  },
  props: {
    items: {
      type: Object as PropType<any[]>,
      required: true,
    },
    numberOfColumns: {
      type: Number,
      default: 1
    },
  },
  setup (props) {
    const grid: Record<number, number> = {1:12, 2:6, 3:4, 4:3, 6:2}
    const computedItems = computed(() => 
      chunk(props.items, Math.ceil(props.items.length / props.numberOfColumns))
    )
    return {
      computedItems,
      grid,
    }
  } 
});
</script>