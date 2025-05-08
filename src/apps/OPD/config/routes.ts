export default [
  {
    name: "general consultation",
    path: "/opd/encounters/consultations/:patient_id",
    component: () => import('@/apps/OPD/views/encounters/GeneralConsultation.vue')
  },
  {
    name: "opd patient registration",
    path: "/opd/encounters/registration/:patient_id",
    component: () => import('@/apps/OPD/views/encounters/Registration.vue')
  },
  {
    name: "hiv status",
    path: "/opd/encounters/hiv-status/:patient_id",
    component: () => import('@/apps/OPD/views/encounters/HIVStatus.vue')
  },
  {
    name: "vitals",
    path: "/opd/encounters/vitals/:patient_id",
    component: () => import('@/apps/ART/views/encounters/Vitals.vue')
  },
  {
    name: "outpatient diagnosis",
    path: "/opd/encounters/diagnosis/:patient_id",
    component: () => import('@/apps/OPD/views/encounters/Diagnosis.vue')
  },
  {
    name: "outcome status",
    path: "/opd/encounters/outcome-status/:patient_id",
    component: () => import('@/apps/OPD/views/encounters/OutcomeStatus.vue')
  },
  {
    name: "OPD social history",
    path: "/opd/encounters/social/:patient_id",
    component: () => import('@/apps/OPD/views/encounters/SocialHistory.vue')
  },
  {
    name: "presenting complaints",
    path: "/opd/encounters/complaints/:patient_id",
    component: () => import('@/apps/OPD/views/encounters/Complaints.vue')
  },
  {
    name: "OPD Prescription",
    path: "/opd/encounters/prescription/:patient_id",
    component: () => import('@/views/DrugPrescription.vue')
  },
  {
    name: "dispensation",
    path: "/opd/encounters/dispensing/:patient_id",
    component: () => import('@/apps/OPD/views/encounters/Dispensing.vue')
  },
  {
    name: "radiology examination",
    path: "/opd/encounters/radiology/:patient_id",
    component: () => import('@/apps/OPD/views/encounters/radiology.vue')
  },
  {
    name: 'clinic_disaggregated',
    path: '/clinic_disaggregated',
    component: () => import('@/apps/OPD/views/reports/clinic/DisaggregatedReport.vue')
  },
  {
    name: 'clinic_with_nids',
    path: "/opd/reports/clinic/clinic_with_nids",
    component: () => import('@/apps/OPD/views/reports/clinic/ClinicWithNIDsReport.vue')
  },
  {
    name: 'clinic_drugs_given',
    path: "/opd/reports/clinic/clinic_drugs_given",
    component: () => import('@/apps/OPD/views/reports/clinic/DrugsReport.vue')
  },
  {
    name: 'clinic_registration',
    path: "/opd/reports/clinic/cclinic_registration",
    component: () => import('@/apps/OPD/views/reports/clinic/ClinicRegistrationReport.vue')
  },
  {
    name: 'clinic_la',
    path: '/opd/reports/clinic/clinic_la',
    component: () => import('@/apps/OPD/views/reports/clinic/LaReport.vue')
  },
  {
    name: 'clinic_cases_seen',
    path: '/opd/reports/clinic/clinic_cases_seen',
    component: () => import('@/apps/OPD/views/reports/clinic/ClinicCasesSeen.vue')
  },
  {
    name: 'clinic_mental_health',
    path: '/opd/reports/clinic/clinic_mental_health',
    component: () => import('@/apps/OPD/views/reports/clinic/MentalHealth.vue')
  },
  {
    name: 'clinic_diagnosis',
    path: '/opd/reports/clinic/clinic_diagnosis',
    component: () => import('@/apps/OPD/views/reports/clinic/Diagnosis.vue')
  },
  {
    name: 'clinic_diagnosis_by_address',
    path: '/opd/reports/clinic/clinic_diagnosis_by_address',
    component: () => import('@/apps/OPD/views/reports/clinic/DiagnosisByAddress.vue')
  },
  {
    name: 'idsr_weekly',
    path: '/opd/reports/moh/idsr_weekly',
    component: () => import('@/apps/OPD/views/reports/moh/IDSR/IDSRWeekly.vue')
  },
  {
    name: 'idsr_monthly',
    path: '/opd/reports/moh/idsr_monthly',
    component: () => import('@/apps/OPD/views/reports/moh/IDSR/IDSRMonthly.vue')
  },
  {
    name: 'idsr_quarterly',
    path: '/opd/reports/moh/idsr_quarterly',
    component: () => import('@/apps/OPD/views/reports/moh/IDSR/IDSRQuarterly.vue')
  },
  {
    name: 'hmis_15',
    path: '/opd/reports/moh/hmis_15',
    component: () => import('@/apps/OPD/views/reports/moh/HMIS/HMIS15.vue')
  },
  {
    name: 'hmis_17',
    path: '/opd/reports/moh/hmis_17',
    component: () => import('@/apps/OPD/views/reports/moh/HMIS/HMIS17.vue')
  },
  {
    name: 'moh_malaria',
    path: '/moh_malaria',
    component: () => import('@/apps/OPD/views/reports/moh/malaria_report.vue')
  }
]

