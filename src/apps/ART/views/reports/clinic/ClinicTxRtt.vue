<template>
    <ion-page>
        <v2Datatable :icon-url="logo" :subtitle="period" title="TX RTT Report" report-prefix="Clinic" :columns="columns"
            :onConfigure="configure" :columnData="reportData" :rowsPerPage="100" :onRefresh="generate" />
    </ion-page>
</template>

<script lang='ts' setup>
import { IonPage } from "@ionic/vue"
import { onMounted, ref } from 'vue'
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { TxReportService } from '@/apps/ART/services/reports/tx_report_service'
import { DateSelection } from "@/utils/ReportDateSelectionPrompt";
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { AGE_GROUPS } from "@/apps/ART/services/reports/patient_report_service"
import { uniq } from "lodash";
import { formatGender } from "@/utils/Strs";
import Img from "@/utils/Img";
import { showArtDrilldown, wrapGeneration } from "@/utils/v2utils";

const logo = Img('reports.png')
const reportData = ref([])
const period = ref('')
const report = new TxReportService()
enum Indicator {
    LESS_THAN_THREE_MONTHS="less_than_three_months",
    THREE_TO_FIVE_MONTHS="three_to_five_months",
    MORE_THAN_SIX_MONTHS="more_than_six_months"
}
const drill = (refData: any) => ({
    ...refData,
    toValue: (data: any) => data.length,
    tdClick: async (row: any) => {
        showArtDrilldown({
            subtitle: period.value,
            patientIdentifiers: row.refData,
            title: `${row.data.age_group} ${formatGender(row.data.gender)} ${row.column.label}`,
        })
    }
})
const columns: Array<v2ColumnInterface[]> = [
    [
        { label: 'Age group', ref: 'age_group' },
        { label: 'Gender', ref: 'gender', toValue: (val) => formatGender(val) },
        drill({ label: 'Returned <3 mo', ref: Indicator.LESS_THAN_THREE_MONTHS }),
        drill({ label: 'Returned 3-5 mo', ref: Indicator.THREE_TO_FIVE_MONTHS }),
        drill({ label: 'Returned 6+ mo', ref: Indicator.MORE_THAN_SIX_MONTHS })
    ]
]
const getIndicator = (month: number) => {
    if (month < 3) return Indicator.LESS_THAN_THREE_MONTHS
    if (month >= 3 && month <= 5) return Indicator.THREE_TO_FIVE_MONTHS
    if (month >= 6) return Indicator.MORE_THAN_SIX_MONTHS
    return "unknown"
}
const getDefaults = () => ({
    [Indicator.LESS_THAN_THREE_MONTHS]: [], 
    [Indicator.THREE_TO_FIVE_MONTHS]: [],  
    [Indicator.MORE_THAN_SIX_MONTHS]: []  
})
const generate = () => wrapGeneration(async()=>{
    reportData.value = []
    const aggregates: any = { M: getDefaults(), F: getDefaults() }
    const res: any = await report.getClinicTxRtt();
    const data = AGE_GROUPS.reduce((a: any, group: string) => {
        if (!res[group]) return { M: {...a.M, [group]: getDefaults() }, F: { ...a.F, [group]: getDefaults() } };
        ["M", "F"].forEach((gender) => {
            res[group][gender].forEach((d: any) => {
                const indicator = getIndicator(d.months)
                a[gender] = {
                    ...a[gender]??{},
                    [group]: {
                        ...a[gender]?.[group]??getDefaults(),
                        [indicator]: [ ...a[gender]?.[group]?.[indicator]??[], d.patient_id ]
                    }
                }
                aggregates[gender] = { ...aggregates[gender], [indicator]: [...aggregates[gender]?.[indicator]??[], d.patient_id] }
            })
        })
        return a
    }, {})
    
    const get = (gender: "M"|"F") => Object.keys(data[gender]).map((age: string) => ({...data[gender][age], age_group: age, gender }))
    reportData.value = [ ...get("F"), ...get("M"), { age_group: "All", gender: "Male", ...aggregates.M } ] as any
    const allf: any = Object.values(aggregates.F).flat(1)
    const mstatus = await report.getMaternalStatus(uniq(allf))
    
    const fp = mstatus?.FP??[]
    const fbf = mstatus?.FBf??[]
    const fnp = mstatus?.FNP??[]
    
    reportData.value = [
        ...reportData.value,
        { age_group: "All", gender: "FP", ...Object.keys(aggregates.F).reduce(
            (a: any, k: string) => ({ ...a, [k]: aggregates.F[k].filter((i: any) => fp.includes(i)) }), {})
        },
        { age_group: "All", gender: "FNP", ...Object.keys(aggregates.F).reduce(
            (a: any, k: string) => ({ ...a, [k]: aggregates.F[k].filter((i: any) => fnp.includes(i))}), {})
        },
        { age_group: "All", gender: "FBF", ...Object.keys(aggregates.F).reduce(
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
