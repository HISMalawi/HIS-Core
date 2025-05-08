import { ArtReportService } from "./art_report_service";

export interface ReportData {
    identifier: string;
    drugName: string;
    dob: string;
    gender: string;
    dispensationDate: string;
    packSize: number;
    packSizes: number;
    quantity: number;
}

export class MohRegimenReportService extends ArtReportService {
    regenerate: boolean;
    data: ReportData[];
    clients: number[];
    constructor() {
        super()
        this.clients = []
        this.data = []
        this.regenerate = false
    }

    setRegenerate(regenerate: boolean) {
        this.regenerate = regenerate
    }

    async generateReport() {
        this.data = []
        this.clients = []
        const res = await this.getReport('latest_regimen_dispensed',
            this.buildRequest({'rebuild_outcome': this.regenerate})
        )
        if (!res) return []
        for (const patientID in res) {
            for (const orderID in res[patientID]) {
                const d = res[patientID][orderID]
                this.data.push({
                    identifier: d.identifier,
                    drugName: d.name,
                    gender: d.gender,
                    dob: d.birthdate,
                    dispensationDate: d['dispensation_date'],
                    packSize: d['pack_sizes'][0],
                    packSizes: d['pack_sizes'].length,
                    quantity: d.quantity
                })
            }
            this.clients.push(parseInt(`${patientID}`))
        }
        return this.data
    }
}
