import { Service } from "@/services/service";

export class CxCaService extends Service {
    constructor() {
        super()
    }

    static async overviewStats() {
       const stats: any = await this.dashboardStats();
       const res = [];
       for(const name in stats) {
        res.push([name, stats[name]])
       }
       return res;
    }
    static async screenedOverviewStats() {
     const stats: any = await this.screenedStats();   
    const res = [];
     for(const ageGroup in stats){
        const people = stats[ageGroup];
        let screened = 0;
        for(const person of people){
        if(person['screening_method_present'] == true)
            screened++;

        }
        res.push([ageGroup, people.length, screened]);
        }
        return res;
    }
    static dashboardStats() {
        return super.getJson(
            'dashboard_stats', {
                'date': super.getSessionDate(),
                'program_id': super.getProgramID()
            }
        )
    }
    static screenedStats() {
        return super.getJson(
            'screened_for_cxca', {
                'date': super.getSessionDate(),
                'program_id': super.getProgramID(),
                'report_name': 'BOOKED CLIENTS FROM ART',
                'start_date': super.getSessionDate(),
                'end_date': super.getSessionDate()
            }
        )
    }
}