<template>
    <div ref="labelComponent" id="container">
        <div class="header-text">
            {{ number ?? "??" }}
        </div>
        <p style="margin:15px;"></p>
        <div>
            <div>Filing area {{ file_type ?? "??" }}</div>
            <div>Version number: {{ version_number ?? "??" }}</div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, PropType, ref } from "vue";
import domtoimage from 'dom-to-image-more';

const labelComponent = ref(null)

const emit = defineEmits(['label-out'])

const props = defineProps({ 
    imageOut: {
        type: Object as PropType<(img: string[]) => void>
    },
    number: String,
    version_number: String,
    file_type: String
})

onMounted(() => {
    domtoimage.toPng(labelComponent.value, { width: 500, height: 260 }).then((dataUrl: string) => {
        emit('label-out', dataUrl)
        if (typeof props.imageOut === 'function') props.imageOut([dataUrl])
    })
})
</script>
<style scoped>
#container {
    padding: 15px;
    font-size: 30px;
    font-family: monospace;
}
.header-text {
    font-size: 100px;
}
</style>
