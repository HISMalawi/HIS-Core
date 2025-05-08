import { AppEncounterService } from "@/services/app_encounter_service"

export class AssessmentService extends AppEncounterService {
    
    hivStatus: string;
    artStatus: string;
    arvNumber: string;
    arvStartDate: string;
    constructor(patientID: number, providerID: number){
        super(patientID, 181, providerID) //TODO: Use encounter type reference name'
        this.hivStatus = ''
        this.artStatus = ''
        this.arvNumber = ''
        this.arvStartDate = ''
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

    async loadArtStatus() {
        const res = await AppEncounterService.getJson(`programs/12/patients/${this.patientID}/art_hiv_status`)
        if (res) {
            this.hivStatus = res['hiv_status'] || this.hivStatus
            this.artStatus = res['art_status'] || ''
            this.arvNumber = res['arv_number'] || ''
            this.arvStartDate = res['arv_start_date'] || ''
        }
    }
}