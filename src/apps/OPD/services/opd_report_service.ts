import { Service } from "@/services/service";
import HisDate from "@/utils/Date"
import { PrintoutService } from '@/services/printout_service';
import Url from "@/utils/Url";
import { uniq } from "lodash";
import { formatGender } from "../../../utils/Strs";
import dayjs from "dayjs";
import quarterPlugin from "dayjs/plugin/quarterOfYear";
dayjs.extend(quarterPlugin);

export interface QuarterInterface {
    name: string;
    start: string;
    end: string;
}

export const AGE_GROUPS = [
    '0-5 months', '6-11 months',
    '12-23 months', '2-4 years', 
    '5-9 years', '10-14 years', 
    '15-17 years', '18-19 years', 
    '20-24 years', '25-29 years', 
    '30-34 years', '35-39 years', 
    '40-44 years', '45-49 years', 
    '50 plus years'
]

export const OTHER_AGE_GROUPS = [
    '<1 year', '1-4 years',
    '5-9 years', '10-14 years',
    '15-19 years', '20-24 years',
    '25-29 years', '30-34 years',
    '35-39 years', '40-44 years',
    '45-49 years', '50 plus years'
]

export const LA_TYPES: Record<string, string> = {
    one: 'AL 1', 
    two: 'AL 2', 
    three: 'AL 3', 
    four: 'LA 4'
}

export const NCD_TYPES = [
    'Diabetes',
    'Hypertension',
    'Stroke',
    'Suspected cancer',
    'Confirmed cancer',
    'Palliative cancer',
    'Asthma',
    'Depression',
    'Acute psychosis',
    'Chronic psychosis',
    'Epilepsy'
]

export const MENTAL_HEALTH_DIAGNOSIS = [
    'Organic mental disorder (Chronic)',
    'Organic mental disorder (acute)',
    'Alcohol use mental disorder',
    'Drug use mental disorder',
    'Schizophrenia',
    'Acute and transient psychotic disorder',
    'Schizo-affective disorder',
    'Mood-affective disorder (MANIC)',
    'Mood-affective disorder (BIPOLAR)',
    'Mood-affective disorder (DEPRESSION)',
    'Anxiety disorder',
    'Stress reaction adjustment disorder',
    'Dissociative conversion disorder',
    'Somatoform disorder',
    'Puerperal mental disorder',
    'Personality/Behaviour disorder',
    'Mental retardation',
    'Psychological mental disorder',
    'Hyperkinetic conduct disorder',
    'Epilepsy'
]

export const DISAG_INDICATORS = {
    "total": "Total Clients",
    "prev_pos_not_on_art": "Pre Pos not on ART",
    "prev_pos_on_art": "Pre Pos on ART",
    "new_neg": "New Neg",
    "new_pos": "New Pos",
    "not_done": "Not Done",
    "screened": "Screened for TB",
    "not_screened": "Not Screened for TB"
}

export type PatientData = Record<string, any>;
export type IndicatorData = Record<string, Array<number | PatientData>>;
export type DisagIndicator = keyof typeof DISAG_INDICATORS;
export type DisagIndicatorData = Record<DisagIndicator, Array<number>>;
export type DisagReportData = Record<string, Record<string, DisagIndicatorData>>;

export interface AggregatedData {
    p: number[];
    bf: number[];
    fnp: number[];
    all_female: number[];
    all_male: number[];
}

export interface MaternityData {
    FBf: Array<number>;
    FP: Array<number>;
}

export type DisagRowData = DisagIndicatorData & { 
    age_group: string;
    gender: "M" | "F";
}

export class OpdReportService extends Service {
    programID: number;
    startDate: string;
    endDate: string;
    date: string;
    epiweek: string;
    constructor() {
        super()
        this.endDate = ''
        this.startDate = ''
        this.epiweek = ''
        this.date = Service.getSessionDate()
        this.programID = Service.getProgramID()
    }

    async getDisaggReport(){
        const report = await this.getReport(`programs/${this.programID}/reports/opd_disaggregated`);
        const aggregatedData = this.aggregateDisagReportData(report.data);
        return [
            ...aggregatedData.F.rows,
            ...aggregatedData.M.rows,
            { ageGroup: "All", gender: "Male", ...aggregatedData.M.aggregate },
            ...await this.buildMaternityAgreggateRows(aggregatedData.F.aggregate, report.aggregated),
        ]
    }

    aggregateDisagReportData(data: DisagReportData) {
        return Object.entries(data).reduce((result, [ageGroup, currentItem]) => {
            if (ageGroup !== 'Unknown') {
                Object.entries(currentItem).forEach(([gender, indicators]) => {
                    result[gender].rows.push({ ageGroup, gender: formatGender(gender), ...indicators });
                    Object.entries(indicators).forEach(([indicator, values]) => {
                        result[gender].aggregate[indicator] = [
                            ...result[gender].aggregate[indicator] ?? [],
                            ...values
                        ];
                    });
                })
            }
            return result;
        },
        { 
            M: { rows: [] as Array<DisagRowData>, aggregate: {} as DisagIndicatorData }, 
            F: { rows: [] as Array<DisagRowData>, aggregate: {} as DisagIndicatorData } 
        });
    }

