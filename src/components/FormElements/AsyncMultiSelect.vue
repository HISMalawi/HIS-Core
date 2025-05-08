<template>
    <view-port :showFull="false">
        <his-text-input :value="filter" @onValue="(value) => onFilter(value)" /> 
        <ion-list class="view-port-content">
            <ion-item
                :key="index"
                v-for="(option, index) in displayList" 
                @click="onSelect(option)"
                :color="option.isChecked ? 'lightblue' : ''"
                :lines="option.isChecked ? 'none' : undefined"
                >
                <ion-checkbox
                    slot="start"
                    :checked="option.isChecked"
                    :disabled="option?.disabled"
                />
                <ion-label>
                    <span class="his-md-text">
                        {{ option.label }}
                    </span>
                </ion-label>
            </ion-item>
        </ion-list>
        <his-keyboard :kbConfig="keyboard" :onKeyPress="keypress"/>
    </view-port>
</template>
<script lang="ts">
import {
    IonList,
    IonItem,
    IonLabel,
    IonCheckbox,
} from "@ionic/vue"
import { defineComponent } from 'vue'
import FieldMixinVue from './FieldMixin.vue'
import { Option } from '../Forms/FieldInterface'
import ViewPort from "@/components/DataViews/ViewPort.vue"
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import { QWERTY } from "@/components/Keyboard/HisKbConfigurations"
import HisTextInput from "@/components/FormElements/BaseTextInput.vue"
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import Fuse from "fuse.js"

export default defineComponent({
    components: {
        ViewPort,
        IonList,
        IonItem,
        IonLabel,
        HisKeyboard,
        HisTextInput,
        IonCheckbox
    },
    mixins: [FieldMixinVue],
    data: () => ({
        filter: "",
        keyboard: QWERTY,
        listOptions: [] as Option[]
    }),
    mounted() {
        this.init()
    },
    activated() {
        this.init()
    },
    watch: {
        clear() {
            this.filter = ''
            this.listOptions.forEach((option: Option) => option.isChecked = false)
            this.updateValue()
        }
    },
    computed: {
        displayList() {
            if (this.filter) {
                const fuse = new Fuse(this.listOptions, {
					threshold: 0.4,
					keys: ['label'],
					useExtendedSearch: true
				})
				return fuse.search(this.filter).map((i: any) => i.item)
            }
            return this.listOptions
        }
    },
    methods: {
        init() {
            this.$emit('onFieldActivated', this)
            this.options(this.fdata).then((data: any) => this.indexData(data))
        },
        updateValue() {
          this.$nextTick(() => {
            this.$emit('onValue', this.listOptions.filter(option => option.isChecked))
          })
        },
        indexData(rawData: Option[]) {
            const indexes = this.listOptions.map((option) => option.label)
            rawData.forEach((option: Option) => {
                if (!indexes.includes(option.label)) {
                    this.listOptions.push(option)
                }
            })
        },
        onFilter(filter: string) {
            this.filter = filter
            this.options(this.fdata, this.filter).then(this.indexData)
        },
        onSelect(selected: Option) {
            this.listOptions.forEach((option) => {
                if (option.label === selected.label) {
                    option.isChecked = option.isChecked ? false : true
                }
            })
            this.updateValue()
        },
        keypress(text: string) {
            this.onFilter(handleVirtualInput(text, this.filter))
        }
    }
})
</script>
