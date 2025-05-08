export default [
  {
    name: "Outpatient Reception",
    path: "/registration/encounters/outpatient_reception/:patient_id",
    component: () => import('@/apps/Registration/views/encounters/OutpatientReception.vue')
  },
  {
    name: "Patient Services",
    path: "/registration/encounters/patient_services/:patient_id",
    component: () => import('@/apps/Registration/views/encounters/Services.vue')
  },
  
]

