import { ArtReportService } from "./art_report_service";

export const AGE_GROUPS = [
    '<1 year',
    '1-4 years', 
    '5-9 years', 
    '10-14 years', 
    '15-19 years', 
    '20-24 years', 
    '25-29 years', 
    '30-34 years', 
    '35-39 years', 
    '40-44 years', 
    '45-49 years', 
    '50-54 years',
    '55-59 years',
    '60-64 years',
    '65-69 years',
    '70-74 years',
    '75-79 years',
    '80-84 years',
    '85-89 years',
    '90 plus years'
]

export class PatientReportService extends ArtReportService {
    constructor() {
        super()
    }
    
    getBookedAppointments(date: string) {
        return ArtReportService.getJson(`programs/${this.programID}/scheduled_appointments`, { date })
    }

    getViralLoadResults(range: string) {
        return this.getReport(`/programs/${this.programID}/reports/high_vl_patients`, { range })
    }

    getOtherOutcome(outcome: string) {
        return this.getReport('patient_outcome_list', { outcome })
    }

    getPatientVisitTypes() {
        return this.getReport('patient_visit_types')
    }

    getClientsDueForVl() {
        return this.getReport('clients_due_vl')
    }

    getClientRentention() {
        return this.getReport(`/programs/${this.programID}/reports/retention`)
    }

    getExternalConsultationClients() {
        return this.getReport(`${this.programID}/external_consultation_clients`)
    }

    getMissedAppointments() {
        return this.getReport('missed_appointments')
    }

    getPregnantWomen() {
        return this.getReport(`/programs/${this.programID}/reports/pregnant_patients`)
    }

    getArchivingCandidates() {
        return ArtReportService.getJson(`programs/${this.programID}/reports/archiving_candidates`, { 
            'start_date': this.date
        })
    }

    getVisitStats () {
        return ArtReportService.getJson(`programs/${this.programID}/reports/visits`, {
            name: 'visits',
            start_date: this.startDate,
            end_date: this.endDate
        })
    }
}
