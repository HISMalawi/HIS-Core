import Validation from "@/components/Forms/validations/StandardValidations"
import { FieldType } from '@/components/Forms/BaseFormElements'
import { Field, Option } from '@/components/Forms/FieldInterface'
import { isPlainObject } from 'lodash'
import HisDate from "@/utils/Date"
import { Service } from "@/services/service"
import { modalController } from "@ionic/vue"
import DrilldownTable from "@/apps/ART/views/reports/BasicReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { Patientservice } from "@/services/patient_service"
import { useRouter } from "vue-router"
import { computed, reactive } from "vue"
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper"

export interface WindowPrintParamInterface {
    containerID: string;
    cssFile: string;
}

export function AncReportComposable(reportTitle='Report') {
    const reportData: any = reactive({
        title: reportTitle,
        rows: [] as Array<any>,
        columns: [] as Array<any>,
        fields: [] as Field[],
        period: '' as string,
        drill: [] as any,
        service: {} as any,
        other: {} as Record<string, any>
    })
    const rows = computed(() => reportData.rows)
    const period = computed(() => reportData.period)
    const fields = computed(() => reportData.fields)
    const columns = computed(() => reportData.columns)
    const title = computed(() => reportData.title)

    const router = useRouter()

    function gotoPatientDashboard(patientId: number) {
        router.push(`/patient/dashboard/${patientId}`)
    }

    // Short function name for formating dates
    function fd(date: string) {
        return HisDate.toStandardHisDisplayFormat(date)
    }

    /**
     * Trigger browser's print action
     * @param params 
     */
    function showPrintWindow(params: WindowPrintParamInterface) {
        const printW = open('', '', 'width:1024px, height:768px')
        const content = document.getElementById(params.containerID)
        if (content && printW) {
            printW.document.write(`
                <html>
                <head>
                    <title>Print Cohort</title>
                    <link rel="stylesheet" media="print"  href="${params.cssFile}"/>
                </head>
                <body>
                    ${content.innerHTML}
                </body>
                </html>
            `)
            setTimeout(() => { printW.print(); printW.close() }, 3500)
        }
    }

    async function presentDrillDown(title: string, patientIds: number[]) {
        (await modalController.create({
            component: DrilldownTable,
            cssClass: 'large-modal',
            componentProps: {
                title: title || 'Drilldown',
                columns: [
                    [
                        table.thTxt('National ID'),
                        table.thTxt('First name'),
                        table.thTxt('Last name'),
                        table.thTxt('Birthdate'),
                        table.thTxt('Action')
                    ]
                ],
                rows: patientIds,
                rowParser: async (patientIds: number[]) => {
                    const row = []
                    for(const id of patientIds) {
                        if (reportData.drill[id]) {
                            row.push(reportData.drill[id])
                            continue
                        }
                        try {
                            const patient = new Patientservice((await Patientservice.findByID(id))) 
                            reportData.drill[id] = [
                                table.td(patient.getNationalID()),
                                table.td(patient.getGivenName()),
                                table.td(patient.getFamilyName()),
                                table.tdDate(`${patient.getBirthdate()}`),
                                table.tdBtn('Show', () => {
                                    router.push({ path: `/patient/dashboard/${id}`})
                                    modalController.dismiss({})
                                })
                            ]
                            row.push(reportData.drill[id])
                        } catch (e) {
                            console.error(e)
                        }
                    }
                    return row
                },
                showFilters: true,
                footerColor: 'light',
                showReportStamp: false,
                paginated: true,
                rowsPerPage: 20,
                onFinish: () => modalController.dismiss()
            }
        })).present()
    }

    /**
     * Show drilldown table based on provided patient identifiers
     * @param title 
     * @param patientIds 
     * @returns 
     */
    function drill(title: string, patientIds: number[]) {
        if (patientIds.length) {
            return table.tdLink(patientIds.length, () => presentDrillDown(title, patientIds))
        }
        return table.td(0)
    }

    /**
     * Generates fields for entering Report start date and report End Date
     * @param params 
     * @returns 
     */
    function buildTimeIntervalFields(params={} as any) {
        return [
            ...generateDateFields({
                id: 'start_date',
                helpText: 'Start',
                required: true,
                minDate: () => params?.minDate || null,
                maxDate: () => params?.maxDate || null,
                estimation: {
                    allowUnknown: false
                },
                computeValue: (date: string) => date 
            }),
            ...generateDateFields({
                id: 'end_date',
                helpText: 'End',
                required: true,
                minDate: (_: any, c: any) => c.start_date,
                maxDate: () => params?.maxDate || null,
                estimation: {
                    allowUnknown: false
                },
                computeValue: (date: string) => date
            })
        ]
    }

    // Initialise default fields here
    reportData.fields = buildTimeIntervalFields()

    function getMonthlyReportFields() {
        return [
            {
                id: 'year',
                helpText: 'Select Year',
                type: FieldType.TT_NUMBER,
                computedValue: (v: Option) => v.value,
                validation: (v: Option) => {
                    const year = isPlainObject(v) ? v.value : -1
                    return Validation.validateSeries([
                        () => Validation.required(v),
                        () => {
                            if (isNaN(parseInt(`${year}`))) {
                                return ['Invalid year']
                            }
                            return null
                        },
                        () => Validation.rangeOf(v, 2000, HisDate.getYear(Service.getSessionDate()))
                    ])
                }
            },
            {
                id: 'month',
                helpText: 'Select Month',
                type: FieldType.TT_SELECT,
                validation: (v: Option) => Validation.required(v),
                computedValue: (v: Option) => v.value,
                options: () => {
                    return [
                        {label: 'January', value: '01'},
                        {label: 'February', value: '02'},
                        {label: 'March', value: '03'},
                        {label: 'April', value: '04'},
                        {label: 'May', value: '05'},
                        {label: 'June', value: '06'},
                        {label: 'July', value: '07'},
                        {label: 'August', value: '08'},
                        {label: 'September', value: '09'},
                        {label: 'October', value: '10'},
                        {label: 'November', value: '11'},
                        {label: 'December', value: '12'}
                    ]
                }
            }
        ]
    }
    return {
        fd,
        drill,
        presentDrillDown,
        getMonthlyReportFields,
        showPrintWindow,
        buildTimeIntervalFields,
        gotoPatientDashboard,
        reportData,
        rows,
        period,
        fields,
        columns,
        title
    }
}