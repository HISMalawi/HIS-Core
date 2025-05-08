<template>
    <div class="keypad">
        <snap class=" ion-text-center"> {{ title }} </snap>
        <ion-input :value="value" style="text-align: center;border: solid 1px #b7b7b7; margin-top: 12px; margin-bottom: 12px;" />         
        <base-keyboard btnSize="8.5vw" :layout="keypad" :onKeyPress="keypress"/> 
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseKeyboard from '@/components/Keyboard/BaseKeyboard.vue'
import { PRESCRIPTION_KEYPAD } from '@/components/Keyboard/KbLayouts'
import handleVirtualInput from '@/components/Keyboard/KbHandler'
export default defineComponent({
components: { BaseKeyboard },
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
    value: '',
    keypad: PRESCRIPTION_KEYPAD,
}),
watch: {
    preset: { 
        handler(value: string | number) {
            if (!value) return
            this.value = value.toString()
        },
        immediate: true
    }
},
methods: {
    async keypress(key: any) {
        if (this.strictNumbers) {
            if (key.includes('.') && this.value.includes('.')) return
            
            if (!key.includes('.') && this.value === '0') this.value = ''

            this.value = handleVirtualInput(key, this.value)
            
            if (!this.value) this.value = ''

            // Condition verifies number as interger and emits parsed integer
            if (`${parseInt(this.value)}` === this.value) {
                this.onKeyPress(parseInt(this.value))
            } else {
                // helps preserve floating point values 
                this.onKeyPress(this.value)
            }
        } else {
            this.value = handleVirtualInput(key, this.value)
            this.onKeyPress(this.value)
        }
    }
}
})
</script>
<style scoped>
snap{
color: #333333;
font-weight: 700;
font-family: "Nimbus Sans L", "Arial Narrow", sans-serif;
font-size: 20px;
}
.keypad {
padding: 0.7em;
float: left;
border: solid 1px grey;
width: 30%;
height: 62vh;
border-left: none;
}
table{
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
</style>
