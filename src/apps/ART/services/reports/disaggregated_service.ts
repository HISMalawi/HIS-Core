import { ArtReportService } from "./art_report_service";
import { AGE_GROUPS } from "./patient_report_service";

export class DisaggregatedReportService extends ArtReportService {
    gender: string;
    ageGroup: string;
    initialize: boolean;
    rebuildOutcome: boolean;

    constructor() {
        super()
        this.gender = ''
        this.ageGroup = AGE_GROUPS[0]
        this.initialize = true
        this.rebuildOutcome = true
    }

    async init() {
        this.initialize = true
        const req = await this.getCohort()
        if (req && req.temp_disaggregated === 'created') {
            this.initialize = false
            return true
        }
        return false
    }

    setAgeGroup(ageGroup: string) {
        this.ageGroup = ageGroup
    }

    setInitialization(isInit: boolean) {
        this.initialize = isInit
    }

    setRebuildOutcome(isRebuild: boolean) {
        this.rebuildOutcome = isRebuild
    }

    setGender(gender: string) {
        this.gender = gender
    }

    getGender() {
        return this.gender
    }

    getDisaggReport(rebuild=false,definition: 'pepfar'|'moh' ='moh') {
        return this.getReport(`programs/${this.programID}/reports/cohort_disaggregated`, {
            rebuild, definition
        })
    }

    getCohort() {
        return this.getReport('cohort_disaggregated', {
            'age_group': `${this.ageGroup}`,
            'rebuild_outcome': `${this.rebuildOutcome}`,
            'initialize': `${this.initialize}`
        })
    }

    getTxIpt() {
        return this.getReport('clients_given_ipt', { 
            'gender': this.gender, 'age_group': `${this.ageGroup}` 
        })
    }

    getTxCurrTB() {
        return this.getReport('screened_for_tb', { 
            'gender': this.gender, 'age_group': `${this.ageGroup}` 
        })
    }

    getRegimenDistribution() {
        return this.getReport('disaggregated_regimen_distribution', {
            'gender': `${this.gender}`, 'age_group': `${this.ageGroup}`
        })
    }
}
