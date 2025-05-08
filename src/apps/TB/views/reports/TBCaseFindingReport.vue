<template>
    <ion-page>
        <v2Datatable
            title="TB Case Finding Report"
            :subtitle="period"
            :columns="columns"
            :columnData="reportData"
            :headerBadge="headerBadges"
            :rowsPerPage="100"
            :onConfigure="configure"
        ></v2Datatable>
    </ion-page>   
</template>
<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { IonPage, modalController } from "@ionic/vue"
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { TBReportService } from "@/apps/ART/services/reports/tb_report_service";
import { v2ColumnInterface, v2TableBadge } from "../../../../components/DataViews/tables/v2PocDatatable/types";
import { addIndexes, wrapGeneration } from "../../../../utils/v2utils";
import { FieldType } from "@/components/Forms/BaseFormElements";
import Validation from "@/components/Forms/validations/StandardValidations";
import { configureTbReport } from "@/apps/TB/services/util"
import { Option } from "@/components/Forms/FieldInterface";
import { toastWarning } from "../../../../utils/Alerts";
import { isEmpty } from "lodash";
import TBDrilldown from "@/apps/TB/components/TBDrilldown.vue";
import { barChart } from "ionicons/icons"

const report = new TBReportService()
const reportData = ref<any>([])
const period = ref('')
const year = ref('')
const quarter = ref('')
const selectedColumns = ref([])
const headerBadges = ref<v2TableBadge[]>([])
const columns = ref<Array<v2ColumnInterface[]>>([])
const ageGroups = [ '0-4', '5-14', '15-24', '25-34', '35-44', '45-54', '55-64', '65+']
const columnModel = [
    // Cases
    {
        label: "New Smear positive", 
        ref: "new_smear_positive", 
        tags: ["cases"],
    },
    { 
        label: "New MTB Detected Xpert", 
        ref: "new_mtb_detected_xpert", 
        tags: ["cases"]
    },
    { 
        label: "New Pulmonary Clinically Diagnosed", 
        ref: "new_pulmonary_clinically_diagnosed", 
        tags: ["cases"]
    },
    { 
        label: "New EPTB", 
        ref: "new_eptb", 
        tags: ["cases"]
    },
    { 
        label: "Relapse Bacteriologically Confirmed", 
        ref: "relapse_bacteriologically_confirmed", 
        tags: ["cases"]
    },
    {
        label: "Treatment Failure Bacteriologically Confirmed",
        ref: "treatment_failure_bacteriologically_confirmed",
        tags: ["cases"]
    },
    {
        label: "Treatment LTF Bacteriologically Confirmed",
        ref: "treatment_ltf_bacteriologically_confirmed",
        tags: ["cases"]
    },
    {
        label: "Treatment LTF Clinically Diagnosed Pulmonary",
        ref: "treatment_ltf_clinically_diagnosed_pulmonary",
        tags: ["cases"]
    },
    { 
        label: "Treatment LTF EPTB", 
        ref: "treatment_ltf_eptb", 
        tags: ["cases"] 
    },
    { 
        label: "Relapse Clinical Pulmonary", 
        ref: "relapse_clinical_pulmonary", 
        tags: ["cases"]
    },
    { 
        label: "Relapse EPTB", 
        ref: "relapse_eptb", 
        tags: ["cases"]
    },
    {
        label: "Other Previously Treated Bacteriologically Confirmed",
        ref: "other_previously_treated_bacteriologically_confirmed",
        tags: ["cases"]
    },
    {
        label: "Other Previously Treated Clinical Pulmonary",
        ref: "other_previously_treated_clinical_pulmonary",
        tags: ["cases"]
    },
    { 
        label: "Other Previously Treated EPTB", 
        ref: "other_previously_treated_eptb", 
        tags: ["cases"]
    },
    {
        label: "Unknown Previous Treatment History Bacteriological",
        ref: "unknown_previous_treatment_history_bacteriological", 
        tags: ["cases"]
    },
    {
        label: "Unknown Previous Treatment History EPTB",
        ref: "unknown_previous_treatment_history_eptb", 
        tags: ["cases"]
    },
    //Presumptives
    {
        label: "Patients with Presumptive TB Undergoing Bacteriological Examination Via Xpert",
        ref: "patients_with_presumptive_tb_undergoing_bacteriological_examination_via_xpert",
        tags: ["presumptives"]
    },
    {
        label:"Patients with Presumptive TB Undergoing Bacteriological Examination Via Microscopy",
        ref:"patients_with_presumptive_tb_undergoing_bacteriological_examination_via_microscopy",
        tags: ["presumptives"]
    },
    {
        label: "Patients with Presumptive TB with Positive Bacteriological Examination Via Xpert",
        ref: "patients_with_presumptive_tb_with_positive_bacteriological_examination_via_xpert",
        tags: ["presumptives"]
    },
    { 
        label: "Patients with Presumptive TB with Positive Bacteriological Examination Via Microscopy",
        ref: "patients_with_presumptive_tb_with_positive_bacteriological_examination_via_microscopy",
        tags: ["presumptives"]
    }
]

