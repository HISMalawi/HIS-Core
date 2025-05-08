import { TaskInterface } from "@/apps/interfaces/TaskInterface";
import router from "@/router";
import { ProgramService } from "@/services/program_service";
import TbService from "../services/tb_service";
import { printTbVisitSummaryLbl } from "../labels";

export const PRIMARY_ACTIVITIES: TaskInterface[] = [
    {
        id: "tb_initial",
        name: "TB Initial",
        workflowID: "Initial Visit",
        icon: "registration.png",
        action: ({patientID}: any) => router.push(`/tb/initial/${patientID}`)
    },
    {
        id: "tb_diagnosis",
        name: "Diagnosis",
        workflowID: "Diagnosis",
        icon: "diagnosis.png",
        action: ({patientID}: any) => router.push(`/tb/diagnosis/${patientID}`)
    },
    {
        id: "tb_examination",
        name: "Examination",
        workflowID: "Examination",
        icon: "registration.png",
        action: ({patientID}: any) => router.push(`/tb/examination/${patientID}`)
    },
    {
        id: "tb_lab_orders",
        name: "Lab Orders",
        workflowID: "Lab Orders",
        icon: "lab.png",
        action: ({patientID}: any) => router.push(`/tb/lab/${patientID}`)
    },
    {
        id: "tb_results",
        name: "Lab Results",
        workflowID: "Lab Results",
        icon: "results.png",
        action: ({patientID}: any) => router.push(`/tb/results/${patientID}`)
    },
    {
        id: "tb_vitals",
        name: "Vitals",
        workflowID: "Vitals",
        icon: "vitals.png",
        action: ({patientID}: any) => router.push(`/tb/vitals/${patientID}`)
    },
    {
        id: "tb_reception",
        name: "TB Reception",
        workflowID: "TB Reception",
        icon: "reception.png",
        action: ({patientID}: any) => router.push(`/tb/reception/${patientID}`)
    },
    {
        id: "tb_registration",
        name: "TB Registration",
        workflowID: "TB Registration",
        icon: "folder.png",
        action: ({patientID}: any) => router.push(`/tb/registration/${patientID}`)
    },
    {
        id: "tb_treatment",
        name: "Treatment",
        workflowID: "Treatment",
        icon: "clinical-notes.png",
        action: ({patientID}: any) => router.push(`/tb/treatment/${patientID}`)
    },
    {
        id: "tb_dispensing",
        name: "Dispensing",
        workflowID: "Dispensing",
        icon: "dispensing.png",
        action: ({patientID}: any) => router.push(`/tb/dispense/${patientID}`)
    },
    {
        id: "tb adherence",
        name: "TB Adherence",
        workflowID: "TB Adherence",
        icon: "adherence.png",
        action: ({patientID}: any) => router.push(`/tb/adherence/${patientID}`)
    },
    {
        id: "tb_appointment",
        name: "Appointment",
        workflowID: "Appointment",
        icon: "appointment.png",
        action: ({patientID}: any) => router.push(`/tb/appointment/${patientID}`)
    },
    {
        id: "contacts tracing",
        name: "Contacts Tracing",
        workflowID: "Contacts Tracing",
        icon: "Person_Undefined_Female_Dark.png",
        action: ({patientID}: any) => router.push(`/tb/contact/new/${patientID}`)
    },
    {
        id: "identifiers",
        name: "Identifiers",
        workflowID: "Identifiers",
        icon: "barcode.svg",
        action: ({patientID}: any) => router.push(`/tb/identifiers/${patientID}`)
    },
    {
        id: "complications",
        name: "Complications",
        workflowID: "Side Effects",
        icon: "barcode.svg",
        action: ({patientID}: any) => router.push(`/tb/complications/${patientID}`)
    },
    {
        id: "regimen initial",
        name: "Regimen Initial",
        workflowID: "Regimen Initial",
        icon: "drugs-given.png",
        action: ({patientID}: any) => router.push(`/dr/initial/${patientID}`),
        condition: async ({patientID}: any) => {
            const data = (await ProgramService.getProgramInformation(patientID))
            return /Multi drug resistance treatment/i.test(data?.current_outcome)
        }
    },
    {
        id: "tb_update_pregnancy_status",
        name: "Update Pregnancy Status",
        workflowID: "Update Pregnancy Status",
        icon: "current_preg.png",
        condition: ({patient}) => patient.person.gender === 'F',
        action: ({patientID}: any) => router.push(`/tb/pregnancy/${patientID}`)
    },
    {
        id: "tb_update_hiv_status",
        name: "Update Hiv Status",
        workflowID: "Update Hiv Status",
        icon: "hiv-staging.png",
        action: ({patientID}: any) => router.push(`/tb/hiv/${patientID}`)
    }
]

export const SECONDARY_ACTIVITIES: TaskInterface[] = [
    {
        id: "malawi_national_id",
        name: "Malawi National ID",
        icon: "mw.png",
        action: ({patientID}: any) => router.push(`/tb/mw/id/${patientID}`)
    },
    {
        id: "patient_weight_trends",
        name: "Patient Weight Trends",
        icon: "raw_data.png",
        action: ({patientID}: any) => router.push(`/tb/trends/weight/${patientID}`)
    },
    {
        id: "all_patient_visits",
        name: "All Patient Visits",
        icon: "summary.png",
        condition: () => false
    },
    {
        id: "visit_summary_print",
        name: "Visit Summary (Print)",
        icon: "barcode.svg",
        action: ({patientID}: any) => printTbVisitSummaryLbl(patientID)
    },
    {
        id: "treatment_number_print",
        name: "Treatment Number (Print)",
        icon: "barcode.svg",
        action: ({patientID}: any) => TbService.printTBNumber(patientID),
    },
    {
        id: "lab_order_summary_print",
        name: "Lab Order Summary (Print)",
        icon: "barcode.svg"
    }
]