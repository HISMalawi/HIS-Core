<template>
  <div style="padding: .1rem;">
    <multi-column-view :items="items" :numberOfColumns="numberOfColumns" v-slot="{entries}">
      <ion-list>
        <span v-for="option in entries" :key="option.label">
          <ion-item v-if="typeof option.visible === 'boolean' ? option.visible : true" style="padding: 0 !important; margin: 0 !important;">
            <div :style="{width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '12px', margin: 0, padding: 0}">
              <span>{{ option.label }}: </span>
              <span v-if="option.other && option.other.editable" @click="onClick(option)">
                <a><b>{{ option.value }}</b></a>
              </span>
              <b v-html="option.value || 'N/A'" v-else></b>
            </div>
          </ion-item>
        </span>
      </ion-list>
    </multi-column-view>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Option } from "@/components/Forms/FieldInterface";
import MultiColumnView from "@/components/containers/MultiColumnView.vue";
export default defineComponent({
  name: "InformationHeader",
  components: {
    MultiColumnView
  },
  props: {
    icon: {
      required: false,
    },
    items: {
      type: Object as PropType<Option[]>,
      required: true,
    },
    numberOfColumns: {
      type: Number,
      default: 2
    },
  },
  emits: ['update','updateARVNumber', 'addGuardian'],
  setup (props, { emit }) {
    const onClick = (entry: Option) => {
      if (entry.other.category === 'demographics') {
        return emit('update', entry.other.attribute)
      }
      if(entry.other.category === 'arv_number') {
        return emit("updateARVNumber")
      }
      return emit('addGuardian')
    }

    return {
      onClick,
    }
  } 
});
</script>
<style scoped>
ion-item {
  padding: 1px !important;
}
</style>