async function drillDown(title: string, patientIdentifiers: number[]) {
    (await modalController.create({
        component: TBDrilldown,
        backdropDismiss: false,
        cssClass: "large-modal",
        componentProps: {
            title,
            patientIdentifiers,
            onFinish: () => modalController.getTop().then((v) => v && modalController.dismiss()),
        },
    })).present();
}

function refreshColumns() {
    const primaryColumns: any = [
        { 
            label: "#", 
            ref: "index",
            span: { thRowspan: 2 } 
        },
        {
            label: "Age Category",
            ref: "age_group",
            span: { thRowspan: 2 }
        }, 
        ...selectedColumns.value.map((column: v2ColumnInterface) => ({ 
            ...column, ref: "", span: { thColspan: 2 } 
        })) as v2ColumnInterface[]
    ]
    const secondaryColumns = selectedColumns.value.reduce((a: any, c: v2ColumnInterface) => {
        const data = (gender: "M"|"F") => ({
            label: gender, ref: `${c.ref}_${gender.toLowerCase()}`,
            secondaryLabel: `${c.label} (${gender === "M" ? "Male" : "Female"})`,
            toValue: (data: any) => `${data.length}`,
            tdClick: (row: any) => row.refData.length && drillDown(c.label, row.refData)
        })
        return [...a, data("F"), data("M")]
    }, [])
    columns.value = [primaryColumns, secondaryColumns]
}

const generate = () => wrapGeneration(async () => {
    if (!(year.value && quarter.value)) return toastWarning("Year and quarter are required!")
    const res = await report.getTBCaseFindingReport(
        year.value,
        parseInt(`${quarter.value}`),
        selectedColumns.value.map((col: any) => col.ref)
    )
    const hashifiedData: any = res.reduce((a: any, data: any) => {
        const { indicator, ...ageGroups } = data
        return {...a, [indicator]: ageGroups }
    }, {})
    const data = ageGroups.reduce((a: any, ageGroup: string) => {
        const obj: any = { age_group: ageGroup }
        Object.keys(hashifiedData).forEach((indicator: string) => {
            const maleIndicator = `${indicator}_m`
            const femaleIndicator = `${indicator}_f`
            const male = hashifiedData[indicator][ageGroup]["male"]
            const female = hashifiedData[indicator][ageGroup]["female"]
            obj[maleIndicator] = male
            obj[femaleIndicator] = female
            a.aggregates = {
                ...a.aggregates,
                [maleIndicator]: [...a.aggregates?.[maleIndicator]??[], ...male ],
                [femaleIndicator]: [...a.aggregates?.[femaleIndicator]??[], ...female]
            }
        })
        a.rows.push(obj)
        return a
    }, { aggregates: {}, rows: [] })
    reportData.value = addIndexes([...data.rows, { age_group: "Totals", ...data.aggregates }])
    // Action buttons for filtering reports
    headerBadges.value = [
        {
            text: "All",
            icon: barChart,
            color: "primary",
            action: () => {
                selectedColumns.value = columnModel as any
                refreshColumns()
                generate()
            }
        },
        {
            text: "Show Presumptives",
            icon: barChart,
            color: "primary",
            action: () => {
                selectedColumns.value = columnModel.filter((column: any) => column.tags.includes("presumptives")) as any
                refreshColumns()
                generate()
            }
        },
        {
            text: "Cases",
            icon: barChart,
            color: "primary",
            action: () => {
                selectedColumns.value = columnModel.filter((column: any) => column.tags.includes("cases")) as any
                refreshColumns()
                generate()
            }
        }
    ]
    return true
})

const configure = () => configureTbReport([
    {
        id: "indicator",
        helpText: "Indicators",
        type: FieldType.TT_SELECT,
        validation: (v: Option) => Validation.required(v),
        options: () => [
            { 
                label: "All", value: "all", 
                other: () => columnModel 
            },
            { 
                label: "Cases", value: "cases",
                other: () => columnModel.filter((column: any) => column.tags.includes("cases"))
            },
            {
                label: "Presumptives", value: "presumptives",
                other: () => columnModel.filter((column: any) => column.tags.includes("presumptives"))
            },
            {
                label: "Custom Indicators", value: "custom"
            }
        ]
    },
    {
        id: "custom",
        helpText: "Custom indicators",
        type: FieldType.TT_MULTIPLE_SELECT,
        validation: (v: Option) => Validation.required(v),
        condition: (f: any) => f.indicator.value === 'custom',
        options: () => columnModel.map((indicator) => ({
            label: indicator.label,
            value: indicator.ref,
            other: indicator
        }))
    }],
    (f: any) => {
        reportData.value = []
        selectedColumns.value = []
        year.value = f.year.value
        quarter.value = f.quarter.value
        period.value = `Q${quarter.value} ${year.value}`
        if (typeof f.indicator.other === 'function') {
            selectedColumns.value = f.indicator.other()
        } else if (!isEmpty(f.custom)) {
            selectedColumns.value = f.custom.map((option: Option) => option.other)
        }
        if (selectedColumns.value.length) {
            refreshColumns()
            generate()
        }
    }
)

onMounted(() => configure())
</script>