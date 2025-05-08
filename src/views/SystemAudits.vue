<template>
    <ion-page>
        <v2Datatable 
            default-sort-order="asc" 
            default-sorted-column="encounter"
            title="System Audits" 
            :icon-url="logo" 
            :subtitle="period" 
            :columns="columns"
            :columnData="reportData" 
            :rowsPerPage="20" 
            :onConfigure="configure" 
            :onRefresh="generate" 
        />
    </ion-page>
</template>

<script lang='ts' setup>
import { IonPage } from "@ionic/vue"
import { onMounted, ref } from 'vue'
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { v2ColumnDataInterface, v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import Img from "@/utils/Img";
import { showV2TableModal, wrapGeneration } from "@/utils/v2utils"
import HisDate from "../utils/Date";
import { DateSelection } from "@/utils/ReportDateSelectionPrompt";
import { UserService } from "@/services/user_service";

const reportData = ref<v2ColumnDataInterface[]>([])
const period = ref('')
const startDate = ref('')
const endDate = ref('')
const logo = Img('reports.png')

const columns: Array<v2ColumnInterface[]> = [[
    { label: "Encounter", ref: "auditable_type" },
    { label: "Action Type", ref: "action" },
    { label: "User", ref: "user", toValue: (user) => user ? `${user.username} (${user.name})` : "" },
    { label: "Timestamp", ref: "created_at", toValue: HisDate.toStandardHisDisplayFormat },
    { 
        label: "Changes", 
        ref: "changes",
        toValue: (data) => data?.length ?? 0,
        tdClick: async (row: any) => {
            const drillColumns: v2ColumnInterface[][] = [[
                { label: "Attribute", ref: "attribute"},
                { label: "Previous Value", ref: "previous"},
                { label: "Current Value", ref: "current"},
            ]];

            const drillData = row.data.changes
                .map((change: any) => {
                    const [attribute, value]: [string, any] = Object.entries(change)[0] || [];
                    if (!attribute) return null;

                    return /password/i.test(attribute)
                        ? { attribute, previous: "*******", current: "*******" }
                        : { attribute, ...value };
                })
                .filter((entry: any) => entry !== null);

            await showV2TableModal({
                title: `Changes made by ${row.data.user.name} on ${row.data.auditable_type}`,
                columns: drillColumns,
                columnData: drillData,
            });
        }
    },
]]

const generate = () => wrapGeneration(async () => {
    reportData.value = await UserService.getAuditReports(startDate.value, endDate.value)
})

/**
 * Loads a dialogue to allow users to configure start and end date
 */
 const configure = () => DateSelection({
    onFinish: (sDate: string, eDate: string, periodstr: string) => {
        period.value = `${periodstr}`
        startDate.value = sDate
        endDate.value = eDate
        generate()
    }
})

/**
 * Initialization code when the report is empty!
 */
onMounted(() => !reportData.value.length && configure())
</script>