<template>
    <ion-loading :is-open="isLoading" message="Please wait..."/>
    <his-standard-form v-if="!isReportReady"
        :fields="fields"
        :skipSummary="true"
        @onFinish="onPeriod"
    />
    <ion-page v-if="isReportReady"> 
        <ion-content>
            <div id="report-content">
                <keep-alive> 
                    <component
                        v-bind:is="activeTemplateName"
                        :indicators="indicators"
                        :siteName="siteName"
                        :date="fd(reportDate)"
                        :reportingYear="reportingYear"
                        :reportingMonth="reportingMonthName"
                        @onindicatorsSelected="onIndicatorSelected"
                    />
                </keep-alive>
            </div>
        </ion-content>
        <ion-footer> 
            <ion-toolbar color="dark"> 
                <ion-button 
                    @click="exportCSV" 
                    size="large"> 
                    CSV
                </ion-button>
                <ion-button 
                    @click="exportPDF" 
                    size="large"> 
                    PDF
                </ion-button>
                <ion-button 
                    @click="onBack" 
                    size="large" 
                    slot="end"> 
                    Back
                </ion-button>
                <ion-button
                    @click="onRefresh"
                    slot="end"
                    size="large" 
                    color="warning">
                    Refresh
                </ion-button>
                <ion-button
                    router-link="/"
                    slot="end" 
                    size="large" 
                    color="success"> 
                    Finish
                </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
    <div id="print"> </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import MonthlyReport from "@/apps/ANC/Views/Reports/Moh/AncMohMonthlyReportTemplate.vue"
import { 
    IonPage, 
    IonContent, 
    IonLoading,
    IonFooter,
    IonButton,
    IonToolbar
} from "@ionic/vue"
import { Field } from '@/components/Forms/FieldInterface'
import { Service } from "@/services/service"
import { alertConfirmation, toastDanger } from '@/utils/Alerts'
import { AncMohReportService } from "@/apps/ANC/Services/anc_moh_report_service"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { toCsv } from "@/utils/Export"
import  { AncReportComposable } from '@/apps/ANC/composables/AncReports'
import CohortTemplate from "@/apps/ANC/Views/Reports/Moh/ANCohortTemplate.vue"
import MonthlyTemplate from "@/apps/ANC/Views/Reports/Moh/AncMohMonthlyReportTemplate.vue"
import { useRoute, useRouter } from 'vue-router'

