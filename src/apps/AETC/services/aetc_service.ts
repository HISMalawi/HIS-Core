import { Service } from "@/services/service";

export class CxCaService extends Service {
    constructor() {
        super()
    }

    static dashboardStats() {
        return super.getJson(
            'dashboard_stats', {
                'date': super.getSessionDate(),
                'program_id': super.getProgramID()
            }
        )
    }

}
