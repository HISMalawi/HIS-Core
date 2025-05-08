<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title class="his-lg-text">
                    <ion-text color="danger">{{npid}}</ion-text> Merge history
                </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-title class="his-md-text his-card">NPID Holder: </ion-title>
            <ion-list>
                <ion-item lines="none" class="his-md-text"> 
                    <ion-label> 
                        Person name
                    </ion-label>
                    <b>{{holderName}}</b>
                </ion-item>
                <ion-item lines="none" class="his-md-text" v-for="(item, index) in patientInfo" :key="index"> 
                    <ion-label>
                        {{item.label}}:
                    </ion-label>
                    <b>{{item.value}}</b>
                </ion-item>
            </ion-list>
            <ion-title class="his-md-text his-card">Transactions:</ion-title>
            <report-table :config="{ tableCssTheme: 'art-report-theme'}" :columns="columns" :rows="rows"></report-table>
        </ion-content>
        <ion-footer> 
            <ion-toolbar color="dark">
                <ion-button 
                    @click="cancel"
                    color="danger" 
                    size="large" 
                    slot="start"> 
                    Cancel 
                </ion-button>
                <ion-button 
                    @click="rollback"
                    :disabled="!isReversible" 
                    color="success" 
                    size="large" 
                    slot="end"> 
                    Reverse
                </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import {
    IonPage,
    IonContent,
    IonToolbar,
    IonHeader,
    IonFooter,
    IonTitle,
    IonList,
    IonItem,
    IonText,
    IonLabel,
    IonButton
} from "@ionic/vue"
import ReportTable from "@/components/DataViews/tables/ReportDataTable.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { MergingService, MergeHistory } from "@/services/merging_service"
import { Option } from '@/components/Forms/FieldInterface'
import { useRoute, useRouter } from 'vue-router'
import { alertConfirmation, toastDanger } from '@/utils/Alerts'
import HisDate from "@/utils/Date"

export default defineComponent({
    components: {
        IonText,
        IonPage,
        IonContent,
        IonToolbar,
        IonHeader,
        IonFooter,
        IonTitle,
        IonList,
        IonItem,
        IonLabel,
        IonButton,
        ReportTable
    },
    setup() {
        const route = useRoute()
        const router = useRouter()
        const patientID = ref(-1)
        const rows = ref([] as any)
        const results = ref([] as MergeHistory[])
        const npid = `${route.params.id}`.toUpperCase() as string
        const holderName = ref('N/A' as string)
        const patientInfo = ref([
            { label: 'Birthdate', value: 'N/A'},
            { label: 'Gender', value: 'N/A'},
        ] as Option[])
        const columns = [
            [
                table.thTxt('Merge type'),
                table.thTxt('Merge date'),
                table.thTxt('First Name'),
                table.thTxt('Last name'),
                table.thTxt('Birthdate'),
                table.thTxt('Gender'),
            ]
        ]

        const isReversible = computed(() => results.value.length > 0)

        onMounted(async () => {
            if (!npid) {
                router.back()
                return
            }
            try {
                results.value = (await MergingService.getMergeHistory(npid) || [])
            } catch (e) {
                toastDanger(`Merge history not found for ${npid}`)
            }
            rows.value = results.value.map((item: MergeHistory) => {
                if (patientID.value === -1) {
                    patientID.value = item['secondary_id']
                    holderName.value =`${item['secondary_first_name']} ${item['secondary_surname']}`
                    patientInfo.value = [
                        { label: 'Birthdate', value: HisDate.toStandardHisDisplayFormat(
                            item['secondary_birthdate']
                        )},
                        { label: 'Gender', value: item['secondary_gender']},
                    ]
                }
                return [
                    table.td(item['merge_type']),
                    table.tdDate(item['merge_date']),
                    table.td(item['primary_first_name']),
                    table.td(item['primary_surname']),
                    table.tdDate(item['primary_birthdate']),
                    table.td(item['primary_gender'])
                ]
            })
        })

        function cancel() {
            router.back()
        }

        async function rollback() {
            if ((await alertConfirmation('Are you sure you want to merge transactions'))) {
                if ((await MergingService.rollback(patientID.value))) {
                    router.back()
                } else {
                    toastDanger('Failed to rollback')
                }
            }
        }

        return {
            cancel,
            holderName,
            isReversible,
            patientInfo,
            rollback,
            columns,
            rows,
            npid
        }
    }
})
</script>
<style scoped>
.his-card {
    margin: auto !important;
    padding: 0.6em;
}
</style>
