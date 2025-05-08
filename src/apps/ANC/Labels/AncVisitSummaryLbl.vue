<template>
    <div style="width: 100%">
        <PatientHistoryLbl 
            :medical_history="medical_history"
            :obstetric_history="obstetric_history" 
            @label-out="onGenerate"
        />
        <div style="padding: 15px;font-size:24px;" ref="detailedObstericComponent">
            <div class="header-title">Detailed Obsteric History</div>
            <div class="header">
                <span>Pr. No: {{ pos }}</span> <span>Year: {{ year }} </span> <span>Gest. months: {{ gest }}</span>
            </div>
            <div>
                <span>Place: </span> <span>{{ place }}</span>
            </div>

            <div>
                <span>Delivery Method: </span> <span>{{ delmode }}</span>
            </div>

            <div>
                <span>Condition at birth: </span> <span>{{ cond }}</span>
            </div>

            <div>
                <span>Birth weight(kg): </span> <span>{{ birt_weig }}</span>
            </div>

            <div>
                <span>Alive now?: </span> <span>{{ dea }}</span>
            </div>

            <div>
                <span>Age at death: </span> <span>{{ age_at_death }}</span>
            </div>
        </div>

        <div ref="pregnancyDetailsComponent" style="font-size:20px;">
            <div class="header">
                <span><strong>ANC No: </strong>{{ visit_no }}</span>
                <span class="date">{{ visit_date }}</span>
            </div>
            <div>
                <div class="row">
                    <div><strong>LMP: </strong>{{ lmp ?? '-' }}</div>
                    <div><strong>EDD: </strong>-</div>
                    <div><strong>Gest Age: </strong>{{ gestation_weeks }}</div>
                </div>
                <div class="row">
                    <div>F-Height: {{ fundal_height }}</div>
                    <div>F-Heart: {{ fetal_movement }}</div>
                    <div>Pos/Pres: {{ position_presentation }}</div>
                </div>
                <div class="row">
                    <div>@: {{ del_place ?? '-' }}</div>
                    <div>Net: {{ net_given ?? '-' }}</div>
                </div>
                <div class="row">
                    <div>Diagnosis:{{ (diagnosis??[]).join(', ') }}</div>
                </div>
                <div class="row">
                    <div>Wt: {{ weight }}</div>
                    <div>Ht:  {{ height ?? '-' }}</div>
                    <div>BMI: {{ bmi ?? '-' }}</div>
                    <div>BP: {{ blood_pressure }}</div>
                </div>
                <div class="row separator"></div>
                <div>{{ (medication??[]).join('/') }}</div>
                <div class="row">
                    <div>Next: {{ next_visit }}</div>
                    <div>By: {{ user }}</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { defineProps, ref, PropType } from "vue"
import domtoimage from 'dom-to-image-more';
import PatientHistoryLbl from "./PatientHistoryLbl.vue";

const detailedObstericComponent = ref(null)

const pregnancyDetailsComponent = ref(null)

const emit = defineEmits(['label-out'])

const props = defineProps({
    imageOut: {
        type: Object as PropType<(img: string[]) => void>
    },
    age_at_death: String,
    lmp: String,
    visit_no: Number,
    visit_date: String,
    gestation_weeks: String,
    position_presentation: String,
    fetal_movement: String,
    weight: String,
    obstetric_history: Object,
    medical_history: Object,
    fundal_height: String,
    diagnosis: Array,
    height: String,
    bmi: String,
    blood_pressure: String,
    medication: Array,
    next_visit: String,
    user: String,
    del_place: String,
    net_given: String,
    pos: String,
    year: String,
    place: String,
    gest: String,
    delmode: String,
    cond: String,
    birt_weig: String,
    dea: String

})

async function onGenerate(ObstericHistoryImg: string[]) {
    const config = {
        width: 500,
        height: 350
    }
    const detailedObstericImg = await domtoimage.toPng(detailedObstericComponent.value, {...config, height: 250 })
    const pregnancyImg = await domtoimage.toPng(pregnancyDetailsComponent.value, {...config, height: 250})
    const images = [...ObstericHistoryImg, detailedObstericImg, pregnancyImg]
    
    if (typeof props.imageOut === 'function') {
        props.imageOut(images)
    }
    emit('label-out', images)
}
</script>
<style scoped>
#container {
    overflow: hidden;
    font-family: monospace;
}

.header-title {
    margin: 5px;
    border-bottom: 2px solid black;
}

.header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
}

.header .date {
    text-align: right;
}

.row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
}

.row div {
    flex: 1;
    margin-right: 5px;
}

.row div:last-child {
    margin-right: 0;
}

.separator {
    margin: 5px 0;
    border-top: 2px solid black;
    padding-top: 5px;
    text-align: left;
}
</style>