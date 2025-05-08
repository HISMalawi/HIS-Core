<template>
  <ion-page>
        <ion-loading :is-open="isLoading" message="Please wait..."/>
        <v2Datatable
            title="OPD General Report"
            :subtitle="period"
            :columns="columns"
            :columnData="reportData"
            :rowsPerPage="25"
            :onConfigure="configure"
            :csvQuarter="csvQuarter"
            :headers="csvheaders"
            :onRefresh="() => generate()"
        />
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent, ref, onMounted } from 'vue';
import { IonPage, IonLoading, modalController } from "@ionic/vue"
import  v2Datatable from "@/apps/AETC/views/reports/clinic/TableView.vue"
import { v2ColumnDataInterface, v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { AETCReportService } from "@/apps/AETC/services/aetc_report_service"
import DrillPatientIds from '../../../../../components/DrillPatientIds.vue';
import { toDate } from '@/utils/Strs';
import { MultiStepPopupForm } from "@/utils/PopupKeyboard";
import { FieldType } from "@/components/Forms/BaseFormElements";
import { Option } from '@/components/Forms/FieldInterface'
import Validation from "@/components/Forms/validations/StandardValidations"
import dayjs from "dayjs";

const reportData = ref<any>([])
const startDate = ref('')
const endDate = ref('')
const period = ref('')
const isLoading = ref(false)
const csvQuarter = ref('')
const startAge = ref('')
const endAge = ref('')
const reportType = ref('')

export default defineComponent({ 
    components: { 
        IonPage,
        IonLoading,
        v2Datatable,
    },

    setup() {
        /**
         * Generates report by start date and end date
         */
         const generate = async () => {
            const report = new AETCReportService()
            report.startDate = startDate.value
            //report.startDate = '2021-10-02'
            report.endDate = endDate.value
            //report.endDate = '2021-10-03'
            report.startAge = startAge.value
            report.endAge = endAge.value
            report.reportType = reportType.value

            try {
                const rawReport = (await report.getClinicReport("OPD GENERAL"))
                reportData.value = rawReport;
            }catch (e){
                console.log(e)
            }
         }

         const drilldown = async (title: string, patientIdentifiers: number[]) => {
            if (patientIdentifiers.length <= 0) {return;}
            (await modalController.create({
                component: DrillPatientIds,
                backdropDismiss: false,
                cssClass: 'large-modal',
                componentProps: {
                    title,
                    subtitle: period,
                    patientIdentifiers,
                    onFinish: () => modalController.getTop().then(v => v && modalController.dismiss())
                }
            })).present()
        }

         const generateYears = () => {
            let years: string[] = [];
            const currentYear = new Date().getFullYear();
            for (let year = 2008; year <= currentYear; year++) {
                years.push(year + "");
            }
            return years.reverse()
         }

         const generateQuarters = () => {
            let quarters: string[] = [];
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1; // Adding 1 because getMonth() returns 0-based months
            const quartersToAdd = currentMonth <= 3 ? 1 : currentMonth <= 6 ? 2 : currentMonth <= 9 ? 3 : 4;

            for (let year = 2008; year <= currentYear; year++) {
                for (let quarter = 1; quarter <= 4; quarter++) {
                    if (year < currentYear || (year === currentYear && quarter <= quartersToAdd)) {
                        quarters.push(`Q${quarter} ${year}`);
                    }
                }
            }

            return quarters.reverse();
        }

         const mapOptions = (options: Array<string>) => {
            return options.map((option) => {
                return { label: option, value: option }
            });
         }

        //csv headers
        const csvheaders = [
            'Data Element',
            'Value'
        ];

         //table headers and data mapping
         const columns: Array<v2ColumnInterface[]> = [
            [
                {
                    label: "No",
                    ref: "",
                    value: (data, index) => {
                        return ++(index as number)
                    }
                },
                {
                    label: "Data Element",
                    ref: "",
                    value: (data: any) => data.diagnosis
                    
                },
                {
                    label: "Value",
                    ref: "",
                    value: (data: any) => data.patients.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel} ${data.diagnosis} `, data.patients
                    )
                },
            ]
        ]

        /**
         * Loads a dialogue to allow users to configure start and end date
         */
         const configure = () => MultiStepPopupForm([
            {
                id: 'start_age',
                helpText: 'Start Age',
                type: FieldType.TT_NUMBER,
                computedValue: (v: Option) => v.value,
                validation: (v: Option) => Validation.required(v)
            },
            {
                id: 'end_age',
                helpText: 'End Age',
                type: FieldType.TT_NUMBER,
                computedValue: (v: Option) => v.value,
                validation: (v: Option) => Validation.required(v)
            },
            {
                id: 'report_type',
                helpText: 'Report type',
                type: FieldType.TT_SELECT,
                computedValue: (v: Option) => v.value,
                options: () => [
                    {
                        label: 'General Outpatient',
                        value: 'General Outpatient',
                    },
                    {
                        label: 'Pediatrics',
                        value: 'Pediatrics',
                    },
                    {
                        label: 'General Diagnoses',
                        value: 'General Diagnoses',
                    },
                    {
                        label: 'Pediatrics Diagnosis',
                        value: 'Pediatrics Diagnosis',
                    }
                ]
            },
            {
                id: 'report_range',
                helpText: 'Select Range',
                type: FieldType.TT_SELECT,
                computedValue: (v: Option) => v.value,
                options: () => [
                    {
                        label: 'Week',
                        value: 'Week',
                    },
                    {
                        label: 'Month',
                        value: 'Month',
                    },
                    {
                        label: 'Quarter',
                        value: 'Quarter',
                    },
                    {
                        label: 'Year',
                        value: 'Year',
                    },
                    {
                        label: 'Select Range',
                        value: 'Select-Range',
                    }
                ]
            },
            {
                id: 'report_range_year',
                helpText: 'Select Year',
                type: FieldType.TT_SELECT,
                condition: (f: any) => f.report_range.value === 'Year' || f.report_range.value === 'Month' || f.report_range.value === 'Week',
                computedValue: (v: Option) => {
                    return v.label
                },
                options: () => {
                    const years: string[] = generateYears();
                    return[
                        ...mapOptions(years)
                    ]
                }
            },
            {
                id: 'report_range_quaters',
                helpText: 'Select Quater',
                type: FieldType.TT_SELECT,
                condition: (f: any) => f.report_range.value === 'Quarter',
                computedValue: (v: Option) => v.value,
                options: () => {
                    const quaters: string[] = generateQuarters();
                    return[
                        ...mapOptions(quaters)
                    ]
                }
            },
            {
                id: "start_date",
                helpText: "Start Date",
                type: FieldType.TT_FULL_DATE,
                validation: (val: Option) => Validation.required(val),
                computedValue: (v: Option) => v.value,
                condition: (f: any) => f.report_range.value === 'Select-Range',

            },
            {
                id: 'report_range_month',
                helpText: 'Select Month',
                type: FieldType.TT_SELECT,
                validation: (v: Option) => Validation.required(v),
                computedValue: (v: Option) => v.value,
                condition: (f: any) => f.report_range.value === 'Month',
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
            },
            {
                id: 'report_range_week',
                helpText: 'Select Week',
                type: FieldType.TT_SELECT,
                condition: (f: any) => {
                    const currentYear = new Date().getFullYear() + "";
                    return f.report_range.value === 'Week' && f.report_range_year.value === currentYear
                },
                options: () => [
                    {
                        label: 'This Week',
                        value: 'This Week',
                    },
                    {
                        label: 'Last Week',
                        value: 'Last Week',
                    },
                    {
                        label: 'This Month',
                        value: 'This Month',
                    },
                    {
                        label: 'Last Month',
                        value: 'Last Month',
                    },
                    {
                        label: 'All Dates',
                        value: 'All Dates',
                    }
                ]
            },
        ], 
        (f: any, c: any) => {
            if(f.report_range?.value === 'Month'){
                startDate.value = `${c.report_range_year}-${c.report_range_month}-01`
                endDate.value = dayjs(new Date(startDate.value).toISOString()).endOf("month").format("YYYY-MM-DD")
            }
            if(f.report_range?.value === 'Select-Range'){
                startDate.value = `${f.year.value}-${f.month.value}-01`
                endDate.value = dayjs(new Date(startDate.value).toISOString()).endOf("month").format("YYYY-MM-DD")
            }
            if(f.report_range?.value === 'Year'){
                startDate.value = `${c.report_range_year}-01-01`; // January 1st of the selected year
                endDate.value = `${c.report_range_year}-12-31`; // December 31st of the selected year
            }
            if(f.report_range?.value === 'Week' && f.report_range_week?.value === 'This Week'){
                // Calculate the start and end dates for the current week (Sunday to Saturday)
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear();
                const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');

                // Calculate the first day (Sunday) of the current week
                const firstDayOfWeek = new Date(currentDate);
                firstDayOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

                // Calculate the last day (Saturday) of the current week
                const lastDayOfWeek = new Date(currentDate);
                lastDayOfWeek.setDate(currentDate.getDate() + (6 - currentDate.getDay()));

                const startDateValue = `${currentYear}-${currentMonth}-${String(firstDayOfWeek.getDate()).padStart(2, '0')}`;
                const endDateValue = `${currentYear}-${currentMonth}-${String(lastDayOfWeek.getDate()).padStart(2, '0')}`;

                startDate.value = startDateValue;
                endDate.value = endDateValue; // Set endDate.value with endDateValue
            }
            if(f.report_range?.value === 'Week' && f.report_range_week?.value === 'Last Week'){
                // Calculate the start and end dates for the last week (Sunday to Saturday)
                const currentDate = new Date();
                currentDate.setDate(currentDate.getDate() - 7); // Go back 7 days to the previous week

                const currentYear = currentDate.getFullYear();
                const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');

                // Calculate the first day (Sunday) of the last week
                const firstDayOfLastWeek = new Date(currentDate);
                firstDayOfLastWeek.setDate(currentDate.getDate() - currentDate.getDay());

                // Calculate the last day (Saturday) of the last week
                const lastDayOfLastWeek = new Date(currentDate);
                lastDayOfLastWeek.setDate(currentDate.getDate() + (6 - currentDate.getDay()));

                const startDateValue = `${currentYear}-${currentMonth}-${String(firstDayOfLastWeek.getDate()).padStart(2, '0')}`;
                const endDateValue = `${currentYear}-${currentMonth}-${String(lastDayOfLastWeek.getDate()).padStart(2, '0')}`;

                startDate.value = startDateValue;
                endDate.value = endDateValue; // Set endDate.value with endDateValue
            }
            if(f.report_range?.value === 'Week' && f.report_range_week?.value === 'This Month'){
                // Calculate the start and end dates for the current month
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear();
                const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');

                const startDateValue = `${currentYear}-${currentMonth}-01`;
                const lastDayOfMonth = new Date(currentYear, currentDate.getMonth() + 1, 0); // Last day of the current month
                const endDateValue = `${currentYear}-${currentMonth}-${String(lastDayOfMonth.getDate()).padStart(2, '0')}`;

                startDate.value = startDateValue;
                endDate.value = endDateValue; // Set endDate.value with endDateValue
            }
            if(f.report_range?.value === 'Week' && f.report_range_week?.value === 'Last Month'){
                // Calculate the start and end dates for the last month
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear();
                const currentMonth = currentDate.getMonth() + 1; // Month is 0-indexed
                const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1; // Handle January
                const lastYear = lastMonth === 12 ? currentYear - 1 : currentYear;

                const lastMonthEndDate = new Date(currentYear, currentMonth - 1, 0); // End of last month

                const startDateValue = `${lastYear}-${String(lastMonth).padStart(2, '0')}-01`;
                const endDateValue = `${lastYear}-${String(lastMonth).padStart(2, '0')}-${String(lastMonthEndDate.getDate()).padStart(2, '0')}`;

                startDate.value = startDateValue;
                endDate.value = endDateValue; // Set endDate.value with endDateValue
            }
            if(f.report_range?.value === 'Week' && f.report_range_week?.value === 'All Dates'){
                // Calculate the start date (January 1st of the current year)
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear();
                const startDateValue = `${currentYear}-01-01`;

                // Calculate the end date (current date)
                const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
                const currentDay = String(currentDate.getDate()).padStart(2, '0');
                const endDateValue = `${currentYear}-${currentMonth}-${currentDay}`;

                startDate.value = startDateValue;
                endDate.value = endDateValue;
            }
            if(f.report_range?.value === 'Quarter'){
                const quarterYear = c.report_range_quaters.split(' ');
                const quarter = parseInt(quarterYear[0].slice(1), 10); // Extract and parse the numeric quarter
                const year = parseInt(quarterYear[1], 10); // Extract and parse the year

                const quarterStartDates: { [key: number]: string } = {
                    1: `${year}-01-01`,
                    2: `${year}-04-01`,
                    3: `${year}-07-01`,
                    4: `${year}-10-01`,
                };

                const quarterEndDates: { [key: number]: string } = {
                    1: `${year}-03-31`,
                    2: `${year}-06-30`,
                    3: `${year}-09-30`,
                    4: `${year}-12-31`,
                };

                startDate.value = quarterStartDates[quarter];
                endDate.value = quarterEndDates[quarter];
            }
            if(f.report_range?.value === 'Week' && f.report_range_year?.value < new Date().getFullYear()){
                startDate.value = `${f.report_range_year.value}-01-01`;
                endDate.value = `${f.report_range_year.value}-12-31`;
            }

            //getting other parameters
            startAge.value = c.start_age
            endAge.value = c.end_age
            reportType.value = c.report_type
            period.value = `Period (${toDate(startDate.value)} to ${toDate(endDate.value)})`
            modalController.dismiss()
            csvQuarter.value = `${toDate(startDate.value)} to ${toDate(endDate.value)}`
            generate()
        })

        /**
         * Initialization code when the report is empty!
         */
         onMounted(() => !reportData.value.length && configure())


         return  {
            columns,
            isLoading,
            reportData,
            period,
            csvQuarter,
            csvheaders,
            generate,
            configure
         }
    }
})

</script>
