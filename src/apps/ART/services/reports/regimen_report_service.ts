import { ArtReportService } from './art_report_service';

export const REGIMENS = [
    '0A', '2A', '4A', '5A', '6A', '7A', '8A', '9A', '10A', '11A', '12A', '13A', '14A', '15A', '16A', '17A',
    '0P', '2P', '4PP', '4PA', '9PP', '9PA', '11PP', '11PA', '12PP', '12PA', '14PP', '14PA', '15PP', '15PA', '16P', '17PP', '17PA'
]

export const REGIMEN_WEIGHT_DISTRIBUTION = [
    '0A', '2A', '4A', '5A', '6A', '7A', '8A', 
    '9A', '10A', '11A', '12A', '13A', '14A', '15A', '16A', '17A',
    '0P', '2P', '4P', '4PP', '4PA', '9P', '9PP', '9PA', '11P', '11PP', 
    '11PA', '12PP', '12PA', '14P', '14PP', '14PA', '15P', '15PP', 
    '15PA', '16P', '17P', '17PP', '17PA'
]
export const WEIGHT_BAND = [
    '3 - 3.9 Kg',
    '4 - 4.9 Kg',
    '5 - 9.9 Kg',
    '10 - 13.9 Kg',
    '14 - 19.9 Kg',
    '20 - 24.9 Kg',
    '25 - 29.9 Kg',
    '30 - 34.9 Kg',
    '35 - 39.9 Kg',
    '40 - 49.9 Kg',
    '50 Kg +',
    'Unknown'
]

export const FORMULATIONS = [
    'pellets',
    'tablets',
    'granules'
]

export class RegimenReportService extends ArtReportService {
    type: string;
    constructor() {
        super()
        this.type = 'pepfar'
    }

    setReportType(type: string) {
        this.type = type
    }

    getTptNewInitiations() {
        return this.getReport(`programs/${this.programID}/reports/tpt_newly_initiated`)
    }

    getRegimenFormulationReport(regimen: string, formulation: string) {
        return this.getReport(`programs/${this.programID}/reports/regimens_and_formulations`, { regimen, formulation })
    }

    getRegimenReport() {
        return this.getReport('regimen_report', { type: this.type})
    }

    getRegimenSwitchReport(isPepfar=false) {
        return this.getReport('regimen_switch', { pepfar: isPepfar })
    }

    getRegimensByWeight(shouldRebuildCache = false) {
        return this.getReport(`programs/${this.programID}/reports/regimens_by_weight_and_gender`, {rebuild: shouldRebuildCache})
    }
    
    getSCReport(isPepfar=false, rebuild = false) {
        return this.getReport('sc_arvdisp', { pepfar: isPepfar, rebuild })
    }
    
}
