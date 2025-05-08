<template>
    <ion-grid class="his-card"> 
        <ion-row> 
            <ion-col size="12">
                <ion-button
                    @click="onIncrement"
                    color="light" 
                    class='w-button'
                    > 
                    +
                </ion-button>
            </ion-col>
        </ion-row>
        <ion-row>
            <ion-col 
                class="ion-text-center ion-margin-vertical large-text"
                @click="onValue"
                > 
                {{ value }}
            </ion-col>
        </ion-row>
        <ion-row> 
            <ion-col size="12">
                <ion-button 
                    @click="onDecrement"
                    color="light" 
                    class='w-button'
                    > 
                    -
                </ion-button>
            </ion-col>
        </ion-row>
    </ion-grid>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import {
    IonGrid,
    IonRow,
    IonCol,
    IonButton
} from "@ionic/vue"
export default defineComponent({
    components: { 
        IonGrid, 
        IonRow, 
        IonCol,
        IonButton
    },
    props: {
        value: {
            type: String,
            required: true
        }
    },
    emits: [
        'onIncrement',
        'onDecrement',
        'onValue'
    ],
    setup(p, context) {
        const onIncrement = () => context.emit('onIncrement')
        const onDecrement = () => context.emit('onDecrement')
        const onValue  = () => context.emit('onValue')
        return {
            onIncrement,
            onDecrement,
            onValue
        }
    }
})
</script>
<style scoped>
    .w-button {
        width: 100%;
        height: 6vh;
        font-size: 3em;
        font-weight: bold;
    }
    .large-text {
        font-size: 2em;
    }
</style>