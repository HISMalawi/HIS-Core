<script lang="ts">
import { defineComponent } from 'vue'
import { Field } from '@/components/Forms/FieldInterface'
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import { Patientservice } from "@/services/patient_service"
import HisDate from "@/utils/Date"
import { modalController } from "@ionic/vue";
import DrilldownTable from "@/apps/ART/views/reports/BasicReportTemplate.vue"
import { OpdReportService } from "@/apps/OPD/services/opd_report_service"
import { IDSRReportService } from "@/apps/OPD/services/idsr_service"
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Option } from '@/components/Forms/FieldInterface'
import Validation from "@/components/Forms/validations/StandardValidations"
import table, { AsyncTableRowHandler } from "@/components/DataViews/tables/ReportDataTable"
import moment from "dayjs"
import { Service } from '@/services/service';
import { isEmpty } from 'lodash'

export default defineComponent({
    data: () => ({
        fields: [] as Array<Field>,
        report: {} as any,
        reportReady: false as boolean,
        period: '' as string,
        startDate: '' as string,
        endDate: '' as string,
        customFileName: '' as string,
        drillDownCache: {} as Record<number, Array<any>>
    }),
    methods: {
        toDate(date: string) {
            return HisDate.toStandardHisDisplayFormat(date)
        },
        confirmPatient(patient: number) {
            return this.$router.push(`/patients/confirm?person_id=${patient}`)
        },
        async exportToCustomPDF(title: string) {
            const printW = open('', '', 'width:1024px, height:768px')
            const content = document.getElementById('report-content')
            if (content && printW) {
                printW.document.write(`
                    <html>
                    <head>
                        <title>${title}</title>
                        <link rel="stylesheet" media="print" href="/assets/css/cohort.css" />
                    </head>
                    <body>
                        ${content.innerHTML}
                    </body>
                    </html>
                `)
                setTimeout(() => { printW.print(); printW.close() }, 3500)
            }
        },
        async onDrillDown(conditionName: string, patientIds: number[]) {
            if(isEmpty(patientIds)) return
            const columns = [[
                table.thTxt('First name'),
                table.thTxt('Last name'),
                table.thTxt('Gender'),
                table.thTxt('Age'),
                table.thTxt('Phone'),
                table.thTxt('Address'),
                table.thTxt('Action')
            ]]
            const rowParser = async (ids: number[]) => {
                return await Promise.all(ids.map(async (id) => {
                const personDetails = await Patientservice.findByID(id)
                const patient = new Patientservice(personDetails)
                return [
                    table.td(patient.getGivenName()),
                    table.td(patient.getFamilyName()),
                    table.td(patient.getGender()),
                    table.td(patient.getAge()),
                    table.td(patient.getPhoneNumber()),
                    table.td(`${patient.getCurrentDistrict()}, ${patient.getCurrentVillage()}, ${patient.getClosestLandmark()}`),
                    table.tdBtn('Select', async () => {
                    await modalController.dismiss({})
                    this.$router.push({ path: `/patient/dashboard/${id}`})
                    })
                ]
                })) 
            }
            return this.drilldownData(conditionName, columns, patientIds, rowParser)
        },
        async drilldownAsyncRows(title: string, columns: Array<any>, asyncRows: AsyncTableRowHandler) {
            const modal = await modalController.create({
                component: DrilldownTable,
                cssClass: 'large-modal',
                componentProps: { 
                    title, 
                    columns, 
                    asyncRows,
                    showFilters: true,
                    rowsPerPage: 50,
                    paginated: true,
                    showReportStamp: false,
                    footerColor: 'light',
                    onFinish: () => modalController.dismiss()
                }
            })
            modal.present()
        },
        async drilldownData(title: string, columns: Array<any>, rows: Array<any>, rowParser: any) {
            const modal = await modalController.create({
                component: DrilldownTable,
                cssClass: 'large-modal',
                componentProps: { 
                    title, 
                    columns, 
                    rows,
                    rowParser,
                    rowsPerPage: 50,
                    showFilters: true,
                    paginated: true,
                    showReportStamp: false,
                    footerColor: 'light',
                    onFinish: () => modalController.dismiss()
                }
            })
            modal.present()
        },
        getDefaultDrillDownTable() {
            const columns = [
                [
                    table.thTxt('ARV number'), 
                    table.thTxt('Gender'),
                    table.thTxt('Birth Date'), 
                    table.thTxt('Actions')
                ]
            ]
            const rowParser = (tableRows: Array<any[]>) => {
                return tableRows.map(async (defaultRow: Array<any>) => {
                    const [index, id ] = defaultRow
                    if (id in this.drillDownCache) {
                        //const [oldIndex, ...rest] = this.drillDownCache[id]
                        return [index] // Assign new index number and maintain patient record
                    } 
    
                    const data = await Patientservice.findByID(id)
                    const patient = new Patientservice(data)
                    const row = [
                        index,
                        table.td(patient.getArvNumber()), 
                        table.td(patient.getGender()), 
                        table.tdDate(patient.getBirthdate().toString()),
                        table.tdBtn('Show', async () => {
                            await modalController.dismiss({})
                            this.$router.push({ path: `/patient/dashboard/${id}`})
                        })
                    ]
                    this.drillDownCache[id] = row
                    return row
                })
            }
            return { rowParser, columns }
        },
        runTableDrill(data: any, title='Drilldown patients') {
            const { columns, rowParser } = this.getDefaultDrillDownTable()
            this.drilldownData(title, columns, data, rowParser)
        },
        drill(values: Array<number>, title='Drill table') {
            if (values && values.length > 0) {
                return table.tdLink(
                    values.length, 
                    () => this.runTableDrill(values, title)
                )
            }
            return table.td(0)
        },
        getEpiweeksFields(): Array<Field> {
            return [
                {
                    id: 'epiweek',
                    helpText: 'Select EPI week',
                    type: FieldType.TT_SELECT,
                    validation: (val: Option) => Validation.required(val),
                    options: async () => {
                        const epiWeeks = await IDSRReportService.getReportEpiWeeks()
                        const items: Array<Option> = epiWeeks.map((q: any) => ({
                            label: q.name +' - ('+ moment(q.start).format('DD/MMM/YYYY') +' - '+ moment(q.end).format('DD/MMM/YYYY')+')',
                            value: q.start,
                            other: q
                        }))
                        return items
                    }
                },
            ]
        },
        getMonthlyFields(): Array<Field> {
            return [
                {
                    id: 'idsrmonth',
                    helpText: 'Select Month',
                    type: FieldType.TT_SELECT,
                    validation: (val: Option) => Validation.required(val),
                    options: async () => {
                        const epiWeeks = await IDSRReportService.getReportMonths()
                        const items: Array<Option> = epiWeeks.map((q: any) => ({
                            label: q.name +' - ('+ moment(q.start).format('DD/MMM/YYYY') +' - '+ moment(q.end).format('DD/MMM/YYYY')+')',
                            value: q.start,
                            other: q
                        }))
                        return items
                    }
                },
            ]
        },
        getDateDurationFields(useQuarter=false, setCustomQuarterPeriod=false, maxQuarter=5): Array<Field> {
            const minDate = '2001-01-01'
            const maxDate = Service.getSessionDate()
            return [
                {
                    id: 'quarter',
                    helpText: 'Select Quarter',
                    type: FieldType.TT_SELECT,
                    condition: () => useQuarter,
                    validation: (val: Option) => Validation.required(val),
                    options: () => {
                        const quarters = OpdReportService.getReportQuarters(maxQuarter)
                        let items: Array<Option> = quarters.map((q: any) => ({
                            label: q.name,
                            value: q.start,
                            other: q
                        }))
                        if (setCustomQuarterPeriod) {
                            items = [
                                {
                                    label: 'Set custom period',
                                    value: 'custom_period',
                                    other: {}
                                },
                                ...items
                            ]
                        }
                        return items
                    }
                },
                ...generateDateFields({
                    id: 'start_date',
                    helpText: 'Start',
                    required: true,
                    condition: (f: any) => f.quarter && f.quarter.value === 'custom_period' || !useQuarter,
                    minDate: () => minDate,
                    maxDate: () => maxDate,
                    estimation: {
                        allowUnknown: false
                    },
                    computeValue: (date: string) => date 
                }),
                ...generateDateFields({
                    id: 'end_date',
                    helpText: 'End',
                    required: true,
                    condition: (f: any) => f.quarter && f.quarter.value === 'custom_period' || !useQuarter,
                    unload: (d: any, s: any, f: any, c: any) => {
                        if (s === 'next') {
                            this.endDate = c.end_date
                        }
                    },
                    minDate: (_: any, c: any) => c.start_date,
                    maxDate: () => maxDate,
                    estimation: {
                        allowUnknown: false
                    },
                    computeValue: (date: string) => date
                })
            ]
        }
    }
})
</script>
