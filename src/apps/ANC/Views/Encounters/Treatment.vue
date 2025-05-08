<template>
    <ion-page> 
        <ion-header> 
            <ion-toolbar> 
                <ion-title class="his-lg-text">Treatment</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-grid> 
                <ion-row style="height:50vh;" class="his-card section drug-section-style">
                    <ion-col> 
                        <table> 
                            <thead> 
                                <tr class="his-sm-text"> 
                                    <th>Drug</th>
                                    <th>Frequency</th>
                                    <th>Duration</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody> 
                                <tr v-for="(drug, drugIndex) in activeDrugs" :key="drugIndex"> 
                                    <td>
                                        <ion-input
                                            readonly
                                            @click="editDrugName(drug)"
                                            :value="drug.drug_name"
                                            placeholder="Add drug"
                                            class="his-sm-text dosage-input"
                                        />
                                    </td>
                                    <td> 
                                        <ion-input 
                                            readonly
                                            @click="editDrugFrequency(drug)"
                                            :value="drug.frequency"
                                            class="his-sm-text dosage-input"
                                            placeholder="Add frequency.."
                                        /> 
                                    </td>
                                    <td> 
                                        <ion-input
                                            readonly
                                            @click="editDrugDuration(drug)"
                                            :value="drug.duration"
                                            placeholder="Add duration.."
                                            class="dosage-input his-sm-text"
                                        >
                                            <ion-button slot="end" fill="none" disabled="true">{{ getDurationUnit(drug) }}</ion-button>
                                        </ion-input> 
                                    </td>
                                    <td> 
                                        <ion-row> 
                                            <ion-col size="6" v-if="drugIndex + 1 >= activeDrugs.length"> 
                                                <ion-button
                                                    :disabled="!(drug.id && drug.frequency && drug.duration)"
                                                    @click="activeDrugs.push(defaultDrugObj())" 
                                                    class="his-md-text"
                                                    style="width:100%"
                                                    color="success"> 
                                                    <ion-icon :icon="add"/>
                                                    Add
                                                </ion-button>
                                            </ion-col>
                                            <ion-col size="6" v-if="drugIndex + 1 < activeDrugs.length || (drugIndex !=0 && drugIndex +1 >= activeDrugs.length)"> 
                                                <ion-button
                                                    @click="activeDrugs.splice(drugIndex, 1)"
                                                    class="his-lg-text"
                                                    style="width:100%"
                                                    color="danger">
                                                    <ion-icon :icon="trashBin"/>
                                                </ion-button>
                                            </ion-col>
                                        </ion-row>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </ion-col>
                </ion-row>
            </ion-grid>
            <ion-list style="height:29vh;" class="his-card section">
                <ion-item class="his-md-text"
                    detail
                    @click="appendDrugSetValues(dset)" 
                    button v-for="(dset, dindex) in drugSets" 
                    :key="dindex"> 
                    <ion-label>{{dset.label}} ({{dset.value}})</ion-label>
                </ion-item>
            </ion-list>
        </ion-content>
        <ion-footer> 
            <ion-toolbar color="dark">
                <ion-button :router-link="cancelDestination" slot="start" size="large" color="danger">
                    Cancel
                </ion-button>
                <ion-button @click="clear" slot="end" size="large" color="warning"> 
                    Clear
                </ion-button>
                <ion-button :disabled="isSubmitting" @click="onFinish" slot="end" size="large" color="success"> 
                    Finish
                </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
    IonHeader,
    IonLabel,
    IonPage,
    IonContent,
    IonTitle,
    IonRow,
    IonGrid,
    IonIcon,
    IonInput,
    IonCol,
    IonFooter,
    IonToolbar,
    IonButton,
} from "@ionic/vue"
import { Option } from '@/components/Forms/FieldInterface'
import EncounterMixinVue from '@/views/EncounterMixin.vue'
import { AncTreatmentService, AncTreatmentDrugObject, DRUG_FREQUENCIES } from '../../Services/anc_treatment_service'
import { FieldType } from "@/components/Forms/BaseFormElements"
import Validation from "@/components/Forms/validations/StandardValidations"
import { DrugService } from '@/services/drug_service'
import { alertConfirmation, toastWarning } from '@/utils/Alerts'
import {
    add,
    trashBin
} from "ionicons/icons";
import { AncDrugSetService } from '../../Services/anc_drug_set'
import popupKeyboard from '@/utils/PopupKeyboard'
import { printAncVisitLbl } from '../../Labels'

