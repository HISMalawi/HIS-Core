import { Service } from "@/services/service"

export class RegistrationReportService extends Service {
    constructor() {
        super()
    }

    requestReport() {
        return Service.getJson('dashboard_stats', {
            'program_id': Service.getProgramID(),
            'date': Service.getSessionDate(),
        })


    }
}
