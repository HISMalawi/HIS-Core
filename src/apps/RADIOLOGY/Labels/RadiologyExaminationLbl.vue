<template>
        <div ref="labelComponent" id="container">
            <div style="margin: 0px auto;">
                <div>{{ fullName ?? "Unkn person" }}</div>
                <div>
                    <span>{{ npid ?? "??" }} {{ gender ?? "??" }} {{ birthDate ?? "??" }}</span>
                </div>
                <div>{{ examination ?? "??" }}</div>
                <div>
                    <span>{{ date ?? "??" }}, {{ accessionNumber ?? "??" }} ({{ department ?? "??" }})</span>
                </div>
            </div>
            <div>
                <svg id="radiology-barcode"></svg>
            </div>
        </div>
</template>
<script setup lang="ts">
import JsBarcode from "jsbarcode";
import domtoimage from 'dom-to-image-more';
import { onMounted, PropType, ref } from "vue";

const emit = defineEmits(['label-out'])
const labelComponent = ref(null)

const props = defineProps({
    imageOut: {
        type: Object as PropType<(img: string[]) => void>
    },
    fullName: String,
    npid: String,
    gender: String,
    birthDate: String,
    examination: String,
    date: String,
    accessionNumber: String,
    department: String
})

onMounted(() => {
    if (props.accessionNumber) {
        JsBarcode("#radiology-barcode", props.accessionNumber, {
            height: 60,
            width: 2,
            displayValue: false,
            format: "CODE128"
        })
        domtoimage.toPng(labelComponent.value).then((dataUrl: string) => {
            emit('label-out', dataUrl)
            if (typeof props.imageOut === 'function') props.imageOut([dataUrl])
        })
    } 
})
</script>
<style scoped>
#container {
    max-width: 578px;
    font-size: 18px;
    font-weight: bold;
}
</style>