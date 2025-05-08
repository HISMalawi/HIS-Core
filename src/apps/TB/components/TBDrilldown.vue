<template>
    <ion-page>
        <v2Datatable
            :title="title"
            :subtitle="subtitle"
            :columnData="reportData"
            :columns="columns"
            :on-finish="runFinishAction"
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
import { formatGender, toDate } from '@/utils/Strs';
import { PersonService } from '@/services/person_service';

const ITEMS_PER_PAGE = 25
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
        const canLoadData = ref(true)
        const subtitle = ref('-')
        const reportData = ref<any>([])
        const router = useRouter()
        const columns: Array<v2ColumnInterface[]> = [
            [
                { label: 'TB Number', ref: 'identifier' },
                { label: 'Name', ref: 'name' },
                { label: 'Gender', ref: 'gender' },
                { label: 'Age', ref: 'age' },
                {
                    label: 'Action',
                    ref: 'patient_id',
                    exportable: false,
                    tdClick: ({data}: v2ColumnDataInterface) => router.push({ path: `/patient/dashboard/${data.person_id}`}) ,
                    value: () => 'View client'
                }
            ]
        ]
        
        function runFinishAction() {
            canLoadData.value = false;
            if (typeof props.onFinish === 'function') props.onFinish()
        }

        watch(() => props.patientIdentifiers, async (data) => {
            reportData.value = []
            subtitle.value = `Total: 0`
            if (!(data && data.length)) return
            const backlog = chunk(data, 1000)
            for(const log of backlog) {
                try {
                    if (!canLoadData.value) break;
                    const res = (await PersonService.getTBPersons(log as number[]))
                        .map((data: any) => ({
                            ...data, 
                            birthdate: toDate(data.birthdate), 
                            gender: formatGender(data.gender)
                        }))
                    reportData.value = [...reportData.value, ...res]
                } catch (e) {
                    console.error(e)
                }
                subtitle.value = `Total: ${reportData.value.length} of ${(data||[]).length}`
                await delayPromise(100)
            }
        }, { immediate: true })

        return  {
            columns,
            subtitle,
            reportData,
            canLoadData,
            ITEMS_PER_PAGE,
            runFinishAction
        }
    }
})
</script>