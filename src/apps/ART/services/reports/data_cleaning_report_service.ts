import { ArtReportService } from "./art_report_service";

export enum CtIndicator {
    DifferentPregnancyValueOnSameDate = 'DIFFERENT PREGNANCY VALUE ON SAME DATE',
    DobMoreThanEnrolledDate = 'DOB MORE THAN DATE ENROLLED',
    ClientsWithEncountersAfterDeath = 'CLIENTS WITH ENCOUNTERS AFTER DECLARED DEAD',
    DateEnrolledLessThanEarliestStartDate = 'DATE ENROLLED LESS THAN EARLIEST START DATE',
    MalesWithFemaleObs = 'MALE CLIENTS WITH FEMALE OBS',
    PrescriptionWithoutDispensation = 'PRESCRIPTION WITHOUT DISPENSATION',
    MissingDemographics = 'MISSING DEMOGRAPHICS',
    MissingStartReasons = 'MISSING START REASONS',
    MissingArtStartDate = 'MISSING ART START DATE',
    MultipleStartReasons = 'MULTIPLE START REASONS',
    PreArtOrUnknownOutcomes ='PRE ART OR UNKNOWN OUTCOMES',
    MissingVlResults = 'MISSING VL RESULTS',
    ActiveClientsWithAdverseOutcomes = 'ACTIVE CLIENTS WITH ADVERSE OUTCOMES',
}

export interface DataCleaningVerificationData {
    'data_cleaning_datetime': string;
    'supervisors': string[];
}

export class DataCleaningReportService extends ArtReportService {
    constructor() {
        super()
    }
    
    getSupervisionHistory() {
        return ArtReportService.getJson('data_cleaning_supervisions')
    }

    saveDataCleaningVerification(data: DataCleaningVerificationData) {
        return ArtReportService.postJson('data_cleaning_supervisions', data)
    }

    getCleaningToolReport(indicator: CtIndicator) {
        return this.getReport('art_data_cleaning_tools', { 
            'report_name' : indicator 
        })
    }

    getEnrolledOnArtBeforeBirth() {
        return ArtReportService.getJson('enrolled_on_art_before_birth')
    }

    getIncompleteVisits() {
        return this.getReport('incomplete_visits', {
            'tool_name': 'INCOMPLETE VISITS'
        })
    }
}
