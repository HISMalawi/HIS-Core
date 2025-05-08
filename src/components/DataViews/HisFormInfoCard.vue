<template>
    <tool-bar-medium-card>
        <ion-grid>
            <ion-row v-for="(row, rIndex) in rowItems" :key="rIndex">
                <ion-col class='col his-sm-text'  
                    v-for="(item, iIndex) in row" 
                    :key="iIndex">
                    <b>{{ item.label }}:</b> {{ item.value }}
                </ion-col>
            </ion-row>
        </ion-grid>
    </tool-bar-medium-card>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Option } from "@/components/Forms/FieldInterface";
import ToolBarMediumCard from "@/components/Cards/ToolbarMediumCard.vue"
import Transformer from "@/utils/Transformers"
import {IonGrid, IonCol, IonRow} from "@ionic/vue"

export default defineComponent({
  name: "HisResultCard",
  components: { ToolBarMediumCard, IonGrid, IonCol, IonRow },
  props: {
    items: {
      type: Object as PropType<Option[]>,
      required: true,
    },
  },
  computed: {
    rowItems(): any {
      return Transformer.convertArrayToTurples(this.items, 2)
    }
  }
});
</script>
<style scoped>
.tool-bar-medium-card {
  height: 100%;
}
.col {
  margin: auto;
  margin: 0;
  padding: 0;
  text-align: left;
}
</style>