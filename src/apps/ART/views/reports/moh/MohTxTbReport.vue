<template>
    <ion-page>
        <ion-loading :is-open="isLoading" message="Please wait..."/>
        <v2Datatable
            title="Tx TB Report"
            :icon-url="Img('login-logos/Malawi-Coat_of_arms_of_arms.png')"
            :subtitle="period"
            :columns="columns"
            :columnData="reportData"
            :rowsPerPage="100" 
            :onConfigure="configure"
            :onRefresh="onRefreshReport"
            report-prefix="MOH"
        />
    </ion-page>
</template>
<script lang='ts'>
import { IonPage, IonLoading, modalController } from "@ionic/vue"
import { defineComponent, onMounted, ref } from 'vue'
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { DateSelection } from '@/utils/ReportDateSelectionPrompt';
import { alertConfirmation, toastDanger, toastWarning } from '@/utils/Alerts';
import { TBReportService } from '@/apps/ART/services/reports/tb_report_service'
import { uniq } from "lodash";
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import ArtDrilldown from "@/apps/ART/Components/ArtDrilldown.vue";
import Img from "@/utils/Img";

export default defineComponent({
    components: { 
        IonPage,
        IonLoading,
        v2Datatable
    },
    setup() {
        const reportData = ref<any>([])
        const period = ref('')
        const isLoading = ref(false)
        const report = new TBReportService()
        const toDrillColumn = (label: string, ref: string) => {
            return {
                ref, label,
                toValue: (data: any) => data.length,
                tdClick: async (row: any) => {
                    if(row.refData.length) {
                        (await modalController.create({
                            component: ArtDrilldown,
                            backdropDismiss: false,
                            cssClass: 'large-modal',
                            componentProps: {
                                subtitle: period,
                                patientIdentifiers: row.refData,
                                title: `${row.data.ageGroup} ${row.data.gender} ${row.column.label}`,
                                onFinish: () => modalController.getTop().then(v => v && modalController.dismiss())
                            }
                        })).present();
                    }
                }
            }
        }
        const columns: Array<v2ColumnInterface[]> = [
            [
                { label: "#", ref: "index" },
                { label: "Age group", ref: 'ageGroup' },
                { label: "Gender", ref: 'gender' },
                toDrillColumn("TX_CURR", "tx_curr"),
                toDrillColumn("Symptom Screen (alone)", "symptom_screen_alone"),
                toDrillColumn("CXR screen", "cxr_screen"),
                toDrillColumn("mWRD screen", "mwrd_screen"),
                toDrillColumn("New on ART/Screen Positive", "sceen_pos_new"),
                toDrillColumn("New on ART/Screen Negative", "sceen_neg_new"),
                toDrillColumn("Already on ART/Screen Positive", "sceen_pos_prev"),
                toDrillColumn("Already on ART/Screen Negative", "sceen_neg_prev"),
                toDrillColumn("TB RX_New on ART", "started_tb_new"),
                toDrillColumn("TB RX_Prev on ART", "started_tb_prev")
            ]
        ]

        const onRefreshReport = async () => generate((
            await alertConfirmation("Do you want to rebuild report?")
        ))

        const generate = async (rebuildCache=false) => {
            if (!(report.startDate && report.endDate)) return toastWarning(
                'Start date and end date required!'
            )
            isLoading.value = true
            reportData.value = []
            try {
                const res = await report.getTxTbReport(rebuildCache, 'moh')
                const GENDER_MAP: any = { F: "Female", M: "Male" }
                const disaggregated = Object.keys(res).reduce((a: any, ageGroup: any) => {
                    if (ageGroup === "Unknown") return a
                    const data = res[ageGroup];
                    Object.keys(data).forEach((gender: string) => {
                        a[gender].rows.push({ ageGroup, gender: GENDER_MAP[gender], ...data[gender] })
                        a[gender].aggregate = Object.keys(data[gender]).reduce((a: any, k: any) => {
                            return Array.isArray(data[gender][k])
                                ? { ...a, [k] : [...a[k]||[], ...data[gender][k]] }
                                : a
                        }, a[gender].aggregate)
                    })
                    return a
                }, { M: { rows: [], aggregate: { } }, F: { rows: [], aggregate: {} }})

                reportData.value = [
                    ...disaggregated.F.rows, ...disaggregated.M.rows,
                    { ageGroup: 'All', gender: 'Male', ...disaggregated.M.aggregate }
                ]

                const allFemale: any = Object.values(disaggregated.F.aggregate).reduce((a: any, c: any) => a.concat(c), [])
                const mStatus = await report.getMaternalStatus(uniq(allFemale))
                const allFp = mStatus.FBf.concat(mStatus.FP);

                (['FP', 'FNP', 'FBf']).forEach((gender: string) => {
                    reportData.value.push(
                        Object.keys(disaggregated.F.aggregate).reduce((a: any, k: any) => {
                            return {
                                ...a, [k]: disaggregated.F.aggregate[k].filter(
                                    (id: number) => gender === 'FNP' 
                                        ? !allFp.includes(id)
                                        : mStatus[gender].includes(id)
                                )
                            }
                        }, { ageGroup: "All", gender })
                    )
                })
                reportData.value = reportData.value.map((d:any, i: number) => ({index: i+1, ...d}))
            } catch (e) {
                console.error(e)
                toastDanger("Unable to generate report!")
            }
            isLoading.value = false
        }

        const configure = () => DateSelection({
            onFinish: (sDate: string, eDate: string, periodstr: string, occupation: string) => {
                period.value = `Period: ${periodstr}`
                report.startDate = sDate
                report.endDate = eDate
                if (occupation) report.setOccupation(occupation)
                generate()
            }
        })

        onMounted(() => configure())

        return {
            Img,
            reportData,
            isLoading,
            onRefreshReport,
            configure,
            generate,
            columns,
            period
        }
    }
})
</script>
