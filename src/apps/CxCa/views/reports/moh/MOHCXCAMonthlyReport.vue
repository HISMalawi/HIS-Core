<template>
    <ion-loading
    :is-open="isLoading"
    message="Please wait..."
    >
    </ion-loading>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-thumbnail slot="start"> 
                    <ion-img :src="logo"/>
                </ion-thumbnail>
                <ion-label> 
                <ul class="header-text-list"  style="list-style-type:none;"> 
                    <li><b>{{ reportTitle }}</b></li>
                    <li><b>{{ reportPeriod }}</b></li>
                </ul>
        </ion-label>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <div id="report-content">
                <report-body :key="componentKey" @onClickIndicator="onDrillDown" :indicators="indicators"/>
            </div>
        </ion-content>
        <ion-footer>
            <ion-toolbar> 
                <ion-chip color="primary">Date Created: <b>{{ date }}</b></ion-chip>
                <ion-chip color="primary">His-Core Version: <b>{{ coreVersion }}</b></ion-chip>
                <ion-chip color="primary">API Version: <b>{{ apiVersion }}</b></ion-chip>
            </ion-toolbar>
        </ion-footer>
        <his-footer :btns="btns"></his-footer>
    </ion-page>
    <div id='print'> </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import HisFooter from "@/components/HisDynamicNavFooter.vue";
import { IonPage, IonContent, IonLoading, modalController, IonToolbar, IonHeader } from "@ionic/vue"
import { Service } from "@/services/service"
import HisDate from "@/utils/Date"
import { Field } from '@/components/Forms/FieldInterface'
import ReportMixinVue from "@/apps/ART/views/reports/ReportMixin.vue";
import { MohCohortReportService } from "@/apps/ART/services/reports/moh_cohort_service"
import MOHCXCAMonthlyReportBody from "@/apps/CxCa/views/reports/moh/MOHCXCAMonthlyReportBody.vue"
import { MultiStepPopupForm } from "@/utils/PopupKeyboard";
import { FieldType } from "@/components/Forms/BaseFormElements";
import { toCsv, toPDFfromHTML } from "@/utils/Export"
import dayjs from "dayjs";
import { isPlainObject } from "lodash";
import { toDate } from "@/utils/Strs";
import { Option } from '@/components/Forms/FieldInterface'
import Validation from "@/components/Forms/validations/StandardValidations"
import DrilldownTable from "@/apps/ART/views/reports/BasicReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { Patientservice } from "@/services/patient_service";
import { useRouter } from "vue-router"

