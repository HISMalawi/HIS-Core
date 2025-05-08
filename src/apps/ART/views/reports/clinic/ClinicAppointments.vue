<template>
    <ion-page>
        <v2Datatable 
            default-sort-order="asc" 
            default-sorted-column="given_name"
            :icon-url="logo" title="Booked clients" 
            report-prefix="Clinic" 
            :subtitle="period" 
            :columns="columns"
            :columnData="reportData" 
            :rowsPerPage="50" 
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
import { formatGender, toDate } from "@/utils/Strs";
import { AppointmentService } from '@/apps/ART/services/appointment_service'
import { PatientReportService } from "@/apps/ART/services/reports/patient_report_service"
import PopupKeyboard from "@/utils/PopupKeyboard";
import { FieldType } from '@/components/Forms/BaseFormElements'
import Validation from "@/components/Forms/validations/StandardValidations"
import Img from "@/utils/Img";
import { addArvColumn, addViewPatientColumn, wrapGeneration } from "@/utils/v2utils"

const reportData = ref<any>([])
const period = ref('')
const report = new PatientReportService()
const totalAppointments = ref<Record<string, any>>({})
const logo = Img('reports.png')

const columns: Array<v2ColumnInterface[]> = [[
    addArvColumn(),
    { label: "First name", ref: "given_name", encrypted: true },
    { label: "Last name", ref: "family_name", encrypted: true },
    { label: "Gender", ref: "gender", toValue: (val) => formatGender(val) },
    { label: "Birthdate", ref: "birthdate", toValue: (val) => `${toDate(val)}` },
    { label: "Outcome", ref: "outcome" },
    {
        ref: "district",
        label: "Current Address",
        encrypted: true,
        exportedValue: {
            dataValue: (v: v2ColumnDataInterface) => `
                ${v.data.district},
                ${v.data.village},
                ${v.data.land_mark},
                ${v.data.cell_phone}
            ` 
        },
        value: (data) => `District: <br/> <b>${data.district}</b><br/>
            Village: <br/> <b>${data.village}</b><br/>
            Land-mark: <br/> <b>${data.land_mark}</b><br/>
            Cellphone: <br/> <b>${data.cell_phone}</b>
        `
    },
    addViewPatientColumn("person_id", "/patients/confirm?person_id=")
]]

const generate = () => wrapGeneration(async () => {
    reportData.value = []
    reportData.value = await report.getBookedAppointments(report.startDate)
})

/**
 * Loads a dialogue to allow users to configure start and end date
 */
const configure = () => {
    PopupKeyboard({
        id: 'date',
        helpText: 'Select date',
        type: FieldType.TT_DATE_PICKER,
        defaultValue: () => PatientReportService.getSessionDate(),
        validation: (val: any) => Validation.required(val),
        onValue: async (date: string) => {
            if (!totalAppointments.value[date]) {
                totalAppointments.value[date] = (await AppointmentService.getDailiyAppointments(date))?.length ?? 0;
            }
            return true
        },
        config: {
            infoItems: (date: string) => {
                return [{
                    label: 'Appointments',
                    value: totalAppointments.value[date]
                }]
            } 
        }
    }, (date) => {
        report.setStartDate(date)
        period.value = `Appointment date: ${toDate(date)}`
        generate()
    })
}

/**
 * Initialization code when the report is empty!
 */
onMounted(() => !reportData.value.length && configure())
</script>