<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Lab order print options</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <div style="margin: 10px auto; width: 95%;" class="ion-text-center  his-card ion-padding">
                <ion-toggle style="font" size="large" class="his-lg-text" v-model="useSmallSpecimen" :checked="false">
                    Print small label
                </ion-toggle>
            </div>
            <div class="ion-text-center ion-padding">
                <h1>Print copies</h1>
                <picker-selector
                    :value="printCopies"
                    @on-increment="addCopies"
                    @on-decrement="decreaseCopies"
                ></picker-selector>
            </div>
        </ion-content>
        <ion-footer>
            <ion-toolbar>
                <ion-button slot="start" @click="close(false, false, 0)" color="danger" size="large" style="width:100%;">
                    Cancel
                </ion-button>
                <ion-button slot="end" @click="print" color="success" size="large" style="width:100%">
                    Print
                </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>
<script lang="ts" setup>
import { PropType, ref } from "vue"
import { 
    IonButton,
    IonToggle,
    IonPage,
    IonHeader,
    IonTitle,
    IonFooter,
    IonToolbar,
    IonContent
} from "@ionic/vue"
import PickerSelector from "@/components/Selectors/PickerSelector.vue"
import { modalController } from "@ionic/core"


function addCopies() {
    const copies = parseInt(printCopies.value) + 1
    if (copies <= 3) printCopies.value = `${copies}`
}

function decreaseCopies() {
    const copies = parseInt(printCopies.value) - 1
    if (copies > 0) printCopies.value = `${copies}`
}

const props = defineProps({
    onClose: Object as PropType<(canPrint: boolean, useSmallSpecimen: boolean, copies: number) => void>
})

const LABEL_SIZE_SETTING = 'lab_use_small_print_label'

const LAB_COPIES = 'lab_print_copies'

const useSmallSpecimen = ref(localStorage.getItem(LABEL_SIZE_SETTING)==='true')

const printCopies = ref(localStorage.getItem(LAB_COPIES)||'1')

function close(canPrint: boolean, useSmall: boolean, copies: number){
    modalController.dismiss();
    if (typeof props.onClose === 'function') {
        props.onClose(canPrint, useSmall, copies)
    }
}

function print(){
    localStorage.setItem(LABEL_SIZE_SETTING, `${useSmallSpecimen.value}`)
    localStorage.setItem(LAB_COPIES, printCopies.value)
    close(true, useSmallSpecimen.value, parseInt(printCopies.value))
}
</script>