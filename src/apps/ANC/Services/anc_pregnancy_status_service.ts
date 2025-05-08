import { AppEncounterService } from "@/services/app_encounter_service";
import { ProgramService } from "@/services/program_service";
import dayjs from "dayjs";

export class AncPregnancyStatusService extends AppEncounterService {
    constructor(patientID: number, providerID: number){
        super(patientID, 111, providerID)
    }

    async getLmpInMonths() {
        const info = await ProgramService.getProgramInformation(this.patientID)
        if (info.date_of_lnmp) {
            const lmp = dayjs(info.date_of_lnmp)
            const today = dayjs(this.date)
            return today.diff(lmp, 'months')
        }
        return -1
    }

    async pregnancyIsOverdue() {
        return (await this.getLmpInMonths()) > 9
    }

    async canInitiateNewPregnancy() {
        return (await this.getLmpInMonths()) >= 7
    }

    async createNewPregnancyStatus() { 
        await this.createEncounter()
        return this.saveValueCodedObs('Pregnancy status', 'New')
    }
}
