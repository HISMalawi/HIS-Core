<template>
    <div ref="labelComponent" id="container">
        <div>{{ name }}</div>
        <div>Quantity: {{ quantity }}</div>
        <div>
            <svg id="drug-barcode"></svg>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { defineProps, onMounted, ref, PropType } from "vue"
import JsBarcode from "jsbarcode";
import domtoimage from 'dom-to-image-more';

const emit = defineEmits(['label-out'])

const labelComponent = ref(null)

const props = defineProps({
    imageOut: {
        type: Object as PropType<(img: string[]) => void>
    },
    name: String,
    quantity: Number,
    barcode: String
})

onMounted(() => {
    JsBarcode("#drug-barcode", props.barcode??"0", {
        height: 90,
        width: 3,
        displayValue: true,
        format: "CODE128"
    })
    domtoimage.toPng(labelComponent.value).then((dataUrl: string) => {
        emit('label-out', dataUrl)
        if (typeof props.imageOut === 'function') props.imageOut([dataUrl])
    })
})
</script>
<style scoped>
#container {
    max-width: 575.5px;
    max-height: 316px;
    font-size: 30px;
    font-weight: bold;
    overflow: hidden;
}
</style>