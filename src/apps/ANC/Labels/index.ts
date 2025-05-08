import { printLabel } from "@/components/LBL/labelUtil"
import AncVisitSummary from "./AncVisitSummaryLbl.vue"
import AncPatientHistoryLbl from "./PatientHistoryLbl.vue"
import AncResultLbl from "./ResultLbl.vue"
import { Patientservice } from "@/services/patient_service"

export function printAncVisitLbl(patientID: number, date=Patientservice.getSessionDate()) {
    printLabel(AncVisitSummary, {
        lblUrl: `programs/${Patientservice.getProgramID()}/patients/${patientID}/labels/visits?date=${date}`
    })
}

export function printAncPatientHistoryLbl(patientID: number) {
    printLabel(AncPatientHistoryLbl, {
        lblUrl: `/programs/${Patientservice.getProgramID()}/patients/${patientID}/labels/history`
    })
}

export function printAncResultLbl(patientID: number, date=Patientservice.getSessionDate()) {
    printLabel(AncResultLbl, {
        scaleHeight: 316,
        lblUrl: `/programs/${Patientservice.getProgramID()}/patients/${patientID}/labels/lab_results?date=${date}`
    })
}