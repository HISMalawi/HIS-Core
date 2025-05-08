import { TaskInterface } from "@/apps/interfaces/TaskInterface";

export const PRIMARY_ACTIVITIES: TaskInterface[] = [
  {
    id: 'AETC patient registration',
    name: 'Patient registration',
    icon: 'attributes.png'
  },
  {
    id: 'AETC vitals',
    name: 'vitals',
    icon: 'vitals.png'
  },
  {
    id: 'AETC presenting complaints',
    name: 'presenting complaints',
    icon: 'complaints.png'
  },
  {
    id: 'AETC hiv status',
    name: 'hiv status',
    icon: 'aids.png',
    encounterTypeName: 'update hiv status',
    availableOnActivitySelection: false
  },
  {
    id: 'AETC outpatient diagnosis',
    name: 'outpatient diagnosis',
    icon: 'diagnosis.png'
  },
  {
    id: 'AETC outcome status',
    name: 'outcome status',
    icon: 'outcomes.png',
    encounterTypeName: 'referral',
    availableOnActivitySelection: false
  },
  {
    id: 'lab orders',
    name: 'Lab orders',
    icon: 'clinical-notes.png',
    availableOnActivitySelection: false,
    action: ({patient}: any, router: any) => {
      router.push(`/los/forms/order/${patient.patient_id}?type=DRAW_SAMPLES`)
    }
  },
  {
    id: 'lab results',
    name: 'Lab results',
    encounterTypeName: 'lab orders',
    icon: 'enter.png',
    availableOnActivitySelection: false,
    action: ({ patient }: any, router: any) => {
      router.push({ path: `/lab/results/${patient.patient_id}`})
    },
  },
  {
    id: 'AETC social history',
    name: 'social history',
    icon: 'medical-report.png'
  },
  {
    id: 'AETC prescription',
    name: 'prescription',
    encounterTypeName: 'Treatment',
    icon: 'drugs-given.png'
  },
  {
    id: 'AETC dispensation',
    name: 'dispensation',
    workflowID:"Dispensing",
    encounterTypeName: 'Dispensing',
    icon: 'dispensing.png',
    availableOnActivitySelection: false
  },
]

export const SECONDARY_ACTIVITIES: TaskInterface[] = [
  {
    id: 'AETC radiology examination',
    name: 'radiology examination',
    icon: 'radiology_types.png'
  },
]
