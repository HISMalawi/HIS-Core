<template>
    <ion-page>
        <ion-loading :is-open="isLoading" message="Please wait.."/>
        <v2Datatable
            :icon-url="Img('login-logos/PEPFAR.png')"
            title="PEPFAR Disaggregated Report"
            report-prefix="Pepfar"
            :subtitle="period"
            :columns="columns"
            :columnData="reportData"
            :rowsPerPage="100" 
            :onConfigure="configure"
            :onRefresh="onRegenerate"
            :headerBadge="headerBadge"
        />
    </ion-page>
</template>

<script lang='ts'>
import { IonPage, IonLoading, modalController } from "@ionic/vue"
import { defineComponent, onMounted, ref } from 'vue'
import { v2ColumnInterface, v2TableBadge } from '@/components/DataViews/tables/v2PocDatatable/types';
import { DateSelection } from '@/utils/ReportDateSelectionPrompt';
import { alertConfirmation, toastDanger, toastWarning } from '@/utils/Alerts';
import { DisaggregatedReportService } from "@/apps/ART/services/reports/disaggregated_service"
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import ArtDrilldown from "@/apps/ART/Components/ArtDrilldown.vue";
import { REGIMENS } from "@/apps/ART/services/reports/regimen_report_service";
import Img from "@/utils/Img";
import { barChart, informationCircle } from "ionicons/icons"
import { formatGender } from "@/utils/Strs";

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
        const report = new DisaggregatedReportService()
        const headerBadge = ref<v2TableBadge[]>([])

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
                { label: "#", ref: "index" },
                { label: "Age group", ref: 'age_group' },
                { label: "Gender", ref: 'gender' },
                toDrillColumn("TX curr (receiving ART)", "tx_curr"),
                ...REGIMENS.map((regimen: string) => toDrillColumn(regimen, regimen)),
                toDrillColumn("Unknown", "N/A"),
                toDrillColumn("Total (regimen)", "total")
            ]
        ]

        const onRegenerate = async () => generate(
            (await alertConfirmation("Do you want to rebuild report?"))
        )
    
        const generate = async (rebuild=false) => {
            if (!(report.startDate && report.endDate)) return toastWarning(
                'Start date and end date required!'
            )
            isLoading.value = true
            try {
                headerBadge.value = []
                reportData.value = []
                const data: any = (await report.getDisaggReport(rebuild, 'pepfar'))
                    .reduce((a: any, c: any) => {
                        if (/unknown/i.test(c.age_group)) {
                            return a
                        }
                        const gender = `${c.gender}`.toUpperCase()
                        if (a[gender]) {
                            a[gender].push({...c, gender: formatGender(c.gender) })
                        }
                        if (['M', 'F'].includes(gender) && !/all/i.test(c.age_group)) {
                            a.totalAlive = [...a.totalAlive, ...c.tx_curr]
                        }
                        return a
                    }, { M: [], F: [], FP: [], FBF: [], FNP: [], totalAlive: []})

                    reportData.value = [...data.F, ...data.M, ...data.FP, ...data.FNP, ...data.FBF].map(
                        (d:any, i: number) => ({ index: i+1, ...d })
                    )
                headerBadge.value = [{
                    text: `Total alive and on ART: <b>${data.totalAlive.length}</b>`, 
                    icon: barChart,
                    color: "primary",
                    action: () => drill({
                        patientIdentifiers: data.totalAlive,
                        title: `Total alive and on ART: ${data.totalAlive.length}`,
                    })
                }]
            } catch (e) {
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

        const configure = (rebuildCaches=false) => DateSelection({
            onFinish: (sDate: string, eDate: string, periodstr: string, occupation: string) => {
                period.value = periodstr
                report.startDate = sDate
                report.endDate = eDate
                if (occupation) report.setOccupation(occupation)
                report.setQuarter('pepfar')
                generate(rebuildCaches)
            }
        })

        onMounted(() => configure(false))

        return {
            Img,
            onRegenerate,
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
