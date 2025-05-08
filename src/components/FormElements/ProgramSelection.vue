<template>
    <view-port>
        <div class='view-port-content'>
            <ion-row>
                <ion-col size="4">
                    <ion-list>
                        <ion-item
                            class="his-sm-text"
                            v-for="(program, pIndex) in listData" 
                            :color="program.label === activeProgram.label ? 'primary': ''" 
                            :key="pIndex"
                            @click="onselect(program)"
                            detail> 
                            <ion-label> {{program.label}} </ion-label>
                        </ion-item>
                    </ion-list>
                </ion-col>
                <ion-col size="8">
                    <h1 
                        v-if="activeProgram.label && states.length <= 0"
                        :style="{textAlign:'center'}"> 
                        Program has no states 
                    </h1>
                    <table class="his-sm-text his-table" v-if="activeProgram.label && states.length > 0"> 
                        <tr>
                            <th>State</th>
                            <th>State Date</th>
                            <th>End Date</th>
                            <th>Actions</th>
                        </tr>
                        <tr v-for="(state, sIndex) in states" :key="sIndex"> 
                            <td>{{state.name}}</td>
                            <td>{{state.startDate}}</td>
                            <td>{{state.endDate || 'N/A'}}</td>
                            <td>
                                <ion-button 
                                  v-for="(stateAction, aIndex) in state.actions" :key="aIndex"
                                  :color="stateAction.color" 
                                  @click="stateAction.action(activeProgram, sIndex)"> 
                                  {{stateAction.name}} 
                                </ion-button>
                            </td>
                        </tr>
                    </table>
                </ion-col>
            </ion-row>
        </div>
    </view-port>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Option } from '../Forms/FieldInterface'
import { isEmpty } from 'lodash'
import HisDate from "@/utils/Date"
import FieldMixinVue from './FieldMixin.vue'
import ViewPort from "@/components/DataViews/ViewPort.vue"
import {
    IonCol,
    IonRow,
    IonButton,
    IonLabel,
    IonList,
    IonItem,
} from "@ionic/vue"

export default defineComponent({
    name: "HisSelect",
    components: { ViewPort, IonCol, IonRow, IonLabel, IonList, IonButton, IonItem,
 },
    mixins: [FieldMixinVue],
    watch: {
        clear(val: boolean){ 
           if (val) {
               this.activeProgram = {}
               this.$emit('onClear')
           }
        }
    },
    data:()=>({
        listData: [] as Array<Option>,
        activeProgram: {} as any,
    }),
    mounted() {
        this.init()
    },
    activated() {
        this.init()
    },
    computed: {
        states(): Array<any> {
            return !isEmpty(this.activeProgram) ? this.activeProgram.other.programStates : []
        }
    },
    methods: {
        async init() {
            this.$emit('onFieldActivated', this)
            this.listData = await this.options(this.fdata)
        },
        formatDate(date: string) {
            return !date ? 'N/A' : HisDate.toStandardHisDisplayFormat(date)
        },
        async onselect(item: Option) {
            this.activeProgram = item
            if (this.onValue) {
                const ok = await this.onValue(item, this)
                if (!ok) {
                    this.activeProgram = {}
                    return
                }
            }
            this.$emit('onValue', item)
        }
    }
})
</script>
<style scoped>
    .view-port-content {
        height: 98%;
        background: white;
    }
    ion-col {
        border-right: solid 1px #ccc;
        height: 75vh;
    }
</style>