export default defineComponent({
    mixins: [ReportMixinVue],
    components: { ReportBody: MOHCXCAMonthlyReportBody, IonPage, IonContent, IonLoading, HisFooter, IonToolbar, IonHeader },
    data: () => ({
        formData: {} as any,
        componentKey: 0 as number,
        indicators: {} as any,
        logo: "/assets/images/login-logos/Malawi-Coat_of_arms_of_arms.png" as string,
        clinicName: MohCohortReportService.getLocationName(),
        btns: [] as Array<any>,
        reportReady: false as boolean,
        fields: [] as Array<Field>,
        startDate: '',
        endDate: '',
        date: HisDate.toStandardHisDisplayFormat(Service.getSessionDate()),
        apiVersion: Service.getApiVersion(),
        coreVersion: Service.getCoreVersion(), 
        reportTitle: "Malawi Cervical Cancer Control Program Monthly Report",
        reportPeriod: "",
        cohort: {} as any,
        isLoading: false as boolean,
        sectionOneRawJson: [],
        reportCohort: [] as Array<[string, Array<number>]>,
        reportService: {} as any,
        reportID: -1 as any
    }),
    created() {
        this.btns = this.getBtns()
        MultiStepPopupForm([
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
            this.startDate = `${f.year.value}-${f.month.value}-01`
            this.endDate = dayjs(new Date(this.startDate).toISOString()).endOf("month").format("YYYY-MM-DD")
            this.onPeriod()
            modalController.dismiss()
        })
    }, 
    methods: {
        async onPeriod() {
            this.reportPeriod = toDate(this.startDate) + "-" + toDate(this.endDate)
            this.isLoading = true
            //Section One
            Service.getJson('screened_for_cxca',{
                'report_name': 'SCREENED FOR CXCA',
                'program_id': Service.getProgramID(),
                'start_date': this.startDate,
                'end_date': this.endDate,
                'date': Service.getSessionDate()
            }).then(response => {
                //load data and perform calculations based by age                    
                const age_groups = this.loadSectionOne(response)
                //assigning
                this.indicators.num_clients_lessthan_25 = age_groups[0][1].length
                this.indicators.num_clients_25_to_29 = age_groups[1][1].length
                this.indicators.num_clients_30_to_44 = age_groups[2][1].length
                this.indicators.num_clients_45_to_49 = age_groups[3][1].length
                this.indicators.num_clients_lessthan_49 = age_groups[4][1].length
                //now pushing to reportCohort
                for (const [category, counts] of age_groups) {
                    this.reportCohort.push([category, counts])
                }
            })

            //Section Two
            Service.getJson('screened_for_cxca',{
                'report_name': 'SCREENED FOR CXCA DISAGGREGATED BY HIV STATUS',
                'program_id': Service.getProgramID(),
                'start_date': this.startDate,
                'end_date': this.endDate,
                'date': Service.getSessionDate()
            }).then(response => {
                    const hiv_status = this.loadSectionTwo(response)
                    //assigning
                    this.indicators.num_clients_positive_art = hiv_status[0][1].length
                    this.indicators.num_clients_positive_not_on_art = hiv_status[1][1].length
                    this.indicators.num_clients_negative_tested_less_than_1_year = hiv_status[2][1].length
                    this.indicators.hiv_1_year_ago = hiv_status[3][1].length
                    //now adding to reportCohort
                    this.reportCohort.push(["num_clients_positive_art", hiv_status[0][1]])
                    this.reportCohort.push(["num_clients_positive_not_on_art", hiv_status[1][1]])
                    this.reportCohort.push(["num_clients_negative_tested_less_than_1_year", hiv_status[2][1]])
                    this.reportCohort.push(["hiv_1_year_ago", hiv_status[3][1]])
            })

            //Section Five
            Service.getJson('screened_for_cxca',{
                'report_name': 'CXCA SCREENING RESULTS',
                'program_id': Service.getProgramID(),
                'start_date': this.startDate,
                'end_date': this.endDate,
                'date': Service.getSessionDate()
            }).then(response => {                  
                    const screening_results = this.loadSectionFive(response)
                    //assigning
                    this.indicators.num_clients_via_negative_cxca_screening_hiv_positive = screening_results[0][1].length
                    this.indicators.num_clients_via_positive_cxca_screening_hiv_positive = screening_results[1][1].length
                    this.indicators.num_clients_with_suspect_ca_screening_hiv_positive = screening_results[2][1].length
                    this.indicators.num_clients_pap_smear_normal_cxca_screening_hiv_positive = screening_results[3][1].length
                    this.indicators.num_clients_pap_smear_abnormal_cxca_screening_hiv_positive = screening_results[4][1].length
                    this.indicators.num_clients_hpv_negative_cxca_screening_hiv_positive = screening_results[5][1].length
                    this.indicators.num_clients_visible_lesion_cxca_screening_hiv_positive = screening_results[6][1].length
                    this.indicators.num_clients_no_visible_lesion_cxca_screening_hiv_positive = screening_results[7][1].length
                    this.indicators.num_clients_other_gynae_cxca_screening_hiv_positive = screening_results[8][1].length
                    //now pushing to reportCohort
                    for (const [category, patientIds] of screening_results) {
                        this.reportCohort.push([category, patientIds])
                    }
            })

            //Section Six
            Service.getJson('screened_for_cxca',{
                'report_name': 'CXCA SCREENING RESULTS',
                'program_id': Service.getProgramID(),
                'start_date': this.startDate,
                'end_date': this.endDate,
                'date': Service.getSessionDate()
            }).then(response => {                  
                    const screening_results = this.loadSectionSix(response)
                    //assigning
                    this.indicators.num_clients_via_negative = screening_results[0][1].length
                    this.indicators.num_clients_via_positive = screening_results[1][1].length
                    this.indicators.num_clients_with_suspect_ca = screening_results[2][1].length
                    this.indicators.num_clients_pap_smear_normal = screening_results[3][1].length
                    this.indicators.num_clients_pap_smear_abnormal = screening_results[3][1].length
                    this.indicators.num_clients_hpv_negative = screening_results[3][1].length
                    this.indicators.num_clients_visible_lesion = screening_results[3][1].length
                    this.indicators.num_clients_no_visible_lesion = screening_results[3][1].length
                    this.indicators.num_clients_other_gynae = screening_results[3][1].length
                    //now pushing to reportCohort
                    for (const [category, patientIds] of screening_results) {
                        this.reportCohort.push([category, patientIds])
                    }
            })

            //Section Seven
            Service.getJson('screened_for_cxca',{
                'report_name': 'CANCER SUSPECTS',
                'program_id': Service.getProgramID(),
                'start_date': this.startDate,
                'end_date': this.endDate,
                'date': Service.getSessionDate()
            }).then(response => {                  
                    const age_groups = this.loadSectionSeven(response)
                    //assigning
                    this.indicators.num_clients_cxca_suspects_lessthan_25 = age_groups[0][1].length
                    this.indicators.num_clients_cxca_suspects_unknown_25_29 = age_groups[1][1].length
                    this.indicators.num_clients_cxca_suspects_30_44 = age_groups[2][1].length
                    this.indicators.num_clients_cxca_suspects_45_49 = age_groups[3][1].length
                    this.indicators.num_clients_cxca_suspects_greaterthan_49 = age_groups[4][1].length
                    //now pushing to reportCohort
                    for (const [category, patientIds] of age_groups) {
                        this.reportCohort.push([category, patientIds])
                    }
            })

            //Section Eight
            Service.getJson('screened_for_cxca',{
                'report_name': 'CLIENTS TREATED',
                'program_id': Service.getProgramID(),
                'start_date': this.startDate,
                'end_date': this.endDate,
                'date': Service.getSessionDate()
            }).then(response => {                  
                    const clients_treated = this.loadSectionEight(response)
                    //assigning
                    this.indicators.same_day_treatment = clients_treated[0][1].length
                    this.indicators.postponed_treatment = clients_treated[1][1].length
                    this.indicators.postponed_treatment_performed = clients_treated[2][1].length
                    this.indicators.referral = clients_treated[3][1].length
                    //now pushing to reportCohort
                    for (const [category, patientIds] of clients_treated) {
                        this.reportCohort.push([category, patientIds])
                    }
            })

            //Section Nine
            Service.getJson('screened_for_cxca',{
                'report_name': 'TREATMENT OPTIONS',
                'program_id': Service.getProgramID(),
                'start_date': this.startDate,
                'end_date': this.endDate,
                'date': Service.getSessionDate()
            }).then(response => {                  
                    const clients_treated = this.loadSectionNine(response)
                    //assigning
                    this.indicators.cryotherapy = clients_treated[0][1].length
                    this.indicators.thermal_coagulation = clients_treated[1][1].length
                    this.indicators.leep = clients_treated[2][1].length
                    this.indicators.other = clients_treated[3][1].length
                    //now pushing to reportCohort
                    for (const [category, patientIds] of clients_treated) {
                        this.reportCohort.push([category, patientIds])
                    }
            })

            //Section 10
            Service.getJson('screened_for_cxca',{
                'report_name': 'REFERRAL REASONS',
                'program_id': Service.getProgramID(),
                'start_date': this.startDate,
                'end_date': this.endDate,
                'date': Service.getSessionDate()
            }).then(response => {                  
                    const referral_reasons = this.loadSectionTen(response)
                    //assigning
                    this.indicators.large_lesion = referral_reasons[0][1].length
                    this.indicators.further_investigation_management = referral_reasons[1][1].length
                    this.indicators.no_treatment = referral_reasons[2][1].length
                    this.indicators.other_gynae = referral_reasons[3][1].length
                    //now pushing to reportCohort
                    for (const [category, patientIds] of referral_reasons) {
                        this.reportCohort.push([category, patientIds])
                    }
            })

            //Section 3
            Service.getJson('screened_for_cxca',{
                'report_name': 'CXCA REASON FOR VISIT',
                'program_id': Service.getProgramID(),
                'start_date': this.startDate,
                'end_date': this.endDate,
                'date': Service.getSessionDate()
            }).then(response => {         
                    const reason_for_visit = this.loadSectionThree(response)
                    this.indicators.initial_screening = reason_for_visit[0][1].length
                    this.indicators.postponed_treatment = reason_for_visit[2][1].length
                    this.indicators.one_year_check_up_after_treatment = reason_for_visit[3][1].length
                    this.indicators.subsequent_screening = reason_for_visit[4][1].length
                    this.indicators.section_three_referral = reason_for_visit[1][1].length
                    this.indicators.problem_visit_after_treatment = reason_for_visit[5][1].length
                    //now pushing to reportCohort
                    for (const [category, patientIds] of reason_for_visit) {
                        this.reportCohort.push([category, patientIds])
                    }
                    //stop the loading dialog
                    this.isLoading = false;
            })
        },
        loadSectionTen(data: any): any {
            let formatted_data = [];
            let results = {} as any;
            let concepts = [
                'Large Lesion (>75%)',
                'Further Investigation & Management',
                'Suspect cancer',
                'Treatment not available',
                'Other'
            ];

            let returnArray : [string, any[]][]  =  [
                ['large_lesion_greater_than_75', []],
                ['further_investigation_management', []],
                ['suspect_ca', []],
                ['no_treatment', []],
                ['other_gynae', []]
            ]

            let count = 1;

            for(let i = 0; i < concepts.length; i++) {
                if(results[concepts[i]] == undefined)
                results[concepts[i]] = [];

                for (const record of data) {
                let result = record.result;
                let patient_id = record.patient_id;
                if(result != concepts[i])
                    continue;

                results[result].push(patient_id);
                //pushing to returnArray
                returnArray[i][1].push(patient_id)
                } 
            }

            for(const result in results){
                formatted_data.push([count++, result, results[result].length]);
            }
            return returnArray;
        },
        loadSectionNine(data: any): any {
            let formatted_data = [];
            let results = {} as any;
            let concepts = [
                'Cryotherapy','Thermocoagulation',
                'Leep', 'Other'
            ];

            let returnArray : [string, any[]][]  =  [
                ['cryotherapy', []],
                ['thermal_coagulation', []],
                ['leep', []],
                ['other', []]
            ]

            let count = 1;

            for(let i = 0; i < concepts.length; i++) {
                if(results[concepts[i]] == undefined)
                results[concepts[i]] = [];

                for (const record of data) {
                let result = record.result;
                let patient_id = record.patient_id;
                if(result != concepts[i])
                    continue;

                results[result].push(patient_id);
                //pushing to returnArray
                returnArray[i][1].push(patient_id)
                } 
            }

            for(const result in results){
                formatted_data.push([count++, result, results[result].length]);
            }
            return returnArray;
        },
        loadSectionEight(data: any): any {
            let formatted_data = [];
            let results = {} as any;
            let concepts = [
                'Same day treatment',
                'Postponed treatment',
                'Postponed treatment performed',
                'Referral'
            ];


            let returnArray : [string, any[]][]  =  [
                ['same_day_treatment', []],
                ['postponed_treatment_section_eight', []],
                ['postponed_treatment_performed', []],
                ['referral', []]
            ]

            let count = 1;

            for(let i = 0; i < concepts.length; i++) {
                if(results[concepts[i]] == undefined)
                results[concepts[i]] = [];

                for (const record of data) {
                let result = record.result;
                let patient_id = record.patient_id;
                if(result != concepts[i])
                    continue;

                results[result].push(patient_id);
                //pushing to returnArray
                returnArray[i][1].push(patient_id)
                } 
            }

            for(const result in results){
                formatted_data.push([count++, result, results[result].length]);
            }
            return returnArray;
        },
        loadSectionSeven(data: any): any {
        const formatted_data = [];
            const age_groups : [string, any[]][]  = [
            ['num_clients_cxca_suspects_lessthan_25', []],
            ['num_clients_cxca_suspects_unknown_25_29',[]],
            ['num_clients_cxca_suspects_30_44',[]],
            ['num_clients_cxca_suspects_45_49',[]],
            ['num_clients_cxca_suspects_greaterthan_49', []],
            ['Unknown', []]
            ];
        
            let count = 1;
            for (const group_cont of age_groups){
            for (const record of data) {
                const age_in_years = record.age_in_years;
                //const patient_id = record.patient_id;
                if(group_cont[0] == this.calculatedAgeGroupSectionSeven(age_in_years)){
                     //store patient ID here
                     group_cont[1].push(record.patient_id)
                }
            } 
            formatted_data.push([count++, group_cont[0], group_cont[1]]);
            }
            //return array
            return age_groups
        },
        loadSectionSix(data: any): any {
            let formatted_data = [];
            let results = {} as any;
            let concepts = [
                'VIA negative',
                'VIA positive',
                'Suspect',
                'PAP Smear normal',
                'PAP Smear abnormal',
                'HPV positive',
                'HPV negative',
                'Visible Lesion',
                'No visible Lesion',
                'Other'
            ];

            let returnArray : [string, any[]][]  =  [
                ['num_clients_via_negative_hiv_negative_unknown', []],
                ['num_clients_via_positive_hiv_negative_unknown', []],
                ['num_clients_with_suspect_ca_hiv_negative_unknown', []],
                ['num_clients_pap_smear_normal_hiv_negative_unknown', []],
                ['num_clients_pap_smear_abnormal_hiv_negative_unknown', []],
                ['num_clients_hpv_negative_hiv_negative_unknown', []],
                ['num_clients_hpv_positive_hiv_negative_unknown', []],
                ['num_clients_visible_lesion_hiv_negative_unknown', []],
                ['num_clients_no_visible_lesion_hiv_negative_unknown', []],
                ['num_clients_other_gynae_hiv_negative_unknown', []]
            ];

            let count = 1;

            for(let i = 0; i < concepts.length; i++) {
                if(results[concepts[i]] == undefined)
                results[concepts[i]] = [];

                for (const record of data) {
                let result = record.result;
                let patient_id = record.patient_id;
                if(result != concepts[i])
                    continue;

                results[result].push(patient_id);
                //pushing to returnArray
                returnArray[i][1].push(patient_id)
                } 
            }
            
            for(const result in results){
                formatted_data.push([count++, result, results[result].length]);
            }
            return returnArray;
        },
        loadSectionFive(data: any): any {
            let formatted_data = [];
            let results = {} as any;
            let concepts = [
                'VIA negative',
                'VIA positive',
                'Suspect cancer',
                'PAP Smear normal',
                'PAP Smear abnormal',
                'HPV positive',
                'HPV negative',
                'Visible Lesion',
                'No visible Lesion',
                'Other'
            ];

            let returnArray : [string, any[]][]  =  [
                ['num_clients_via_negative_cxca_screening_hiv_positive', []],
                ['num_clients_via_positive_cxca_screening_hiv_positive', []],
                ['num_clients_with_suspect_ca_screening_hiv_positive', []],
                ['num_clients_pap_smear_normal_cxca_screening_hiv_positive', []],
                ['num_clients_pap_smear_abnormal_cxca_screening_hiv_positive', []],
                ['num_clients_hpv_negative_cxca_screening_hiv_positive', []],
                ['num_clients_hiv_positive_cxca_screening_hiv_positive', []],
                ['num_clients_visible_lesion_cxca_screening_hiv_positive', []],
                ['num_clients_no_visible_lesion_cxca_screening_hiv_positive', []],
                ['num_clients_other_gynae_cxca_screening_hiv_positive', []]
            ];

            let count = 1;

            for(let i = 0; i < concepts.length; i++) {
                if(results[concepts[i]] == undefined)
                results[concepts[i]] = [];

                for (const record of data) {
                let result = record.result;
                let patient_id = record.patient_id;
                if(result != concepts[i])
                    continue;

                results[result].push(patient_id);
                //pushing to returnArray
                returnArray[i][1].push(patient_id)
                } 
            }
            
            for(const result in results){
                formatted_data.push([count++, result, results[result].length]);
            }
            return returnArray;
        },
        loadSectionThree(data: any): any {
            const returnArray: [string, any[]][]  = [
                ['initial_screening', []],
                ['section_three_referral',[]],
                ['postponed_treatment_section_three', []],
                ['one_year_check_up_after_treatment',[]],
                ['subsequent_screening',[]],
                ['problem_visit_after_treatment', []]
            ] 
            // Create an array of visits with their respective integer counts
            const visitsArray = Object.entries(data).map(([visit, integers]) => [visit, integers as number[]]);
            //transforming visits
            for(let i = 0; i < visitsArray.length; i++){
                for(let y = 0; y < visitsArray[i][1].length; y++){
                    returnArray[i][1].push(visitsArray[i][1][y])
                }
            }
            // return the array
            return returnArray;
        },
        loadSectionTwo(data: any): any {
            let age_groups: [string, any[]][] = [
                ['Positive on ART', []],
                ['Positive NOT on ART', []],
                ['Negative', []],
                ['Unknown', []]
            ];

            for (const group_cont of age_groups){
                for (const record of data) {
                    const hiv_status = record.hiv_status;
                    const patient_id = record.patient_id;
                    if(group_cont[0] == this.calculatedGroup(hiv_status)){
                        //adding to array
                        group_cont[1].push(patient_id)
                    }
                } 
            }
            //return array
            return age_groups
        },
        calculatedGroup(hiv_staus: any){
            if(hiv_staus.match(/Positive|Negative/)){
                return hiv_staus;
            }else{
                return 'Unknown'
            }
        },
        loadSectionOne(data: any): any {
            const formatted_data = [];
            const age_groups: [string, any[]][] = [
            ['num_clients_lessthan_25', []],
            ['num_clients_25_to_29',[]],
            ['num_clients_30_to_44',[]],
            ['num_clients_45_to_49',[]],
            ['num_clients_greaterthan_49', []],
            ['Unknown', []]
            ];

            let count = 1;
            for (const group_cont of age_groups){
            for (const record of data) {
                const age_in_years = record.age_in_years;
                //const patient_id = record.patient_id;
                if(group_cont[0] == this.calculatedAgeGroupSectionOne(age_in_years)){
                    //store patient ID here
                    group_cont[1].push(record.patient_id)
                }
            } 
            formatted_data.push([count++, group_cont[0], group_cont[1]]);
            }
            //return array
            return age_groups
        
        },
        calculatedAgeGroupSectionOne(age: any){
            if(age < 25){
            return 'num_clients_lessthan_25';
            }else if(age <= 29){
            return 'num_clients_25_to_29';
            }else if(age <= 44){
            return 'num_clients_30_to_44'
            }else if(age <= 49){
            return 'num_clients_45_to_49'
            }else if(age > 49){
            return 'num_clients_greaterthan_49'
            }else{
            return 'Unknown'
            }
        },
        calculatedAgeGroupSectionSeven(age: any){
            if(age < 25){
            return 'num_clients_cxca_suspects_lessthan_25';
            }else if(age <= 29){
            return 'num_clients_cxca_suspects_unknown_25_29';
            }else if(age <= 44){
            return 'num_clients_cxca_suspects_30_44'
            }else if(age <= 49){
            return 'num_clients_cxca_suspects_45_49'
            }else if(age > 49){
            return 'num_clients_cxca_suspects_greaterthan_49'
            }else{
            return 'Unknown'
            }
        },
        requestCompleted(request: any) {
            //check if request object url contains the word 'report'
            if(request.ok){
                //processing the data retrieved from the api
                this.processData(request)
            }
        },
        async processData(request: any) {
            const data = await request.json()
            this.cohort = data.values
            this.indicators = this.toIndicators(data.values)
        },
        /**
         * Transform indicators from array to a simple key value pair object
        */ 
        toIndicators(params: any) {
            return params.reduce((data: Record<string, number>, indicator: any) => {
                data[indicator.name] = parseInt(indicator.contents)
                return data
            }, {})
        },
        async onDrillDown(indicatorName: string) {
            //loop through report cohort display retrieved data of all Patient ID's
            for (const [category, patientIDs] of this.reportCohort) {
                //check if values match
                if(category == indicatorName){
                    this.presentDrillDown(indicatorName, patientIDs)
                }
            }

        },
        async presentDrillDown(title: string, patientIds: number[]) {
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
                const router = useRouter()
                for(const id of patientIds) {
                    try {
                        const patient = new Patientservice((await Patientservice.findByID(id)))
                        row.push([
                            table.td(patient.getNationalID()),
                            table.td(patient.getGivenName()),
                            table.td(patient.getFamilyName()),
                            table.tdDate(`${patient.getBirthdate()}`),
                            table.tdBtn('Show', () => {
                                router.push({ path: `/patient/dashboard/${id}`})
                                modalController.dismiss({})
                            })
                        ])
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
        },
        regenerate() {
            this.onPeriod()
        },
        exportToCsv() {
            const headers = ['Indicator', 'Value', 'Indicator', 'Value']
            const indicatorsArray = Object.keys(this.indicators).map(k => [k, this.indicators[k]])
            const rows = [] as any
            //getting total length of array
            let totalIndicators = (indicatorsArray.length as number) - 1 
            
            for(let i = 0; i < indicatorsArray.length; i++){
                let normalIndex = (totalIndicators / 2) + i
                //split the list in two
                if(i <= (totalIndicators/2)){
                    rows.push([indicatorsArray[i][0], indicatorsArray[i][1], indicatorsArray[normalIndex][0], indicatorsArray[normalIndex][1]])
                }
            }

            const reportTitle = `${Service.getLocationName()} MOH Monthly Report ${this.period}`
            toCsv([headers], [
                ...rows,
                [`Date Created: ${dayjs().format('DD/MMM/YYYY HH:MM:ss')}`],
                [`HIS-Core Version: ${Service.getCoreVersion()}`],
                [`API Version: ${Service.getApiVersion()}`],
                [`Site: ${Service.getLocationName()}`],
                [`Site UUID: ${Service.getSiteUUID()}`]
            ], reportTitle)
        },
        printSpec() {
            const content = document.getElementById('report-content')
            if (content) {
                toPDFfromHTML(`
                <html>
                    <head>
                    <title>Print Cohort</title>
                    <style> 
                        .numbers {
                        width: 2.5%;
                        text-align: center;
                        border-width: 0px 1px 0px 0px;
                        border-style: dotted;
                        }
                        .row-title {
                        width: 17.75%;
                        text-align: left;
                        padding-left: 5px;
                        border-style: dotted;
                        }
                        .signatures {
                        width: 39.875%;
                        text-align: left;
                        padding-left: 5px;
                        border-style: dotted;
                        }
                        .row-name {
                        width: 39.875%;
                        text-align: left;
                        padding-left: 5px;
                        border-style: dotted;
                        border-left-style: solid;
                        }
                        .no-borders {
                        border-width: 0px;
                        }
                        #version-row td {
                        height: 30px;
                        }
                        #version {
                        text-align: right;
                        padding-right: 5px;
                        font-size: 10px;
                        }
                        #consistency_check div {
                        color: red;
                        padding-bottom: 10px;
                        }
                        a {
                        color: black;
                        text-decoration: none;
                        }
                        table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                        }
                        tr {
                        height: 45px;
                        }
                        .vertical-separator {
                        border-width: 0px;
                        }
                        td {
                        border-style: solid;
                        border-width: 1px;
                        padding: 1em;
                        text-align: center;
                        }
                        .section-description td {
                        border-width: 0px;
                        }
                        .horisonatl-separator td {
                        border-width: 0px;
                        }
                        .numbers {
                        width: 2.5%;
                        text-align: center;
                        border-width: 0px 1px 0px 0px;
                        border-style: dotted;
                        }
                        .sum-arrows {
                        width: 75px;
                        height: 55px;
                        }
                        .postfixes {
                        font-size: x-small;
                        font-weight: bold;
                        position: relative;
                        top: -15px;
                        left: -40px;
                        }
                        .granules {
                        width: 100%;
                        height: 32px;
                        margin: 10px;
                        display: table;
                        }
                        .granules-row {
                        display: table-row;
                        }
                        .granules-cell {
                        display: table-cell;
                        text-align: center;
                        }
                        .granules span{
                        font-size: 10px;
                        }
                        .granules-right-td {
                        border-right-style: dotted !important;
                        border-right-width: 1px;
                        }

                        @media print
                        {
                        table { page-break-after:auto }
                        tr    { page-break-inside:avoid; page-break-after:auto }
                        td    { page-break-inside:avoid; page-break-after:auto }
                        thead { display:table-header-group }
                        tfoot { display:table-footer-group }
                        }
                    </style>
                    </head>
                    <body>
                    ${content.innerHTML}
                    </body>
                </html>
                `)
            }
        },
        sectionOne(){
            return null
        },
        getBtns() {
            return  [
                {
                name: "CSV",
                size: "large",
                slot: "start",
                color: "primary",
                visible: true,
                onClick: () => this.exportToCsv()
                },
                {
                name: "PDF",
                size: "large",
                slot: "start",
                color: "primary",
                visible: true,
                onClick: () => this.printSpec()
                },
                {
                name: "Refresh",
                size: "large",
                slot: "end",
                color: "danger",
                visible: true,
                onClick: async () => this.regenerate()
                },
                {
                name: "Finish",
                size: "large",
                slot: "end",
                color: "success",
                visible: true,
                onClick: () => this.$router.push({ path:'/' })
                }
            ]   
        }
    },
    props: {
        title: {
        type: String,
        required: true,
        },
        period: {
        type: String,
        default: '',
        }
    }
})
</script>