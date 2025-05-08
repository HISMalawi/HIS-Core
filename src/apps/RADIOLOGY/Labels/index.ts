import { printLabel } from "@/components/LBL/labelUtil";
import RadiologyExaminations from "@/apps/RADIOLOGY/Labels/RadiologyExaminationLbl.vue";

export async function printRadiologyExamination(accession: string) {
    printLabel(RadiologyExaminations, {
        lblUrl: `orders/radiology?accession_number=${accession}`
    })
}
