<template>
    <ion-page>
        <ion-loading :is-open="isLoading" message="Please wait..." />
        <v2Datatable :icon-url="Img('login-logos/PEPFAR.png')" title="Pepfar Tx New" report-prefix="Pepfar"
            :subtitle="period" :columns="columns" :columnData="reportData" :rowsPerPage="100" :headerBadge="headerBadge"
            :onConfigure="configure" :onRefresh="() => generate(true)" />
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
import ReportErrors from "@/apps/ART/Components/ReportErrors.vue"
import { barChart, thumbsUp, thumbsDown, bug, informationCircle } from "ionicons/icons"
import { MohCohortReportService } from "@/apps/ART/services/reports/moh_cohort_service"

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
        const report = new TxReportService()
        const headerBadge = ref<v2TableBadge[]>([])
        const mohService = new MohCohortReportService()

        const toDrillColumn = (label: string, ref: string) => {
            return {
                ref, label,
                toValue: (data: any) => data.length,
                tdClick: async (row: any) => {
                    if (row.refData.length) {
                        (await modalController.create({
                            component: ArtDrilldown,
                            backdropDismiss: false,
                            cssClass: 'large-modal',
                            componentProps: {
                                subtitle: period,
                                patientIdentifiers: row.refData,
                                title: `${row.data.age_group} ${row.data.gender} ${row.column.label}`,
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
                toDrillColumn("Tx new CD4 <200", "cd4_less_than_200"),
                toDrillColumn("Tx new CD4 >=200", "cd4_greater_than_equal_to_200"),
                toDrillColumn("Tx new CD4 Unknown", "cd4_unknown_or_not_done"),
                toDrillColumn("Transfer-ins", "transfer_in")
            ]
        ]

        const updateHeaderBadge = function (badge: v2TableBadge) {
            const index = headerBadge.value.findIndex(obj => obj.id === badge.id);
            if (index !== -1) {
                headerBadge.value[index] = badge
            } else {
                headerBadge.value.push(badge)
            }
        }

        const showErrors = async function (errors: string[]) {
            const id = 'validationErrors';
            (await modalController.create({
                id,
                component: ReportErrors,
                backdropDismiss: false,
                cssClass: "large-modal",
                componentProps: {
                    errors
                }
            })).present();
            updateHeaderBadge({
                id,
                text: `<b>${errors.length}</b> validation errors detected`,
                icon: thumbsDown,
                color: "danger",
                action: () => showErrors(errors)
            })
        }

        function validateReport(stats: any) {
            const validations: any = {
                'initiated_on_art_first_time': {
                    param: stats.total,
                    check: (i: number, p: number) => i != p,
                    error: (i: number, p: number) => `
                        MOH cohort initiated on ART first time <b>(${i})</b> is not matching Tx New <b>(${p})</b>
                    `
                },
                'initial_pregnant_females_all_ages': {
                    param: stats.pregnant,
                    check: (i: number, p: number) => i != p,
                    error: (i: number, p: number) => `
                        MOH cohort initial pregnant females all ages 
                        <b>(${i})</b> is not matching with TX new Pregnant women <b>${p}</b>
                    `
                },
                'males_initiated_on_art_first_time': {
                    param: stats.male,
                    check: (i: number, p: number) => i != p,
                    error: (i: number, p: number) => `
                        MoH Cohort males initiated on ART first time <b>(${i})</b>
                        is not matching with TX new All male <b>(${p})</b>
                    `
                },
                'quarterly_re_initiated_on_art + transfer_in': {
                    param: stats.transfer_in,
                    check: (i: number, p: number) => i != p,
                    error: (i: number, p: number) => `
                        Quarterly Transfer In + Reinitiated Clients <b>${i}</b>  does not match Transfer In <b>${p}</b> clients in TXNEW report
                    `
                }
            }
            const s = mohService.validateIndicators(validations, (errors: string[]) => {
                if (errors.length) {
                    showErrors(errors)
                } else {
                    updateHeaderBadge({
                        id: "reportOk",
                        text: "<b>Report is consistent</b>",
                        icon: thumbsUp,
                        color: "success"
                    })
                }
            })
            if (s === -1) showErrors(['Report not validated. Run the MoH cohort report for similar reporting period and then run this report'])
        }

        const generate = async (refresh=false) => {
            if (!(report.startDate && report.endDate)) return toastWarning(
                'Start date and end date required!'
            )
            const rebuild = refresh && (await alertConfirmation("Do you want to rebuild report?"))
            isLoading.value = true
            reportData.value = []
            try {
                const res = await report.getTxNewReport(rebuild); 
                // const male and female only 
                const data = res.filter((row: any) => !['All'].includes(row.age_group));
                const disaggregated = data.reduce((a: any, c: any) => {
                    a[c.gender] = Object.keys(c).reduce((a: any, k: any) => {
                        if (Array.isArray(c[k])) {
                            return { ...a, [k]: [...a[k] || [], ...c[k]] };
                        }
                        return a;
                    }, a[c.gender] || {});
                    return a;
                }, { Male: {}, Female: {} });

                reportData.value = res

                const allFp = res.reduce((acc: any[], record: any) => {
                    if (record.gender === 'FP') {
                        const flatArrays = Object.values(record)
                            .filter(Array.isArray)
                            .flat();
                        return acc.concat(flatArrays);
                    }
                    return acc;
                }, []);

                const txNewIndicators = [
                    'cd4_less_than_200',
                    'cd4_greater_than_equal_to_200',
                    'cd4_unknown_or_not_done'
                ];
                const txNewTotal = uniq((['Female', 'Male'] as any).reduce((a: any, g: any) => {
                    return [...a, ...(txNewIndicators.map((i) => disaggregated[g][i])).flat(1)];
                }, []));
                
                updateHeaderBadge({
                    id: "stats",
                    text: `Tx new <b>${txNewTotal.length}</b>`,
                    icon: barChart,
                    color: "primary",
                    action: async () => {
                        (await modalController.create({
                            component: ArtDrilldown,
                            backdropDismiss: false,
                            cssClass: 'large-modal',
                            componentProps: {
                                title: `All TxNew`,
                                subtitle: period.value,
                                patientIdentifiers: txNewTotal,
                                onFinish: () => modalController.getTop().then(v => v && modalController.dismiss())
                            }
                        })).present();
                    }
                })
                validateReport({
                    total: txNewTotal.length,
                    pregnant: uniq(txNewIndicators.map((i) => disaggregated['Female'][i].filter(
                        (p: number) => allFp.includes(p))).flat(1)).length,
                    male: uniq((txNewIndicators.map((i) => disaggregated['Male'][i]).flat(1))).length,
                    transfer_in: [
                        ...disaggregated.Male.transfer_in,
                        ...disaggregated.Female.transfer_in
                    ].length
                })
                reportData.value = reportData.value.map((d: any, i: number) => ({ index: i + 1, ...d }))
            } catch (e) {
                console.error(`${e}`)
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
                mohService.setStartDate(report.startDate)
                mohService.setEndDate(report.endDate)
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
