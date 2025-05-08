<template>
    <view-port>
        <div class='view-port-content'>
            <ion-grid> 
                <ion-row> 
                    <ion-col size="6"><b class="his-lg-text"> {{"Medication" }} </b> </ion-col>
                    <ion-col size="3"><b class="his-lg-text"> {{"Amount Brought" }}</b> </ion-col>
                    <ion-col size="3"><b class="his-lg-text"> {{"Amount Given" }}</b> </ion-col>
                </ion-row>
                <ion-row v-for="(data, index) in listData" :key="index"> 
                    <ion-col size="6">  
                       <div class="his-md-text his-card" :style="{textAlign:'left'}"> {{ data.label }} </div>
                    </ion-col>
                    <ion-col size="3"> 
                        <ion-input 
                            readonly 
                            :value="data.other.remainingAmount" 
                            @click="remainingAmount(data)" 
                            class="his-card his-md-text"
                        />
                    </ion-col>
                    <ion-col size="3"> 
                        <ion-input 
                            readonly 
                            :value="data.other.givenAmount" 
                            @click="givenAmount(data)" 
                            class="his-card his-md-text"
                        />
                    </ion-col>
                </ion-row>
            </ion-grid>   
        </div>
    </view-port>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import ViewPort from '../DataViews/ViewPort.vue'
import { modalController } from '@ionic/vue'
import { Option } from '@/components/Forms/FieldInterface'
import KeyPad from '../Keyboard/HisKeypad.vue'
import FieldMixinVue from './FieldMixin.vue'
import {
    IonGrid,
    IonCol,
    IonRow,
    IonInput
} from "@ionic/vue"
export default defineComponent({
  components: { 
    ViewPort,
    IonGrid,
    IonCol,
    IonRow,
    IonInput
  },
  mixins: [FieldMixinVue],
  data: () => ({
    keypadActive: false,
    listData: [] as any
  }),
  watch: {
    clear: {
        handler() {
            this.listData = this.listData.map((item: Option) => {
                return {
                    ...item,
                    other: {
                        givenAmount: '',
                        remainingAmount: ''
                    }
                }
            })
        },
        immediate: true
    },
    listData: {
        handler() {
            this.$emit('onValue', this.listData)
        },
        deep: true,
        immediate: true
    }
  },
  mounted() {
    this.init()
  },
  activated() {
    this.init()
  },
  methods: {
    async init() {
        this.$emit('onFieldActivated', this)
        this.listData = await this.options(this.fdata, this.cdata, this.listData)
    },
    givenAmount(item: Option) {
        return this.launchKeyPad('Amount given', (value: number) => {
            item.other = {
                ...item?.other ?? {},
                givenAmount: value
            }
        })
    },
    remainingAmount(item: Option) {
        return this.launchKeyPad('Amount brought to clinic',(value: number) => {
            item.other = {
                ...item.other ?? {},
                remainingAmount: value
            }
        })
    },
    async launchKeyPad(title: string, onKeyPress: any) {
        if (this.keypadActive) return
        this.keypadActive = true
        const modal = await modalController.create({
            component: KeyPad,
            backdropDismiss: false,
            cssClass: 'keypad-modal',
            componentProps: {
                title,
                strictNumbers: true,
                onKeyPress(val: string){
                    this.keypadActive = false
                    if (typeof onKeyPress === 'function') onKeyPress(Number(val))
                }
            }
        })
        modal.present()
        await modal.onDidDismiss()
        this.keypadActive = false
    }
  }
})
</script>
<style scoped>
    .his-card {
        text-align: center;
        font-weight: bold;
        border: solid 1px #ccc;
        height: 75px;
        width: 100%;
    }
    .view-port-content {
        height: 100%;
    }
</style>
