import { TaskInterface } from "@/apps/interfaces/TaskInterface";
import router from "@/router";

export const PRIMARY_ACTIVITIES: TaskInterface[] = [
  {
    id: 'patient registration',
    name: 'Patient registration',
    icon: 'attributes.png'
  },
  {
    id: 'admit patient',
    name: 'Admin Patient',
    encounterTypeName: 'admit patient',
    icon: 'consultation.png'
  },
  {
    id: 'hiv status',
    name: 'HIV Status',
    icon: 'aids.png',
    encounterTypeName: 'update hiv status',
    workflowID: "update hiv status",
    action: ({patientID}: any) => {
      router.push({ path: `/SPINE/encounters/hiv-status/${patientID}`})
    }
  },
  {
    id: 'influenza data',
    name: 'Influenza Data',
    icon: 'influenza.jpg'
  },
  {
    id: 'lab orders',
    name: 'Lab orders',
    icon: 'clinical-notes.png',
    action: ({patient}: any, router: any) => {
      router.push(`/los/forms/order/${patient.patient_id}?type=DRAW_SAMPLES`)
    }
  },
  {
    id: 'lab results',
    name: 'Lab results',
    icon: 'enter.png',
    action: ({ patient }: any, router: any) => {
      router.push({ path: `/lab/results/${patient.patient_id}`})
    },
  },
  {
    id: 'social history',
    name: 'social history',
    icon: 'medical-report.png',
  },
  {
    id: 'chronic conditions',
    name: 'Chronic Conditions',
    icon: 'attributes.png'
  },
  {
    id: 'patient diagnosis',
    name: 'Diagnosis',
    encounterTypeName: "diagnosis",
    workflowID: "diagnosis",
    icon: 'diagnosis.png',
    action: ({patientID}: any) => {
      router.push({ path: `/SPINE/encounters/diagnosis/${patientID}` })
    }
  },
  {
    id: 'prescription',
    name: 'Prescription',
    encounterTypeName: 'Treatment',
    workflowID: "treatment",
    icon: 'drugs-given.png',
    action: ({patientID}: any) => {
      router.push({ path: `/SPINE/encounters/prescription/${patientID}` })
    }
  },
  {
    id: 'dispensation',
    name: 'Dispensation',
    workflowID:"Dispensing",
    icon: 'dispensing.png',
    action: ({patientID}: any) => {
      router.push({ path: `/SPINE/encounters/dispensing/${patientID}` })
    }
  },
  {
    id: 'discharge patient',
    name: 'Discharge Patient',
    icon: 'outcomes.png',
  },
];

export const SECONDARY_ACTIVITIES: TaskInterface[] = [];
