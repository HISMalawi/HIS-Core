<template>
    <ion-page>
        <v2Datatable :icon-url="logo" :subtitle="period" title="TPT Outcome" report-prefix="Clinic" :columns="columns"
            :onConfigure="configure" :columnData="reportData" :rowsPerPage="100" :onRefresh="generate" />
    </ion-page>
</template>

<script lang='ts' setup>
import { IonPage } from "@ionic/vue"
import { onMounted, ref } from 'vue'
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { ClinicReportService } from '@/apps/ART/services/reports/clinic_report_service'
import { DateSelection } from "@/utils/ReportDateSelectionPrompt";
import { uniq } from "lodash";
import Img from "@/utils/Img";
import { showArtDrilldown, wrapGeneration } from "@/utils/v2utils";

const logo = Img('reports.png')
const reportData = ref([])
const period = ref('')
const report = new ClinicReportService()

const drill = (refData: any) => ({
    ...refData,
    toValue: (data: any) => data.length,
    tdClick: (row: any) => {
        showArtDrilldown({
            title: `${row.data.age_group} ${row.column.label}`,
            subtitle: period.value,
            patientIdentifiers: row.refData.map((data: any) => data.patient_id),
        })
    }
})

const columns: Array<v2ColumnInterface[]> = [[
    { label: 'Age group', ref: "age_group" },
    { label: 'TPT Type', ref: "tpt_type"},
    drill({ label: 'Started TPT (New on ART)', ref: "started_tpt_new"}),
    drill({ label: 'Started TPT (Previous on ART)', ref: "started_tpt_prev"}),
    drill({ label: 'Completed TPT (New on ART)', ref: "completed_tpt_new"}),
    drill({ label: 'Completed TPT (Previous on ART)', ref: "completed_tpt_prev"}),
    drill({ label: 'Not completed TPT', ref: "not_completed_tpt"}),
    drill({ label: 'Died', ref: "died"}),
    drill({ label: 'Defaulted', ref: "defaulted"}),
    drill({ label: 'Stopped ART', ref: "stopped"}),
    drill({ label: 'TO', ref: "transfer_out"}),
    drill({ label: 'Confirmed TB ', ref: "confirmed_tb"}),
    drill({ label: 'Pregnant', ref: "pregnant"}),
    drill({ label: 'Breastfeeding', ref: "breast_feeding"}),
    drill({ label: 'Skin rash', ref: "skin_rash"}),
    drill({ label: 'Peripheral neuropathy', ref: "peripheral_neuropathy"}),
    drill({ label: 'Yellow eyes', ref: "yellow_eyes"}),
    drill({ label: 'Nausea', ref: "nausea"}),
    drill({ label: 'Dizziness', ref: "dizziness"}),
]]

const generate = () => wrapGeneration(async () => {
    reportData.value = []
    const res: any = (await report.getTtpOutcomes()).reduce(
        (a: any, c: any) => ({ ...a, [c.tpt_type]: [...a[c.tpt_type], c] }) , { 
            "3HP": [], "6H": [] 
        }
    );
    reportData.value = [...res["3HP"], ...res["6H"]] as any
    const aggregates = reportData.value.reduce((a: any, c: any) => {
        Object.keys(c).forEach((k: string) => {
            if (Array.isArray(c[k])) {
                const get = (gender: "M"|"F") => ({
                    ...a[gender], [k]: [...(a?.[gender]?.[k]??[]), ...c[k].filter((t: any) => t.gender === gender)]
                })
                a = { M : get("M"), F: get("F") }
            }
        })
        return a
    }, { M: {}, F: {} })
    const fp = uniq(aggregates.F.pregnant)
    const fbf = uniq(aggregates.F.breast_feeding)
    const allFp = fp.concat(fbf)
    reportData.value = [ 
        ...reportData.value,
        { age_group: "All", tpt_type: "Male", ...aggregates.M },
        { age_group: "All", tpt_type: "FP", ...Object.keys(aggregates.F).reduce(
            (a: any, k: string) => ({ ...a, [k]: aggregates.F[k].filter((i: any) => fp.includes(i)) }), {})
        },
        { age_group: "All", tpt_type: "FNP", ...Object.keys(aggregates.F).reduce(
            (a: any, k: string) => ({ ...a, [k]: aggregates.F[k].filter((i: any) => !allFp.includes(i))}), {})
        },
        { age_group: "All", tpt_type: "FBF", ...Object.keys(aggregates.F).reduce(
            (a: any, k: string) => ({ ...a, [k]: aggregates.F[k].filter((i: any) => fbf.includes(i)) }), {})
        }
    ] as any
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
onMounted(() => !reportData.value.length && configure())
</script>