export default defineComponent({
    components: {
        HisStandardForm,
        MonthlyReport,
        IonPage, 
        IonContent, 
        IonLoading,
        IonFooter,
        IonButton,
        IonToolbar,
        CohortTemplate,
        MonthlyTemplate
    },
    setup() {
        const route = useRoute()
        const router = useRouter()
        const activeTemplateName = route.params['template_id'] as string
        const { 
            presentDrillDown,
            getMonthlyReportFields, 
            showPrintWindow, 
            fd 
        } = AncReportComposable()
        const siteName = Service.getLocationName()
        const report = new AncMohReportService()
        const reportData = ref({} as any)
        const reportingYear = ref(0 as number)
        const reportingMonth = ref('' as string)
        const reportingMonthName = ref('' as string)
        const isLoading = ref(false)
        const indicators = ref({} as Record<string, any>)
        const isReportReady = ref(false)
        const reportDate = computed(() => {
            if (reportingYear.value && reportingMonth.value) {
                return `${reportingYear.value}-${reportingMonth.value}-01`
            }
            return ''
        })
        const reportTemplates: Record<string, {
            title: string;
            cssFile: string; 
            generate: () => Promise<any>;
        }> = {
            'CohortTemplate': {
                title: 'Cohort',
                cssFile: `
                    @page {
                        size: auto;   /* auto is the current printer page size */
                        margin: 0mm;  /* this affects the margin in the printer settings */
                        font-size: 10px;
                        height: 100%;
                    }

                    .footer {
                        display: none;
                    }

                    #main {
                        height: 100% !important;
                        overflow: hidden !important;
                    }

                    a[href]:after {
                        content: none !important;
                    }

                    table#table-header td{
                        padding: 10px;
                    }

                    table td {
                        padding: 5px;
                    }

                    .err-rows {
                        background-color: red;
                        color: white;
                    }

                    .pass-rows {
                        background-color: green;
                        color: black;
                        border: 1px solid #000000;
                    }

                    .err-num {
                        width: 3%;
                    }

                    #Unknown {
                        display: none;
                    }

                    #num {
                        display: none;
                    }

                    #main {
                        height: 600px;
                    }

                    a:link {
                        color: #000;
                        text-decoration: none;
                    }

                    a:hover {
                        color: orange !important;
                        text-decoration: underline;
                    }

                    a:visited {
                        color: #000;
                        text-decoration: none;
                    }

                    .valueCell {
                        border: 3px solid #000;
                    }
                `,
                generate: () => report.generateCohort()
            },
            'MonthlyTemplate': {
                title: 'Monthly',
                cssFile: `
                    @page {
                        size: auto;   /* auto is the current printer page size */
                        margin: 0mm;  /* this affects the margin in the printer settings */
                        font-size: 10px;
                        height: 100%;
                    }

                    .footer {
                        display: none;
                    }
                    #main {
                        height: 100% !important;
                        overflow: hidden !important;
                    }
                    a[href]:after {
                        content: none !important;
                    }
                    .err-rows {
                        background-color: red;
                        color: white;
                    }

                    .pass-rows {
                        background-color: green;
                        color: black;
                        border: 1px solid #000000;
                    }

                    .err-num {
                        width: 3%;
                    }
                    #Unknown {display: none;}
                    #num {display: none;}
                    #main {
                    height: 520px;
                    }

                    a:link {
                        color: #000;
                        text-decoration: none;
                    }

                    a:hover {
                        color: orange !important;
                        text-decoration: underline;
                    }

                    a:visited {
                        color: #000;
                        text-decoration: none;
                    }
                    .valueCell {
                        border: 3px solid #000;
                    }
                    table.report td {
                        padding-top: 10px;
                        padding-bottom: 5px;
                    }
                    table.report {
                        width: 100%;
                    }

                    #btnNext {
                        margin: 5px 0px 0px; 
                        padding: 0px; 
                        padding-left: 25px;
                        padding-right: 25px;
                        float: right;
                    }
                    #print {
                        margin-right: 30px;
                        padding:0px;
                        padding-left: 30px;
                        padding-right: 30px;
                    }

                    table#table-header tr td{
                        padding: 12px;
                    }
                `,
                generate: () => report.genertateMonthly()
            }
        }

        const activeReport = reportTemplates[activeTemplateName]

        const fields: Field[] = getMonthlyReportFields()

        function onIndicatorSelected(indicator: string) {
            const data = reportData.value['values'][indicator]['table']
            presentDrillDown(data['indicator_name'], data['contents'])
        }

        function exportPDF() {
            if (activeReport) {
                showPrintWindow({
                    containerID: 'report-content',
                    cssFile: activeReport?.cssFile,
                })
            }
        }

        function exportCSV() {
            const headers = ['Indicator', 'Value']
            const rows = Object.keys(reportData.value['values'])
                .map((k: string) => {
                    return [
                        reportData.value['values'][k]['table']['indicator_name'],
                        reportData.value['values'][k]['table']['contents'].length
                    ]
                })
            if (activeReport) {
                toCsv([headers], rows, `${siteName} ${activeReport.title} report ${reportDate.value}`)
            }
        }

        function onBack() {
            isReportReady.value = false
        }

        async function onRefresh() {
            if ((await alertConfirmation("Are you sure you want to reload report?"))) {
                generate()
            }
        }

        async function generate() {
            if (!activeReport) {
                toastDanger('Unable to initiate report')
                setTimeout(() => router.push('/'), 3000)
                return
            }
            isLoading.value = true
            isReportReady.value = true
            try {
                reportData.value = await activeReport.generate()
                indicators.value = Object.keys(reportData.value['values'])
                    .reduce((a: any, k: string) => {
                        a[k] = reportData.value['values'][k]['table']['contents'].length
                        return a
                    }, {})
            } catch (e) {
                console.error(e)
                toastDanger(`${e}`)
            }
            isLoading.value = false
        }

        async function onPeriod(f: any, c: Record<string, string | number>) {
            reportingYear.value = c.year as number
            reportingMonth.value = c.month as string
            reportingMonthName.value = f.month.label
            report.setStartDate(reportDate.value)
            await generate()
        }

        return {
            fd,
            siteName,
            isLoading,
            activeTemplateName,
            onIndicatorSelected,
            fields,
            indicators,
            reportDate,
            reportingYear,
            reportingMonthName,
            isReportReady,
            onRefresh,
            exportPDF,
            exportCSV,
            onBack,
            onPeriod
        }
    }
})
</script>
