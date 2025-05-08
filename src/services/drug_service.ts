import { Service } from "./service";

export class DrugService extends Service {
    constructor() {
        super()
    }

    
    static getDrugs(params={} as Record<string, string | number>) {
        return super.getJson('/drugs', params)
    }

    static getOPDDrugs(params={} as Record<string, string | number>) {
        return super.getJson('OPD_drugslist', params)
    }
}