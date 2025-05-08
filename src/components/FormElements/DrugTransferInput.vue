<template>
    <view-port>
        <div class='view-port-content'>
            <ion-grid> 
                <ion-row> 
                    <ion-col size="6"><b> Medication </b> </ion-col>
                    <ion-col size="3"><b> Given Amount</b> </ion-col>
                    <ion-col size="3"><b> Pills brought </b> </ion-col>
                </ion-row>
                <ion-row v-for="(data, index) in listData" :key="index"> 
                    <ion-col size="6">  
                       <div class="his-card" :style="{textAlign:'left'}"> {{ data.label }} </div>
                    </ion-col>
                    <ion-col size="3"> 
                        <ion-input :value="data.value" @click="launchKeyPad(data, 'Given amount')" class="his-card"/>
                    </ion-col>
                    <ion-col size="3"> 
                        <ion-input :value="data.other.pillsBrought" @click="launchKeyPad(data, 'Pills brought')" class="his-card"/>
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
    listData: [] as any
  }),
  watch: {
    clear: {
        handler() {
            this.listData = this.listData.filter((item: Option) => {
                item.value = ''
                item.other.pillsBrought = ''
                return true
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
    async launchKeyPad(item: Option, type: 'Given amount' | 'Pills brought') {
        const modal = await modalController.create({
            component: KeyPad,
            backdropDismiss: false,
            cssClass: 'keypad-modal',
            componentProps: {
                title: item.label,
                preset: type === 'Given amount' 
                    ? item.value 
                    : item.other.pillsBrought,
                strictNumbers: true,
                onKeyPress(val: string){
                    if (type === 'Given amount') {
                        item.value = val
                    }
                    if (type === 'Pills brought') {
                        item.other.pillsBrought = val
                    }
                }
            }
        })
        modal.present()
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
