<template>
  <div class="tool-bar-medium-card">
    <slot> </slot>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "ToolBarMediumCard"
});
</script>
