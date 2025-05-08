<template>
        <div ref="labelComponent" id="container">
            <div>
               <span style="font-weight: bold;">Examination</span>
            </div>
            <div>
                <table style="width:90%">
                    <tr>
                        <td>Height</td>
                        <td class="bordered">{{ height }}</td>
                    </tr>
                    <tr>
                        <td>Weight</td>
                        <td class="bordered">{{ weight }}</td>
                    </tr>
                </table>
            </div>
            <p></p>
            <div>
                <table style="width:90%; text-align: left;">
                    <tr>
                        <th>Lab tests</th>
                        <th>Date</th>
                        <th>Result</th>
                    </tr>
                    <tr>
                        <td>HIV</td>
                        <td class="bordered">{{ hiv_date }}</td>
                        <td class="bordered">{{ hiv_result }}</td>
                    </tr>
                    <tr>
                        <td>Syphilis</td>
                        <td class="bordered">{{ syphilis_date }}</td>
                        <td class="bordered">{{ syphilis_result }}</td>
                    </tr>
                    <tr>
                        <td>Hb</td>
                        <td class="bordered">{{ hb_date }}</td>
                        <td class="bordered">{{ hb_result }}</td>
                    </tr>
                    <tr>
                        <td>Malaria</td>
                        <td class="bordered">{{ malaria_date }}</td>
                        <td class="bordered">{{ malaria_result }}</td>
                    </tr>
                    <tr>
                        <td>Blood Group</td>
                        <td class="bordered">{{ blood_group_date }}</td>
                        <td class="bordered">{{ blood_group_result }}</td>
                    </tr>
                </table>
            </div>
        </div>
</template>
<script setup lang="ts">
import { defineProps, PropType, ref, onMounted } from 'vue';
import domtoimage from 'dom-to-image-more';

const labelComponent = ref(null)
const emit = defineEmits(['label-out'])

const props = defineProps({
    imageOut: {
        type: Object as PropType<(img: string[]) => void>
    },
    height: String,
    weight: String,
    hiv_date: String,
    hiv_result: String,
    syphilis_date: String,
    syphilis_result: String,
    hb_date: String,
    hb_result: String,
    malaria_date: String,
    malaria_result: String,
    blood_group_date: String,
    blood_group_result: String
})
onMounted(() => {
    domtoimage.toPng(labelComponent.value).then((dataUrl: string) => {
        emit('label-out', dataUrl)
        if (typeof props.imageOut === 'function') props.imageOut([dataUrl])
    })
})
</script>
<style scoped>
#container {
    width: 3575.2px;
    font-weight: bold;
    font-size: 162px;
    overflow: hidden;
}
.bordered {
    border: 8px solid black;
    padding: 0.6%;
}
</style>