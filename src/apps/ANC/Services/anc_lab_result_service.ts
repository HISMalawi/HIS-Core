import { AppEncounterService } from "@/services/app_encounter_service";
import { Service } from "@/services/service";
import { PrintoutService } from "@/services/printout_service";
import dayjs from "dayjs";
import { STANDARD_DATE_FORMAT } from "@/utils/Date";

export class AncLabResultService extends AppEncounterService {
    hivStatus: string;
    artStatus: string;
    arvNumber: string;
    arvStartDate: string;
    isSubsequentVisit: boolean;
    isPregnancyTestDone: boolean;
    lastHivTestInMonths: number;
    constructor(patientID: number, providerID: number){
        super(patientID, 32, providerID)
        this.lastHivTestInMonths = -1
        this.hivStatus = ''
        this.artStatus = ''
        this.arvNumber = ''
        this.arvStartDate = ''
        this.isPregnancyTestDone = false
        this.isSubsequentVisit = false
    }

    getHivStatus() {
        return this.hivStatus
    }

    getArtStatus() {
        return this.artStatus
    }

    getArvNumber() {
        return this.arvNumber
    } 

    getArvStartDate() {
        return this.arvStartDate
    }

    isHivPositive() {
        return this.hivStatus.match(/positive/i) ? true : false
    }
    
    async isAtRiskOfPreEclampsia() {
        const sys = await AppEncounterService.getFirstValueNumber(this.patientID, 'Systolic blood pressure')
        const ds = await AppEncounterService.getFirstValueNumber(this.patientID, 'Diastolic blood pressure')
        return sys && ds && sys >= 140 && ds >= 90
    }

    async loadTimeSinceLastHivTest() {
        const obs = await AppEncounterService.getFirstObs(this.patientID, 'HIV status')
        if (!obs) return
        const obsdate = dayjs(obs.obs_datetime).format(STANDARD_DATE_FORMAT)
        this.lastHivTestInMonths = dayjs(this.date).diff(obsdate, 'months')
    }

    async loadSubsequentVisit() {
        const res: any = await Service.getJson(`programs/${this.programID}/patients/${this.patientID}/subsequent_visit`, {
            date: this.date
        })
        if (res) {
            this.hivStatus = res['hiv_status']
            /**
             * On new pregnancies for existing patients, HIV status is empty even if the patient is positive!! 
             * So we need to check concepts if the patient is really positive
             */
            if (!this.hivStatus) {
                const res = await this.getFirstValueCoded('HIV status')
                this.hivStatus = `${res}`.match(/positive/i) ? 'Positive' : ''
            }
            this.isSubsequentVisit = res['subsequent_visit']
            this.isPregnancyTestDone = res['pregnancy_test']
        }
    }

    printLabResults() {
        return new PrintoutService().printLbl(`/programs/${this.programID}/patients/${this.patientID}/labels/lab_results?date=${this.date}`)
    }

    async loadArtStatus() {
        const res = await Service.getJson(`programs/${this.programID}/patients/${this.patientID}/art_hiv_status`)
        const artStartDate = res['arv_start_date'] || ''
        if (artStartDate && dayjs(this.date).isBefore(artStartDate)) {
            return
        }
        if (res) {
            this.hivStatus = res['hiv_status'] || this.hivStatus
            this.artStatus = res['art_status'] || ''
            this.arvNumber = res['arv_number'] || ''
            this.arvStartDate = res['arv_start_date'] || ''
        }
    }
}
