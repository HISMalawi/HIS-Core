import { AETC_GLOBAL_PROP } from "../aetc_global_props"

export default [
    {
        name: "AETC patient registration",
        path: "/aetc/encounters/registration/:patient_id",
        component: () => import('@/apps/AETC/views/encounters/Registration.vue')
    },
    {
        name: "AETC hiv status",
        path: "/aetc/encounters/hiv-status/:patient_id",
        component: () => import('@/apps/AETC/views/encounters/HIVStatus.vue')
    },
    {
        name: "AETC vitals",
        path: "/aetc/encounters/vitals/:patient_id",
        component: () => import('@/apps/ART/views/encounters/Vitals.vue')
    },
    {
        name: "AETC outpatient diagnosis",
        path: "/aetc/encounters/diagnosis/:patient_id",
        component: () => import('@/apps/AETC/views/encounters/Diagnosis.vue')
    },
    {
        name: "AETC outcome status",
        path: "/aetc/encounters/outcome-status/:patient_id",
        component: () => import('@/apps/AETC/views/encounters/OutcomeStatus.vue')
    },
    {
        name: "AETC social history",
        path: "/aetc/encounters/social/:patient_id",
        component: () => import('@/apps/AETC/views/encounters/SocialHistory.vue')
    },
    {
        name: "AETC presenting complaints",
        path: "/aetc/encounters/complaints/:patient_id",
        component: () => import('@/apps/AETC/views/encounters/Complaints.vue')
    },
    {
        name: "AETC presenting complaints",
        path: "/aetc/encounters/complaints/:patient_id",
        component: () => import('@/apps/AETC/views/encounters/Complaints.vue')
    },
    {
        name: "AETC prescription",
        path: "/aetc/encounters/prescription/:patient_id",
        component: () => import('@/views/DrugPrescription.vue')
    },
    {
        name: "AETC dispensation",
        path: "/aetc/encounters/dispensing/:patient_id",
        component: () => import('@/apps/AETC/views/encounters/Dispensing.vue')
    },
    {
        name: "AETC radiology examination",
        path: "/aetc/encounters/radiology/:patient_id",
        component: () => import('@/apps/AETC/views/encounters/radiology.vue')
    },
    {
        name: AETC_GLOBAL_PROP.SET_TOP_10_DIAGNOSIS,
        path: "/aetc/preferences/top_ten_diagnosis",
        component: () => import("@/apps/AETC/views/preferences/DefaultPreferences.vue")
    },
    {
        name: AETC_GLOBAL_PROP.SET_TOP_10_DRUGS,
        path: "/aetc/preferences/top_ten_drugs",
        component: () => import("@/apps/AETC/views/preferences/DefaultPreferences.vue")
    },
    {
        name: 'aetc_diagnosis',
        path: '/aetc/reports/clinic/diagnosis',
        component: () => import('@/apps/AETC/views/reports/clinic/Diagnosis.vue')
    },
    {
        name: 'aetc_diagnosis_specific',
        path: '/aetc/reports/clinic/diagnosisSpecific',
        component: () => import('@/apps/AETC/views/reports/clinic/DiagnosisSpecific.vue')
    },
    {
        name: 'aetc_disaggregated_diagnosis',
        path: '/aetc/reports/clinic/disaggregatedDiagnosis',
        component: () => import('@/apps/AETC/views/reports/clinic/DisaggregatedDiagnosis.vue')
    },
    {
        name: 'aetc_opd_general_report',
        path: '/aetc/reports/clinic/opdGeneral',
        component: () => import('@/apps/AETC/views/reports/clinic/OPDGeneral.vue')
    },
    {
        name: 'aetc_referral_report',
        path: '/aetc/reports/clinic/referral',
        component: () => import('@/apps/AETC/views/reports/clinic/Referral.vue')
    },
    {
        name: 'aetc_total_registered_report',
        path: '/aetc/reports/clinic/totalRegistered',
        component: () => import('@/apps/AETC/views/reports/clinic/TotalRegistered.vue')
    },
    {
        name: 'aetc_dhis2_report',
        path: '/aetc/reports/clinic/dhis2',
        component: () => import('@/apps/AETC/views/reports/clinic/DHIS2.vue')
    },
    {
        name: 'aetc_malaria_report',
        path: '/aetc/reports/moh/malaria_report',
        component: () => import('@/apps/AETC/views/reports/moh/malaria_report.vue')
    },
]
