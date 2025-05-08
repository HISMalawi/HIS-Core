<template>
    <div ref="lblComponent" id="container">
        <div style="display: flex; justify-content: space-between; width: 100%;">
            <span><b>{{ date }}</b></span>
            <span>({{ visit_by ?? "??" }})</span>
            <span style="font-weight:bold; padding: 1.7px;">{{ arv_number }}</span>
        </div>
        <div style="width: 100%">
            <span><b>{{ patient_details }}</b></span>
            <span><b>&nbsp;:Patient visit</b></span>
        </div>
        <div style="display: flex; justify-content: space-between; width: 100%;">
            <span>{{ weight }}kg</span>
            <span>{{ height }}cm</span>
            <span><b>BMI:</b>{{ bmi }}</span>
            <span><b>VL:</b>{{ viral_load }}</span>

        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 3px solid black; width: 100%;">
            <span><b>OUTC:</b>{{ outcome }}&nbsp;</span>
            <span>{{ toDate(outcome_date??"") }} </span>
        </div>
        <table style="width: 100%;text-align:center;">
            <tr>
                <th>SE</th>
                <th>TB</th>
                <th>Adh</th>
                <th>DRUG(S) Given</th>
            </tr>
            <tr>
                <td></td>
                <td>{{ tb_status }}</td>
                <td>{{ adherence }}</td>
                <td>
                    <ul>
                        <li v-for="(drug, index) in drugs" :key="index">
                            {{  drug }}
                        </li>
                    </ul>
                </td>
            </tr>
        </table>
        <p></p>
        <div style="text-align: right;">
            <div>
                <div>Next: {{ next_appointment_date }}</div>
                <div>{{ seen_by }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { toDate } from "@/utils/Strs";
import { onMounted, PropType, ref } from "vue";
import domtoimage from 'dom-to-image-more';

const emit = defineEmits(['label-out'])

const lblComponent = ref(null)

const props = defineProps({
    imageOut: {
        type: Object as PropType<(img: string[]) => void>
    },
    visit_by: {
        type: String
    },
    date: {
        type: String
    },
    arv_number: {
        type: String
    },
    patient_details: {
        type: String
    },
    height: {
        type: String
    },
    weight: {
        type: String
    },
    bmi: {
        type: String
    },
    viral_load: {
        type: String
    },
    outcome_date: {
        type: String
    },
    outcome: {
        type: String
    },
    next_appointment_date: {
        type: String
    },
    seen_by: {
        type: String
    },
    se: {
        type: String
    },
    tb_status: {
        type: String
    },
    adherence: {
        type: String
    },
    drugs: {
        type: Object
    }
})

onMounted(() => {
    domtoimage.toPng(lblComponent.value, { height: 350, width: 560 }).then((dataUrl: string) => {
        emit('label-out', dataUrl)
        if (typeof props.imageOut === 'function') props.imageOut([dataUrl])
    })
})
</script>
<style scoped>
#container {
    font-family: monospace;
    font-size: 24px;
    overflow: hidden;
    padding: 15px;
}
ul, ol {
    list-style-type: none;  /* Removes bullet points or numbers */
    padding-left: 0;        /* Removes padding */
    margin: 0;              /* Removes margin */
}
</style>