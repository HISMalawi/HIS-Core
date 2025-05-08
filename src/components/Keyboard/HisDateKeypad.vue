<template>
    <ion-content> 
        <div class="keypad">
            <ion-input :value="fullDate" :disabled="true" class='keypad-input'/> 
            <center>
                <ion-chip> {{ title || 'keypad'}} </ion-chip>
            </center>
            <ion-grid>
        <ion-row>
            <ion-col size="2">
                <ion-button @click="add('day')" size="large">+</ion-button>
            </ion-col>
            <ion-col size="2">
                <ion-button @click="add('month')" size="large">+</ion-button>
            </ion-col>
            <ion-col size="2">
                <ion-button @click="add('year')" size="large">+</ion-button>
            </ion-col>
        </ion-row>
        <ion-row>
            <ion-col size="2">
                <ion-input class="date-inputs">{{ getDay }}</ion-input>
            </ion-col>
            <ion-col size="2">
                <ion-input class="date-inputs">{{ getMonth }}</ion-input>
            </ion-col>
            <ion-col size="2">
                <ion-input class="date-inputs">{{getYear}}</ion-input>
            </ion-col>
            <ion-col size="2">
                <ion-button @click="today()" size="large">
                    Today
                </ion-button>
            </ion-col>
        </ion-row>
        <ion-row>
            <ion-col size="2">
                <ion-button @click="subtract('day')" size="large">-</ion-button>
            </ion-col>
            <ion-col size="2">
                <ion-button @click="subtract('month')" size="large">-</ion-button>
            </ion-col>
            <ion-col size="2">
                <ion-button @click="subtract('year')" size="large">-</ion-button>
            </ion-col>
        </ion-row>
    </ion-grid>
    <ion-button size="large" @click="closeModal">
        Done
    </ion-button>
        </div>
    </ion-content>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseKeyboard from '@/components/Keyboard/BaseKeyboard.vue'
import { DEFAULT_KEYPAD } from '@/components/Keyboard/KbLayouts'
import handleVirtualInput from '@/components/Keyboard/KbHandler'
import { modalController } from '@ionic/core'
import { Service } from '@/services/service'
import HisDate from "@/utils/Date"
import {IonInput, IonGrid, IonCol, IonRow, IonButton} from '@ionic/vue'
export default defineComponent({
    components: { IonInput, IonGrid, IonCol, IonRow, IonButton },
    props: {
        title: {
            type: String
        },
        preset: {
            type: String
        },
        onKeyPress: {
            type: Function,
            required: true,
        },
        strictNumbers: {
            type: Boolean,
            default: false
        }
    },
    data: () => ({
        date: Service.getSessionDate() as any,
        keypad: DEFAULT_KEYPAD,
        value: '' as any
    }),
    
    methods: {
      
        onKbValue(text: any) { 
            this.value = text
        },
        async keypress(text: any){
            this.value = handleVirtualInput(text, this.value)
        },
        add(unit: string) {
            this.date = HisDate.add(`${this.date}`, unit, 1)
        },
        subtract(unit: string) {
           this.date = HisDate.subtract(`${this.date}`, unit, 1)
        },
        today() {
            this.date = Service.getSessionDate();
        },
        async closeModal() {
            await modalController.dismiss(this.fullDate)
        }
    },
    computed: {
        getYear(): any {
            return HisDate.getYear(`${this.date}`);
        },
        getMonth(): any {
            return HisDate.getMonth(`${this.date}`);
        },
        getDay(): any {
            return HisDate.getDay(`${this.date}`);
        },
        fullDate(): any{
            return HisDate.toStandardHisFormat(this.date);
        }
    },
       
   
})
</script>
<style scoped>
.keypad {
    background: #F4F4F4;
    padding: 0.7em;
    margin: auto;
}

.his-keyboard-margin {
 padding: 0px!important;
}

.his-keyboard-btn {
    width: 110px!important;
}
.keypad-input {
    border: solid 1px #ccc;
    background: white;
    border-radius: 10px;
    width: 100%;
    height: 70px;
    text-align: center;
    font-size: 3em;
}
.date-inputs {
    border: solid 1px black;
    font-size: 1.7em;
}
</style>
