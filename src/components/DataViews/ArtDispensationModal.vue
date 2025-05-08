<template>
    <ion-content>
        <table>
            <thead>
                <tr>
                    <th colspan="6"> {{ drugName }} </th>
                </tr>
                <tr>
                    <th>Total tab(s) needed </th>
                    <th colspan="2"> Available stock </th>
                    <th colspan="2"> Dispensed </th>
                    <th></th>
                </tr>
                <tr>
                    <th> </th>
                    <th> Pack size </th>
                    <th> Packs </th>
                    <th> Total Tab(s)</th>
                    <th> Packs </th>
                    <th> </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td :rowspan="amountNeededRowSpan"> {{tabsNeeded}} tab(s) </td>
                </tr>
                <tr v-for="(list, rIndex) in listData" :key="rIndex">
                    <td v-for="(amount, cIndex) in list" :key="cIndex" 
                        :class="cIndex >= 2 ? 'input-field' : 'his-md-text'"> 
                        {{ fmtNumber(amount) }}
                    </td>
                    <td> 
                        <ul class='btn-list'> 
                            <li> <ion-button @click="incrementAmount(rIndex)" class='dispense-btn' size="large"> + </ion-button> </li>
                            <li> <ion-button @click="decrementAmount(rIndex)" class='dispense-btn' size="large"> - </ion-button> </li>
                        </ul>
                    </td>
                </tr>
            </tbody>
        </table>
    </ion-content>
    <ion-footer>
        <ion-toolbar>
        <ion-button @click="onClose" color="danger" size="large" slot="end"> Close </ion-button>
        <ion-button 
            @click="onDispense(dispensedValues)" 
            color="success" 
            size="large" 
            slot="end"> 
            Dispense 
        </ion-button>
        </ion-toolbar>
    </ion-footer>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { modalController } from "@ionic/vue"
import { toNumString } from '@/utils/Strs'

export default defineComponent({
    data: () => ({
        listData: [] as Array<any>,
        tabsIndex: 2,
        packsIndex: 3
    }),
    props: {
        drugName: {
            type: String,
            required: true 
        },
        tabsNeeded: {
            type: String,
            required: true
        },
        items: {
            type: Array,
            required: true
        },
        onDispense: {
            type: Function,
            required: true
        },
        onClose: {
            type: Function
        }
    },
    computed: {
        dispensedValues(): Array<[number, number]> {
            return this.listData
                       .filter((d: Array<number>) => d[this.tabsIndex] > 0) // We only want tabs with entered value amounts
                       .map((d: Array<number>) => [ d[this.tabsIndex], d[this.packsIndex] ]) // Just track Tabs and packs changed.. ignore the rest
        },
        amountNeededRowSpan(): number {
            return this.listData.length + 1
        }
    },
    watch: {
        items: {
            handler(items: Array<any>){
                if (items) this.listData = [...items]
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        async onClose() {
            await modalController.dismiss({})
            if (typeof this.onClose === 'function') this.onClose()
        },
        incrementAmount(rIndex: number) {
            const [packSize,, totalTabs, totalPacks ] = this.listData[rIndex]
            const tabsAmount = packSize + totalTabs
            const packAmount = totalPacks + 1
            this.listData[rIndex][2] = tabsAmount
            this.listData[rIndex][3] = packAmount
        },
        decrementAmount(rIndex: number) {
            const [packSize,, totalTabs, totalPacks ] = this.listData[rIndex]
            const packAmount = totalPacks - 1
            if (packAmount >= 0) {
                const tabsAmount = totalTabs - packSize
                this.listData[rIndex][2] = tabsAmount
                this.listData[rIndex][3] = packAmount
            }
        },
        fmtNumber(value: string) {
            if(/-/i.test(value)) return value;
            return toNumString(value);
        }
    }
})
</script>

<style scoped>
    table {
        font-size: var(--his-md-font-size);
        width: 98%;
        margin: auto;
    }
    table, td, th {
        font-size: var(--his-sm-font-size);
        border: solid 1px #ccc;
        text-align: center;
        vertical-align: middle;
    }
    td {
        height: 120px;
    }
    .btn-list {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .dispense-btn {
        width: 60px;
    }
    .input-field {
        font-weight: bold;
        font-size: 1.3em;
        background-color: rgb(248, 248, 167);
    }
</style>