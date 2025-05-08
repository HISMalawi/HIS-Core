<template>
  <table class="his-md-text" :class="classStyles">
    <tr>
      <th v-for="(column, hIndex) in columns" :key="hIndex">
        {{ column }}
      </th>
    </tr>
    <tr v-for="(dataItems, rIndex) in rows" :key="rIndex">
      <td
        :class="getColorCodeClass(rIndex, dIndex)"
        v-for="(item, dIndex) in dataItems"
        :key="dIndex"
      >
        <div v-if="isLink(item)">
          <div v-if="item.isActive">
            <a href="#" @click.prevent="item.action(dataItems)">{{
              item.value
            }}</a>
          </div>
          <div v-else>
            {{ item.value }}
          </div>
        </div>
        <div v-else-if="isActionButton(item)">
          <ion-button 
            :color="item?.color || 'primary'"
            :style="item.style" 
            @click="item.action(dataItems)">{{
              item.name
            }}</ion-button>
        </div>
        <div v-else>
          <span v-html="item"></span>
        </div>
      </td>
    </tr>
  </table>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";
import { isEmpty } from "lodash";
import { IonButton } from "@ionic/vue"

export default defineComponent({
  components: {IonButton},
  props: {
    styles: {
      type: Array,
    },
    rowColors: {
      type: Array,
      default: () => [],
    },
    cellColors: {
      type: Array,
      default: () => [],
    },
    columns: {
      type: Object as PropType<string[]>,
      required: true,
    },
    rows: {
      type: Object as PropType<string[]>,
    },
  },
  computed: {
    classStyles(): string {
      const styles = this.styles ? this.styles.join(" ") : "";
      return `his-table ${styles}`;
    },
  },
  methods: {
    isLink(item: any) {
      try {
        return typeof item === "object" && item.type === "link";
      }catch(e) {
        return item
      }
    },
    isActionButton(item: any) {
      try {
        return typeof item === "object" && item.type === "button";
      }catch(e) {
        return item
      }
    },
    getColorCodeClass(rIndex: number, dIndex: number) {
      let styleClass = "";
      if (!isEmpty(this.rowColors)) {
        const row: any = this.rowColors.filter((i: any) =>
          i.indexes.includes(rIndex)
        );
        if (!isEmpty(row)) {
          styleClass += " " + row[0].class;
        }
      }
      if (!isEmpty(this.cellColors)) {
        const cell: any = this.cellColors.filter((i: any) => {
          return i.index === dIndex && i.row === rIndex;
        });
        if (!isEmpty(cell)) {
          styleClass += " " + cell[0].class;
        }
      }
      return styleClass;
    },
  },
});
</script>
