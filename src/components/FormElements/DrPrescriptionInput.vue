<template>
    <view-port :showFull="false">
        <ion-input :value="composition" class="input_display" :disabled="true"/>
        <ion-grid class="view-port-content">
            <ion-row v-for="(chart, index) in drugChart" :key="index">
                <ion-col size="3">
                    <b class="his-md-text">{{ chart.name }}</b>
                </ion-col>
                <ion-col size="9">
                    <table style="width: 100%;text-align: left;">
                        <thead>
                            <th class="his-sm-text">Weight band</th>
                            <th class="his-sm-text">Abbreviation</th>
                            <th class="his-sm-text">Side Effects</th>
                            <th class="his-sm-text">Resistant</th>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    {{ chart.drug?.weight_adjusted?.[0]?.drug?.name || 'N/A' }}
                                </td>
                                <td>
                                    {{ chart?.abbreviation }}
                                </td>
                                <td>
                                    <span :class="{ 
                                        'drug_danger': chart?.side_effects, 
                                        'drug_ok': !chart?.side_effects 
                                        }">
                                        {{ chart?.side_effects ? 'Yes' : 'No' }}
                                    </span>
                                </td>
                                <td>
                                    <span :class="{
                                        'drug_danger': chart?.resistant, 
                                        'drug_ok': !chart?.resistant
                                    }">
                                        {{ chart.resistant ? 'Yes' : 'No' }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </ion-col>
            </ion-row>
        </ion-grid>
    </view-port>
    <div class="his-floating-keyboard">
        <div class="his-floating-keyboard-content">
            <table style="width: 100%;text-align: left;">
                <td v-for="(option, index) in listData" :key="index">
                    <table style="width: 100%;text-align: left">
                        <tr>
                            <td>
                                <ion-button 
                                    @click="switchRegimen(option, 0)"
                                    :disabled="option.other.length <= 1||option.other?.[0]?.abbreviation === option.value" 
                                    :color="option.other.length > 1 ? 'success' : 'light'" 
                                    class="w-button">
                                    +
                                </ion-button>
                            </td>
                        </tr>
                        <tr>
                            <td class="ion-text-center">
                               <span class="his-lg-text">{{ option.value }}</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <ion-button 
                                    @click="switchRegimen(option, 1)"
                                    :disabled="option.other.length <= 1||option.other?.[1]?.abbreviation === option.value"
                                    :color="option.other.length > 1 ? 'success' : 'light'" 
                                    class="w-button">
                                    -
                                </ion-button>
                            </td>
                        </tr>
                    </table>
                </td>
            </table>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import ViewPort from '../DataViews/ViewPort.vue'
import { IonButton, IonInput, IonRow, IonCol, IonGrid } from "@ionic/vue"
import { Option } from "../Forms/FieldInterface"
import FieldMixinVue from './FieldMixin.vue'

export default defineComponent({
    mixins: [FieldMixinVue],
    components: { IonButton, ViewPort, IonInput, IonRow, IonCol, IonGrid },
    data: () => ({
        listData: [] as Option[]
    }),
    mounted() {
        this.init()
    },
    activated(){
        this.init()
    },
    computed: {
        drugChart() {
            return this.listData.reduce((a: any, c: Option) => [...a, ...c.other], [])
        },
        composition(){ 
            return this.listData.map((l) => l.value).join('-')
        }
    },
    methods: {
        async init() {
            this.$emit('onFieldActivated', this)
            this.listData = await this.options(this.fdata)
            this.emitValue()
        },
        switchRegimen(option: any, index: number) {
            option.value = option.other?.[index]?.abbreviation
            option.other.selected = option.other?.[index]
            this.emitValue()
        },
        emitValue() {
            this.$emit('onValue', this.listData.map((l: Option) => {
                const regimen = l.other.find((d: any) => d.abbreviation === l.value)
                return { 
                    label: regimen.name, 
                    value: regimen.concept.concept_id, 
                    other: regimen.drug.weight_adjusted[0]
                }
            }))
        }
    }
})
</script>
<style scoped>
.view-port-content {
    background-color: white!important;
    height: 99%;
}
th {
    font-weight: bold;
    padding: 1.3%;
    border-bottom: 1.5px solid #343434;
}
td {
    padding: 1.5%;
}
.drug_danger {
    color: red;
}
.drug_ok {
    color:green;
}
.w-button {
    width: 100%;
    height: 1.8vh;
    font-size: 1.8em;
    font-weight: bold;
}
.half {
    height: 55vh!important;
}
</style>