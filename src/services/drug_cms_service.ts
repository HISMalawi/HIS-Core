import { Service } from "./service";

export class DrugCmsService extends Service {
    constructor() {
        super()
    }

    
    static getDrugs(params={} as Record<string, string | number | boolean>) {
        return super.getJson('/drug_cms', params)
    }

    static search(keyword="") {
        return super.getJson('/drug_cms/search', { keyword })
    }
}