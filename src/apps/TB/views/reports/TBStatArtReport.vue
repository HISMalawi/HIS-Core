<template>
    <ion-page>
        <v2Datatable
            title="TB STAT ART Report"
            report-prefix="PEPFAR"
            :icon-url="logo"
            :subtitle="period"
            :columns="columns"
            :columnData="reportData"
            :rowsPerPage="50"
            :onConfigure="configure"
            :onRefresh="() => generate()" />
    </ion-page>
</template>
<script lang='ts' setup>
import { IonPage, modalController } from "@ionic/vue"
import { onMounted, ref } from 'vue'
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { DateSelection } from '@/utils/ReportDateSelectionPrompt';
import { toastWarning } from '@/utils/Alerts';
import { wrapGeneration } from "@/utils/v2utils";
import { TBReportService } from "@/apps/TB/services/tb_report_service";
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import TBDrilldown from "@/apps/TB/components/TBDrilldown.vue";
import Img from "@/utils/Img";

const logo = Img('login-logos/PEPFAR.png')
const reportData = ref([])
const period = ref('')
const report = new TBReportService()

const toDrillColumn = (label: string, ref: string) => {
    return {
        label,
        ref,
        toValue: (data: any) => data.length,
        tdClick: async (props: any) => (await modalController.create({
            component: TBDrilldown,
            backdropDismiss: false,
            cssClass: "large-modal",
            componentProps: {
                title: props.column.label,
                patientIdentifiers: props.refData,
                subtitle: `Period: ${period.value}`,
                onFinish: () => modalController.getTop().then((v) => v && modalController.dismiss())
            }
        })).present()
    }
}
const columns: Array<v2ColumnInterface[]> = [
    [
        { label: "#", ref: "index" },
        { label: "Age group", ref: 'age_group' },
        { label: "Gender", ref: 'gender' },
        toDrillColumn("Known positive", "known_positive"),
        toDrillColumn("Newly Tested Positives", "newly_tested_positive"),
        toDrillColumn("New Negatives", "new_negative"),
        toDrillColumn("Recent negative", "recent_negative"),
        toDrillColumn("Not Done", "not_done"),
        toDrillColumn("New on ART", "new_on_art"),
        toDrillColumn("Already on ART", "already_on_art")
    ]
]

/**
 * Generates the report data
*/
const generate = () => wrapGeneration(async () => {
    if (!(report.startDate && report.endDate)) return toastWarning('Start date and end date required!')
    reportData.value = []
    const res = await (TBReportService as any).getJson('programs/2/reports/TB_ART_STAT', report.buildRequestParams({}))
    const data = Object.keys(res).reduce((a: any, k) => {
        if (/unknown|all/i.test(k)) return a
        a.M.push({ age_group: k, gender: 'Male', ...res[k]['M'] })
        a.F.push({ age_group: k, gender: 'Female', ...res[k]['F'] })
        return a
    },{ F: [], M: [] })
    const final: any = [
        ...data.F,
        ...data.M
    ]
    reportData.value = final.map((d: any, i: any) => ({index: i+1, ...d}))
})

/**
 * Loads a dialogue to allow users to configure start and end date
 */
const configure = () => DateSelection({
    onFinish: (sDate: string, eDate: string, periodstr: string) => {
        period.value = `${periodstr}`
        report.startDate = sDate
        report.endDate = eDate
        generate()
    }
})

/**
 * Initialization code when the report is empty!
*/
onMounted(() => configure())
</script>
