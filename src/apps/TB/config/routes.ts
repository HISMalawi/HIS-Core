export default [
    {
        name: "tb_stat_art",
        path: '/reports/tb_stat_art',
        component: () => import('@/apps/TB/views/reports/TBStatArtReport.vue')
    },
    {
        name: "tb_lab_activities",
        path: "/tb/lab/activities/:patient_id",
        component: () => import("@/apps/TB/views/TBLabActivities.vue")
    },
    {
        name: "tb_data_cleaning",
        path: "/tb_data_cleaning",
        component: () => import("@/apps/TB/views/DataManagement/TBDataCleaningTools.vue")
    },
    {
        name: "tb_preference",
        path: "/tb_preference",
        component: () => import("@/apps/TB/views/preferences/Preferences.vue")
    },
    {
        name: "tb_hiv_reporting_form",
        path: "/reports/tb_hiv_reporting_form",
        component: () => import("@/apps/TB/views/reports/TBHIVReportingForm.vue")
    },
    {
        name: "tb_presumptives_report",
        path: "/reports/tb_presumptives",
        component: () => import("@/apps/TB/views/reports/TBPresumptivesReport.vue")
    },
    {
        name: "tb_contact_investigations_report",
        path: "/reports/tb_contact_investigation",
        component: () => import("@/apps/TB/views/reports/TBContactInvestigation.vue")
    },
    {
        name: "tb_high_risk_patients_report",
        path: "/reports/tb_high_risk_patients",
        component: () => import("@/apps/TB/views/reports/TBHighRiskPatientsReport.vue")
    },
    {
        name: "tb_tpt_outcomes",
        path: "/reports/tb_ipt_outcomes",
        component: () => import("@/apps/TB/views/reports/TBTPTOutcomesReport.vue")
    },
    {
        name: "tb_community",
        path: "/reports/tb_community",
        component: () => import("@/apps/TB/views/reports/TBCommunityReport.vue")
    },
    {
        name: "tb_case_finding_report",
        path: "/reports/tb_case_finding_report",
        component: () => import("@/apps/TB/views/reports/TBCaseFindingReport.vue")
    },
    {
        name: "tb_quarterly_treatment_outcomes",
        path: "/reports/tb_quarterly_treatment_outcomes",
        component: () => import("@/apps/TB/views/reports/TBQuaterlyTreatmentOutcomes.vue")
    },
    {
        name: "tb_mdr_case_finding",
        path: "/reports/mdr_casefinding",
        component: () => import("@/apps/TB/views/reports/TBMDRCaseFindingReport.vue")
    },
    {
        name: "tb_mdr_outcomes",
        path: "/reports/mdr_outcomes",
        component: () => import("@/apps/TB/views/reports/TBMDROutcomesReport.vue")
    }
    ,{
        name: "mdr_interim_outcome_report",
        path: "/reports/mdr_interim_outcome_report",
        component: () => import("@/apps/TB/views/reports/TBMDRInterimOutcomesReport.vue")
    },
    {
        name: "tb_initial",
        path: "/tb/initial/:patient_id",
        component: () => import("@/apps/TB/views/encounters/Initial.vue")
    },
    {
        name: "tb_diagnosis",
        path: "/tb/diagnosis/:patient_id",
        component: () => import("@/apps/TB/views/encounters/Diagnosis.vue")
    },
    {
        name: "tb_examination",
        path: "/tb/examination/:patient_id",
        component: () => import("@/apps/TB/views/encounters/Examination.vue")
    },
    {
        name: "tb_lab_orders",
        path: "/tb/lab/:patient_id",
        component: () => import("@/apps/TB/views/encounters/Lab.vue")
    },
    {
        name: "tb_results",
        path: "/tb/results/:patient_id",
        component: () => import("@/apps/TB/views/encounters/Result.vue")
    },
    {
        name: "tb_reception",
        path: "/tb/reception/:patient_id",
        component: () => import("@/apps/TB/views/encounters/Reception.vue")
    },
    {
        name: "tb_treatment",
        path: "/tb/treatment/:patient_id",
        component: () => import("@/apps/TB/views/encounters/Treatment.vue")
    },
    {
        name: "tb_vitals",
        path: "/tb/vitals/:patient_id",
        component: () => import("@/apps/TB/views/encounters/Vitals.vue")
    },
    {
        name: "tb_registration",
        path: "/tb/registration/:patient_id",
        component: () => import("@/apps/TB/views/encounters/Registration.vue")
    },
    {
        name: "microscopy result",
        path: "/tb/results/microscopy/:patient_id",
        component: () => import("@/apps/TB/views/results/Microscopy.vue")
    },
    {
        name: "xpert result",
        path: "/tb/results/xpert/:patient_id",
        component: () => import("@/apps/TB/views/results/Xpert.vue")
    },
    {
        name: "lpa result",
        path: "/tb/results/lpa/:patient_id",
        component: () => import("@/apps/TB/views/results/Lpa.vue")
    },
    {
        name: "lam result",
        path: "/tb/results/lam/:patient_id",
        component: () => import("@/apps/TB/views/results/Lam.vue")
    },
    {
        name: "culture result",
        path: "/tb/results/culture/:patient_id",
        component: () => import("@/apps/TB/views/results/Culture.vue")
    },
    {
        name: "tb_update_hiv_status",
        path: "/tb/hiv/:patient_id",
        component: () => import("@/apps/TB/views/encounters/Hiv.vue")
    },
    {
        name: "tb_update_pregnancy_status",
        path: "/tb/pregnancy/:patient_id",
        component: () => import("@/apps/TB/views/encounters/Pregnancy.vue")
    },
    {
        name: "tb_dispensing",
        path: "/tb/dispense/:patient_id",
        component: () => import("@/apps/TB/views/encounters/Dispense.vue")
    },
    {
        name: "tb_appointment",
        path: "/tb/appointment/:patient_id",
        component: () => import("@/apps/TB/views/encounters/Appointment.vue")
    },
    {
        name: 'tb_complications',
        path: '/tb/complications/:patient_id',
        component: () => import("@/apps/TB/views/encounters/Complications.vue")
    },
    {
        name: 'tb_adherence',
        path: '/tb/adherence/:patient_id',
        component: () => import("@/apps/TB/views/encounters/Adherence.vue")
    },
    {
        name: 'add_tb_contact',
        path: '/tb/contact/new/:patient_id',
        component: () => import("@/apps/TB/views/encounters/Contacts.vue")
    },
    {
        name: 'tb_identifiers',
        path: '/tb/identifiers/:patient_id',
        component: () => import("@/apps/TB/views/encounters/Identifiers.vue")
    },
    {
        name: 'tb_mw_identifier',
        path: '/tb/mw/id/:patient_id',
        component: () => import("@/apps/TB/views/encounters/NationalID.vue")
    },
    {
        name: 'dr_initial_regimen',
        path: '/dr/initial/:patient_id',
        component: () => import("@/apps/TB/views/encounters/DrRegimen.vue")
    },
    {
        name: 'tb_weight_trends',
        path: '/tb/trends/weight/:patient_id',
        component: () => import("@/apps/TB/views/encounters/WeightTrends.vue")
    }
]