<template>
  <table>
    <tr v-for="(row, rowIndex) in layout" :key="rowIndex">
      <td class='his-keyboard-margin' v-for="(btnKey, btnIndex) in row" :key="`btn-${btnIndex}`">
          <ion-button 
            v-if="btnKey" 
            :style="{width: btnSize}"
            :class="`his-keyboard-btn btn-${btnKey}-${dynamicClass(row)}`" 
            @click="() => keyPress(btnKey)">
              {{ btnKey }}
          </ion-button>
      </td>
      </tr>
  </table>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { IonButton } from "@ionic/vue";
export default defineComponent({
  components: { IonButton },
  props: {
    btnSize: {
      type: String,
      default: '90%'
    },
    layout: {
      type: Array,
      required: true,
      default: () => []
    },
    onKeyPress: {
      type: Function,
      required: true,
    },
  },
  methods: {
    keyPress(key: any) {
      this.onKeyPress(key);
    },
    dynamicClass(row: any){
      if(row.length == 3 && row[0] == "Unknown")
        return "Keypad"
      return row[0]
    }
  },
});
</script>