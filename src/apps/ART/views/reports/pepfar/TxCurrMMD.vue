<template>
    <ion-page>
        <ion-loading :is-open="isLoading" message="Please wait.."/>
        <v2Datatable
            :icon-url="Img('login-logos/PEPFAR.png')"
            title="TX Curr MMD Report"
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
import ReportErrors from "@/apps/ART/Components/ReportErrors.vue"
import { IonPage, IonLoading, modalController } from "@ionic/vue"
import { defineComponent, onMounted, ref } from 'vue'
import { v2ColumnInterface, v2TableBadge } from '@/components/DataViews/tables/v2PocDatatable/types';
import { DateSelection } from '@/utils/ReportDateSelectionPrompt';
import { alertConfirmation, toastDanger, toastWarning } from '@/utils/Alerts';
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import ArtDrilldown from "@/apps/ART/Components/ArtDrilldown.vue";
import { barChart, informationCircle, thumbsDown, thumbsUp } from "ionicons/icons"
import { TxReportService } from '@/apps/ART/services/reports/tx_report_service'
import { MohCohortReportService } from "@/apps/ART/services/reports/moh_cohort_service"
import Img from "@/utils/Img";
import { uniq } from "lodash";

enum Indicators {
    LESS_THAN_THREE_MONTHS = 'less_than_three_months',
    THREE_TO_FIVE_MOTHS = "three_to_five_months",
    GREATHER_THAN_SIX_MONTHS = "greater_than_six_months"
}

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
        const report = new TxReportService()
        const mohCohort = new MohCohortReportService()
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
                ref, 
                label,
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
                toDrillColumn("# of clients on <3 months of ARVs", Indicators.LESS_THAN_THREE_MONTHS),
                toDrillColumn("# of clients on 3 - 5 months of ARVs", Indicators.THREE_TO_FIVE_MOTHS),
                toDrillColumn("# of clients on >= 6 months of ARVs", Indicators.GREATHER_THAN_SIX_MONTHS)
            ]
        ]

        const onRegenerate = async () => generate((await alertConfirmation("Do you want to rebuild report?")))

        const updateHeaderBadge = function (badge: v2TableBadge) {
            const index =  headerBadge.value.findIndex(obj => obj.id === badge.id);
            if (index !== -1) {
                headerBadge.value[index] = badge
            } else {
                headerBadge.value.push(badge)
            }
        }
    
        const showErrors = async function(errors: string[]) {
            const VALIDATION_ID = 'validation';
            (await modalController.create({
                id: VALIDATION_ID,
                component: ReportErrors,
                backdropDismiss: false,
                cssClass: "large-modal",
                componentProps: { errors }
            })).present();
            updateHeaderBadge({
                id: VALIDATION_ID,
                text: `<b>${errors.length}</b> validation errors detected`,
                icon: thumbsDown,
                color: "danger",
                action: () => showErrors(errors)
            })
        }

        const generate = async (rebuild=false) => {
            if (!(report.startDate && report.endDate)) return toastWarning('Start date and end date required!')
            isLoading.value = true
            try {
                headerBadge.value = []
                reportData.value = []
                const res = await report.getTxCurrMMDReport(rebuild, 'pepfar')
                const data: any = Object.keys(res).reduce((all: any, ageGroup: any) => {
                    const data = res[ageGroup];
                    ["Male", "Female"].forEach((gender: string) => {
                        const indicatorData: any = { gender, age_group: ageGroup }
                        Object.keys(data[gender]).forEach((indicator: string) => {
                            indicatorData[indicator] = data[gender][indicator]
                            all.totalAlive = [...all.totalAlive, ...indicatorData[indicator]]
                            all.aggregate[gender][indicator] = [...all.aggregate[gender][indicator]||[], ...indicatorData[indicator]]
                        })
                        all[gender].push(indicatorData)
                    })
                    return all
                },
                {
                    Male: [],
                    Female: [],
                    totalAlive: [],
                    aggregate: { Male: { }, Female: { } }
                })
                reportData.value = [...data.Female, ...data.Male, { age_group: "All", gender: "Male", ...data.aggregate.Male }]
                const allFemale: any = Object.values(data.aggregate.Female).reduce((a: any, c: any) => a.concat(c), [])
                const mStatus = await report.getMaternalStatus(uniq(allFemale))
                const allFp = mStatus.FBf.concat(mStatus.FP);

                (['FP', 'FNP', 'FBf']).forEach((gender: string) => {
                    reportData.value.push(
                        Object.keys(data.aggregate.Female).reduce((a: any, k: any) =>({ 
                            ...a, [k]: data.aggregate.Female[k].filter((id: number) => gender === 'FNP' ? !allFp.includes(id) : mStatus[gender].includes(id)) 
                        }), { age_group: "All", gender })
                    )
                })

                reportData.value = reportData.value.map((d:any, i: number) => ({index: i+1, ...d}))
                headerBadge.value = [{
                    text: `Total alive and on ART: <b>${data.totalAlive.length}</b>`, 
                    icon: barChart,
                    color: "primary",
                    action: () => drill({ patientIdentifiers: data.totalAlive,
                        title: `Total alive and on ART: ${data.totalAlive.length}`
                    })
                }]

                const s = mohCohort.validateIndicators({
                    'total_alive_and_on_art': {
                        param: data.totalAlive.length,
                        check: (i: number, p: number) => p > i,
                        error: (i: number, p: number) => `
                            MoH cohort Alive and on ART clients <b>(${i})</b> is not
                            matching with total TX MMD clients <b>(${p})</b>.
                        `
                    }
                }, (errors: string[]) => {
                    if (errors.length) { 
                        showErrors(errors) 
                    } else {
                        updateHeaderBadge({
                            id: "validation",
                            text: "<b>Report is consistent</b>",
                            icon: thumbsUp,
                            color: "success"
                        })
                    }
                })
                if (s === -1) showErrors(['Report not validated. Run the MoH cohort report for similar reporting period and then run this report'])
            } catch (e) {
                const msg = "Unable to generate report!"
                toastDanger(msg)
                headerBadge.value = [{
                    text: msg,
                    color: "danger",
                    icon: informationCircle,
                    action: function() {
                        console.log(e)
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
                report.setQuarter('pepfar')
                mohCohort.setStartDate(sDate)
                mohCohort.setEndDate(eDate)
                if (occupation) {
                    mohCohort.setOccupation(occupation)
                    report.setOccupation(occupation)
                } 
                generate(rebuildCaches)
            }
        })

        onMounted(() => configure())

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
