<template>
        <div ref="labelComponent" id="container">
            <div style="display:flex; justify-content: space-between; width:100%">
                <span><b>{{ visitDate }}</b></span>
                <span style="background: black; font-weight:bold; color: white; padding: 1.7px;">{{ tb_number }}</span>
            </div>
            <p></p>
            <div style="width: 100">
                <span><b>{{ name }}</b></span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 3px solid black; width: 100%;">
                <span><b>OUTC:</b></span>
                <span>{{ toDate(outcome_date??'') }} </span>
            </div>
            <table style="width:100%;text-align:center;">
                <tr>
                    <th>SE</th>
                    <th>TB</th>
                    <th>Adh</th>
                    <th>DRUG(S) Given</th>
                </tr>
                <tr>
                    <td></td>
                    <td>{{ tb_status }}</td>
                    <td>{{ adherence_data }}</td>
                    <td>
                        <ul>
                            <li v-for="(key, index) in drugs" :key="index">
                                {{  `${index} (${key})` }}
                            </li>
                        </ul>
                    </td>
                </tr>
            </table>
            <p></p>
            <div style="text-align: right;">
                <div>
                    <div>Next: {{ toDate(next_appointment??'') }}</div>
                    <div>{{ seen_by }}</div>
                </div>
            </div>
        </div>
</template>
<script lang="ts" setup>
import { onMounted, PropType, ref, computed } from "vue";
import { toDate } from "@/utils/Strs";
import dayjs from "dayjs";
import domtoimage from 'dom-to-image-more';

const labelComponent = ref(null)
const emit = defineEmits(['label-out'])

const props = defineProps({
    imageOut: {
        type: Object as PropType<(img: string[]) => void>
    },
    seen_by: {
        type: String
    },
    date: {
        type: String
    },
    tb_number: {
        type: String
    },
    drugs: {
        type: Array
    },
    name: {
        type: String
    },
    height: {
        type: String
    },
    tb_status: {
        type: String
    },
    adherence_data: {
        type: String
    },
    outcome: {
        type: String
    },
    outcome_date: {
        type: String
    },
    next_appointment: {
        type: String
    }
})
const visitDate = computed(() => dayjs(props.date).format('MMMM D YYYY'))

onMounted(() => {
    domtoimage.toPng(labelComponent.value).then((dataUrl: string) => {
        emit('label-out', dataUrl)
        if (typeof props.imageOut === 'function') props.imageOut([dataUrl])
    })
})
</script>
<style scoped>
#container {
    width: 578px;
    font-size: 18px;
    font-family: monospace;
    overflow: hidden;
}
ul, ol {
    list-style-type: none;  /* Removes bullet points or numbers */
    padding-left: 0;        /* Removes padding */
    margin: 0;              /* Removes margin */
}
</style>