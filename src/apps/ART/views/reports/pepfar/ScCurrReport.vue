<template>
    <ion-page>
        <ion-loading :is-open="isLoading" message="Please wait..."/>
        <v2Datatable
            title="Sc Curr"
            :icon-url="Img('login-logos/PEPFAR.png')"
            :subtitle="period"
            :columns="columns"
            :columnData="reportData"
            :rowsPerPage="20"
            :onConfigure="configure"
            :onRefresh="() => generate()"
            reportPrefix="PEPFAR"
        />
    </ion-page>
</template>

<script lang='ts'>
import { IonPage, IonLoading, modalController } from "@ionic/vue"
import { defineComponent, onMounted, ref } from 'vue'
import  v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { StockReportService } from "@/apps/ART/services/reports/stock_report_service"
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { DateSelection } from '@/utils/ReportDateSelectionPrompt';
import { toastDanger, toastWarning } from '@/utils/Alerts';
import DrillTable from "@/components/DataViews/DrillTableModal.vue"
import { toNumString } from "@/utils/Strs";
import Img from "@/utils/Img";

export default defineComponent({
    components: { 
        IonPage,
        IonLoading,
        v2Datatable
    },
    setup() {
        const reportData = ref([])
        const period = ref('')
        const isLoading = ref(false)
        const report = new StockReportService()
        const columns: Array<v2ColumnInterface[]> = [
            [
                {
                    label: "#",
                    ref: "index"
                },
                {
                    label: "ARV drug category",
                    ref: 'category'
                },
                {
                    label: "# of bottles (units) remaining",
                    ref: 'units',
                    value: (data: any) => toNumString(data.units),
                    tdClick: async (val: any) => {
                        (await modalController.create({
                            component: DrillTable,
                            cssClass: 'custom-modal',
                            componentProps: {
                                title: val.data.category,
                                columns: ['Drug', 'Quantity'],
                                onRows: () => (val.data?.granular_spec||[]).map((data: any) => {
                                    return [data.drug_name, toNumString(data.units)]
                                })
                            }
                        })).present()
                    }
                }
            ]
        ]

        /**
         * Generates report by start date and end date
         */
         const generate = async () => {
            if (!(report.startDate && report.endDate))  {
                return toastWarning('Start date and end date required!')
            }
            isLoading.value = true
            reportData.value = []
            try {
                reportData.value = (await report.getScCurrReport()).map((
                    data: any, index: number) => ({...data, index: index+1})
                )
            } catch (e) {
                toastDanger("Unable to generate report!")
            }
            isLoading.value = false
        }

        /**
         * Loads a dialogue to allow users to configure start and end date
         */
         const configure = () => DateSelection({
            onFinish: (sDate: string, eDate: string, periodstr: string) => {
                period.value = periodstr
                report.startDate = sDate
                report.endDate = eDate
                generate()
            }
        })

        /**
         * Initialization code when the report is empty!
        */
        onMounted(() => !reportData.value.length && configure())

        return {
            Img,
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
