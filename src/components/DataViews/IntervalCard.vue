<template>
    <div :class="`his-card ${state}`" @click="() => enabled ? $emit('onclick') : null"> 
      <s v-if="!enabled">{{ label }}</s> 
      <div v-if="enabled" class="his-md-text">{{label}}</div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    color: {
        type: String
    },
    enabled: {
      type: Boolean,
      default: true
    },
    label: {
        type: String,
        required: true
    }
  },
  computed: {
    state(): string {
      return this.enabled ? `clickable ${this.color}` : 'disabled-card-color'
    }
  }
})
</script>
<style scoped>
 .his-card {
    height: 60px;
    margin: 1.5%;
    text-align: center;
 }
</style>
