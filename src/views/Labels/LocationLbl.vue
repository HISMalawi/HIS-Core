<template>
        <div ref="labelComponent" id="container">
            <div>{{ location_name }}</div>
            <div style="padding: 1%"></div>
            <svg id="location-barcode"></svg>
        </div>
</template>

<script lang="ts" setup>
import domtoimage from 'dom-to-image-more';
import JsBarcode from "jsbarcode";
import { onMounted, PropType, ref } from "vue";

const emit = defineEmits(['label-out'])

const labelComponent = ref(null)

const props = defineProps({
    imageOut: {
        type: Object as PropType<(img: string[]) => void>
    },
    location_id: {
        type: Number,
        required: true
    },
    location_name: {
        type: String,
        required: true
    }
})
onMounted(() => {
    JsBarcode("#location-barcode", `${props.location_id}`, {
        height: 70,
        width: 3,
        displayValue: false,
        format: "CODE128"
    })
    domtoimage.toPng(labelComponent.value, { width: 500, height: 250 }).then((dataUrl: string) => {
        emit('label-out', dataUrl)
        if (typeof props.imageOut === 'function') props.imageOut([dataUrl])
    })
})
</script>
<style scoped>
#container {
    font-size: 44px;
    font-weight: 400;
    overflow: hidden;
}
</style>