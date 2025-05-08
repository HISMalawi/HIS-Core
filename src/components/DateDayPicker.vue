<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title class="ion-text-center">
                    Select a day
                </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-grid>
                <ion-row>
                    <ion-col class="calendar-day" v-for="day in days" :key="day">
                        <b>{{ day }}</b>
                    </ion-col>
                </ion-row>
                <ion-row class="calendar-row" v-for="week in weeks" :key="`${week}`">
                    <ion-col
                        v-for="day in week" 
                        class="calendar-date ion-padding"
                        :class="{ 'selected-date': `${currentDay}` === `${day}` }"
                        @click="day > 0 ? onSelectDay(day): null"
                        :key="day">
                        {{ day > 0 ? day : '' }}
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>
<script lang="ts" setup>
import {
    IonPage,
    IonContent,
    IonTitle,
    IonHeader,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol
} from "@ionic/vue"
import dayjs from "dayjs";
import { computed, ref, PropType } from 'vue';

const props = defineProps({
    date: String,
    onDay: Object as PropType<(day: number) => void>
})

const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat']

const currentDay = ref<any>(dayjs(props.date).format('D'))

const weeks = computed(() => {
    const currentDate = dayjs(props.date)
    const firstDayOfMonth = currentDate.startOf('month');
    const lastDayOfMonth = currentDate.endOf('month');
    const numDaysInMonth = lastDayOfMonth.date();
    const startDayOfWeek = firstDayOfMonth.day();
    const weeks = [];

    let currentWeek = [];
    let dayOfMonthCounter = 1;

    for (let i = 0; i < 6; i++) { // Assuming a maximum of 6 weeks in a month.
        for (let j = 0; j < 7; j++) { // Assuming 7 days in a week (Sunday to Saturday).

        if (i === 0 && j < startDayOfWeek) {
            currentWeek.push(0); // Pushing placeholder 0 for days before the start of the month.
        } else {
            if (dayOfMonthCounter <= numDaysInMonth) {
                currentWeek.push(dayOfMonthCounter); // Pushing the actual day of the month.
            } else {
                currentWeek.push(0); // Pushing placeholder 0 for days after the end of the month.
            }
            dayOfMonthCounter++;
        }
        }

        weeks.push(currentWeek);
        currentWeek = [];
    }
    return weeks;
});

function onSelectDay(day: number) {
    currentDay.value = day
    if (typeof props.onDay === 'function') {
        props.onDay(day)
    }
}
</script>
    
<style scoped>
ion-grid {
    height: 100%;
}

.calendar-date {
    height: 8.5vh;
    font-size: 2rem;
    border: 1px solid #f0efef;
}

.selected-date {
    color: white;
    background-color: #3880ff!important;
}
</style>
