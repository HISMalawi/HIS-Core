import { printLabel } from "@/components/LBL/labelUtil"
import ArtVisitLbl from "./ArtVisitLbl.vue"
import PatientDemographicLbl from "./PatientDemographicLbl.vue"
import TransferoutLbl from "./TransferoutLbl.vue"
import { Patientservice } from "@/services/patient_service"
import FilingNumber from "@/apps/ART/Labels/FilingNumberLbl.vue"
import DrugLbl from "./DrugLbl.vue"

export function printArtDrug(drugID: number, quantity: number) {
    printLabel(DrugLbl, { scaleHeight: 316, lblUrl: `drugs/${drugID}/barcode?quantity=${quantity}` })
}

export function printArtFilingNumberLbl(patientID: number) {
    printLabel(FilingNumber, { scaleHeight: 316, lblUrl: `patients/${patientID}/labels/filing_number` })
}

export function printArtVisitLbl(patientID: number, date=Patientservice.getSessionDate()) {
    printLabel(ArtVisitLbl, {
        copies: 2,
        lblUrl: `programs/${Patientservice.getProgramID()}/patients/${patientID}/labels/visits?date=${date}`,
    })
}

export function printArtPatientDemographicsLbl(patientID: number) {
    printLabel(PatientDemographicLbl, {
        lblUrl: `programs/${Patientservice.getProgramID()}/patients/${patientID}/labels/patient_history`,
    })
}

export function printArtTransferoutLbl(patientID: number, date=Patientservice.getSessionDate()) {
    printLabel(TransferoutLbl, { lblUrl: `programs/1/patients/${patientID}/labels/transfer_out?date=${date}`})
}