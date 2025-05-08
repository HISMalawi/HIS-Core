<template>
    <ion-page>
        <ion-loading :is-open="isLoading" message="Please wait..."/>
        <v2Datatable
            title="TX RTT Report"
            report-prefix="Pepfar"
            :icon-url="Img('login-logos/PEPFAR.png')"
            :subtitle="period"
            :columns="columns"
            :columnData="reportData"
            :rowsPerPage="100" 
            :headerBadge="headerBadge"
            :onConfigure="configure"
            :onRefresh="() => generate(true)"
        />
    </ion-page>
</template>

<script lang='ts'>
import { IonPage, IonLoading, modalController } from "@ionic/vue"
import { defineComponent, onMounted, ref } from 'vue'
import { v2ColumnInterface, v2TableBadge } from '@/components/DataViews/tables/v2PocDatatable/types';
import { DateSelection } from '@/utils/ReportDateSelectionPrompt';
import { alertConfirmation, toastDanger, toastWarning } from '@/utils/Alerts';
import { TxReportService } from "@/apps/ART/services/reports/tx_report_service";
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import ArtDrilldown from "@/apps/ART/Components/ArtDrilldown.vue";
import Img from "@/utils/Img";
import { uniq } from "lodash";
import { barChart, bug, informationCircle } from "ionicons/icons";

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
        const headerBadge = ref<v2TableBadge[]>([])
        const report = new TxReportService()

        function toDrillColumn(label: string, ref: string) {
            return {
                ref,
                label,
                toValue: (data: any) => data.length,
                tdClick: async (row: any) => {
                    if(row.refData.length) {
                        (await modalController.create({
                            component: ArtDrilldown,
                            backdropDismiss: false,
                            cssClass: 'large-modal',
                            componentProps: {
                                title: `${row.data.age_group} ${row.data.gender} ${row.column.label}`,
                                patientIdentifiers: row.refData,
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
                { label: "Age group", ref: 'age_group' },
                { label: "Gender", ref: 'gender' },
                toDrillColumn("CD4 <200", "cd4_less_than_200"),
                toDrillColumn("CD4 >=200", "cd4_greater_than_or_equal_to_200"),
                toDrillColumn("Unknown CD4", "unknown_cd4_count"),
                toDrillColumn("Not Eligible for CD4", "not_eligible_for_cd4"),
                toDrillColumn("Returned <3 mo", "returned_less_than_3_months"),
                toDrillColumn("Returned 3-5 mo", "returned_greater_than_3_months_and_less_than_6_months"),
                toDrillColumn("Returned 6+ mo", "returned_greater_than_or_equal_to_6_months"),
            ]
        ]

        const generate = async (refresh=false) => {
            if (!(report.startDate && report.endDate)) toastWarning(
                'Start date and end date required!'
            )
            const rebuild = refresh && (await alertConfirmation("Do you want to rebuild report?"))
            isLoading.value = true
            try {
                const res = await report.getTxRttReport(rebuild)
                const GENDER_MAP: any = { F: "Female", M: "Male" }
                const disaggregated: any = res.reduce((a: any, c: any) => {
                    if (c.age_group != 'Unknown') {
                        a[c.gender].rows.push({ ...c, gender: GENDER_MAP[c.gender as any] })
                        a[c.gender].aggregate = Object.keys(c).reduce((a: any, k: any) => {
                            return Array.isArray(c[k]) ? { ...a, [k] : [...a[k]||[], ...c[k]]} : a
                        }, a[c.gender].aggregate)
                    }
                    return a
                },
                { 
                    M: { rows: [], aggregate: {} }, F: { rows: [], aggregate: {} }
                })

                reportData.value = [
                    ...disaggregated.F.rows, ...disaggregated.M.rows,
                    { age_group: 'All', gender: 'Male', ...disaggregated.M.aggregate }
                ]

                const allFemale = Object.values(disaggregated.F.aggregate).flat(1) as Array<number>
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
                        }, { age_group: "All", gender })
                    )
                })
                reportData.value = reportData.value.map((d:any, i: number) => ({index: i+1, ...d}))
                const allMale = Object.values(disaggregated.M.aggregate).flat(1) as Array<number>;
                const total = uniq([...allFemale, ...allMale]);
                headerBadge.value = [{
                    id: "stats",
                    text: `Total <b>${total.length}</b>`,
                    icon: barChart,
                    color: "primary",
                    action: async () => {
                        (await modalController.create({
                            component: ArtDrilldown,
                            backdropDismiss: false,
                            cssClass: 'large-modal',
                            componentProps: {
                                title: `Total Clients`,
                                subtitle: period.value,
                                patientIdentifiers: total,
                                onFinish: () => modalController.getTop().then(v => v && modalController.dismiss())
                            }
                        })).present();
                    }
                }]
            } catch (e) {
                console.error(e)
                toastDanger("Unable to generate report!")
                headerBadge.value = [{
                    text: "Unable to generate report!",
                    color: "danger",
                    icon: bug,
                    action: function () {
                        headerBadge.value = [{
                            text: `Exception occured: <b>${e}</b>`,
                            color: "danger",
                            icon: informationCircle
                        }]
                    }
                }]
            }
            isLoading.value = false
        }

        const configure = () => DateSelection({
            onFinish: (sDate: string, eDate: string, periodstr: string, occupation: string) => {
                period.value = periodstr
                report.startDate = sDate
                report.endDate = eDate
                if (occupation) report.setOccupation(occupation)
                generate()
            }
        })

        onMounted(() => configure())

        return {
            headerBadge,
            reportData,
            isLoading,
            Img,
            configure,
            generate,
            columns,
            period
        }
    }
})
</script>
