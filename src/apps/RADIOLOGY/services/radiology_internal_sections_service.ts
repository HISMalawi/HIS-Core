import { Service } from "@/services/service"

export class RadiologyInternalSectionService extends Service {
    constructor() {
        super()
    }

    static getInternalSections() {
        return super.getJson('internal_sections')
    }

    static createInternalSection(name: string) {
        return super.postJson('internal_sections', { name })
    }
}
