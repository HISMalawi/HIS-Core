<template>
    <ion-content> 
        <div class="keypad">
            <ion-input :value="value" :disabled="true" class='keypad-input'/> 
            <center>
                <ion-chip> {{ title || 'keypad'}} </ion-chip>
            </center>
            <base-keyboard btnSize="96px" :layout="keypad" :onKeyPress="keypress"/> 
        </div>
    </ion-content>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseKeyboard from '@/components/Keyboard/BaseKeyboard.vue'
import { DEFAULT_KEYPAD } from '@/components/Keyboard/KbLayouts'
import handleVirtualInput from '@/components/Keyboard/KbHandler'
import { modalController } from '@ionic/core'
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
        value: '0',
        keypad: DEFAULT_KEYPAD
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
            if (key.match(/done/i)) {
                await modalController.dismiss(this.value)
            } else {
                if (this.strictNumbers) {
                    if (key.includes('.') && this.value.includes('.')) return
                    
                    if (!key.includes('.') && this.value === '0') this.value = ''
    
                    this.value = handleVirtualInput(key, this.value)
                    
                    if (!this.value) this.value = '0'

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
    }
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
</style>
