<template>
    <ion-page>
        <report-template
            :title="title"
            :period="period"
            :rows="rows"
            :fields="fields"
            :columns="columns"
            :config="{
                showIndex: true
            }"
            :onReportConfiguration="onPeriod">
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import { IonPage } from "@ionic/vue"
import { AncPepfarReportService } from "@/apps/ANC/Services/anc_pepfar_report_service"
import  { AncReportComposable } from '@/apps/ANC/composables/AncReports'
import table from "@/components/DataViews/tables/ReportDataTable"
import dayjs from 'dayjs'

export default defineComponent({
    components: { ReportTemplate, IonPage },
    setup() {
        const locationName = AncPepfarReportService.getLocationName()
        const r =  AncReportComposable('Facility Pepfar Report')
        const { reportData, drill } = r
        reportData.columns = [
            [
                table.thTxt('District'),
                table.thTxt('Site'),
                table.thTxt('Month'),
                table.thTxt('Year') ,
                table.thTxt('ANC Indicator'),
                table.thTxt('Age Category'),
                table.thTxt('Value')
            ]
        ]
        reportData.other.months = {
            0: "January", 
            1: "February",
            2: "March",
            3: "April",
            4: "May",
            5: "June",
            6: "July",
            7: "August",
            8: "September",
            9: "October",
            10: "November",
            11: "December"
        } as any

        reportData.other.ageGroups = ["<10", "10-14", "15-19",
            "20-24", "25-29", "30-34", "35-39", "40-49",
            "50+", "Unknown", "All"
        ] as string[]

        reportData.other.indicators = [
            "Already on ART", 
            "Known at entry positive",
            "Known status", 
            "New ANC client", 
            "Newly identified negative",
            "Newly identified positive",
            "Newly on ART"
        ] as string[]

        const toDate = (date: string) => dayjs(date).format('MMM YYYY')

        const generateIndicatorDates = (startDate: string, endDate: string) => {
            const dates = [startDate]
            let date = startDate
            while(date < dayjs(endDate).add(-1, 'months').format('YYYY-MM-DD')) {
                dates.push(date = dayjs(date).add(1, 'months').format('YYYY-MM-DD'))
            }
            return dates
        }
        
        const generateRows = async (monthlyDates: string[]) => {
            for(const date of monthlyDates) {
                try {
                    const data = await reportData.service.generateDisaggregated(date)
                    reportData.other.indicators.forEach((indicator: string) => {
                        reportData.other.ageGroups.forEach((age: string) => {
                            const patients = data[toDate(date)][indicator][age]
                            reportData.rows.push([
                                table.td(''),
                                table.td(locationName || 'N/A'),
                                table.td(reportData.other.months[dayjs(date).month()]),
                                table.td(dayjs(date).year()),
                                table.td(indicator),
                                table.td(age),
                                drill(`${date}-${indicator}-${age}`,patients)
                            ])
                        })
                    })
                } catch (e) {
                    console.warn(`${e}`)
                }
            }
        }

        const onPeriod = async (_: any, c: Record<string, any>) => {
            reportData.rows = []
            reportData.service = new AncPepfarReportService()
            reportData.period = `${toDate(c.start_date)} - ${toDate(c.end_date)}`
            await generateRows(generateIndicatorDates(c.start_date, c.end_date))
        }

        return {
            ...r,
            onPeriod
        }
    }
})
</script>
