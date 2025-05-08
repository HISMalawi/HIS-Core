import VisitSummary from "./VisitSummaryLbl.vue";
import { printLabel } from "@/components/LBL/labelUtil"
import { Patientservice } from "@/services/patient_service";

export function printOpdVisitSummary(patientID: number, date=Patientservice.getSessionDate()) {
    printLabel(VisitSummary, {
        lblUrl: `programs/${Patientservice.getProgramID()}/patients/${patientID}/labels/visits?date=${date}`
    })
}