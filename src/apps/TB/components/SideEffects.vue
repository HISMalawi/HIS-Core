<template>
    <ion-header>
        <ion-toolbar>
            <ion-title class="his-lg-text">Suspected causes</ion-title>
        </ion-toolbar>
    </ion-header>
    <ion-content :style="{ overflowY: 'hidden', background: 'grey' }">
        <ion-grid>
            <ion-row>
                <ion-col>
                    <ion-list :style="{ overflowY: 'auto', height: '78vh' }">
                        <ion-radio-group v-model="activeSelection">
                            <ion-item class="his-md-text" v-for="(data, label) in sideEffectData" :key="label">
                                <ion-radio slot="start" :value="label"></ion-radio>
                                <ion-label>{{ label }}</ion-label>
                            </ion-item>
                        </ion-radio-group>
                    </ion-list>
                </ion-col>
                <ion-col :style="{ overflowY: 'auto', height: '78vh' }">
                    <div v-if="activeSelection" class="side-title">
                      <b>{{ activeSelection }}</b> causes 
                    </div>
                    <ion-list v-if="activeSelection">
                        <ion-item class="his-lg-text">
                            <ion-label>Current Medication(s)</ion-label>
                        </ion-item>
                        <ion-item class="his-md-text" v-for="(data, name) in sideEffectData[activeSelection].drugReason" :key="name">
                            <ion-label>{{ name }}</ion-label>
                            <ion-checkbox @ion-change="onDrugReason" slot="start" v-model="data.isChecked"></ion-checkbox>
                        </ion-item>
                    </ion-list>
                    <ion-radio-group @ion-change="onOtherReason" v-if="activeSelection" v-model="sideEffectData[activeSelection].otherReason">
                        <ion-item class="his-lg-text">
                            <ion-label>Previous Medication</ion-label>
                        </ion-item>
                        <ion-item class="his-md-text">
                            <ion-label>Other, not drug related</ion-label>
                            <ion-radio slot="start" value="Other"></ion-radio>
                        </ion-item>
                        <ion-item class="his-md-text">
                            <ion-label>Drug side effect</ion-label>
                            <ion-radio slot="start" value="Drug side effect"></ion-radio>
                        </ion-item>
                    </ion-radio-group>
                </ion-col>
            </ion-row>
        </ion-grid>
    </ion-content>
    <ion-footer>
        <ion-toolbar>
            <ion-button @click="close" slot="start" size="large" color="danger"> Close </ion-button>
            <ion-button @click="submit" size="large" slot="end" :disabled="!allSelected"> Save </ion-button>
        </ion-toolbar>
    </ion-footer>
</template>
<script lang="ts" setup>
import {
    IonGrid,
    IonFooter,
    IonCol,
    IonLabel,
    IonCheckbox,
    IonRadio,
    IonContent,
    IonButton,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonRadioGroup,
    IonRow,
modalController
} from "@ionic/vue";
import { onMounted, defineProps, PropType, ref, computed } from "vue";
import { Option } from "@/components/Forms/FieldInterface";

const activeSelection = ref('')

const sideEffectData = ref<any>({})

const props = defineProps({
    prevSideEffectState: {
        type: Object as PropType<any>
    },
    sideEffects: {
        type: Object as PropType<Option[]>,
        required: true
    },
    drugs: {
        type: Array,
        default: () => []
    }
})

const allSelected = computed(() => Object.keys(sideEffectData.value).every((effect) => {
    const data = sideEffectData.value[effect]
    const hasDrugSelection = Object.keys(data.drugReason).some((d) => data.drugReason[d].isChecked)
    return hasDrugSelection || `${data.otherReason}`.length > 0
}))

function close() { modalController.dismiss() }

function submit() {
    const data: any[] = []
    Object.keys(sideEffectData.value).forEach((k: string) => {
        Object.keys(sideEffectData.value[k].drugReason).forEach((d: any) => {
            if (sideEffectData.value[k].drugReason[d].isChecked) data.push({
                concept: sideEffectData.value[k].concept,
                drug: sideEffectData.value[k].drugReason[d].detail
            })
        })
        if (sideEffectData.value[k].otherReason) data.push({ 
            concept: sideEffectData.value[k].concept,
            other: sideEffectData.value[k].otherReason 
        })
    })
    modalController.dismiss({ values: data, state: sideEffectData.value })
}

function onDrugReason(e: any) {
    if (e.detail.checked) sideEffectData.value[activeSelection.value].otherReason = ''
}

function onOtherReason() {
    Object.keys(sideEffectData.value[activeSelection.value].drugReason).forEach((d) => {
        sideEffectData.value[activeSelection.value].drugReason[d].isChecked = false
    })
}

onMounted(() => {
    if (props.prevSideEffectState) {
        sideEffectData.value = props.prevSideEffectState
    } else {
        props.sideEffects.forEach((effect) => {
            if (!activeSelection.value) activeSelection.value = effect.label
            sideEffectData.value[effect.label] = {
                concept: effect.other.concept,
                drugReason: props.drugs.reduce((a: any, c: any) => {
                    a[c.drug.name] = {
                        isChecked: false,
                        detail: c
                    }
                    return a
                }, {}),
                otherReason: ''
            }
        })
    }
})
</script>
<style scoped>
ion-col {
    border-right: solid 1px #ccc;
}

.side-title {
    width: 100%;
    padding: 0.5em;
    text-align: center;
    background: rgb(233, 232, 232);
    font-size: 1.2em;
}
p {
    font-weight: bold;
}
</style>