export default defineComponent({
    components: {
        IonHeader,
        IonIcon,
        IonRow,
        IonLabel,
        IonGrid,
        IonCol,
        IonPage,
        IonContent,
        IonTitle,
        IonInput,
        IonButton,
        IonFooter,
        IonToolbar
    },
    mixins: [EncounterMixinVue],
    setup() {
        return {
            add,
            trashBin
        }
    },
    data: () => ({
        activeDrugs: [] as AncTreatmentDrugObject[],
        drugSets: [] as any,
        defaultDrugs: [] as any,
        isSubmitting: false as boolean,
        service: {} as any
    }),
    computed: {
        selectedDrugNames(): string[] {
            return this.activeDrugs.map((d: any) => d.drug_name || '')
        }
    },
    watch: {
        ready: {
            async handler(ready: boolean) {
                this.activeDrugs = [this.defaultDrugObj()]
                if (ready) {
                    this.service = new AncTreatmentService(this.patientID, this.providerID)
                    this.drugSets = (await AncDrugSetService.getDrugSets())
					.map((d: any) => ({
                        label: d.name,
                        value: d.description,
                        other: {
                            drugs: d.drugs
                        }
                    }))
                    this.defaultDrugs = await DrugService.getDrugs({'page_size': 50})
                }
            },
            immediate: true
        }
    },
    methods: {
        printVisitSummary() {
            return printAncVisitLbl(this.patientID);
        },
        async onFinish() {
            if (this.formIsEmpty()) {
                if ((await alertConfirmation('Do you want to proceed without prescribing drugs?'))) {
                    await this.service.createEncounter()
                    await this.service.saveValueCodedObs('Medication received at vist', 'No')
                    await this.printVisitSummary()
                    this.nextTask()
                }
                return
            }
            if (!this.formIsComplete()) {
                return toastWarning('Please complete the form')
            }
            this.isSubmitting = true
            try {
                await this.service.submitTreatment(this.activeDrugs)
                await this.printVisitSummary()
                return this.nextTask()
            } catch (e) {
                toastWarning(`${e}`)
                console.error(e)
            }
            this.isSubmitting = false
        },
        getDurationUnit(drug: AncTreatmentDrugObject){
            if(/week/i.test(drug.frequency)) return "week(s)";
            if(/month/i.test(drug.frequency)) return "month(s)";
            return "day(s)"
        },
        defaultDrugObj() {
            return {
                'id': 0,
                'drug_name': '',
                'dose': '',
                'duration': 0,
                'frequency': '',
                'units': ''
            }
        },
        formIsComplete() {
            return this.activeDrugs.every(d => d.id && d.duration && d.frequency)
        },
        formIsEmpty() {
            return this.activeDrugs.length === 1 && this.activeDrugs[0].drug_name === ''
                && this.activeDrugs[0].duration === 0 && this.activeDrugs[0].frequency === '' 
        },
        appendDrugSetValues(drugSet: any) {
            const drugs = drugSet.other.drugs.reduce((a: any, c: any) => a.concat(c), [])
            if (this.activeDrugs.length === 1 && !this.activeDrugs[0].id){
                this.activeDrugs = drugs
            } else {
                this.activeDrugs = this.activeDrugs.concat(
                    drugs.filter((d: any) => !this.selectedDrugNames.includes(d.drug_name))
                )
            }
        },
        editDrugName(drugItem: any) {
            popupKeyboard({
                id: 'new_drug',
                helpText: 'Add drug to prescribe',
                type: FieldType.TT_SELECT,
                defaultValue: () => drugItem.drug_name,
                validation: (v: Option) => this.validateSeries([
                    () => Validation.required(v),
                    () => {
                        if (this.selectedDrugNames.includes(v.label)) {
                            return ['Drug already added']
                        } else {
                            return null
                        }
                    }
                ]),
                options: async (_: any, filter: string) => {
                    let drugs: any = []
                    if (filter) {
                        drugs = await DrugService.getDrugs({
                           'page_size': 50,
                           'name': filter
                       })
                    } else {
                        drugs = this.defaultDrugs
                    }
                    return drugs.map((d: any) => ({
                        label: d.name,
                        value: d.drug_id,
                        other: {
                            dose: d.dose_strength,
                            units: d.units
                        }
                    }))
                },
                config: {
                    showKeyboard: true,
                    isFilterDataViaApi: true
                }
            }, 
            (data: Option) => {
                drugItem['id'] = data.value
                drugItem['drug_name'] = data.label
                drugItem['dose'] = data.other.dose
                drugItem['units'] = data.other.units
            })
        },
        editDrugFrequency(drug: AncTreatmentDrugObject) {
            popupKeyboard({
                id: 'frequency',
                helpText: `Edit drug frequency for ${drug.drug_name}`,
                type: FieldType.TT_SELECT,
                defaultValue: () => drug.frequency,
                validation: (v: Option) => Validation.required(v),
                options: () =>  this.mapStrToOptions(Object.keys(DRUG_FREQUENCIES))
            },
            (v: Option) => {
                drug.frequency = v.label as string
            })
        },
        editDrugDuration(drug: AncTreatmentDrugObject) {
            popupKeyboard({
                id: 'duration',
                helpText: `Edit duration of ${drug.drug_name} in days`,
                type: FieldType.TT_NUMBER,
                defaultValue: () => drug.duration,
                validation: (v: Option) => Validation.required(v)
            }, 
            (v: Option) => {
                drug.duration = v.value as number
            })
        },
        async clear() {
            const ok = await alertConfirmation('Are you sure you want to clear all drugs?')
            if (ok) {
                this.activeDrugs = [this.defaultDrugObj()]
            }
        },
    }
})
</script>
<style scoped>
    .dosage-input {
        text-align: center;
        border: solid 1px #ccc;
        height: 50px;
        width: 100%;
        background-color: rgb(252, 252, 241);  
    }
    table {
        width: 100%;
    }
    .drug-section-style {
        padding: 0;
        background: #f6f2ca;
    }
    td, th {
        border: solid 1px rgba(131, 131, 131, 0.2);
    }
    th {
        padding: 0.2em;
    }
    td {
        padding: 0.2em;
    }
    .section {
        margin-top: 10px;
        overflow-y: scroll;
    }
</style>