    private async getMaternalStatus(patientIds: number[], reportDefinition = 'pepfar'): Promise<MaternityData> {
        const params = Url.parameterizeObjToString(this.buildRequest({ 'report_definition': reportDefinition }));
        return Service.postJson(`vl_maternal_status?${params}`, {
            'patient_ids': patientIds
        })
      }
    
    
      async buildMaternityAgreggateRows(femaleData: IndicatorData, aggregated?: AggregatedData, reportDefinition = 'pepfar') {
        const indicators = Object.keys(femaleData);
        let allFp: Array<number> = [];
        let mStatus: MaternityData = { FBf: [], FP: [] };

        if(aggregated) {
            mStatus.FBf = aggregated.bf;
            mStatus.FP = aggregated.p;
        } else {
            const females = uniq(Object.values(femaleData).flat(1).map(entry => entry instanceof Object ? entry.patient_id : entry)) as Array<number>;
            mStatus = await this.getMaternalStatus(females, reportDefinition);
        }

        allFp = mStatus.FBf.concat(mStatus.FP);
        return ["FP", "FNP", "FBf"].map(gender => {
          return indicators.reduce((row, indicator) => {
            return {
              [indicator]: femaleData[indicator].filter((idOrPatient) => {
                const id = idOrPatient instanceof Object ? idOrPatient.patient_id : idOrPatient;
                return gender === 'FNP' ? !allFp.includes(id) : mStatus[gender as keyof MaternityData].includes(id)
              }),
              ...row,
            }
          }, 
          {
            ageGroup: "All", 
            gender
          } as Record<string, any>)
        })
      }

    getMentalHealth() {
        return this.getReport(`programs/${this.programID}/reports/mental_health`);
    }

    getCasesSeen() {
        return this.getReport(`programs/${this.programID}/reports/cases_seen`);
    }

    getPatientsWithNIDs() {
        return this.getReport('with_nids')
    }

    getClinicRegistrations(){
        return this.getReport('registration');
    }

    getAttendance(){
        return this.getReport(`programs/${this.programID}/reports/attendance`)
    }

    getDrugs() {
        const url = `programs/${this.programID}/reports/drug`
        return Service.getJson(url, {
            'start_date': this.startDate,
            'end_date': this.endDate,
            'date': this.date
        })
    }

    getDiagnosis(){
        const url = `programs/${this.programID}/reports/diagnosis`
        return Service.getJson(url, {
            'start_date': this.startDate,
            'end_date': this.endDate,
            'date': this.date
        })
    }

    getDiagnosisByAddress(){
        return this.getReport('diagnosis_by_address')
    }

    getLaPrescriptions(){
        const url = `programs/${this.programID}/reports/la_prescriptions`
        return Service.getJson(url, {
            'start_date': this.startDate,
            'end_date': this.endDate,
            
        })
    }

    getMalariaReport(){
        const url = `programs/${this.programID}/reports/malaria_report`
        return Service.getJson(url, {
            'start_date': this.startDate,
            'end_date': this.endDate,
            'date': this.date
        })
    }
    
    printLaReport(data: Record<string, any>){
        const printService = new PrintoutService()
        const url = `programs/${this.programID}/barcodes/la_report`
        const params: Record<string, any> = {
            "date[start]": this.startDate,
            "date[end]": this.endDate
        }
        Object.keys(LA_TYPES).forEach((v, i) => {
            i++
            params[`${i}[prescription]`] = data[`total_la_${v}_prescribed_drugs`]
            params[`${i}[dispensed]`] = data[`total_la_${v}_dispensed_drugs`]
        })
        return printService.printLbl(`${url}?${Url.parameterizeObjToString(params)}`)
    }

    getDateIntervalPeriod() {
        return `${HisDate.toStandardHisDisplayFormat(this.startDate)} - ${HisDate.toStandardHisDisplayFormat(this.endDate)}`
    }

    setStartDate(startDate: string) {
        this.startDate = startDate
    }  

    setEndDate(endDate: string) {
        this.endDate = endDate
    }

    setEpiWeek(epiweek: string) {
        this.epiweek = epiweek
    }

    getReportPeriod() {
        return this.startDate && this.endDate
         ? `${HisDate.toStandardHisDisplayFormat(this.startDate)} - ${HisDate.toStandardHisDisplayFormat(this.endDate)}`
         : '-'
    }

    getReport(url: string, params={}) {
        return Service.getJson(url, this.buildRequest(params))
    }

    buildRequest(config: Record<string, any> = {}) {
        const payload: any = {'date': this.date, 'program_id': this.programID}
        if (this.startDate && this.endDate) {
            payload['start_date'] = this.startDate
            payload['end_date'] = this.endDate
        }
        if (this.epiweek) {
            payload['epiweek'] = this.epiweek
        }
        return { ...payload, ...config }
    }

    static getReportQuarters(minDuration = 4) {
        const quarters: Array<QuarterInterface> = [];
        let currentDate = dayjs();

        for (let i = 0; i < minDuration * 4; i++) {
            quarters.push({ 
                start: currentDate.startOf('quarter').format('YYYY-MM-DD'), 
                end: currentDate.endOf('quarter').format('YYYY-MM-DD'), 
                name: `Q${currentDate.quarter()} ${currentDate.year()}`
            });
            currentDate = currentDate.subtract(1, 'quarter');
        }

        return quarters;
    }

}