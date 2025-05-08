import { ArtReportService } from "./art_report_service";

export enum AGE_GROUP {
    GENERAL = "General",
    CHILDREN = "Children",
    WOMEN = "Women"
}

export class SurvivalAnalysisReportService extends ArtReportService {
    ageGroup: AGE_GROUP;
    quarter: string;
    regenerate: boolean;
    constructor() {
        super()
        this.quarter = ''
        this.regenerate = false
        this.ageGroup = AGE_GROUP.GENERAL
    }

    setRegenerate(ok: boolean) {
        this.regenerate = ok
    }

    getAgeGroup() {
        return this.ageGroup
    }

    setQuarter(quarter: string) {
        this.quarter = quarter
    }

    setAgeGroup(ageGroup: AGE_GROUP) {
        this.ageGroup = ageGroup
    }

    getSurvivalAnalysis() {
        return this.getReport('cohort_survival_analysis', {
            quarter: this.quarter,
            regenerate: this.regenerate,
            date: this.date,
            'age_group': this.ageGroup,
            'program_id': this.programID,
        })
    }
}
