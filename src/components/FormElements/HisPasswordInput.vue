<template>
    <view-port :showFull="false">
        <base-input type="password" :value="value" @onValue="onKbValue"/>
        <ion-progress-bar :color="progressColor" :value="progressValue"/>
        <div class="ion-text-center">
            <ul style="list-style: none;">
                <li v-for="(recommendation, index) in recommendations" :key="index">
                    {{ recommendation }}
                </li>
            </ul>
        </div>
    </view-port>
    <his-keyboard :kbConfig="keyboard" :onKeyPress="keypress" :disabled="false"/>
</template>
<script lang="ts">
import { PASSWORD_KEYBOARD_CONFIG } from "@/components/Keyboard/HisKbConfigurations"
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import BaseInput from "@/components/FormElements/BaseTextInput.vue"
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import { Option } from '../Forms/FieldInterface'
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'
import { defineComponent } from 'vue'
import {
    IonProgressBar,
    IonInput,
    IonRow,
    IonCol,
    IonGrid,
    IonList, 
    IonItem, 
    IonLabel,
} from "@ionic/vue"
import passwordValidator from "zxcvbn"

// Score is between 1 to 5
const MAX_PASSWORD_SCORE = 5
const MIN_PASSWORD_SCORE = 3
export default defineComponent({
    components: {
        IonProgressBar,
        IonInput, 
        IonRow,
        IonCol,
        IonGrid,
        BaseInput, 
        HisKeyboard, 
        ViewPort, 
        IonList, 
        IonItem, 
        IonLabel 
    },
    mixins: [FieldMixinVue],
    data: ()=>({
        value: '' as string,
        passwordScore: 0,
        recommendations: [],
        keyboard: PASSWORD_KEYBOARD_CONFIG
    }),
    computed: {
        progressValue() {
            return this.passwordScore ? this.passwordScore / MAX_PASSWORD_SCORE : 0
        },
        progressColor() {
            if (this.passwordScore >= MIN_PASSWORD_SCORE && this.passwordScore < MAX_PASSWORD_SCORE) {
                return 'warning'
            }
            if (this.passwordScore >= MAX_PASSWORD_SCORE) {
                return 'success'
            }
            return 'danger'
        }
    },
    methods: {
        async emitValue(v: Option) {
            this.value = `${v.value??''}`
            const validated = passwordValidator(this.value);
            this.passwordScore = 0
            this.passwordScore += validated.score
            this.recommendations = validated?.feedback?.suggestions ?? []
            if (/^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/i.test(this.value)) {
                this.passwordScore += 2
            } else {
                this.recommendations = ["Password must have a combination of letters, numbers and special characters"]
            }
            if (this.passwordScore < MIN_PASSWORD_SCORE) {
                return this.$emit('onValue', null)
            } 
            this.$emit('onValue', v)
        },
        async onKbValue(text: any) {
            await this.emitValue({ label: text, value: text })
        },
        async keypress(text: any){
            const input = handleVirtualInput(text, this.value, this.config?.casing)
            await this.emitValue({ label: input, value: input })
        }
    },
    watch: {
        clear() { 
            this.emitValue({})
        }
    }
})
</script>
<style scoped> 
#view-port {
    height: 53vh;
}
.view-port-content {
    height: 80%;
}
</style>