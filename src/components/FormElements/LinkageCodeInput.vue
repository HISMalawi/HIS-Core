<template>
    <view-port :showFull="false">
        <ion-grid>
            <ion-row>
                <ion-col>
                    <ion-input
                        mode='md'
                        :readonly="inputIsReadOnly"
                        inputmode="numeric"
                        type="number"
                        @click="onClickMask('bookNo')"
                        v-model="checkDigit.bookNo"
                        :style="{ textAlign: 'center' }"
                        placeholder="Book No."
                        :class="{
                            'highlighted-input' : activeMask === 'bookNo'
                        }"
                        class="input_display" />
                </ion-col>
                <ion-col>
                    <ion-input
                        mode='md'
                        :readonly="inputIsReadOnly"
                        type="number"
                        inputmode="numeric"
                        :maxlength="inputLengthLimit.pageNo"
                        @click="onClickMask('pageNo')"
                        v-model="checkDigit.pageNo"
                        :style="{ textAlign: 'center' }"
                        placeholder="Page No."
                        :class="{
                            'highlighted-input' : activeMask === 'pageNo'
                        }"
                        class="input_display" />
                </ion-col>
                <ion-col>
                    <ion-input
                        mode='md'
                        :readonly="inputIsReadOnly"
                        inputmode="numeric"
                        type="number"
                        :maxlength="inputLengthLimit.rowNo"
                        @click="onClickMask('rowNo')"
                        v-model="checkDigit.rowNo"
                        :class="{
                            'highlighted-input' : activeMask === 'rowNo'
                        }"
                        :style="{ textAlign: 'center' }"
                        placeholder="Row No."
                        class="input_display" />
                </ion-col>
                <ion-col>
                    <ion-input
                        mode='md'
                        :readonly="inputIsReadOnly"
                        :maxlength="inputLengthLimit.checkDigit"
                        @click="onClickMask('checkDigit')"
                        :class="{
                            'highlighted-input' : activeMask === 'checkDigit'
                        }"
                        v-model="checkDigit.checkDigit"
                        :style="{ textAlign: 'center' }"
                        placeholder="Check digit"
                        class="input_display" />
                </ion-col>
            </ion-row>
        </ion-grid>
    </view-port>
    <his-keyboard 
        v-if="showKeyboard" 
        :onKeyPress="onKeyPress" 
        :kbConfig="activeKeyboard"
    />
</template>

<script lang="ts">
import { 
    IonInput,
    IonRow,
    IonCol,
    IonGrid
} from "@ionic/vue"
import { computed, defineComponent, onActivated, reactive, ref, watch } from 'vue'
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import { NUMBER_PAD_LO } from "@/components/Keyboard/KbLayouts"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import Platform from "@/composables/usePlatform"
import { validateScanFormLinkageCode } from "@/utils/Damm"

export default defineComponent({
    components: { 
        IonInput, 
        IonRow,
        IonCol,
        IonGrid,
        HisKeyboard, 
        ViewPort
    },
    mixins: [FieldMixinVue],
    watch: {
        clear() {
            this.checkDigit.bookNo = ''
            this.checkDigit.pageNo = ''
            this.checkDigit.rowNo = ''
            this.checkDigit.checkDigit = ''
            this.activeMask = 'bookNo'
            this.showKeyboard = true
        }
    },
    setup(props, { emit }) {
        onActivated(() => emit('onFieldActivated', this))
        const inputLengthLimit: any = {
            'bookNo': 5,
            'checkDigit': 1,
            'pageNo': 3,
            'rowNo': 2,
        }
        const inputIsReadOnly = computed(() => Platform().activePlatformProfile.value.keyboard === 'HIS_KEYBOARD_ONLY')
        const activeMask = ref<'bookNo'|'pageNo'|'rowNo'|'checkDigit'|''>('bookNo')
        const showKeyboard = ref(true)
        const activeKeyboard = computed(() =>  {
            const NumberKeyboard = [
                NUMBER_PAD_LO,
                [
                   ['Delete'],
                   ['Clear']
                ]
            ]
            const kbMap: Record<string, any> = {
                bookNo: NumberKeyboard,
                pageNo: NumberKeyboard,
                rowNo: NumberKeyboard,
                checkDigit: [
                    [
                        ['B', 'F', 'G'],
                        ['H', 'J', 'P'],
                        ['V', 'W', 'X'],
                        ['', 'Z', '']
                    ],
                    [
                        ['Delete'],
                        ['Clear']
                    ]
                ] 
            }
            return kbMap[activeMask.value]
        })

        const checkDigit = reactive<Record<string, number|string>>({
            bookNo:  '',
            pageNo: '',
            rowNo:  '',
            checkDigit: ''
        })

        function onKeyPress(input: string) {
            if (activeMask.value) {
                const maxLength = inputLengthLimit[activeMask.value] || 0 
                const val = handleVirtualInput(input, maxLength === 1 ? '' : `${checkDigit[activeMask.value]}`)
                if (maxLength <= 1 || `${val}`.length <= maxLength ) {
                    checkDigit[activeMask.value] = val
                }
            }
        }

        function onClickMask(maskName: 'bookNo'|'pageNo'|'rowNo'|'checkDigit') {
            activeMask.value = maskName
            showKeyboard.value = true
        }

        watch(checkDigit, (input) => {
            const value = `${input.bookNo}-${input.pageNo}-${input.rowNo}-${input.checkDigit}`
            emit('onValue', {  
                label: value, 
                value: `${input.bookNo}${input.pageNo}${input.rowNo}${input.checkDigit}`,
                other: {
                    isValidLinkageCode: validateScanFormLinkageCode(value)
                }
            })
        }, { deep: true })

        return {
            activeMask,
            checkDigit,
            showKeyboard,
            inputIsReadOnly,
            inputLengthLimit,
            activeKeyboard,
            onClickMask,
            onKeyPress
        }
    }
})
</script>

<style scoped> 
#view-port {
    height: 53vh;
}
.highlighted-input {
    color: #3880ff;
    border-bottom: 3px solid #3880ff;
}
</style>