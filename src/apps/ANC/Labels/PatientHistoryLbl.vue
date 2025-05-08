<template>
<div ref="labelComponent" class="container">
    <div class="column">
        <div class="header">Obstetric History</div>
        <div class="row">
            <span>Gravida:</span> <span class="value">{{ obstetric_history?.gravida ?? "??" }}</span>
        </div>
        <div class="row">
            <span>Deliveries:</span> <span class="value">{{ obstetric_history?.deliveries ?? "??" }}</span>
        </div>
        <div class="row">
            <span>Abortions:</span> <span class="value">{{ obstetric_history?.abortions ?? "??" }}</span>
        </div>
        <div class="row">
            <span>Still births:</span> <span class="value">{{ obstetric_history?.still_births ?? "??" }}</span>
        </div>
        <div class="row">
            <span>Vacuum Extraction:</span> <span class="value">{{ obstetric_history?.vacuum_extraction ?? "??" }}</span>
        </div>
        <div class="row">
            <span>C/Section:</span> <span class="value">{{ obstetric_history?.csection ?? "??" }}</span>
        </div>
        <div class="row">
            <span>Haemorrhage:</span> <span class="value">{{ obstetric_history?.haemorrhage ?? "??" }}</span>
        </div>
        <div class="row">
            <span>Pre-Eclampsia:</span> <span class="value">{{ obstetric_history?.preeclampsia ?? "??" }}</span>
        </div>
    </div>
    <div class="column">
        <div class="header">Medication History</div>
        <div class="row">
            <span>Asthma:</span> <span class="value">{{ medical_history?.asthma ?? "??" }}</span>
        </div>
        <div class="row">
            <span>Diabetes:</span> <span class="value">{{ medical_history?.diabetes ?? "??" }}</span>
        </div>
        <div class="row">
            <span>Epilepsy:</span> <span class="value">{{ medical_history?.epilepsy ?? "??" }}</span>
        </div>
        <div class="row">
            <span>Renal Disease:</span> <span class="value">{{ medical_history?.renal_disease ?? "??" }}</span>
        </div>
        <div class="row">
            <span>Fistula Repair:</span> <span class="value">{{ medical_history?.fistula_repair ?? "??" }}</span>
        </div>
        <div class="row">
            <span>BP:</span> <span class="value">{{ medical_history?.hypertension ?? "??" }}</span>
        </div>
        <div class="row">
            <span>Leg/Spine Deformation:</span> <span class="value">{{ medical_history?.leg_spine_deform ?? "??" }}</span>
        </div>
        <div class="row">
            <span>Age:</span> <span class="value">{{ medical_history?.age ?? "??" }}</span>
        </div>
    </div>
</div>

</template>
<script setup lang="ts">
import domtoimage from 'dom-to-image-more';
import { onMounted, PropType, ref } from "vue";

const labelComponent = ref(null)

const emit = defineEmits(['label-out'])

const props = defineProps({
    imageOut: {
        type: Object as PropType<(img: string[]) => void>
    },
    obstetric_history: Object,
    medical_history: Object
})
onMounted(() => {
    domtoimage.toPng(labelComponent.value, { width: 500, height: 350 }).then((dataUrl: string) => {
        emit('label-out', [dataUrl])
        if (typeof props.imageOut === 'function') props.imageOut([dataUrl])
    })
})
</script>
<style scoped>
.header {
    font-size: 26px;
    border-bottom: 2px solid black;
}

.container {
    font-family: monospace;
    font-size: 25px;
    display: flex; /* Use Flexbox for layout */
    flex-direction: row; /* Ensure items are side-by-side (default) */
    gap: 6px; /* Add space between the columns */
}

.column {
    flex: 1; /* Make columns take equal width */
    padding: 6px; /* Add padding inside each column */
}
</style>