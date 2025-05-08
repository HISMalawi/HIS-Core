<template>
    <ion-page> 
        <ion-header> 
            <ion-toolbar> 
                <ion-title class="his-lg-text"> 
                    Drug Set
                </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <view-port> 
                <ion-grid style="background-color: white;" class="view-port-content">
                    <ion-row> 
                        <ion-col size="4"> 
                            <ion-list> 
                                <ion-item class="his-sm-text"
                                    button
                                    detail
                                    :color="selectedDrugSet.id === dataSet.id ? 'lightblue': ''"
                                    v-for="(dataSet, dIndex) in drugSets" 
                                    @click="selectedDrugSet=dataSet"
                                    :key="dIndex"> 
                                    <ion-label> {{ dataSet.name }}</ion-label>
                                </ion-item>
                            </ion-list>
                        </ion-col>
                        <ion-col size="8"> 
                            <report-data-table
                                :columns="drugSetColumns"
                                :rows="drugSetRows"
                                :config="{
                                    tableCssTheme: 'art-report-theme'
                                }"
                            > </report-data-table>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </view-port>
        </ion-content>
        <ion-footer> 
            <ion-toolbar color="dark"> 
                <ion-button
                    @click="cancel"
                    slot="start" 
                    color="danger" 
                    size="large"> 
                    Cancel
                </ion-button>
                <ion-button v-if="hasSelectedDrugSet" 
                    @click="voidDrugset"
                    slot="end" 
                    color="danger" 
                    size="large"> 
                    Void Drug Set
                </ion-button>
                <ion-button 
                    @click="addDrugset"
                    slot="end" 
                    color="success" 
                    size="large"> 
                    Add Drug Set 
                </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import ViewPort from "@/components/DataViews/ViewPort.vue"
import ReportDataTable from "@/components/DataViews/tables/ReportDataTable.vue"
import Table from "@/components/DataViews/tables/ReportDataTable"
import {
    IonPage,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonContent,
    IonHeader,
    IonGrid,
    IonRow,
    IonCol,
    IonTitle,
    IonFooter,
    IonToolbar
} from "@ionic/vue"
import { AncDrugSetService, NewDrugSet } from '../../Services/anc_drug_set'
import { isEmpty } from 'lodash'
import { useRouter } from 'vue-router'
import { alertConfirmation, toastWarning } from '@/utils/Alerts'

export default defineComponent({
    components: {
        IonPage,
        ReportDataTable,
        IonList,
        IonItem,
        IonLabel,
        ViewPort,
        IonButton,
        IonContent,
        IonHeader,
        IonGrid,
        IonRow,
        IonCol,
        IonTitle,
        IonFooter,
        IonToolbar
    },
    setup() {
        const router = useRouter()
        const selectedDrugSet = ref({} as NewDrugSet) 
        const drugSets = ref([] as NewDrugSet[])
        const drugSetColumns = [
            [
                Table.thTxt('Drug'),
                Table.thTxt('Duration in days'),
                Table.thTxt('Frequency')
            ]
        ]
        const hasSelectedDrugSet = computed(() => {
            return !isEmpty(drugSets.value)
        })
        const drugSetRows = computed(() => {
            return selectedDrugSet.value?.drugs?.map(drugSet => [
                Table.td(drugSet['drug_name'] || 'N/A'),
                Table.td(drugSet.duration || 'N/A'),
                Table.td(drugSet.frequency)
            ]) || []
        })
        onMounted(async () => {
            drugSets.value = await AncDrugSetService.getDrugSets() as NewDrugSet[]
            if (!isEmpty(drugSets.value)) {
                selectedDrugSet.value = drugSets.value[0]
            }
        })

        function cancel() {
            router.back()
        }

        function addDrugset() {
            router.push({
                name: 'add anc drugset'
            })
        }

        async function voidDrugset() {
            if((await alertConfirmation('Are you sure you want to void this drug set?'))){
                try {
                    await AncDrugSetService.voidDrugSet(selectedDrugSet.value.id || -1)
                    drugSets.value = drugSets.value.filter(d => d.id != selectedDrugSet.value.id)
                    if (!isEmpty(drugSets.value)) {
                        selectedDrugSet.value = drugSets.value[0]
                    } else {
                        selectedDrugSet.value = {} as any
                    }
                } catch (e) {
                    toastWarning(`e`)
                }
            }
        }
        return {
            cancel,
            addDrugset,
            voidDrugset,
            drugSets,
            hasSelectedDrugSet,
            selectedDrugSet,
            drugSetColumns,
            drugSetRows
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