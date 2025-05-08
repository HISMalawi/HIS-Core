import { Service } from "@/services/service";

export class AncService extends Service {
    constructor() {
        super()
    }

    static getStats() {
        return this.getJson(`programs/${this.getProgramID()}/reports/visits`, {
            'name': 'visits_report', 
            'start_date': this.getSessionDate()
        })
    }
}