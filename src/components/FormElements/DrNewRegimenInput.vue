<template>
    <view-port>
        <ion-input :value="regimenComposition" class="input_display" :disabled="true"/>
        <ion-grid class='view-port-content'>
            <ion-row v-for="(option, index) in listData" :key="index">
                <ion-col size="3">
                    <b class="his-md-text">{{ option.label }}</b> <br/>
                    <i>{{ option.value }}</i>
                </ion-col>
                <ion-col size="9">
                    <table style="width: 100%;text-align: left;">
                        <thead>
                            <th></th>
                            <th class="his-sm-text">Drug</th>
                            <th class="his-sm-text">Resistant</th>
                            <th class="his-sm-text">Side effects</th>
                            <th class="his-sm-text">Alternative</th>
                        </thead>
                        <tbody>
                            <tr v-for="(drug, dIndex) in option.other.drugs" :key="dIndex">
                                <td>
                                    <ion-checkbox 
                                        @ion-change="(e) => onCheck(e, drug)" 
                                        :disabled="drug.resistant||drug.disabled" 
                                        v-model="drug.isChecked" />
                                </td>
                                <td class="his-sm-text">
                                    <s v-if="drug.disabled">{{ `${drug.name} (${drug.abbreviation})` }}</s>
                                    <span v-if="!drug.disabled">{{ `${drug.name} (${drug.abbreviation})` }}</span>
                                </td>
                                <td class="his-sm-text" 
                                    :class="{
                                        'drug_danger': drug.resistant, 
                                        'drug_ok': !drug.resistant
                                    }"> 
                                    {{ drug.resistant ? 'Yes' : 'No' }}
                                </td>
                                <td class="his-sm-text" :class="{ 
                                    'drug_danger': drug.side_effects, 
                                    'drug_ok': !drug.side_effects 
                                    }"> 
                                    {{ drug.side_effects ? 'Yes' : 'No' }}
                                </td>
                                <td class="his-sm-text">{{ drug.substitute?.name ? `${drug.substitute?.name} (${drug.substitute?.abbreviation})` :'N/A' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </ion-col>
            </ion-row>
        </ion-grid>
    </view-port>
</template>
<script lang="ts">
import { IonInput, IonCheckbox, IonRow, IonCol, IonGrid } from "@ionic/vue" 
import { defineComponent } from 'vue'
import ViewPort from '../DataViews/ViewPort.vue'
import FieldMixinVue from './FieldMixin.vue'
import { Option } from "../Forms/FieldInterface"

export default defineComponent({
    components: { IonInput, IonCheckbox, ViewPort, IonRow, IonCol, IonGrid },
    mixins: [FieldMixinVue],
    data: () => ({
        listData: [] as Option[]
    }),
    mounted() {
        this.init()
    },
    activated(){
        this.init()
    },
    watch: {
        listData: {
            handler(items: Option[]) {
                const drugs = this.toDrugs(items)
                    .filter((drug: any) => drug.isChecked)
                    .reduce((a: any, c: any) =>[...a, c, ...c.substitute?.concept ? [c.substitute] : [] ], [])
                    .map((drug: any) => {
                        return {
                            label: drug.name,
                            value: drug.concept.concept_id,
                            other: this.regimenComposition
                        }
                    })
                this.$emit('onValue', drugs.length ? drugs : null)
            },
            deep: true
        },
        clear() {
            this.listData.forEach((option) => option.other.drugs.forEach((drug: any) => {
                drug.isChecked = false
                drug.disabled = false
            }))
        }
    },
    computed: {
       regimenComposition() {
            const composition: any = []
            const drugs = this.toDrugs(this.listData).filter((drug: any) => drug.isChecked);
            (drugs||[]).forEach(drug => {
                // Add "/" where drugs are substitutable when substituble drug is already selected
                if (Object.keys(drug.substitute).length > 0) {
                    const abbreviation = `${drug.abbreviation}/${drug.substitute.abbreviation}`
                    const altAbbreviation = `${drug.substitute.abbreviation}/${drug.abbreviation}` 
                    // avoid duplication by checking possible abbreviations 
                    if (!composition.includes(abbreviation) && !composition.includes(altAbbreviation)) {
                        composition.push(abbreviation)
                    }
                } else {
                    // Push as is
                    composition.push(drug.abbreviation)
                }
            })

            return composition.join('-')
       } 
    },
    methods: {
        onCheck(e: any, drug: any) {
            if (drug?.substitute?.abbreviation) {
                this.listData.forEach((option) => {
                    option.other.drugs.forEach((d: any) => {
                        if (drug.abbreviation === d?.substitute?.abbreviation) {
                            d.disabled = e.detail.checked
                        }
                    })
                })
            }
        },
        toDrugs(listData: Option[]) {
            return listData.map((option) => option.other.drugs).flat(1)
        },
        async init() {
            this.$emit('onFieldActivated', this)
            this.listData = await this.options(this.fdata)
        }
    }
})
</script>
<style scoped>
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
</style>