import { AppEncounterService } from "@/services/app_encounter_service";

export class AncObstericService extends AppEncounterService {
    para: number;
    gravida: number;
    nextGravida: number;
    constructor(patientID: number, providerID: number) {
        super(patientID, 82, providerID)
        this.para = 0
        this.gravida = 0
        this.nextGravida = 0
    }

    async initData() {
        this.para = (await this.getFirstValueNumber('Parity')) || 0
        this.gravida = (await this.getFirstValueNumber('Gravida')) || 0
        this.nextGravida = this.gravida > 0 ? this.gravida + 1 : 0
    }
}
