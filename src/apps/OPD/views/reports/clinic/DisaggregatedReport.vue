<template>
    <ion-page>
        <ion-loading :is-open="isLoading" message="Please wait.."/>
        <v2Datatable
            :icon-url="Img('reports.png')"
            title="Clinic Disaggregated Report"
            report-prefix="clinic"
            :subtitle="period"
            :columns="columns"
            :columnData="reportData"
            :rowsPerPage="100" 
            :onConfigure="configure"
            :onRefresh="generate"
            :headerBadge="headerBadge"
        />
    </ion-page>
</template>

<script lang='ts'>
import { IonPage, IonLoading, modalController } from "@ionic/vue"
import { defineComponent, onMounted, ref } from 'vue'
import { v2ColumnInterface, v2TableBadge } from '@/components/DataViews/tables/v2PocDatatable/types';
import { DateSelection } from '@/utils/ReportDateSelectionPrompt';
import { toastDanger, toastWarning } from '@/utils/Alerts';
import { DISAG_INDICATORS, OpdReportService } from "@/apps/OPD/services/opd_report_service";
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import ArtDrilldown from "@/apps/ART/Components/ArtDrilldown.vue";
import Img from "@/utils/Img";
import { informationCircle } from "ionicons/icons"

export default defineComponent({
    components: { 
        IonPage,
        IonLoading,
        v2Datatable
    },
    setup() {
        const reportData = ref<any>([])
        const period = ref('')
        const loadingMessage = ref('')
        const isLoading = ref(false)
        const report = new OpdReportService()
        const headerBadge = ref<v2TableBadge[]>([])
        let reportIndex = 0;

        const drill = async (props: any) => {
            (await modalController.create({
                component: ArtDrilldown,
                backdropDismiss: false,
                cssClass: 'large-modal',
                componentProps: {
                    ...props,
                    subtitle: period.value,
                    onFinish: () => modalController.getTop().then(v => v && modalController.dismiss())
                }
            })).present();
        }

        const toDrillColumn = (label: string, ref: string) => {
            return {
                ref, label,
                defaultValue: "0",
                toValue: (data: any) => data.length,
                tdClick: async (row: any) => {
                    if(row.refData.length) drill({
                        patientIdentifiers: row.refData,
                        title: `${row.data.age_group} ${row.data.gender} ${row.column.label}`,
                    })
                }
            }
        }

        const columns: Array<v2ColumnInterface[]> = [
            [
                { label: "#", ref: "index", toValue: () => ++reportIndex },
                { label: "Age group", ref: 'ageGroup' },
                { label: "Gender", ref: 'gender'},
                ...Object.entries(DISAG_INDICATORS).map(([ref, label]) => {
                    return toDrillColumn(label, ref)
                }),
            ]
        ]
    
        const generate = async () => {
            if (!(report.startDate && report.endDate)) return toastWarning(
                'Start date and end date required!'
            )
            isLoading.value = true
            try {
                reportData.value = await report.getDisaggReport();
            } catch (e) {
                console.error(e)
                const msg = "Unable to generate report!"
                toastDanger(msg)
                headerBadge.value = [{
                    text: msg,
                    color: "danger",
                    icon: informationCircle,
                    action: function() {
                        headerBadge.value = [{
                            text: `Exception occured: <b>${e}</b>`,
                            color: "danger",
                            icon: informationCircle
                        }]
                    }
                }]
            }
            isLoading.value = false
            loadingMessage.value = ''
        }

        const configure = () => DateSelection({
            onFinish: (sDate: string, eDate: string, periodstr: string) => {
                period.value = periodstr
                report.startDate = sDate
                report.endDate = eDate
                generate()
            }
        })

        onMounted(() => configure())

        return {
            Img,
            headerBadge,
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