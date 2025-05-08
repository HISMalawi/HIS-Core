<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-button @click="yearDown" color="dark" slot="start" size="large" fill="clear">
                    <ion-icon :icon="arrowBack"/>
                </ion-button>
                <ion-title class="ion-text-center">
                    Select a year
                    <br/>
                    <small>{{ minYear + 1 }} to {{ maxYear }}</small>
                </ion-title>
                <ion-button @click="yearUp" color="dark" slot="end" size="large" fill="clear">
                    <ion-icon :icon="arrowForward"/>
                </ion-button>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-grid>
                <ion-row v-for="(yearRow, index) in years" :key="index">
                    <ion-col 
                        size-sm="12"
                        size-md="4"
                        style="height: 12.4vh;"
                        v-for="(year, yearIndex) in yearRow" 
                        :key="yearIndex"
                        class="ion-padding ion-text-center">
                        <ion-button
                            size="large"
                            mode="ios"
                            :color="year === selectedYear ? 'primary' : 'dark'"
                            :fill="year === selectedYear ? 'solid' : 'clear'"
                            style="font-size:1.6rem;"                      
                            @click="onSelectYear(year)">
                            {{ year }}
                        </ion-button>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>
<script setup lang="ts">
import {
    IonIcon,
    IonButton,
    IonPage,
    IonContent,
    IonTitle,
    IonHeader,
    IonToolbar,
    IonGrid, 
    IonCol, 
    IonRow 
} from "@ionic/vue"
import { 
    arrowBack,
    arrowForward
} from "ionicons/icons"
import { computed, PropType, ref, watch } from "vue";
import dayjs from "dayjs";
import { chunk } from "lodash";

const props = defineProps({
    date: String,
    onYear: Object as PropType<(year: number) => void>
})

const ROWS_PER_VIEW = 4
const COLS_PER_ROW = 3
const TOTAL_ITEMS = ROWS_PER_VIEW * COLS_PER_ROW
const cursor = ref(0)
const maxYear = ref(0)
const selectedYear = ref(0)
const minYear = computed(() => maxYear.value - TOTAL_ITEMS)

const years = computed(() => {
    const all: number[] = []
    for(let y=maxYear.value; y > minYear.value; --y) {
        all.push(y)
    }
    const yearRows =  chunk(all.sort(), COLS_PER_ROW)
    return chunk(yearRows, ROWS_PER_VIEW)[cursor.value]
})

function yearDown() {
    maxYear.value = minYear.value
}

function yearUp() {
    maxYear.value = maxYear.value + TOTAL_ITEMS
}


function onSelectYear(year: number) {
    selectedYear.value = year
    if (typeof props.onYear === 'function') {
        props.onYear(year)
    }
}

watch(() => props.date, (date) => {
    selectedYear.value = dayjs(date).get('year')
    maxYear.value = selectedYear.value
}, { immediate: true })
</script>