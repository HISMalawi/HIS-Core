import { Service } from "@/services/service";

export class LosService extends Service {
    constructor() {
        super()
    }

    static async overviewStats() {
        const stats: Record<string, any> = { }
        const ordered = await this.ordersMade('ordered')
        const drawn = await this.ordersMade('drawn')
        ordered.forEach((o: any) => {
            if (!(o.name in stats)) {
                stats[o.name] = {
                    ordered: 0
                }
            }
            stats[o.name].ordered += 1
        })
        drawn.forEach((d: any) => {
            if (!(d.name in stats)) {
                stats[d.name] = {
                    drawn: 0
                }
            }
            if (!stats[d.name].drawn) {
                stats[d.name].drawn = 0
            }
            stats[d.name].drawn += 1
        })
        return stats
    }

    static ordersMade(orderStatus: 'ordered' | 'drawn') {
        return super.getJson(
            'orders_made', {
                date: super.getSessionDate(),
                'status': orderStatus,
                'start_date': super.getSessionDate(),
                'end_date': super.getSessionDate(),
                'program_id': super.getProgramID()
            }
        )
    }
}