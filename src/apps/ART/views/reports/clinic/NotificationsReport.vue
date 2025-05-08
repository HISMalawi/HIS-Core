<template>
    <ion-page>
        <v2Datatable
            title="Notification logs"
            :subtitle="subtitle"
            :columnData="data"
            default-sort-order="asc" 
            default-sorted-column="arv_number"
            :columns="columns"
            :on-finish="onFinish"
            :on-refresh="generate"
            :on-configure="configure"
            :rowsPerPage="20" 
            report-prefix="Clinic"
        />
    </ion-page>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { IonPage } from "@ionic/vue"
import  v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { NotificationService } from "@/services/notification_service"
import router from '@/router';
import { DateSelection } from '@/utils/ReportDateSelectionPrompt';
import { addArvColumn, addViewPatientColumn, wrapGeneration } from '@/utils/v2utils';

export default defineComponent({ 
    components: {
        IonPage,
        v2Datatable
    },
    setup() {
        const subtitle = ref('-')
        const data = ref<any[]>([])
        const startDate = ref<string>('')
        const endDate = ref<string>('')
        const columns: Array<v2ColumnInterface[]> = [
            [
                addArvColumn("arv_number", "ARV Number"),
                { label: 'Date ordered', ref: 'date_ordered' },
                { label: 'Ordered By', ref: 'ordered_by' },
                { label: 'Date of result', ref: 'result_date' },
                addViewPatientColumn()
            ]
        ]

        const generate = () => wrapGeneration(async () => {
            data.value = await NotificationService.getlogs(startDate.value, endDate.value)
        })

        /**
         * Loads a dialogue to allow users to configure start and end date
         */
         const configure = () => DateSelection({
            onFinish: (sDate: string, eDate: string, periodstr: string) => {
                startDate.value = sDate
                endDate.value = eDate
                subtitle.value = `${periodstr}`
                generate()
            }
        })

        onMounted(() => {
            configure()
        })

        const onFinish = () => router.push('/')

        return  {
            data,
            columns,
            subtitle,
            configure,
            generate,
            onFinish
        }
    }
})
</script>