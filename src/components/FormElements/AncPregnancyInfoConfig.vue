<template>
    <view-port>
        <div class='view-port-content'>
            <table class="pregnancy-table"> 
                <thead class="ion-text-center"> 
                    <tr> 
                        <th>Pregnancy</th>
                        <th>Baby count</th>
                        <th>Details available</th>
                    </tr>
                </thead>
                <tbody class="ion-text-center"> 
                    <tr v-for="(item, index) in listData" :key="index"> 
                        <td v-html="item.label"></td>
                        <td> 
                            <ion-row> 
                                <ion-col>
                                    <ion-button :disabled="parseInt(`${item.value}`)===1" @click="item.value = parseInt(`${item.value}`) > 1  ?  parseInt(`${item.value}`) - 1 : 1">
                                        <ion-icon slot="icon-only" :icon="arrowDown"></ion-icon>
                                    </ion-button> 
                                </ion-col>
                                <ion-col> 
                                    <ion-input class="baby-count" :value="item.value"/> 
                                </ion-col>
                                <ion-col> 
                                    <ion-button :disabled="parseInt(`${item.value}`) === 4" @click="item.value = parseInt(`${item.value}`) < 4 ? parseInt(`${item.value}`) + 1 : parseInt(`${item.value}`)">
                                        <ion-icon slot="icon-only" :icon="arrowUp"> </ion-icon>
                                    </ion-button> 
                                </ion-col>
                            </ion-row>
                            
                        </td>
                        <td><ion-checkbox v-model="item.isChecked"/></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </view-port>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Option } from '../Forms/FieldInterface'
import FieldMixinVue from './FieldMixin.vue'
import ViewPort from '../DataViews/ViewPort.vue'
import { 
    IonCheckbox,
    IonInput,
    IonButton,
    IonIcon,
    IonCol,
    IonRow,
} from "@ionic/vue"
import {
    arrowUp,
    arrowDown
} from "ionicons/icons"

export default defineComponent({
    name: "HisSelect",
    mixins: [FieldMixinVue],
    components: {
        IonInput,
        IonButton,
        IonCheckbox,
        IonCol,
        IonRow,
        IonIcon,
        ViewPort,
    },
    setup() {
        return {
            arrowUp,
            arrowDown
        }
    },
    data: () => ({
        listData: [] as Option[]
    }),
    mounted() {
        this.init()
    },
    activated() {
        this.init()
    },
    methods: {
        async init() {
            this.$emit('onFieldActivated', this)
            this.listData = this.options(this.fdata)
        }
    },
    watch: {
        listData: {
            handler(data: Option[]) {
                if (data) {
                    if (typeof this.onValue === 'function') this.onValue(data)
                    this.$emit('onValue', data)
                } 
            },
            deep: true,
            immediate: true
        }
    }
})
</script>
<style scoped>
    .baby-count {
        padding: 2em;
        font-size: 1.3;
        border: 2px solid #ccc;
    }
    .pregnancy-table {
        width: 100%;
    }
    thead {
        background: lightblue;
        font-size: 1.3rem;
        font-weight: 'bold'
    }
    td, th {
        border: solid 1px #3333;
    }
    th {
        padding: 1.2em;
    }
    td {
       font-size: 1.3rem; 
       padding: 1.4em;
    }
    ion-checkbox {
        --size: 38px;
    }
</style>