<template>
    <ion-page>
        <v2Datatable
            title="VL Collection"
            default-sort-order="asc" 
            default-sorted-column="identifier"
            :subtitle="period"
            :columns="columns"
            :columnData="reportData"
            :rowsPerPage="50"
            :onConfigure="configure"
            :onRefresh="() => generate()"
            report-prefix="Clinic"
        />
    </ion-page>
</template>

<script lang='ts'>
import { IonPage } from "@ionic/vue"
import { computed, defineComponent, onMounted, ref } from 'vue'
import  v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { ViralLoadReportService } from "@/apps/ART/services/reports/viral_load_report";
import { DateSelection } from '@/utils/ReportDateSelectionPrompt';
import { toastWarning } from '@/utils/Alerts';
import { formatGender, toDate } from "@/utils/Strs";
import ApiStore from "@/composables/ApiStore";
import { addArvColumn, addViewPatientColumn, wrapGeneration } from "@/utils/v2utils";

export default defineComponent({
    components: { 
        IonPage,
        v2Datatable
    },
    setup() {
        const reportData = ref([])
        const period = ref('')
        const isLoading = ref(false)
        const report = new ViralLoadReportService()
        const filingNumberEnabled = ref(false);
        const columns: any = computed(() => [[
            filingNumberEnabled.value 
                ? { label: "Filing#", ref: 'identifier' }
                : addArvColumn("identifier"),
            {
                label: "First name",
                ref: 'given_name',
                exportable: false
            },
            {
                label: "Last name",
                ref: 'family_name',
                exportable: false
            },
            {
                label: "Gender",
                ref: 'gender',
                toValue: (val: any) => formatGender(val)
            },
            {
                label: "DOB",
                ref: 'birthdate',
                toValue: (val: any) => toDate(val)
            },
            {
                label: "Date of VL Order",
                ref: 'order_date',
                toValue: (val: any) => toDate(val)
            },
            addViewPatientColumn()
        ]])
        
        const generate = () => wrapGeneration(async() => {
            if (!(report.startDate && report.endDate))  {
                return toastWarning('Start date and end date required!')
            }
            reportData.value = []
            reportData.value = await report.getVlCollection()
        })

        /**
         * Loads a dialogue to allow users to configure start and end date
         */
         const configure = () => DateSelection({
            onFinish: (sDate: string, eDate: string, periodstr: string, occupation: string) => {
                if (occupation) report.setOccupation(occupation)
                period.value = `${periodstr}`
                report.startDate = sDate
                report.endDate = eDate
                generate()
            }
        })

        /**
         * Initialization code when the report is empty!
        */
        onMounted(() => {
            ApiStore.get("IS_ART_FILING_NUMBER_ENABLED")
                    .then(isEnabled => filingNumberEnabled.value = isEnabled)
                    
            !reportData.value.length && configure()
        })

        return {
            reportData,
            isLoading,
            configure,
            generate,
            columns,
            period
        }
    }
})
</script>
