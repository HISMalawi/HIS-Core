<template>
    <view-port> 
        <div class="vertically-align">
            Error Loading form element. Exit app and try again and check your network.
        </div>
    </view-port>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ViewPort from "@/components/DataViews/ViewPort.vue"
export default defineComponent({
    components: {
        ViewPort
    }
})
</script>
