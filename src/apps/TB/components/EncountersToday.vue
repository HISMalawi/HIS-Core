<template>
    <div>
        <h1 class="ion-text-center his-lg-text" style="font-weight:bold;color:#6281a7;">
            Visit statistics
        </h1>
        <table>
            <thead>
                <tr>
                    <th class="his-lg-text">Task type</th>
                    <th class="his-lg-text">Today</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(data, index) in rows" :key="index">
                    <td class="his-md-text">{{ data[0].td.toUpperCase() }}</td>
                    <td class="his-md-text">{{ data[1].td }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import table from "@/components/DataViews/tables/ReportDataTable"
import { RegistrationReportService } from '@/apps/Registration/services/registration_report_service'

export default defineComponent({
    setup() {
        const rows = ref(Array.from({ length: 6 }, (_) => [{td: '...'}, {td: '...'}])) as any
        onMounted(() => {
            const stats = new RegistrationReportService()
            const req = stats.requestReport()
            if (typeof req === 'object' && req.then) {
                req.then((data) => {
                    rows.value = []
                    Object.keys(data).forEach((item: any) => {
                        rows.value.push([
                            table.td(humanize(item)),
                            table.td(data[item].today)
                        ])
                    })
                })
            }
        })
        return {
            rows
        }
    }
})

const humanize = (str: string) => {
    return str?.replace(/_/g, ' ')
           ?.replace(/\b\w/g, match => match.toUpperCase());
}
</script>
<style scoped>
table {
    width: 100%;
    border: 1px solid #eee!important;
    background: white;
    text-align: left;
}

td, th {
    padding: 1.3%;
}

td {
    border: 1px solid rgb(200, 200, 200);
    background-color: #f2f2f2;
}

thead {
    color: #fff;
    background-color: #6281a7;
}
</style>