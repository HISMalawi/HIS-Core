<template>
    <ion-page>
        <v2Datatable
            :title="title"
            :subtitle="subtitle"
            :columnData="reportData"
            :columns="columns"
            :on-finish="onFinish"
            :rowsPerPage="ITEMS_PER_PAGE"
        />
    </ion-page>
</template>
<script lang="ts">
import { defineComponent, ref, PropType, watch } from 'vue';
import { IonPage } from "@ionic/vue"
import  v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { v2ColumnDataInterface, v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { useRouter } from "vue-router"
import { chunk } from 'lodash';
import { delayPromise } from '@/utils/Timers';
import { Patientservice } from '@/services/patient_service';
import { toDate } from '@/utils/Strs';

const ITEMS_PER_PAGE = 20
export default defineComponent({ 
    props: {
        title: {
            type: String,
            default: 'Drilldown'
        },
        patientIdentifiers: {
            type: Object as PropType<number[]>
        },
        onFinish: {
            type: Function
        }
    },
    components: {
        IonPage,
        v2Datatable
    },
    setup(props) {
        const subtitle = ref('-')
        const reportData = ref<any>([])
        const router = useRouter()
        const columns: Array<v2ColumnInterface[]> = [
            [
                {
                    label: 'National ID',
                    ref: 'national_id'
                },
                {
                    label: 'First name',
                    ref: 'given_name'
                },
                {
                    label: 'Last name',
                    ref: 'family_name'
                },
                {
                    label: 'Birthdate',
                    ref: 'birthdate'
                },
                {
                    label: 'Action',
                    ref: 'patient_id',
                    exportable: false,
                    tdClick: ({data}: v2ColumnDataInterface) => router.push({ path: `/patient/dashboard/${data.patient_id}`}) ,
                    value: () => 'View client'
                }
            ]
        ]
        
        watch(() => props.patientIdentifiers, async (data) => {
            reportData.value = []
            subtitle.value = `Total: 0`
            if (!(data && data.length)) return
            const backlog = chunk(data, ITEMS_PER_PAGE)
            for(const log of backlog) {
                for (const id of log) {
                    try {
                        const patient = new Patientservice((await Patientservice.findByID(id)))
                        reportData.value.push({
                            'patient_id': patient.getID(),
                            'national_id': patient.getNationalID(),
                            'given_name': patient.getGivenName(),
                            'family_name': patient.getFamilyName(),
                            'birthdate': toDate(patient.getBirthdate())
                        })
                    } catch (e) {
                        console.error(e)
                        reportData.value.push({})
                    }
                    subtitle.value = `Total: ${reportData.value.length} of ${(data||[]).length}`
                }
                await delayPromise(500)
            }
        }, { immediate: true })

        return  {
            columns,
            subtitle,
            reportData,
            ITEMS_PER_PAGE
        }
    }
})
</script>