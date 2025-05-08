import { ART_GLOBAL_PROP } from "../art_global_props"

export default [
    {
        name: "HTN Enrollment Report",
        path: "/art/htn_enrollment_report",
        component: () => import("@/apps/ART/views/reports/clinic/ClinicHtnEnrollmentReport.vue")
    },
    {
        name: "Lab Audit",
        path: "/art/lab_audit",
        component: () => import('@/apps/ART/views/reports/inconsistencies/LabAudit.vue')
    },
    {
        name: "Tx HTN Report",
        path: "/art/tx_htn_report",
        component: () => import('@/apps/ART/views/reports/pepfar/PepfarTxHtnReport.vue')
    },
    {
        name: "Emergency supply",
        path: "/art/emergency_supply/:patient_id",
        component: () => import('@/apps/ART/views/encounters/EmergencySupply.vue')
   },
   {        
        name: "NID Utilization report",
        path: "/art/npid_utilization_report",
        component: () => import("@/apps/ART/views/reports/clinic/ClinicNationalIdUtilization.vue")
    },
    {
        name: "NID Cumulative report",
        path: "/art/npid_cumulative_report",
        component: () => import("@/apps/ART/views/reports/clinic/ClinicNationalIDCumulative.vue")
    },
    {
        name: "Clinic vl suppression report",
        path: "/art/clinic_vl_suppression",
        component: () => import('@/apps/ART/views/reports/clinic/ClinicVlSuppression.vue')
    },
    {
        name: "Data supervision report",
        path: "/art/data_supervision",
        component: () => import('@/apps/ART/views/reports/inconsistencies/DataCleaningVerificationReport.vue')
    },
    { 
        name: "Pepfar Tx New Report",
        path: "/art/pepfar_tx_new_report",
        component: () => import('@/apps/ART/views/reports/pepfar/TxNew.vue')
    },
    {
        name: "User activity settings",
        path: "/art/user_activity_settings",
        component: () => import('@/apps/ART/views/UserActivitySettings.vue')
    },
    {
        name: "Hypertension cascade report",
        path: "/art/hypertension_cascade_report",
        component: () => import('@/apps/ART/views/reports/clinic/ClinicHypertensionCascadeReport.vue')
    },
    {
        name: "Hypertension report",
        path: "/art/hypertension_report",
        component: () => import('@/apps/ART/views/reports/clinic/ClinicHypertensionReport.vue')
    },
    {
        name: "Clinic Discrepancy Report",
        path: "/art/clinic_discrepancy_report",
        component: () => import("@/apps/ART/views/reports/clinic/ClinicDiscrepancyReport.vue")
    },
    {
        name: "Viral Load Register",
        path: "/art/report/clinic_viral_load_register",
        component: () => import("@/apps/ART/views/reports/clinic/ClinicViralLoadRegister.vue")
    },
    {
      name: "Clinic vl collection",
      path: '/art/clinic_vl_collection_report',
      component: () => import("@/apps/ART/views/reports/clinic/ClinicVlCollection.vue")  
    },
    {
        name: "Stock Sc Curr",
        path: "/art/sc_curr",
        component: () => import("@/apps/ART/views/reports/pepfar/ScCurrReport.vue")
    },
    {
        name: "Data cleaning verification",
        path: "/art/data_cleaning_verification",
        component: () => import("@/apps/ART/views/reports/inconsistencies/DataCleaningVerification.vue")
    },
    {
        name: "Edit ARV Number",
        path: "/art/arv-number/:patient_id",
        component: () => import("@/apps/ART/views/encounters/ARVNumber.vue")
    },
    {
        name: 'preferences',
        path: "/art/preferences",
        component: () => import("@/apps/ART/views/preferences/AllPreferences.vue")
    },
    {
        name: 'target_lab',
        path: "/art/preferences/target_lab",
        component: () => import("@/apps/ART/views/preferences/DefaultPreferences.vue")
    },
    {
        name: ART_GLOBAL_PROP.CLINIC_HOLIDAYS,
        path: "/art/preferences/clinic_holidays",
        component: () => import("@/apps/ART/views/preferences/DefaultPreferences.vue")
    },
    {
        name: 'bp_thresholds',
        path: "/art/preferences/bp_thresholds",
        component: () => import("@/apps/ART/views/preferences/DefaultPreferences.vue")
    },
    {
        name: 'clinic_days',
        path: "/art/preferences/clinic_days",
        component: () => import("@/apps/ART/views/preferences/DefaultPreferences.vue")
    },
    {
        name: "cervical_cancer",
        path: "/art/preferences/cervical_cancer_screening",
        component: () => import("@/apps/ART/views/preferences/DefaultPreferences.vue")
    },
    {
        name: ART_GLOBAL_PROP.LAB_ORDER_PRINT_COPIES,
        path: "/art/preferences/lab_print_copies",
        component: () => import("@/apps/ART/views/preferences/DefaultPreferences.vue")
    }, 
    {
        name: ART_GLOBAL_PROP.HTN_SCREENING_AGE_THRESHOLD,
        path: "/art/preferences/htn_age",
        component: () => import("@/apps/ART/views/preferences/DefaultPreferences.vue")
    }, 
    {
        name: ART_GLOBAL_PROP.NOTIFICATION_PERIOD,
        path: "/art/preferences/notification_period",
        component: () => import("@/apps/ART/views/preferences/DefaultPreferences.vue")
    },
    {
        name: ART_GLOBAL_PROP.FILING_NUMBER_LIMIT,
        path: "/art/preferences/fn/limit",
        component: () => import("@/apps/ART/views/preferences/DefaultPreferences.vue")
    },
    {
        name: ART_GLOBAL_PROP.APPOINTMENT_LIMIT,
        path: "/art/preferences/appointment/limit",
        component: () => import("@/apps/ART/views/preferences/DefaultPreferences.vue")
    },
    {
        name: 'art_patient_visit_stats',
        path: '/art/patient_visits',
        component: () => import("@/apps/ART/views/reports/inconsistencies/PatientVisitStats.vue")
    },
    {
        name: "filing management",
        path: '/art/filing_numbers/:patient_id',
        component: () => import("@/apps/ART/views/FilingNumberManagement.vue")
    },
    {
        name: 'art notes',
        path: '/art/clinical_notes/:patient_id',
        component: () => import("@/apps/ART/views/encounters/ArtNotes.vue")
    },
    {
        name: "Enter stock",
        path: "/art/stock/enter",
        component: () => import("@/apps/ART/views/ARTStock/enter_receipts.vue")
    },
    {
        name: "Audit trail",
        path: "/art/stock/trail",
        component: () => import("@/apps/ART/views/ARTStock/AuditTrail.vue")
    },
    {
        name: "Verify stock",
        path: "/art/stock/verify",
        component: () => import("@/apps/ART/views/ARTStock/verification.vue")
    },
    {
        name: "Move stock",
        path: "/art/stock/move",
        component: () => import("@/apps/ART/views/ARTStock/movement.vue")
    },
    {
        name: "Stock report",
        path: "/art/stock/report",
        component: () => import("@/apps/ART/views/ARTStock/StockReport.vue")
    },
    {
        name: "Print drug barcode",
        path: "/drug/print",
        component: () => import("@/views/PrintDrug.vue")
    },
    {
        name: "treatment",
        path: "/art/encounters/prescriptions/:patient_id",
        component: () => import("@/apps/ART/views/encounters/Prescription.vue")
    },
    {
        name: 'bp_alert',
        path: '/art/encounters/bp/alert/:patient_id',
        component: () => import ("@/apps/ART/views/encounters/BpAlert.vue")
    },
    {
        name: "art adherence",
        path: "/art/encounters/adherence/:patient_id",
        component: () => import("@/apps/ART/views/encounters/Adherence.vue")
    },
    {
        name: "hiv clinic consultation (clinician)",
        path: "/art/encounters/consultation/:patient_id",
        component: () => import("@/apps/ART/views/encounters/Consultation.vue")
    },
    {
        name: "hiv clinic consultation",
        path: "/art/encounters/consultation/:patient_id",
        component: () => import("@/apps/ART/views/encounters/Consultation.vue")
    },
    {
        name: "hiv clinic registration",
        path: "/art/encounters/registration/:patient_id",
        component: () => import("@/apps/ART/views/encounters/Registration.vue")
    },
    {
        name: "hiv reception",
        path: "/art/encounters/reception/:patient_id",
        component: () => import("@/apps/ART/views/encounters/Reception.vue")
    },
    {
        name: "hiv staging",
        path: "/art/encounters/staging/:patient_id",
        component: () => import("@/apps/ART/views/encounters/Staging.vue")
    },
    {
        name: "appointment",
        path: "/art/encounters/appointment/:patient_id",
        component: () => import("@/apps/ART/views/encounters/Appointment.vue")
    },
    {
        name: "dispensing",
        path: "/art/encounters/dispensation/:patient_id",
        component: () => import("@/apps/ART/views/encounters/Dispensing.vue")
    },
    {
        name: "vitals",
        path: "/art/encounters/vitals/:patient_id",
        component: () => import("@/apps/ART/views/encounters/Vitals.vue")
    },
    {
        name: "htn_vitals",
        path: "/art/encounters/vitals/:patient_id",
        component: () => import("@/apps/ART/views/encounters/Vitals.vue")
    },
    {
        name: "patient type",
        path: "/art/encounters/patient_type/:patient_id",
        component: () => import("@/apps/ART/views/encounters/PatientType.vue")
    },
    {
        name: "fast track assesment",
        path: "/art/encounters/fast_track/:patient_id",
        component: () => import("@/apps/ART/views/encounters/FastTrack.vue")
    },
    {
        name: "bp_management",
        path: "/art/encounters/bp_management/:patient_id",
        component: () => import("@/apps/ART/views/encounters/BPManagement.vue")
    },
    {
        name: "Hypertesnion diagnosis",
        path: "/art/encounters/hypertension_diagnosis/:patient_id",
        component: () => import("@/apps/ART/views/encounters/hypertension_diagnosis.vue")
    },
    {
        name: "BP prescription",
        path: "/art/encounters/bp_prescription/:patient_id",
        component: () => import("@/apps/ART/views/encounters/BPDrug_management.vue")
    },
    {
        name: "Social history",
        path: "/art/encounters/social_history/:patient_id",
        component: () => import("@/apps/ART/views/encounters/SocialHistory.vue")
    },
    {
        name: "BP adherence",
        path: "/art/encounters/bp_adherence/:patient_id",
        component: () => import("@/apps/ART/views/encounters/BPAdherence.vue")
    },
    {
        name: "lab activities",
        path: "/art/encounters/lab/:patient_id",
        component: () => import("@/apps/ART/views/encounters/LabActivities.vue")
    },
    {
        name: "patient mstercard",
        path: "/art/mastercard/:patient_id",
        component: () => import("@/apps/ART/views/Mastercard.vue")
    },
    {
        name: "Data cleaning",
        path: "/data_cleaning",
        component: () => import("@/apps/ART/views/reports/inconsistencies/DataCleaning.vue")
    },
    /** ART MOH REPORT*/
    {
        name: 'moh_tpt_cohort',
        path: '/art/moh_tpt_cohort',
        component: () => import("@/apps/ART/views/reports/moh/MohTptCohortReport.vue")
    },
    {
        name: 'moh_disaggregated_report',
        path: '/art/moh_disaggregated_report',
        component: () => import("@/apps/ART/views/reports/moh/MohDisaggregatedReport.vue")
    },
    {
        name: 'moh_regimen_report',
        path: '/art/moh_regimen_report',
        component: () => import('@/apps/ART/views/reports/moh/MohRegimenReport.vue')
    },
    {
        path: '/art/report/moh/moh_cohort',
        name: 'moh_cohort',
        component: () => import("@/apps/ART/views/reports/moh/CohortReport/MohCohort.vue")
    },
    {
        path: '/art/report/moh/moh_survial_analysis',
        name: 'moh_survial_analysis',
        component: () => import("@/apps/ART/views/reports/moh/MohSurvivalAnalysisReport.vue")
    },
    {
        path: '/art/report/moh/moh_tpt_new_initiations',
        name: 'moh_tpt_new_initiations',
        component: () => import("@/apps/ART/views/reports/moh/MohTptInitiationsReport.vue")
    }, 
    {
        name: 'moh_tx_curr_mmd',
        path: '/art/report/moh/moh_tx_curr_mmd',
        component: () => import("@/apps/ART/views/reports/moh/MohTxCurrMMD.vue")
    },
    {
        name: 'moh_regimen_weight_distribution',
        path: '/art/report/moh/moh_regimen_weight_distribution',
        component: () => import("@/apps/ART/views/reports/moh/MohRegimenWeightDistribution.vue")
    },
    /** ART Clinic reports */
    {
        name: 'clinic_archiving_candidates',
        path: '/art/report/clinic/clinic_archiving_candidates',
        component: () => import("@/apps/ART/views/reports/clinic/ClinicArchivingCandidates.vue")
    },
    {
        name: 'clinic_retention_report',
        path: "/art/report/clinic/clinic_retention_report",
        component: () => import("@/apps/ART/views/reports/clinic/ClinicRetentionReport.vue")
    },
    {
        name: 'clinic_external_consultation_report',
        path: "/art/report/clinic/clinic_external_consultation_report",
        component: () => import("@/apps/ART/views/reports/clinic/ClinicExternalConsultation.vue")
    },
    {
        name: 'clinic_due_viral_load_report',
        path: "/art/report/clinic/clinic_due_viral_load_report",
        component: () => import("@/apps/ART/views/reports/clinic/ClinicDueForViralLoad.vue")
    },
    {
        name: "clinic_lab_results",
        path: "/art/report/clinic/clinic_lab_results",
        component: () => import("@/apps/ART/views/reports/clinic/ClinicLabResultsReport.vue")
    },
    {
        name: 'clinic_missed_appointments',
        path: "/art/report/clinic/clinic_missed_appointments",
        component: () => import("@/apps/ART/views/reports/clinic/ClinicMissedAppointments.vue")
    },
    {
        name: "clinic_defaulters_report",
        path: "/art/report/clinic/clinic_defaulters",
        component: () => import("@/apps/ART/views/reports/clinic/ClinicDefaulters.vue")
    },
    {
        name: "clinic_regimen_report",
        path: "/art/report/clinic/clinic_regimen_report",
        component: () => import("@/apps/ART/views/reports/clinic/ClinicRegimenReport.vue")
    },
    {
        name: "clinic_regimen_switch",
        path: "/art/report/clinic/clinic_regimen_switch",
        component: () => import("@/apps/ART/views/reports/clinic/ClinicRegimenSwitchReport.vue")
    },
    {
        name: "clinic_pregnant_patients",
        path: "/art/report/clinic/clinic_pregnant_patients",
        component: () => import("@/apps/ART/views/reports/clinic/ClinicPregnantPatientsReport.vue")
    },
    {
        name: "clinic_appointments",
        path: "/art/report/clinic/clinic_appointments",
        component: () => import("@/apps/ART/views/reports/clinic/ClinicAppointments.vue")
    },
    {
        name: "stock_card_report",
        path: "/art/report/clinic/stock_card_report",
        component: () => import("@/apps/ART/views/reports/clinic/ClinicStockCardReport.vue")
    },
    {
        name: "clinic_viral_load",
        path: "/art/report/clinic/clinic_viral_load",
        component: () => import("@/apps/ART/views/reports/clinic/ClinicViralLoadReport.vue")
    },
    {
        name: "clinic_other_outcome_list",
        path: "/art/report/clinic/clinic_other_outcome_list",
        component: () => import("@/apps/ART/views/reports/clinic/ClinicOtherOutcomeReport.vue")
    },
    {
        name: "clinic_regimen_formulation",
        path: "/art/report/clinic/clinic_regimen_formulation",
        component: () => import("@/apps/ART/views/reports/clinic/ClinicRegimenFormulationReport.vue")
    },
    /** ART PEPFAR REPORTS */
    {
        name: 'pepfar_disaggregated_report',
        path: "/art/report/pepfar/disaggregated",
        component: () => import("@/apps/ART/views/reports/pepfar/disaggregated.vue")
    },
    {
        name: "pepfar_defaulters_report",
        path: "/art/report/pepfar/defaulters",
        component: () => import("@/apps/ART/views/reports/pepfar/defaulters.vue")
    },
    {
        name: "pepfar_regimen_report",
        path: "/art/report/clinic/regimens",
        component: () => import("@/apps/ART/views/reports/clinic/regimen.vue")
    },
    {
        name: "pepfar_regimen_switch",
        path: "/art/report/pepfar/regimen_switch",
        component: () => import("@/apps/ART/views/reports/pepfar/RegimenSwitch.vue")
    },
    {
        name: "pepfar_tb_prev_report",
        path: "/art/report/pepfar/tb_prev",
        component: () => import("@/apps/ART/views/reports/pepfar/TBPrev.vue")
    },
    {
        name: "pepfar_tx_curr_mmd_report",
        path: "/art/report/pepfar/tx_cur_mmd",
        component: () => import("@/apps/ART/views/reports/pepfar/TxCurrMMD.vue")
    },
    {
        name: "pepfar_tx_ml_report",
        path: "/art/report/pepfar/tx_ml",
        component: () => import("@/apps/ART/views/reports/pepfar/TxCurrMl.vue")
    },
    {
        name: "pepfar_tx_rtt",
        path: "/art/report/pepfar/tx_rtt",
        component: () => import("@/apps/ART/views/reports/pepfar/TxRtt.vue")
    },
    {
        name: "moh_tx_tb",
        path: "/art/moh_tx_tb",
        component: () => import("@/apps/ART/views/reports/moh/MohTxTbReport.vue")
    },
    {
        name: "pepfar_tx_tb",
        path: "/art/pepfar_tx_tb",
        component: () => import("@/apps/ART/views/reports/pepfar/PepfarTxTbReport.vue")
    },
    {
        name: 'pepfar_tx_pvls',
        path: '/art/report/pepfar/pepfar_tx_pvls',
        component: () => import("@/apps/ART/views/reports/pepfar/TxPVLS.vue")
    },
    {
        name: 'sc_arv',
        path: '/art/report/pepfar/sc_arv',
        component: () => import("@/apps/ART/views/reports/pepfar/SCARVReport.vue")
    },
    {
        name: 'clinic_tx_rrt',
        path: '/art/report/clinic_tx_rtt',
        component: () => import('@/apps/ART/views/reports/clinic/ClinicTxRtt.vue')
    },
    {
        name: 'clinic_tpt_outcomes',
        path: '/art/report/clinic_tpt_outcomes',
        component: () => import('@/apps/ART/views/reports/clinic/ClinicTpTOutcomes.vue')
    }
]
