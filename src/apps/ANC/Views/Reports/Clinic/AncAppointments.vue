<template>
    <ion-page>
        <report-template
            :title="title"
            :period="period"
            :rows="rows" 
            :fields="fields"
            :columns="columns"
            :onReportConfiguration="onPeriod">
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { AncClinicReportService } from "@/apps/ANC/Services/anc_clinic_report_service"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import { FieldType } from '@/components/Forms/BaseFormElements'
import Validation from "@/components/Forms/validations/StandardValidations"
import table from "@/components/DataViews/tables/ReportDataTable"
import { IonPage } from "@ionic/vue"
import { AncReportComposable } from "@/apps/ANC/composables/AncReports"

export default defineComponent({
    components: { ReportTemplate, IonPage },
    setup() { 
        const r =  AncReportComposable('Booked clients')
        const { reportData, fd, gotoPatientDashboard } = r
        reportData.service = new AncClinicReportService()
        reportData.other['appointments'] = [] as any
        reportData.fields = [
            {
                id: 'date',
                helpText: 'Select date',
                type: FieldType.TT_DATE_PICKER,
                defaultValue: () => AncClinicReportService.getSessionDate(),
                validation: (val: any) => Validation.required(val),
                onValue: async (date: string) => {
                    reportData.service .setStartDate(date)
                    if (!reportData.other['appointments'][date]) {
                        reportData.other['appointments'][date] = (await reportData.service.generateBookedAppointments()) || []
                    }
                    return true
                },
                config: {
                    infoItems: (date: string) => {
                        return [{
                            label: 'Appointments',
                            value: reportData.other['appointments'][date]?.length || 0
                        }]
                   } 
                }
            }
        ]
        reportData.columns = [
            [
                table.thTxt('Identifier'),
                table.thTxt('First name'),
                table.thTxt('Last name') ,
                table.thTxt('Gender'),
                table.thTxt('birthdate'),
                table.thTxt('Actions')
            ]
        ]
        const onPeriod = async (form: any) => {
            reportData.rows = []
            reportData.period = fd(form.date)
            reportData.rows = reportData.other['appointments'][form.date].map((p: any) => ([
                table.td(p.npid),
                table.td(p.given_name),
                table.td(p.family_name),
                table.td(p.gender),
                table.tdDate(p.birthdate),
                table.tdBtn('View', () => gotoPatientDashboard(p.person_id))
            ]))
        }
        return {
            ...r,
            onPeriod
        }
    }
})
</script>
