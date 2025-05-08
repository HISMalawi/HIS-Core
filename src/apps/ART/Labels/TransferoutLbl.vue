<template>
    <div id="container">
        <div ref="firstPageComponent" class="label">
            <div>
                <div class="title ion-text-center">Transfer out</div>
                <div class="content" style="display: flex; gap: 10px;">
                    <div><b>Name: </b> {{ name ?? "??" }} </div>
                    <div><b>Age: </b> {{ age ?? "??" }}</div>
                </div>
                <div class="content">
                    <div><b>ARV#: </b>{{ arv_number }}</div>
                    <div><b>From: </b>{{ health_center ?? "???" }}</div>
                    <div><b>To: </b>{{ destination ?? "???" }}</div>
                </div>
            </div>
            <div>
                <div class="title">Staging conditions:</div>
                <div class="content">
                    <div>Starting reason: {{ reason_for_starting ?? "??" }}</div>
                    <div>ART start: {{ art_start_date ?? "??" }}</div>
                </div>
            </div>
        </div>
        <div ref="secondPageComponent">
            <div>
                <div>
                    <div class="title">Other diagnosis:</div>
                    <div class="content">{{ other_diagnosis || '-' }}</div>
                </div>
            </div>
            <div>
                <div class="title">Initial Height/Weight</div>
                <div class="content" style="display: flex; gap: 10px;">
                    <div>Height: {{ initial_height }}</div>
                    <div>Weight: {{ initial_weight }}</div>
                    <div>CD4 Count: {{ first_cd4_count || "-" }}</div>
                </div>
            </div>
            <div>
            <div class="title">Current Drugs:</div>
                <div class="content">
                    <div>{{ current_art_drugs || '-' }}</div>
                </div>
            </div>
            <div>
                <div class="title">Transfer date: </div>
                <div class="content">
                    <div>{{ transfer_out_date ?? "-" }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import domtoimage from 'dom-to-image-more';
import { onMounted, PropType, ref } from "vue";

const firstPageComponent = ref(null)
const secondPageComponent = ref(null)

const props = defineProps({
    imageOut: {
        type: Object as PropType<(img: string[]) => void>
    },
    name: String,
    health_center: String,
    destination: String,
    gender: String,
    arv_number: String,
    age: Number,
    staging_conditions: String,
    reason_for_starting: String,
    art_start_date: String,
    other_diagnosis: String,
    initial_height: String,
    initial_weight: String,
    first_cd4_count: String,
    first_cd4_count_date: String,
    current_art_drugs: String,
    transfer_out_date: String
})
onMounted(async () => {
    const config = {
        width: 500,
        height: 340
    }
    firstPageComponent.value = await domtoimage.toPng(firstPageComponent.value, config)
    secondPageComponent.value = await domtoimage.toPng(secondPageComponent.value, config)
    if (typeof props.imageOut === 'function') props.imageOut([
        firstPageComponent.value ?? '', secondPageComponent.value ?? ''
    ])
})
</script>
<style scoped>
#container {
    padding: 10px;
    font-size: 24px;
    overflow: hidden;
    font-family: monospace;
}
.title {
    border-bottom: 1px solid black;
    font-weight: bold;
    margin-top: 8px;
}
</style>