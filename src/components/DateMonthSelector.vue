<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title class="ion-text-center">
                    Select a month
                </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-grid>
                <ion-row v-for="(monthRow, index) in months" :key="index">
                    <ion-col 
                        size-sm="12"
                        size-md="4"
                        style="height: 12.3vh;"
                        v-for="(month, monthIndex) in monthRow" 
                        :key="monthIndex"
                        class="ion-padding ion-text-center">
                        <ion-button
                            :key="monthIndex"
                            style="font-size:1.6rem;"
                            mode="ios"
                            :color="selection.toUpperCase() === month.toUpperCase() ? 'primary' : 'dark'"
                            :fill="selection.toUpperCase() === month.toUpperCase() ? 'solid' : 'clear'"
                            @click="selectMonth(month)"
                                size="large">
                                {{ month }}
                        </ion-button>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>
<script setup lang="ts">
import { 
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
import dayjs from "dayjs";
import { PropType, ref } from "vue";

const props = defineProps({
    date: String,
    onMonth: Object as PropType<(month: number) => void>
})

const selection = ref(dayjs(props.date).format('MMM'))

const months = [
    ["Jan", "Feb", "Mar"], 
    ["Apr", "May", "Jun"], 
    ["Jul", "Aug", "Sep"], 
    ["Oct", "Nov", "Dec"]
]

const shortMonthToNumeric: Record<string, number> = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12
};

function selectMonth(month: string) {
    selection.value = month
    const monthNumber = shortMonthToNumeric[month]
    if (typeof props.onMonth === 'function') {
        props.onMonth(monthNumber)
    }
}
</script>