export default [
  {
    name: "patient registration",
    path: "/spine/encounters/registration/:patient_id",
    component: () => import('@/apps/SPINE/views/encounters/Registration.vue')
  },
  {
    name: "admit patient",
    path: "/spine/encounters/admit-patient/:patient_id",
    component: () => import('@/apps/SPINE/views/encounters/AdmitPatient.vue')
  },
  {
    name: "hiv status",
    path: "/spine/encounters/hiv-status/:patient_id",
    component: () => import('@/apps/SPINE/views/encounters/HIVStatus.vue')
  },
  {
    name: "patient diagnosis",
    path: "/spine/encounters/diagnosis/:patient_id",
    component: () => import('@/apps/SPINE/views/encounters/Diagnosis.vue')
  },
  {
    name: "discharge patient",
    path: "/spine/encounters/outcome-status/:patient_id",
    component: () => import('@/apps/SPINE/views/encounters/DischargePatient.vue')
  },
  {
    name: "social history",
    path: "/spine/encounters/social/:patient_id",
    component: () => import('@/apps/SPINE/views/encounters/SocialHistory.vue')
  },
  {
    name: "prescription",
    path: "/spine/encounters/prescription/:patient_id",
    component: () => import('@/views/DrugPrescription.vue')
  },
  {
    name: "dispensation",
    path: "/spine/encounters/dispensing/:patient_id",
    component: () => import('@/apps/SPINE/views/encounters/Dispensing.vue')
  },
  {
    name: "influenza data",
    path: "/spine/encounters/influenza/:patient_id",
    component: () => import("@/apps/SPINE/views/encounters/InfluenzaData.vue")
  },
  {
    name: "chronic conditions",
    path: "/spine/encounters/chronic-conditions/:patient_id",
    component: () => import("@/apps/SPINE/views/encounters/ChronicConditions.vue")
  },
  {
    name: "Spine Clinic Diagnosis Report",
    path: "/spine/reports/clinic/diagnosis",
    component: () => import("@/apps/SPINE/views/reports/clinic/ClinicDiagnosis.vue")
  },
  {
    name: "Spine Clinic Outcomes Report",
    path: "/spine/reports/clinic/outcomes",
    component: () => import("@/apps/SPINE/views/reports/clinic/ClinicOutcomes.vue")
  },
]

