<template>
    <view-port> 
        <div class="view-port-content"> 
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-radio-group v-model="selected"> 
                            <ion-list class="his-card">
                                <ion-item class="his-md-text" v-for="(item, index) in listData" :key="index"> 
                                    <ion-radio slot="start" :value="item"> </ion-radio>
                                    <ion-label>{{ item.label }}</ion-label>
                                </ion-item>
                            </ion-list>
                        </ion-radio-group>
                    </ion-col>
                    <ion-col v-if="selected?.other?.options">
                        <ion-radio-group v-model="selected.value">
                            <ion-list class="his-card">
                                <ion-item class="his-md-text" v-for="(optionItem, optionIndex) in selected.other.options" :key="optionIndex"> 
                                    <ion-radio slot="start" :value="optionItem.label"> </ion-radio>
                                    <ion-label>{{ optionItem.label }}</ion-label>
                                </ion-item>
                            </ion-list>
                        </ion-radio-group>
                    </ion-col>
                </ion-row>
                <ion-row v-if="selected?.other?.subgroupTitle">
                    <ion-col>
                        <h4>{{selected?.other?.subgroupTitle}}</h4>
                    </ion-col>
                </ion-row>
                <ion-row  v-if="selected?.other?.subGroupOptions">
                    <ion-col>
                        <ion-radio-group v-model="selected.other.subGroupOptionValue"> 
                            <ion-list class="his-card">
                                <ion-item class="his-md-text" v-for="(subOption, subOptionIndex) in selected.other.subGroupOptions" :key="subOptionIndex"> 
                                    <ion-radio slot="start" :value="subOption"> </ion-radio>
                                    <ion-label>{{ subOption.label }}</ion-label>
                                </ion-item>
                            </ion-list>
                        </ion-radio-group>
                    </ion-col>
                    <ion-col v-if="selected?.other?.subGroupOptionValue?.other?.options">
                        <ion-radio-group v-model="selected.other.subGroupOptionValue.value">
                            <ion-list class="his-card">
                                <ion-item class="his-md-text" v-for="(optionItem, optionValueIndex) in selected.other.subGroupOptionValue.other.options" :key="optionValueIndex"> 
                                    <ion-radio slot="start" :value="optionItem.label"> </ion-radio>
                                    <ion-label>{{ optionItem.label }}</ion-label>
                                </ion-item>
                            </ion-list>
                        </ion-radio-group>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </div>
    </view-port>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import FieldMixinVue from './FieldMixin.vue'
import { Option } from '@/components/Forms/FieldInterface'
import {
    IonCol,
    IonRow,
    IonGrid,
    IonList,
    IonItem,
    IonRadioGroup,
    IonRadio,
    IonLabel
} from "@ionic/vue"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import { isEmpty } from 'lodash'

export default defineComponent({
    mixins: [FieldMixinVue],
    components: {
        IonCol,
        IonRow,
        IonGrid,
        IonList,
        IonItem,
        ViewPort,
        IonRadioGroup,
        IonRadio,
        IonLabel
    },
    data: () => ({
        selected: {} as Option, 
        listData: [] as Option[]
    }),
    watch: {
        selected: {
            handler(option: Option) {
                if (!isEmpty(option)) {
                    this.$emit('onValue', option)
                } 
            },
            immediate: true,
            deep: true
        },
        clear()  {
            this.selected = {} as Option
            this.initiateList()
        }
    },
    methods: {
        init() {
            this.$emit('onFieldActivated', this) 
            this.initiateList()
        },
        async initiateList() {
            this.listData = (await this.options(this.fdata, this.cdata))
                .map((o: Option) => {
                    if (o.other.subGroupOptions) {
                        o.other.subGroupOptionValue = null
                    }
                    return o
                })
        }
    },
    mounted() {
        this.init()
    },
    activated() {
        this.init()       
    }
})
</script>
<style scoped>
    #view-port {
        height: 81vh;
    }
    .his-card {
        padding: 0.1em;
        height: 34vh;
        overflow-y: scroll;
    }
</style>
