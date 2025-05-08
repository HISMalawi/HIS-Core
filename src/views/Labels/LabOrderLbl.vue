<template>
    <div ref="labelComponent" id="container">
    <div class="content-wrapper">
        <!-- Rotated Reason for Test -->
        <div class="rotated-text">
            <span>{{ reason_for_test }}</span>
        </div>
        
        <!-- Main Content -->
        <div class="main-content">
            <div>
                <span>{{ `${given_name} ${family_name}` }}&nbsp;</span>
                <span>{{ nhid }}</span>
            </div>
            <div>{{ birthdate }}</div>
            <svg id="accession-barcode"></svg>
            <div>
                <span>{{ accession_number }} # {{ accession_number }}</span>
            </div>
            <div> col: {{  }}</div>
            <div> {{ tests }} </div>
        </div>
    </div>
    </div>
</template>

<script lang="ts" setup>
import JsBarcode from "jsbarcode";
import { onMounted, PropType, ref } from "vue";
import domtoimage from 'dom-to-image-more';

const emit = defineEmits(['label-out'])
const labelComponent = ref(null)

const props = defineProps({
    imageOut: {
        type: Object as PropType<(img: string[]) => void>
    },
    accession_number: String,
    given_name: String,
    family_name: String,
    nhid: String,
    birthdate: String,
    gender: String,
    drawer: String,
    tests: String,
    reason_for_test: String
})
onMounted(() => {
    JsBarcode("#accession-barcode", `${props.accession_number}`, {
        height: 40,
        width: 2,
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
    width: 100%;
    font-size: 30px;
}

.content-wrapper {
    display: flex; /* Layout for side-by-side alignment */
    align-items: flex-start; /* Align by top edges */
}

.rotated-text {
    padding: 12px;
    writing-mode: vertical-rl; /* Make text vertical */
    transform: rotate(180deg); /* Flip to correct orientation */
    white-space: nowrap; /* Prevent wrapping */
    text-align: left; /* Align text properly */
}

.main-content {
    flex: 1; /* Main content takes up remaining space */
}

</style>