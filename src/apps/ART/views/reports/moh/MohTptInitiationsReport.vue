<template>
    <ion-page> 
        <report-template
            reportPrefix="MoH"
            :title="title"
            :period="period"
            :rows="rows" 
            :fields="fields"
            :columns="columns"
            :config="{
                showIndex: true
            }"
            :validationErrors="errors"
            :showValidationStatus="showStatus"
            :headerInfoList="headerList"
            :onReportConfiguration="onPeriod"
            > 
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { AGE_GROUPS } from "@/apps/ART/services/reports/patient_report_service"
import { RegimenReportService } from "@/apps/ART/services/reports/regimen_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { isEmpty, uniq } from 'lodash'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { IonPage } from "@ionic/vue"
import { MohCohortReportService } from "@/apps/ART/services/reports/moh_cohort_service"
import { Option } from '@/components/Forms/FieldInterface'

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate, IonPage },
    data: () => ({
        title: 'TPT new initiations report',
        rows: [] as Array<any>,
        cohort: {} as any,
        canValidate: false as boolean,
        mohCohort: {} as any,
        headerList: [] as Array<Option>,
        errors: [] as string[],
        showStatus: false as boolean,
        columns: [
            [
                table.thTxt('District'),
                table.thTxt('Age group'),
                table.thTxt('Gender'),
                table.thNum('3HP (Started New on ART)'),
                table.thNum('6H (Started New on ART)'),
                table.thNum('3HP (Started Previously on ART)'),
                table.thNum('6H (Started Previously on ART)')
            ]
        ],
        totalIpt: [] as number[],
        total3hp: [] as number[]
    }),
    watch: {
        async canValidate(doIt: boolean) {
            if (doIt) await this.validateReport()
        }
    },
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.canValidate = false
            this.rows = []
            this.errors = []
            this.showStatus = false
            this.totalIpt = []
            this.total3hp = []
            this.report = new RegimenReportService()
            this.mohCohort = new MohCohortReportService()
            this.mohCohort.setStartDate(config.start_date)
            this.mohCohort.setEndDate(config.end_date)
            this.mohCohort.setOccupation(config.occupation)
            this.report.setOccupation(config.occupation)
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            this.cohort = await this.report.getTptNewInitiations()
            this.setRows('F')
            this.setRows('M')
            this.canValidate = true
            this.showStatus = true
        },
        drilldown(patients: Array<any>, context: string) {
            const columns = [
                [
                    table.thTxt('ARV #'),
                    table.thTxt('DOB'),
                    table.thTxt('Dispensed date'),
                    table.thTxt('Art start date')
                ]
            ]
            const asyncRows = () => this.sortByArvNumber(patients).map(
                (p: any) => ([
                   table.td(p.arv_number),
                   table.tdDate(p.birthdate),
                   table.tdDate(p.dispensation_date),
                   table.tdDate(p.art_start_date)
               ])
            )
            if (patients.length <= 0) return table.td(0)

            return table.tdLink(patients.length, () => this.drilldownAsyncRows(context, columns, asyncRows))
        },
        setRows(gender: 'M' | 'F') {
            const fullGender = this.formatGender(gender)
            for(const ageIndex in AGE_GROUPS) {
                const group = AGE_GROUPS[ageIndex]
                const location = this.cohort['Location'];
                if (!isEmpty(this.cohort) && group in this.cohort && ageIndex) {
                    const data = this.cohort[group]
                    this.total3hp = uniq([...this.total3hp, ...data['3HP_new'][gender], ...data['3HP_prev'][gender]])
                    this.totalIpt = uniq([...this.totalIpt, ...data['6H_new'][gender], ...data['6H_prev'][gender]])
                    this.rows.push([
                        table.td(location),
                        table.td(group),
                        table.td(fullGender),
                        this.drilldown(data['3HP_new'][gender], `${group} ${fullGender}s New on 3HP`),
                        this.drilldown(data['6H_new'][gender], `${group} ${fullGender}s New on 6H`),
                        this.drilldown(data['3HP_prev'][gender], `${group} ${fullGender}s Previously on 3HP`),
                        this.drilldown(data['6H_prev'][gender], `${group} ${fullGender}s Previously on 6H`)
                    ])
                } else {
                    this.rows.push([
                        table.td(group),
                        table.td(fullGender),
                        table.td(0),
                        table.td(0)
                    ])
                }
            }
        },
        validateReport() {
            const validations = {
                'newly_initiated_on_3hp' : {
                    param: this.total3hp.length,
                    check: (i: number, p: number) => i != p,
                    error: (i: number, p: number) => `
                        Total newly initiated on <b>3HP(${p})</b> is not matching newly 
                        initiated on 3HP in Cohort report <b>(${i})</b>.
                    `
                },
                'newly_initiated_on_ipt': {
                    param: this.totalIpt.length,
                    check: (i: number, p: number) => i != p,
                    error: (i: number, p: number) => `
                        Total newly initiated on IPT <b>(${p})</b> is not matching 
                        newly initiated on IPT in Cohort report <b>(${i})</b>.
                    `
                }
            }
            const s = this.mohCohort.validateIndicators(validations, (errors: string[]) => this.errors = errors)
            if (s === -1) this.errors = ['Report not validated. Run the MoH cohort report for similar reporting period and then run this report']
        }
    }
})
</script>
