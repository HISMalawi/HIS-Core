<template>
    <ion-page>
        <ion-loading :is-open="isLoading" message="Please wait..."/>
        <v2Datatable
            title="MONTHLY MOH Report"
            :subtitle="period"
            :columns="columns"
            :columnData="reportData"
            :rowsPerPage="25"
            :onConfigure="configure"
            :csvQuarter="csvQuarter"
            :onRefresh="() => generate()"
            :order="order"
            :headers="csvheaders"
            :csv-spacing="spacing"
            :csv-data="csvData"
        />
    </ion-page>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { IonPage, IonLoading, modalController } from "@ionic/vue"
import  v2Datatable from "@/apps/CxCa/views/reports/moh/TableView.vue"
import { v2ColumnDataInterface, v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { CxCaReportService } from "@/apps/CxCa/services/reports/cxca_report_service"
import { toastDanger, toastWarning } from '@/utils/Alerts';
import DrillPatientIds from '../../../../../components/DrillPatientIds.vue';
import { toDate } from '@/utils/Strs';
import { MultiStepPopupForm } from "@/utils/PopupKeyboard";
import { FieldType } from "@/components/Forms/BaseFormElements";
import { Option } from '@/components/Forms/FieldInterface'
import { isPlainObject } from "lodash";
import Validation from "@/components/Forms/validations/StandardValidations"
import { Service } from "@/services/service"
import HisDate from "@/utils/Date"
import dayjs from "dayjs";
import { cloneDeep } from 'lodash';

const reportData = ref([] as Array<any>);
const startDate = ref('')
const endDate = ref('')
const period = ref('')
const isLoading = ref(false)
const csvQuarter = ref('')
//adding a new reactive variable to store csv data
const csvData = ref<any>([])

export default defineComponent({ 
    components: { 
        IonPage,
        IonLoading,
        v2Datatable,
    },
    setup() {
        /**
         * Ordering rows
         */
         const orderingRows = [
            'screened_disaggregated_by_age',
            'screened_disaggregated_by_hiv_status',
            'screened_disaggregated_by_reason_for_visit',
            'screened_disaggregated_by_screening_method',
            'screening_results_hiv_positive',
            'screening_results_hiv_negative',
            'suspects_disaggregated_by_age',
            'total_treated',
            'total_treated_disaggregated_by_tx_option',
            'referral_reasons',
            'referral_feedback',
            'family_planning'
        ];

        const mid =(data: []) => {
            return Math.floor(data.length / 2);
        }

        const array1 = (data: [], mid : number) =>{
            const half = data.slice(0, mid)
            return half;
        }

        const array2 = (data: [], mid : number) =>{
            const half = data.slice(mid)
            return half;
        }

        const merge = (array1: any[], array2: any[]): any[] => {
            const mergedArray: any[] = [];
            for (let i = 0; i < array1.length; i++) {
                mergedArray.push(array1[i].concat(array2[i]));
            }
            return mergedArray;
        };
        const processData = (data: any) => {
            //to be displayed
            const result: any = [];
            //to be generated as csv
            const csvresult: any = [];
            const keys = Object.keys(data);
            //doing this to show title
            let previouskey: any;
            //indicator whole number
            let indicatorWholeNumber = 0
            //indicator decimal notation
            let indicatorDecimal = 0
            //concatinated value of both indicator whole number and decimal used as the actual indicator
            let indicator = ""

            keys.forEach((key) => {
                const values = Object.entries(data[key]);
                values.forEach(([subKey, subValues]) => {
                    if(previouskey != key){
                        //before we push this to the array lets change the headers to accurately present the data
                        //increment by 1
                        indicatorWholeNumber = indicatorWholeNumber + 1
                        //reset the decimal value to 0 after incrementing the whole number
                        indicatorDecimal = 0
                        mappedheaders.forEach((mappedKey) => {
                            if(mappedKey[0] == key){
                                key = mappedKey[1]
                            }
                        });
                        result.push([indicatorWholeNumber, key, "TH"]);
                        //csv format
                        csvresult.push([indicatorWholeNumber, key, ""]);
                    }
                    if (Array.isArray(subValues)) {
                        indicatorDecimal = indicatorDecimal + 1
                        //concatinating the value
                        indicator = indicatorWholeNumber + "." + indicatorDecimal
                        result.push([indicator, subKey, subValues]);
                        //csv format
                        csvresult.push([indicator, subKey, subValues]);
                    } else {
                        result.push([indicator, subKey, []]);
                        //csv format
                        csvresult.push([indicator, subKey, []]);
                    }
                    //keep the previous key/title
                    previouskey = key
                });
            });
            //save to csv data for generating csv file
            csvData.value = csvresult
            return result;
        };

        const sortData = (data: Record<string, any>) => {
            const sortedData: Record<string, any> = {};
            orderingRows.forEach((key) => {
                if (data[key]) {
                sortedData[key] = data[key];
                }
            });
            return sortedData;
        };

        const drilldown = async (title: string, patientIdentifiers: number[]) => {
            if (patientIdentifiers.length <= 0) {
                // The array is empty or has no elements, so don't launch the drilldown
                return;
            }
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

        const processArray = (dataArray:any) => {
        
        
            dataArray.forEach((entry: (string | any[])[]) => {
            // Step 1: Swap "TH" with ""
            entry[2] = entry[2] === 'TH' ? " " : entry[2];

            // Step 2: Replace arrays with their length
            if (Array.isArray(entry[5])) {
            entry[5] = "" + entry[5].length;
            }

            // Step 2: Replace arrays with their length
            if (Array.isArray(entry[2])) {
            entry[2] = "" + entry[2].length;

            // Step 1: Swap "TH" with ""
            entry[5] = entry[5] === 'TH' ? " " : entry[5];
            }
        });
        return dataArray
        };
        
        /**
         * ordering of columns
         */
        const order = [
            'age_group',
            'cryotherapy',
            'thermocoagulation',
            'leep',
            'via_deffered',
            'via_reffered',
            'suspected_reffered'
        ];
        //mapping to show actual report headers
        const mappedheaders = [
            ["family_planning", "Offered family planning services"],
            ["referral_feedback", "Number of clients with referral feedback"],
            ["referral_reasons", "Number of clients referred disaggregated by referral reasons"],
            ["screened_disaggregated_by_age", "Number of clients screened for cervical cancer disaggregated by age"],
            ["screened_disaggregated_by_hiv_status", "Number of clients screened for cervical cancer disaggregated by HIV status"],
            ["screened_disaggregated_by_reason_for_visit", "Number of clients screened for cervical cancer disaggregated by reason for visit"],
            ["screened_disaggregated_by_screening_method", "Number of clients screened disaggregated by screening method"],
            ["screening_results_hiv_negative", "Cervical cancer screening results (HIV- / unknown)"],
            ["screening_results_hiv_positive", "Cervical cancer screening results (HIV+)"],
            ["suspects_disaggregated_by_age", "Cervical Cancer suspects disaggregated by age"],
            ["total_treated", "Total number of clients treated"],
            ["total_treated_disaggregated_by_tx_option", "Number of clients treated disaggregated by treatment option"]
        ]
        //csv headers
        const csvheaders = [
            'Indicator #', 
            'Name of Indicator', 
            'Value', 
            'Indicator #', 
            'Name of Indicator', 
            'Value'
        ];

        //blank spacing for csv spacing
        const spacing = 5;


        /**
         * Table column definition and value mapping
         */
        const columns: Array<v2ColumnInterface[]> = [
            [
                {
                    label: "indicator #",
                    ref: ""
                },
                {
                    label: "Name of indicator",
                    ref: ""
                },
                {
                    label: "value",
                    ref: ""
                },
                {
                    label: "indicator #",
                    ref: ""
                },
                {
                    label: "Name of indicator",
                    ref: ""
                },
                {
                    label: "value",
                    ref: ""
                },
            ],
            [
                {
                    label: "Indicator #",
                    ref: "data.indicatorOne",
                    secondaryLabel: "Indicator #",
                    value: (data: any) => data.indicatorOne
                }, 
                {
                    label: "Name of Indicator",
                    ref: "data.nameOfIndicatorOne",
                    secondaryLabel: "Name of Indicator",
                    value: (data: any) => data.nameOfIndicatorOne,
                    dataStyle: (data: any) => {
                        if(data.valueOne === "TH"){
                            return {
                                fontWeight: 'bold'
                            }
                        }
                        return {
                            fontWeight: 'normal'
                        }                        
                    },
                    colSpan: (data: any) => {
                        if(data.valueOne === "TH"){
                            return 2
                        } 
                        return 1
                    }
                },
                {
                    label: "value",
                    ref: "data.valueOne",
                    secondaryLabel: "Value",
                    value: (data: any) => {
                        if(Array.isArray(data.valueOne)){
                            return data.valueOne.length
                        }else{
                            return data.valueOne
                        }
                    },
                    tdClick: ({ data }: v2ColumnDataInterface) => drilldown(
                        `${data.indicatorOne} ${data.nameOfIndicatorOne}`, data.valueOne
                    )
                }, 
                {
                    label: "Indicator #",
                    ref: "data.indicatorTwo",
                    secondaryLabel: "Indicator #",
                    value: (data: any) => data.indicatorTwo
                }, 
                {
                    label: "Name of Indicator",
                    ref: "data.nameOfIndicatorTwo",
                    secondaryLabel: "Name of Indicator",
                    value: (data: any) => data.nameOfIndicatorTwo,
                    dataStyle: (data: any) => {
                        if(data.valueTwo === "TH"){
                            return {
                                fontWeight: 'bold'
                            }
                        }
                        return {
                            fontWeight: 'normal',
                        }                        
                    },
                    colSpan: (data: any) => {
                        if(data.valueTwo === "TH"){
                            return 2
                        } 
                        return 1
                    }
                },
                {
                    label: "value",
                    ref: "data.valueTwo",
                    secondaryLabel: "Value",
                    value: (data: any) => {
                        if(Array.isArray(data.valueTwo)){
                            return data.valueTwo.length
                        }else{
                            return data.valueTwo
                        }
                    },
                    tdClick: ({ data }: v2ColumnDataInterface) => drilldown(
                        `${data.indicatorTwo} ${data.nameOfIndicatorTwo}`, data.valueTwo
                    )
                },   
            ],
        ]
        /**
         * Generates report by start date and end date
         */
         const generate = async () => {
            if (!(startDate.value && endDate.value))  {
                return toastWarning('Start date and end date required!')
            }
            isLoading.value = true
            reportData.value = []
            const report = new CxCaReportService()
            report.startDate = startDate.value
            report.endDate = endDate.value
            try {
                const rawReport = (await report.getClinicReport('SCREENED FOR CXCA'))
                //sorting the data basing on the template order
                const sortedDataObject = sortData(rawReport)
                //formating to array
                const array = processData(sortedDataObject)
                //spliting the array and merging it
                const midIndex = mid(array)
                //merging
                const formattedArray = merge(array1(array, midIndex), array2(array, midIndex))
                //copy the array and passit to the csvData.value
                const tempArray = cloneDeep(formattedArray)
                //csv format
                csvData.value = processArray(tempArray)
                
                //convert to desired array of objects format
                const convertedArray = formattedArray.map((item) => {
                    const obj = {
                        indicatorOne: item[0],
                        nameOfIndicatorOne: item[1],
                        valueOne: item[2],
                        indicatorTwo: item[3],
                        nameOfIndicatorTwo: item[4],
                        valueTwo: item[5]
                    };
                    return obj;
                });

                reportData.value = convertedArray
            } catch (e) {
                toastDanger("Unable to generate report!")
                console.error(e)
            }
            isLoading.value = false
        }
        /**
         * Loads a dialogue to allow users to configure start and end date
         */
         const configure = () => MultiStepPopupForm([
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
        ], 
        (f: any) => {
            startDate.value = `${f.year.value}-${f.month.value}-01`
            endDate.value = dayjs(new Date(startDate.value).toISOString()).endOf("month").format("YYYY-MM-DD")
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
            generate,
            configure,
            order,
            csvheaders,
            spacing,
            csvData
        }
    }
})

</script>