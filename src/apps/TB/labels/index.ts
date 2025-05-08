import { printLabel } from "../../../components/LBL/labelUtil";
import { Service } from "../../../services/service";
import { TB_PROGRAM_ID } from "../meta/constants";
import VisitSummaryLbl from "./VisitSummaryLbl.vue";

export async function printTbVisitSummaryLbl(patientID: number, date=Service.getSessionDate()){
    return printLabel(VisitSummaryLbl, { lblUrl: `programs/${TB_PROGRAM_ID}/patients/${patientID}/labels/visits?date=${date}`})
}
