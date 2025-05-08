import { TaskInterface } from "../../interfaces/TaskInterface"
import { Patientservice } from "@/services/patient_service"
import Store from "@/composables/ApiStore"
import { alertConfirmation } from "@/utils/Alerts"
import { delayPromise } from "@/utils/Timers"
import { printArtFilingNumberLbl, printArtPatientDemographicsLbl, printArtVisitLbl } from "../Labels"

async function canDoActivity(activity: string) {
  const activities = await Store.get('ART_USER_SELECTED_ACTIVITIES')
  const status = await Store.get('CAN_EDIT_ACTIVITIES')
  if (!/yes/i.test(status) && !activities.includes(activity)) {
    return false
  }
  return true
}

function isEncounterAfterDeath(p: any) {
  return /died/i.test(`${p?.program?.outcome}`) && 
    new Date(Patientservice.getSessionDate()) >= new Date(p?.program?.startDate)
}

export const PRIMARY_ACTIVITIES: TaskInterface[] = [
  {
    id: "hiv clinic registration",
    name: "Hiv clinic registration",
    workflowID: "HIV first visits",
    icon: "registration.png",
    disabled: isEncounterAfterDeath,
    condition: () => canDoActivity("HIV first visits")
  },
  {
    id: "hiv reception",
    name: "HIV reception",
    workflowID: "HIV reception visits",
    icon: "reception.png",
    disabled: isEncounterAfterDeath,
    condition: () => canDoActivity("HIV reception visits")
  },
  {
    id: "vitals",
    name: "Vitals",
    icon: "vitals.png",
    taskCompletionChecklist: [
      'Weight'
    ],
    disabled: isEncounterAfterDeath,
    condition: () => canDoActivity("Vitals")
  },
  {
    id: "hiv staging",
    name: "HIV staging",
    workflowID: "HIV staging visits",
    icon: "hiv-staging.png",
    disabled: isEncounterAfterDeath,
    condition: () => canDoActivity("HIV staging visits")
  },
  {
    id: "hiv clinic consultation",
    name: "HIV clinic consultation",
    workflowID: "HIV clinic consultations",
    taskCompletionChecklist: [
      'Medication orders'
    ],
    icon: "consultation.png",
    disabled: isEncounterAfterDeath,
    condition: () => canDoActivity("HIV clinic consultations")
  },
  {
    id: "art adherence",
    name: "ART adherence",
    workflowID: "ART adherence",
    icon: "adherence.png",
    disabled: isEncounterAfterDeath,
    condition: () => canDoActivity("ART adherence")
  },
  {
    id: "treatment",
    name: "Treatment",
    workflowID: "Prescriptions",
    icon: "prescription.png",
    disabled: isEncounterAfterDeath,
    condition: () => canDoActivity("Prescriptions")
  },
  {
    id: "fast track assesment",
    name: "Fast Track assesment",
    icon: "fast-track.png",
    condition: () => Store.get('IS_ART_FAST_TRACK_ENABLED'),
    availableOnActivitySelection: false
  },
  {
    id: "dispensing",
    name: "Drug Dispensations",
    encounterTypeName: "DISPENSING",
    workflowID: "Drug Dispensations",
    icon: "dispensing.png",
    disabled: isEncounterAfterDeath,
    condition: () => canDoActivity("Drug Dispensations")
  },
  {
    id: "appointment",
    name: "Manage Appointments",
    encounterTypeName: "APPOINTMENT",
    workflowID: "Manage Appointments",
    icon: "appointment.png",
    disabled: isEncounterAfterDeath,
    condition: () => canDoActivity("Manage Appointments")
  },
  {
    id: "patient type",
    name: "Patient Type",
    encounterTypeName: "Registration",
    icon: "patient-type.png",
    disabled: isEncounterAfterDeath,
    availableOnActivitySelection: false
  },
  {
    id: "bp_management",
    name: "bp_management",
    icon: "dispensing.png",
    encounterTypeName: "Hypertension management",
    disabled: isEncounterAfterDeath,
    condition: () => Store.get('IS_ART_HTN_ENABLED'),
    availableOnActivitySelection: false
  },
  {
    id: "bp_alert",
    name: "bp_alert",
    icon: "dispensing.png",
    disabled: isEncounterAfterDeath,
    condition: () => Store.get('IS_ART_HTN_ENABLED'),
    availableOnActivitySelection: false
  }
]

