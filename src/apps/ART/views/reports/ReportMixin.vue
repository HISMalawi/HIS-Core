<script lang="ts">
import { Service } from "@/services/service"
import { defineComponent } from 'vue'
import { Field } from '@/components/Forms/FieldInterface'
import { Patientservice } from "@/services/patient_service"
import HisDate from "@/utils/Date"
import { modalController } from "@ionic/vue";
import DrilldownTable from "@/apps/ART/views/reports/BasicReportTemplate.vue"
import { ArtReportService } from "@/apps/ART/services/reports/art_report_service"
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Option } from '@/components/Forms/FieldInterface'
import Validation from "@/components/Forms/validations/StandardValidations"
import table, { AsyncTableRowHandler } from "@/components/DataViews/tables/ReportDataTable"
import { isArray } from "lodash"
import Store from "@/composables/ApiStore"
import App from "@/apps/app_lib"
import { formatGender as fmtGender, toDate } from "@/utils/Strs"
import { PatientProgramService } from "@/services/patient_program_service"


export default defineComponent({
    data: () => ({
        app: App.getActiveApp(),
        fields: [] as Array<Field>,
        report: {} as any,
        reportReady: false as boolean,
        period: '' as string,
        startDate: '' as string,
        endDate: '' as string,
        customFileName: '' as string,
        isMilitarySite: false as boolean,
        drillDownCache: {} as Record<number, Array<any>>
    }),
    methods: {
        formatGender(gender: string) {
            return fmtGender(gender);
        },
        toDate(date: string) {
            return HisDate.toStandardHisDisplayFormat(date)
        },
        sortByArvNumber(data: Array<any>, attr='arv_number') {
            try {
                return data.sort((a: any, b: any) => this.getArvInt(a[attr]) > this.getArvInt(b[attr]) ? 1 : -1)
            } catch(e) {
                console.error(e)
                return data
            }
        },
        getArvInt(arv: string) {
            if (typeof arv === 'string') {
                const arvNumStr = arv.split('-')[2]
                const arvNumInt = parseInt(arvNumStr)
                return typeof arvNumInt === 'number' ? arvNumInt : 0 
            }
            return 0
        },
        parseAgeGroup (ageGroup: string): number[] {
            if (ageGroup === '<1 year') return [0, 0]
            if (ageGroup === '90 plus years') return [90, 1000]
            return ageGroup.split('-').map(age => parseInt(age, 10));
        },
        tdARV(arv: string, params={}) {
            return table.td(arv, { sortValue: this.getArvInt(arv), ...params})
        },
        confirmPatient(patient: number) {
            return this.$router.push(`/patients/confirm?person_id=${patient}`)
        },
        async drilldownAsyncRows(title: string, columns: Array<any>, asyncRows: AsyncTableRowHandler, canExport=true) {
            const modal = await modalController.create({
                component: DrilldownTable,
                cssClass: 'large-modal',
                componentProps: { 
                    title, 
                    columns, 
                    asyncRows,
                    canExport,
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
                    table.thTxt('Art start date'), 
                    table.thTxt('Actions')
                ]
            ]
            const rowParser = async (tableRows: Array<any[]>) => {
                let ARV_NUM_INDEX = 0
                const t = tableRows.map(async (defaultRow: Array<any>) => {
                    let id: any = null
                    let index: null | number = null
                    if (isArray(defaultRow)) {
                        const [num, key ] = defaultRow
                        index = num
                        if (key in this.drillDownCache) {
                            return [index, ...this.drillDownCache[key].slice(1)]
                        }
                    } else {
                        id = defaultRow
                        if (id in this.drillDownCache) {
                            return this.drillDownCache[id]
                        }
                    }
    
                    const data = await Patientservice.findByID(id)
                    const pProgram = await (new PatientProgramService(id)).getProgram()
                    const patient = new Patientservice(data)
                    const row = []
                    if (index) {
                        ARV_NUM_INDEX = 1
                        row.push(index)
                    } 
                    row.push(this.tdARV(patient.getArvNumber()))
                    row.push(table.td(this.formatGender(patient.getGender())))
                    row.push(table.tdDate(patient.getBirthdate().toString()))
                    row.push(table.tdDate(pProgram.startDate))
                    row.push(table.tdBtn('Show', async () => {
                        await modalController.dismiss({})
                        this.$router.push({ path: `/patient/dashboard/${id}`})
                    }))
                    this.drillDownCache[id] = row
                    return row
                })
                const rows = await Promise.all(t)
                return rows.sort((a: any, b: any) => 
                        a[ARV_NUM_INDEX].sortValue > b[ARV_NUM_INDEX].sortValue 
                        ? 1 : -1)
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
        getQuaterOptions() {
            const quarters = ArtReportService.getReportQuarters()
            return quarters.map((q: any) => ({
                label: q.name, value: q.start, other: q
            }))
        },
        getDateDurationFields(
            useQuarter=false, 
            setCustomQuarterPeriod=false, 
            maxQuarter=5, 
            maxDate=Service.getSessionDate() as string | null,
        ): Array<Field> {
            const minDate = '2000-01-01'
            return [
                {
                    id: 'quarter',
                    helpText: 'Select Quarter',
                    type: FieldType.TT_SELECT,
                    condition: () => useQuarter,
                    validation: (val: Option) => Validation.required(val),
                    options: () => {
                        const quarters = ArtReportService.getReportQuarters(maxQuarter)
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
                {
                    id: 'start_date',
                    helpText: 'Start Date',
                    type: FieldType.TT_FULL_DATE,
                    validation: (v: Option) => {                        
                        if (!v) return ['Date is required']

                        if (minDate && new Date(v.value) < new Date(minDate)) {
                            return [`${toDate(`${v.value}`)} is less than minimum date of ${toDate(minDate)}`]
                        }
                        if (maxDate && new Date(v.value) > new Date(maxDate)) {
                            return [`${toDate(`${v.value}`)} is greater than max date of ${toDate(maxDate)}`]
                        }
                        return null
                    },
                    computedValue: (v: Option) => v.value,
                    condition: (f: any) => f.quarter && f.quarter.value === 'custom_period' || !useQuarter,
                },
                {
                    id: 'end_date',
                    helpText: 'End Date',
                    type: FieldType.TT_FULL_DATE,
                    defaultValue: (f: any) => f.start_date.value,
                    validation: (v: Option, f: any) => {
                        if (!v) return ['Date is required']

                        if (f.start_date.value && new Date(v.value) < new Date(f.start_date.value)) {
                            return [`${toDate(`${v.value}`)} is less than minimum date of ${toDate(f.start_date.value)}`]
                        }
                        if (maxDate && new Date(v.value) > new Date(maxDate)) {
                            return [`${toDate(`${v.value}`)} is greater than max date of ${toDate(maxDate)}`]
                        }
                        return null
                    },
                    computedValue: (v: Option) => v.label,
                    condition: (f: any) => f.quarter && f.quarter.value === 'custom_period' || !useQuarter,
                },
                {
                    id: 'occupation',
                    helpText: "Report Group",
                    type: FieldType.TT_SELECT,
                    init: async () => {
                        this.isMilitarySite = await Store.get('IS_MILITARY_SITE')
                        return true
                    },
                    computedValue: (v: Option) => v.value, 
                    condition: () => this.app?.applicationName === 'ART' && this.isMilitarySite,
                    validation: (val: Option) => Validation.required(val),
                    options: () => {
                        return [
                            { label: 'All', value: 'All'},
                            { label: 'Military', value: 'Military'},
                            { label: 'Civilian', value: 'Civilian'},
                        ]
                    }
                }
            ]
        }
    }
})
</script>
