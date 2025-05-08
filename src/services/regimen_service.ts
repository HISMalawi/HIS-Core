import { Service } from "./service";

export class RegimenService extends Service {
    constructor() {
        super()
    } 

    static getAllArvRegimens() {
        return this.getJson(`programs/${this.getProgramID()}/all_arv_regimens`)
    }

    static getRegimens(patientId: number) {
        return this.getJson(`programs/${this.getProgramID()}/regimens`, {'patient_id': patientId})
    }

    static getCustomIngridients() {
        return this.getJson(`programs/${this.getProgramID()}/custom_regimen_ingredients`)
    }

    static getCurrentRegimen(patientId: number, date=this.getSessionDate()) {
        return this.getJson(`programs/${this.getProgramID()}/${patientId}`, {date})   
    }
}