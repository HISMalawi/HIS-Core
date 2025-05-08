<template>
        <div id="container">
            <div style="padding: 15px;" ref="demographicsComponent">
                <div style="font-weight: 600" class="row">
                    <div>PATIENT DETAILS</div>
                    <div>{{ arv_number }}</div>
                </div>
                <div>
                    <div>Name: {{ patient_details?.name }}</div>
                    <div>DOB: {{ patient_details?.dob  }}</div>
                    <div>Phone: {{ patient_details?.phone }}</div>
                    <div>Addr: {{ patient_details?.address }}</div>
                    <div>Guard: {{ patient_details?.guardian }}</div>
                    <div style="margin-top: 2%">
                        <div>TI: {{ patient_details?.transfer_in }}</div>
                        <div>FUP: {{ patient_details?.agrees_to_followup }}</div>
                    </div>
                </div>
            </div>
            <div style="padding: 15px;" ref="artComponent">
                <div class="row">
                    <div>STATUS AT ART INITIATION</div>
                    <div>(DSA: {{ art_initiation_status?.art_start_date }})</div>
                    <div><b>{{ arv_number }}</b></div>
                </div>
                <div class="row">
                    <div>RFS:{{ art_initiation_status?.reason_for_art_eligibility }}</div>
                    <div>TB: {{ art_initiation_status?.tb_status }}</div>
                    <div>HEIGHT: {{ art_initiation_status?.initial_height }}</div>
                </div>
                <div class="row">
                    <div>KS: {{ art_initiation_status?.ks_status }}</div>
                    <div>WEIGHT: {{ art_initiation_status?.initial_weight }}</div>
                </div>
                <div class="row">
                    <div>1st + Test:{{ art_initiation_status?.hiv_test_date }}</div>
                    <div>Preg: {{ art_initiation_status?.pregnant }}</div>
                    <div>Init Age: {{ art_initiation_status?.age_at_initiation }}</div>
                </div>
                <div style="border-top: 3px solid black; width:100%"></div>
                <div style="font-weight:bold; display: flex; justify-content: right">
                    STAGE DEFINING CONDITIONS
                </div>
                <div style="margin-top: 14px;">
                    {{[
                        ...art_initiation_status?.first_line_drugs??[], 
                        ...art_initiation_status?.alt_first_line_drugs ?? [], 
                        ...art_initiation_status?.second_line_drugs ?? []
                    ].join(",")}}
                </div>
            </div>
        </div>
</template>

<script lang="ts" setup>
import { onMounted, PropType, ref } from "vue";
import domtoimage from 'dom-to-image-more';

const demographicsComponent = ref(null)
const artComponent = ref(null)

const emit = defineEmits(['label-out'])

const props = defineProps({
    imageOut: {
        type: Object as PropType<(img: string[]) => void>
    },
    arv_number: {
        type: String
    },
    patient_details: {
        type: Object
    },
    art_initiation_status: {
        type: Object
    }
})

onMounted(async () => {
    const config = {
        width: 500, 
        height: 250
    }
    const demographicsImg = await domtoimage.toPng(demographicsComponent.value, config)
    const artImg = await domtoimage.toPng(artComponent.value, config)
    if (typeof props.imageOut === 'function') props.imageOut([demographicsImg, artImg])
    emit('label-out', [demographicsImg, artImg])
})
</script>
<style scoped>
#container {
    font-size: 24px;
    font-family: monospace;
    overflow: hidden;
}
.row {
    display:flex; 
    justify-content: space-between;
}
</style>