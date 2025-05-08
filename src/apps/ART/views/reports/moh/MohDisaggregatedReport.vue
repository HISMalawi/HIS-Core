<template>
    <ion-page>
        <ion-loading :is-open="isLoading" message="Please wait.."/>
        <v2Datatable
            :icon-url="Img('login-logos/Malawi-Coat_of_arms_of_arms.png')"
            title="Disaggregated report"
            report-prefix="MoH"
            :subtitle="period"
            :columns="columns"
            :columnData="reportData"
            :rowsPerPage="100"
            :onRefresh="onRegenerate"
            :headerBadge="headerBadge"
        />
    </ion-page>
</template>

<script lang='ts'>
import { IonPage, IonLoading, modalController } from "@ionic/vue"
import { defineComponent, onMounted, ref } from 'vue'
import { v2ColumnInterface, v2TableBadge } from '@/components/DataViews/tables/v2PocDatatable/types';
import { alertConfirmation, toastDanger } from '@/utils/Alerts';
import { DisaggregatedReportService } from "@/apps/ART/services/reports/disaggregated_service"
import { REGIMENS } from "@/apps/ART/services/reports/regimen_report_service";
import { thumbsUp, thumbsDown, bug, barChart } from "ionicons/icons"
import { useRoute } from "vue-router";
import { formatGender, toDate } from "@/utils/Strs";
import { MohCohortReportService } from "@/apps/ART/services/reports/moh_cohort_service"
import ArtDrilldown from "@/apps/ART/Components/ArtDrilldown.vue";
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import ReportErrors from "@/apps/ART/Components/ReportErrors.vue"
import Img from "@/utils/Img";

export default defineComponent({
    components: {
        IonPage,
        IonLoading,
        v2Datatable
    },
    setup() {
        const route = useRoute()
        const configOk = ref(false)
        const reportData = ref<any>([])
        const period = ref('')
        const loadingMessage = ref('')
        const isLoading = ref(false)
        const report = new DisaggregatedReportService()
        const mohService = new MohCohortReportService()
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
                toDrillColumn("TX curr (receiving ART)", "tx_curr"),
                ...REGIMENS.map((regimen: string) => toDrillColumn(regimen, regimen)),
                toDrillColumn("Unknown", "N/A"),
                toDrillColumn("Total (regimen)", "total")
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
                componentProps: {
                    errors
                }
            })).present();
            updateHeaderBadge({
                id: VALIDATION_ID,
                text: `<b>${errors.length}</b> validation errors detected`,
                icon: thumbsDown,
                color: "danger",
                action: () => showErrors(errors)
            })
        }

        const onValidate = async (totalAlive: number[]) => {
            const validations: any = {
                'total_alive_and_on_art' : {
                    param: totalAlive.length,
                    check: (i: number, p: number) => i != p,
                    error: (i: number, p: number) => `
                        Total alive of <b>${p}</b>
                        Does not match total alive of <b>${i}</b> on MOH report
                    `
                }
            }
            const s = mohService.validateIndicators(validations, (errors: string[]) => {
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
        }

        const generate = async (rebuild=false) => {
            if (!configOk.value) return toastDanger("Unable to generate report, return to cohort report")
            isLoading.value = true
            try {
                reportData.value = []
                const data: any = (await report.getDisaggReport(rebuild, 'moh'))
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
                        (d:any, i: number) => ({index: i+1, ...d})
                    )

                    updateHeaderBadge({
                        text: `Total alive and on ART: <b>${data.totalAlive.length}</b>`, 
                        icon: barChart,
                        color: "primary",
                        action: () => drill({
                            patientIdentifiers: data.totalAlive,
                            title: `Total alive and on ART: ${data.totalAlive.length}`,
                        })
                    })

                    onValidate(data.totalAlive)
            } catch (e) {
                const msg = "Unable to generate report!"
                toastDanger(msg)
                headerBadge.value = [{
                    text: msg,
                    color: "danger",
                    icon: bug,
                    action: function() {
                        headerBadge.value = [{
                            text: `Exception occured: <b>${e}</b>`,
                            color: "danger",
                            icon: bug
                        }]
                    }
                }]
            }
            isLoading.value = false
            loadingMessage.value = ''
        }

        onMounted(() => {
            configOk.value = (route.query.start_date && route.query.end_date && route.query.quarter) ? true : false
            if (configOk.value) {
                report.setStartDate(`${route.query.start_date}`)
                report.setEndDate(`${route.query.end_date}`)
                report.setOccupation(`${route.query.occupation}`)
                mohService.setOccupation(report.occupation)
                mohService.setStartDate(report.startDate)
                mohService.setEndDate(report.endDate)
                period.value = `${toDate(report.startDate)} to ${toDate(report.endDate)}`
                if (route.query.quarter) {
                    report.setQuarter(`${route.query.quarter}`)
                    mohService.setQuarter(report.quarter)
                }
                generate()
            }
        })

        return {
            Img,
            onRegenerate,
            headerBadge,
            reportData,
            isLoading,
            generate,
            columns,
            period
        }
    }
})
</script>
