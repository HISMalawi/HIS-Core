<template>
        <div ref="labelComponent" id="container">
            <div class="label">
                <div class="bold" style="border-bottom: 3px solid black;">
                    Visit: {{ visit?.start_time ?? "??" }} - {{ visit?.end_time ?? "??" }}
                </div>
                <div>
                    <div>
                        <span>Lab orders: </span>
                        <span v-for="(lab, index) in lab_orders??[]" :key="index">
                            {{ lab }}
                        </span>
                    </div>
                    <!--Diagnoses-->
                    <div v-if="(diagnoses??[]).length">
                        <div v-for="(diagnosis, index) in diagnoses" :key="index">
                            <div class="bold">Diagnoses at {{ diagnosis.time ?? "??" }}</div>
                            <span>{{ diagnosis.observations.join(", ") }}</span>
                        </div>
                    </div>
                    <div v-else>
                        <div class="bold">Diagnoses</div>
                        <span>No diagnoses done</span>
                    </div>
                    <!--End Diagnoses-->

                    <!--Prescriptions-->
                    <div v-if="(treatments??[]).length">
                        <div v-for="(treatment, index) in treatments" :key="index">
                            <div class="bold">Prescriptions at {{ treatment.time }}</div>
                            <span>{{ treatment.prescriptions }}</span>
                        </div>
                    </div>
                    <div v-else>
                        <div class="bold">Prescriptions</div>
                        <span>No prescriptions have been made</span>
                    </div>
                    <!--End Prescriptions-->
                </div>
            </div>
            <div>
                <div>
                    <div class="bold">NOTES AND VITALS</div>
                    <span>{{ notes_and_vitals }}</span>
                </div>
                <p></p>
                <div style="border-top: 10px dotted black;">
                    <span>Seen by: {{ `${seen_by?.initial}${seen_by?.last_name}` }} at {{ seen_by?.location ?? "??" }}</span>
                </div>
            </div>
        </div>
</template>
<script setup lang="ts">
import { defineProps } from "vue"
import { onMounted, PropType, ref } from "vue";
import domtoimage from 'dom-to-image-more';

const labelComponent = ref(null)
const emit = defineEmits(['label-out'])

const props = defineProps({
    imageOut: {
        type: Object as PropType<(img: string[]) => void>
    },
    lab_orders: Object,
    visit: Object,
    treatments: Object,
    procedures: Object,
    hiv_status: Object,
    diagnoses: Object,
    transferout: String,
    notes: Object,
    admissions: Object,
    outcomes: Object,
    vitals: Object,
    referral: String,
    seen_by: Object,
    notes_and_vitals: String
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
    max-width: 578px;
    font-size: 16px;
}
.bold {
    font-weight: bold;
}
.label {
    height: 316px;
    overflow: hidden;
}
</style>