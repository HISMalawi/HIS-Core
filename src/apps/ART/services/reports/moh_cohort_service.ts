import { find } from "lodash";
import { ArtReportService } from "./art_report_service";

export enum CohortVar {
    MOH_CACHE = 'mohCache'
}

export interface CohortValidationInterface {
    param: number | string;
    error: (indicator: number, param: number) => string;
    check: (indicator: number, param: number) => boolean;
}

export class MohCohortReportService extends ArtReportService {
    regenerate: boolean;
    constructor() {
        super()
        this.regenerate = false
    }

    private cohortUrl() {
        return `programs/${this.programID}/reports/cohort`
    }

    setRegenerate(regenerate: boolean) {
        this.regenerate = regenerate
    }

    getCohortDrillDown(resourceId: string) {
        return ArtReportService.getJson('cohort_report_drill_down', {
            id: resourceId,
            date: this.date,
            'program_id': this.programID
        })
    }

    requestCohort(params: any) {
        return ArtReportService.ajxGet(
            this.cohortUrl(), params
        )
    }

    qaurterRequestParams() {
        const data: any =  { 
            name: this.quarter,
            regenerate: this.regenerate 
        }
        if (this.occupation) {
            data['occupation'] = this.occupation
        }
        return data
    }

    datePeriodRequestParams() {
        const data: any = {
            name: `Cohort-${this.startDate}-${this.endDate}`,
            'start_date': this.startDate,
            'end_date': this.endDate,
            regenerate: this.regenerate
        }
        if (this.occupation) {
            data['occupation'] = this.occupation
        }
        return data
    }

    getCachedCohortValues() {
        const cache = sessionStorage.getItem(CohortVar.MOH_CACHE)
        if (cache) {
            const conf = JSON.parse(cache)
            if (conf.start_date === this.startDate 
                && conf.end_date === this.endDate
                || conf.quarter === this.quarter) {
                return conf.data
            }
        }
    }

    cacheCohort(values: any) {
        sessionStorage.setItem(
            CohortVar.MOH_CACHE, 
            JSON.stringify({
                'start_date': this.startDate,
                'end_date': this.endDate,
                'quarter': this.quarter,
                'data': values
        }))
    }

    validateIndicators(validations: Record<string, CohortValidationInterface>, callback: (errors: Array<any>) => any) {
        const cachedValues = this.getCachedCohortValues()
        if (cachedValues) {
            const errors = Object.keys(validations)
                .reduce((errors: Array<any>, key: string) => {
                    const totals = key.replaceAll(' ', '').split('+').reduce((total: any, i: any) => {
                        const indicator: any = find(cachedValues, { name: i })
                        return total + parseInt(indicator?.contents||'0') 
                    }, 0)
                    const validation: any = validations[key]
                    const param = validation.param as number
                    const condition = validation.check(totals, param)
                    if (condition) errors.push(validation.error(totals, param))
                    return errors
                }, [])
            return callback(errors)
        }
        return -1
    }
}
