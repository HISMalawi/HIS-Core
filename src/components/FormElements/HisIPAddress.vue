<template>
    <view-port :showFull="false">
        <ion-grid>
            <ion-row>
                <ion-col 
                    v-for="index of Object.keys(addressInputs)"
                    :key="index"
                    > 
                    <ion-input
                        :readonly="activePlatformProfile.keyboard === 'HIS_KEYBOARD_ONLY'"
                        mode='md'
                        inputmode="numeric"
                        type="number"
                        :max="255"
                        :class="{
                            'highlighted-input' : index === activeIndex
                        }"
                        v-model="addressInputs[index]"
                        @ionFocus="onAddressClick(index as ActiveIndexI)"
                        :style="{ textAlign: 'center' }"
                        placeholder="0"
                        class="input_display"
                    />
                </ion-col>
            </ion-row>
        </ion-grid>
    </view-port>   
    <his-keyboard :onKeyPress="keypress" :kbConfig="numbers" />
</template>

<script lang="ts">
import { defineComponent, onActivated, ref, watch } from 'vue'
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import { NUMBER_ARROW_PAD_LO } from "@/components/Keyboard/KbLayouts"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import { 
    IonInput,
    IonRow,
    IonCol,
    IonGrid
} from "@ionic/vue"
import { isEmpty } from 'lodash'
import Platform from "@/composables/usePlatform"

type ActiveIndexI = 'first' | 'second' | 'third' | 'fourth';

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
            this.addressInputs = {
                first:  '',
                second: '',
                third:  '',
                fourth: ''
            } 
        }
    },
    setup(_props, {emit}) {
        const  { activePlatformProfile } = Platform()
        onActivated(() => emit('onFieldActivated', this))
        const activeIndex = ref<ActiveIndexI>('first');
        // Track IP Address parts
        const addressInputs = ref({
            first:  '',
            second: '',
            third:  '',
            fourth: ''
        }) as any

        const transitionMap = {
            'first': 'second',
            'second': 'third',
            'third': 'fourth',
            'fourth': 'third'
        };

        const onAddressClick = (index: ActiveIndexI) => activeIndex.value = index;
        const goToNext = () => activeIndex.value = transitionMap[activeIndex.value] as ActiveIndexI || activeIndex.value;
        const goToPrevious = () => activeIndex.value = Object.keys(transitionMap)
            .find(key => transitionMap[key as ActiveIndexI] === activeIndex.value) as ActiveIndexI || activeIndex.value;

 
        function keypress(input: string) {
            if (/→/i.test(input)) return goToNext();
            if (/←/i.test(input)) return goToPrevious(); 
            const index = activeIndex.value
            const value = handleVirtualInput(
                input, addressInputs.value[index]
            )
            // Tab to next IP Address part if value exceeds 3
            if (value.length > 3) return goToNext();
            addressInputs.value[index] = value.charAt(0) === '0' && value.length > 1
                ? value.substring(1)
                : value
            
        }

        watch(addressInputs, (address) => {
            if (!address) return
            // Only Emit the IP Address if all the parts are set
            const complete = Object.values(address)
                .map(
                    (i: any) => !isEmpty(i)
                )
            if (complete.every(Boolean)) {
                const value = Object
                    .values(address)
                    .map(i => i)
                    .join('.')
                emit('onValue', {label: value, value})
            } else {
                emit('onValue', null)
            }
        }, { deep: true, immediate: true })

        return {
            activePlatformProfile,
            keypress,
            activeIndex,
            onAddressClick,
            addressInputs,
            numbers: [
                NUMBER_ARROW_PAD_LO,
                [
                   ['Delete'],
                   [ 'Clear' ]
                ]
            ]
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