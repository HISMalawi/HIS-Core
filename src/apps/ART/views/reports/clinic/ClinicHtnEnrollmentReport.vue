<template>
    <ion-page>
        <v2Datatable
            title="HTN Enrollment Report"
            :icon-url="logo"
            :subtitle="period"
            :columns="columns"
            :columnData="reportData"
            :rowsPerPage="50" 
            :onConfigure="configure"
            :onRefresh="() => generate()"
            report-prefix="Clinic" />
    </ion-page>
</template>

<script lang='ts' setup>
import { IonPage, modalController } from "@ionic/vue"
import { onMounted, ref } from 'vue'
import { wrapGeneration } from "@/utils/v2utils";
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { DateSelection } from '@/utils/ReportDateSelectionPrompt';
import { toastWarning } from '@/utils/Alerts';
import { ClinicReportService } from "@/apps/ART/services/reports/clinic_report_service";
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import ArtDrilldown from "@/apps/ART/Components/ArtDrilldown.vue";
import Img from "@/utils/Img";

const logo = Img('reports.png')
const reportData = ref<any>([])
const period = ref('')
const report = new ClinicReportService()

const reportModel: any = {
    htn_enrollment: {
        _label: 'HYPERTENSION (HTN) ENROLMENT',
        registered_with_hypertension: "Patients registered with hypertension",
        enrolled_and_active_in_care: "HTN Patients enrolled and active in care",
        who_have_defaulted_during_the_reporting_period: "HTN Patients who have defaulted during the reporting period",
        who_have_died: "HTN Patients who have died",
        who_have_transferred_out: "HTN Patients who have transferred out",
        who_have_stopped_htn_care: "HTN Patients who have stopped HTN care",
        with_a_visit_in_last_3_months: "HTN Patients with a visit in the last 3 months",
        with_a_visit_in_last_3_months_who_have_a_bp_measurement_recorded: "HTN Patients with a visit in the last 3 months who have a BP measurement recorded",
        with_a_visit_in_last_3_months_who_have_bp_below_140_90: "HTN Patients with a visit in the last 3 months who have BP below 140/90",
    },
    treatment_drug_classification: {
        _label: 'TREATMENT BASED ON HTN DRUG CLASSIFICATION',
        diuretics: "Diuretics",
        beta_blockers: "Beta Blockers",
        calcium_channel_blockers: "Calcium Channel Blockers",
        ace_inhibitors: "ACE Inhibitors",
        angiotensin2_receptor_blockers: "Angiotensin 2 Receptor Blockers",
        vasodilator: "Vasodilator",
        others: "Others"
    }
}
const toDrillColumn = (label: string, ref: string) => {
    return {
        ref,
        label,
        defaultValue: '',
        toValue: (data: any) => data.length,
        tdClick: async (row: any) => {
            if(row.refData.length) {
                (await modalController.create({
                    component: ArtDrilldown,
                    backdropDismiss: false,
                    cssClass: 'large-modal',
                    componentProps: {
                        title: row.column.label,
                        subtitle: period,
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
        { label: "indicator", ref: 'indicator' },
        toDrillColumn("Reporting period", "reporting_period"),
        toDrillColumn("Cumulatively", "cumulatively"),
    ]
]

const setDefaults = (values={} as any) => {
    reportData.value = []
    const generateIndicators = (cat: 'htn_enrollment' | 'treatment_drug_classification') => {
        let count = 1
        Object.keys(reportModel[cat]).forEach((key) => { 
            if (key === '_label') {
                reportData.value.push({
                    indicator: `<b>${reportModel[cat][key]}</b>`,
                    index: ''
                })
                return
            } 
            const val = values?.[cat]?.[key]
            reportData.value.push({
                index: count,
                indicator: reportModel[cat][key],
                reporting_period: val?.reporting_period ?? [],
                cumulatively: val?.cummulative ?? [],
            })
            ++count
        })
    }
    generateIndicators('htn_enrollment')
    generateIndicators('treatment_drug_classification')
}

const generate = () => wrapGeneration(async () => {
    if (!(report.startDate && report.endDate)) {
        return toastWarning('Start date and end date required!')
    }
    setDefaults({})
    setDefaults((await report.getHtnEnrollmentReport()))
})

/**
 * Initialization code when the report is empty!
*/
onMounted(() => {
    setDefaults()
    configure()
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
</script>
