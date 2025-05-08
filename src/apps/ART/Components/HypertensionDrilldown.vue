<template>
    <ion-page>
        <v2Datatable
            :title="title"
            :columnData="patients"
            :columns="columns"
            :on-finish="onFinish"
            icon-url="/assets/images/folder.png"
            :rowsPerPage="ITEMS_PER_PAGE"
        />
    </ion-page>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage } from "@ionic/vue"
import  v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { v2ColumnDataInterface, v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { useRouter } from "vue-router"
import { formatGender, toDate } from '@/utils/Strs';

export default defineComponent({
    components: {
        v2Datatable,
        IonPage
    },
    props: {
        title: String,
        patients: Array,
        onFinish: Function
    },
    setup() {
        const ITEMS_PER_PAGE = 20;
        const router = useRouter()
        const columns: Array<v2ColumnInterface[]> = [[
            {
                label: 'ARV Number',
                ref: 'arv_number'
            },
            {
                label: 'Gender',
                ref: 'gender',
                value: (data: any) => formatGender(data.gender)
            },
            {
                label: 'Systolic/Diastolic',
                ref: 'diastolic',
                value: (data) => `${data.systolic}/${data.diastolic}`
            },
            {
                label: 'Art start date',
                ref: 'art_start_Date',
                value: (data) => toDate(data.art_start_date)
            },
            {
                label: 'Action',
                ref: 'patient_id',
                exportable: false,
                tdClick: ({data}: v2ColumnDataInterface) => router.push({ path: `/patient/dashboard/${data.patient_id}`}) ,
                value: () => 'View client'
            }
        ]]
        return {
            ITEMS_PER_PAGE,
            columns
        }
    }
})
</script>