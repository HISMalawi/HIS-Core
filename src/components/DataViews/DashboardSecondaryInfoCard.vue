<template>
  <div class="tool-bar-medium-card">
    <div v-for="(item, index) in items" :key="index"> 
      <ion-icon v-if="hasIcon(item)" :icon="item.other.icon"/>
      {{ item.label }}: <b>{{ item.value }}</b>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Option } from "@/components/Forms/FieldInterface";
import {IonIcon} from "@ionic/vue"
export default defineComponent({
  name: "HisResultCard",
  components: {IonIcon},
  props: {
    icon: {
      required: false,
    },
    items: {
      type: Object as PropType<Option[]>,
      required: true,
    },
  },
  methods: {
    hasIcon(item: Option) {
      return 'other' in item && 'icon' in item.other
    }
  }
});
</script>
<style scoped>
  .tool-bar-medium-card {
    padding: 0.3em;
    margin: 0;
    font-size: 0.95rem;
  }
  b {
    color: rgb(71, 70, 70);
  }
  ul li {
    padding: 0;
    list-style: none;
    color: rgb(94, 92, 92);
  }
</style>