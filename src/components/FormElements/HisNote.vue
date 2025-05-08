<template>
    <view-port :showFull="false">
        <ion-textarea 
            :readonly="readonly"
            :value="value"
            style="width:100%"
            @ionInput="(e) => e.detail.value ? emitValue({label: e.detail.value, value: e.detail.value}) : null"
            placeholder="Start typing...." 
            class="input_display"
        />
    </view-port>
    <div class="his-floating-keyboard"> 
        <div class="his-floating-keyboard-content"> 
            <table style="width:99.9%;"> 
                <tr v-for="(tr, index) in layout" :key="index"> 
                    <td  v-for="(cl, cindex) in tr" :key="cindex"> 
                        <ion-button 
                            style="text-transform: none;"
                            strong
                            @click="keypress(cl)"
                            :class="`key__button ${cl.toLowerCase()}_btn`">
                            {{cl}} 
                        </ion-button>
                    </td>
                </tr>
            </table>
        </div>
        <ion-button @click="keypress('space')" strong style="width:100%;" shape="round" size="large" > Space </ion-button>
    </div>
  
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import { Option } from '../Forms/FieldInterface'
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'
import { isPlainObject } from 'lodash'
import { NOTE_PAD_KEYBOARD } from "@/components/Keyboard/KbLayouts"
import { IonButton, IonTextarea } from "@ionic/vue"
import usePlatform from "@/composables/usePlatform"

export default defineComponent({
    components: { 
        ViewPort,
        IonButton, 
        IonTextarea
    },
    mixins: [FieldMixinVue],
    data: () => ({
        value: '' as string,
        capsOn: false as boolean,
        layout: NOTE_PAD_KEYBOARD as Array<any>,
    }),
    computed: {
        readonly() {
            return usePlatform().activePlatformProfile.value.keyboard === 'HIS_KEYBOARD_ONLY'
        }
    },
    mounted() {
        this.init()
    },
    activated(){
        this.init()
    },
    methods: {
        async init() {
            this.$emit('onFieldActivated', this)
            await this.setDefaultValue()
        },
        async setDefaultValue() {
            if (this.defaultValue && !this.value) {
                const defaults: any = await this.defaultValue(this.fdata, this.cdata)
                if (defaults) {
                    if (isPlainObject(defaults)) {
                        this.emitValue(defaults)
                        this.value = defaults.value.toString()
                    } else {
                        this.value = defaults
                        this.emitValue({label: defaults, value: defaults})
                    }
                }
            }
        },
        updateKeyboardCaps(isUpperCase=false) {
            this.layout = this.layout.map((r: string[]) => 
                r.map((i: string) => isUpperCase ? i.toUpperCase() : i.toLowerCase()
            ))
        },
        async emitValue(v: Option) {
            if (this.onValue) {
                const ok = await this.onValue(v)
                if (!ok) {
                    return
                }
            }
            this.value = v.label
            this.$emit('onValue', v)
        },
        async onKbValue(text: any) {
            await this.emitValue({ label: text, value: text })
        },
        async keypress(text: any){
            const input = handleVirtualInput(
                this.capsOn ? text.toUpperCase() : text.toLowerCase(), 
                this.value
            )
            if (input.match(/caps/i)) {
                this.capsOn = this.capsOn ? false : true
                this.updateKeyboardCaps(this.capsOn)
                return
            }
            await this.emitValue({ label: input, value: input })
        }
    },
    watch: {
        clear() { this.value = '' }
    }
})
</script>
<style scoped> 
.input_display {
    background: white;
    font-size: 1.3em;
    height: 20vh;
}
#view-port {
    height: 53vh;
}
.del_btn, .enter_btn, .clear_btn, .caps_btn {
    width: 10vw !important;
}
.key__button {
  box-sizing: border-box;
  font-size: 1.4em;
  width: 8vw;
  height: 9vh;
  border-color: #f2f2f2;
  border-style: solid;
  text-shadow: 0 0.5px 1px #777, 0 2px 6px #f2f2f2;
  border-width: 1px;
  border-radius: 10px!important;
    -webkit-box-shadow: var(--his-card-primary-shadow-webkit);
-moz-box-shadow: var(--his-card-primary-shadow-moz);
box-shadow: var(--his-card-primary-shadow);
}
</style>