export const SECONDARY_ACTIVITIES: TaskInterface[] = [
  {
    id: "demographics",
    name: "Demographics (Print)",
    description: "Print Patient Demographics",
    action: ({ patient }: any) => {
      return printArtPatientDemographicsLbl(patient.patient_id)
    },
    icon: "print.png",
  },
  {
    id: "visit_summary",
    name: "Visit Summary (Print)",
    description: "Print Patient Visit Summary",
    action({ patient, visitDate }: any) {
      return printArtVisitLbl(patient.patient_id, visitDate)
    },
    icon: "folder.png",
  },
  {
    id: "master_card",
    name: "Master card",
    description: "View mastercard",
    action: ({ patient }: any, router: any) => {
      router.push(`/art/mastercard/${patient.patient_id}`)
    },
    icon: "card.png"
  },
  {
    id: "f_number",
    name: "Filing Number (Print)",
    description: "Print Patient Filing Number",
    condition: async({patient}: any) => {
      const p = new Patientservice(patient)
      return (await Store.get('IS_ART_FILING_NUMBER_ENABLED')) && (p.hasActiveFilingNumber() || p.hasDormantFilingNumber())
    },
    action({ patient }: any) {
      return printArtFilingNumberLbl(patient.patient_id)
    },
    icon: "folder.png"
  },
  {
    id: "archive_client",
    name: "Archive client",
    description: "Archive a client",
    action: ({ patient }: any, router: any) => {
      delayPromise(200).then(() => {
        alertConfirmation('Are you sure you want to archive patient?').then((ok) => {
          if (ok) {
            router.push(`/art/filing_numbers/${patient.patient_id}?archive=true`)
          }
        })
      })
    },
    condition: async ({ patient }: any) => {
      return (await Store.get('IS_ART_FILING_NUMBER_ENABLED')) && new Patientservice(patient).hasActiveFilingNumber()
    },
    icon: "archive.png"
  },
  {
    id: "assign_filing_number",
    name: "Assign filing number",
    description: "Assign a new filing number",
    condition: async ({patient}: any) => {
      const _p = new Patientservice(patient)
      return (await Store.get('IS_ART_FILING_NUMBER_ENABLED')) && (_p.hasDormantFilingNumber() || !_p.hasActiveFilingNumber())
    },
    action: ({ patient }: any, router: any) => {
      delayPromise(200).then(() => {
        alertConfirmation('Are you sure you want to assign a filing number?').then((ok) => {
          if (ok) {
            router.push(`/art/filing_numbers/${patient.patient_id}?assign=true`)
          }
        })
      })
    },
    icon: "archive.png"
  },
  {
    id: "filing_number_trail",
    name: "View filing number trail",
    description: "view trail",
    action: ({ patient }: any, router: any) => {
      router.push(`/art/filing_numbers/${patient.patient_id}?trail=true`)
    },
    condition: () =>  Store.get('IS_ART_FILING_NUMBER_ENABLED'),
    icon: "folder.png"
  },
  {
    id: 'art notes',
    name: 'ART Clinical Notes',
    icon: 'clinical-notes.png',
    availableOnActivitySelection: false
  },
  {
    id: 'emergency_supply',
    name: "Emergency drug supply",
    description: "",
    action: ({patient}: any, router: any) => {
      router.push(`/art/emergency_supply/${patient.patient_id}`)
    },
    icon: "archive.png"
  }
]
