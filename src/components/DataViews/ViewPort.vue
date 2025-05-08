<template> 
    <div id='view-port' :class="!showFull ? 'half': ''"> 
        <slot></slot>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
    name: 'ViewPort',
    props: {
        showFull: {
            type: Boolean,
            default: () => true
        }
    }
})
</script>
<style scoped> 
    .half {
        height: 53vh !important;
    }
    .half .view-port-content {
        height: 86%;
    }
</style>