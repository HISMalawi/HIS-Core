<template>
    <div :class="`his-card ${state}`"  @click="onclick"> 
        <table> 
            <td class='title'> {{ value }}&nbsp; </td>
            <td class="his-sm-text" :style="{textAlign: 'center'}">{{ label }} </td>
        </table>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    showTitle: {
        type: Boolean,
        default: true
    },
    enabled: {
        type: Boolean,
        default: true
    },
    color: {
        type: String
    },
    label: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    }
  },
  computed: {
      state(): string {
          if (this.enabled) return `${this.color} clickable`

          return 'disabled-card-color'
      }
  },
  methods: {
    onclick() { if (this.enabled) this.$emit('onclick') }
  }  
})
</script>
<style scoped>
 table {
    width: 100%;
 }
 .title {
    border-style: solid;
    border-color: rgb(105, 105, 105);
    border-width: 0px 2px 0px 0px;
    text-align: center;
    width: 35px;
    font-weight: bold;
    padding: 5px;
 }
 .his-card {
    padding: 0.8em;
 }

</style>
