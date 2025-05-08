import { FolderInterface } from "@/apps/interfaces/AppInterface"
import Store from "@/composables/ApiStore"

export const REPORTS: FolderInterface[] = [
    {
        name: 'MoH',
        icon: 'login-logos/Malawi-Coat_of_arms_of_arms.png',
        defaultFilesIcon: 'reports.png',
        files: [
            {
                name: 'Cohort / disaggregated',
                pathName: 'moh_cohort'
            },
            {
                name: 'Disaggregated',
                pathName: 'moh_disaggregated',
                condition: () => false
            },
            {
                name: 'Regimen Distribution (Weight)',
                pathName: 'moh_regimen_weight_distribution'
            },
            {
                name: 'Survival analysis',
                pathName: 'moh_survial_analysis' 
            },
            {
                name: 'TPT new initiations',
                pathName: 'moh_tpt_new_initiations'
            },
            {
                name: 'TX CURR MMD',
                pathName: 'moh_tx_curr_mmd'
            },
            {
                name: 'Regimen Report',
                pathName: 'moh_regimen_report'
            },
            {
                name: 'TPT Cohort',
                pathName: 'moh_tpt_cohort'
            },
            {
                name: 'TX_TB',
                pathName: 'moh_tx_tb'
            }
        ]
    },
    {
        name: 'Clinic',
        icon: 'reports.png',
        defaultFilesIcon: 'reports.png',
        files: [
            {
                name: "National ID reports",
                icon: "folder.png",
                defaultFilesIcon: 'reports.png',
                files: [
                    {
                        name: "Utilization report",
                        pathUrl: '/art/npid_utilization_report'
                    },
                    {
                        name: "Cumulative report",
                        pathUrl: '/art/npid_cumulative_report'
                    }
                ]
            },
            {
                name: "Viral-load Reports",
                icon: "folder.png",
                defaultFilesIcon: 'reports.png',
                files: [
                    {
                        name: 'Clinic Vl Suppression',
                        pathUrl: "/art/clinic_vl_suppression"
                    },
                    {
                        name: 'Clients due for VL',
                        pathName: 'clinic_due_viral_load_report'
                    },
                    {
                        name: 'VL results',
                        pathName: 'clinic_viral_load'
                    },
                    {
                        name: "Viral Load Register",
                        pathUrl: "/art/report/clinic_viral_load_register"
                    },
                    {
                        name: 'Vl collection',
                        pathUrl: '/art/clinic_vl_collection_report'
                    }
                ]
            },
            {
                name: "Regimen Reports",
                icon: "folder.png",
                defaultFilesIcon: 'reports.png',
                files: [
                    {
                        name: 'Regimen Dispensation',
                        pathName: 'clinic_regimen_report'
                    },
                    {
                        name: 'Regimen switch',
                        pathName: 'clinic_regimen_switch'
                    },
                    {
                        name: 'Regimen Report',
                        pathName: 'pepfar_regimen_report'
                    },
                    {
                        name: 'Regimens and Formulation',
                        pathName: 'clinic_regimen_formulation'
                    }
                ]
            },
            {
                name: "Hypertension Reports",
                icon: "folder.png",
                defaultFilesIcon: 'reports.png',
                files: [
                    {
                        name: "HTN Enrollment Report",
                        pathUrl: "/art/htn_enrollment_report"
                    },
                    {
                        name: "Hypertension Report",
                        pathUrl: "/art/hypertension_report"
                    },
                    {
                        name: "Hypertension Cascade Report",
                        pathUrl: "/art/hypertension_cascade_report"
                    }
                ]
            },
            {
                name: "Outcome Reports",
                icon: "folder.png",
                defaultFilesIcon: 'reports.png',
                files: [
                    {
                        name: 'TPT Outcomes',
                        pathUrl: '/art/report/clinic_tpt_outcomes'
                    },
                    {
                        name: 'Other outcome list',
                        pathName: 'clinic_other_outcome_list'
                    },
                    {
                        name: 'Active clients with adverse outcomes',
                        pathName: 'clinic_archiving_candidates'
                    }
                ]
            },
            {
                name: 'Defaulter list',
                pathName: 'clinic_defaulters_report'
            },
            
            {
                name: 'Lab results',
                pathName: 'clinic_lab_results'
            },
            
            {
                name: 'External and Emergency supply clients',
                pathName: 'clinic_external_consultation_report'
            },
            {
                name: 'Retention report',
                pathName: 'clinic_retention_report'
            },
            {
                name: 'Pregnant Patient',
                pathName: 'clinic_pregnant_patients'
            },
            {
                name: 'Missed Appointment',
                pathName: 'clinic_missed_appointments'
            },
            {
                name: 'Appointments',
                pathName: 'clinic_appointments'
            },
            {
                name: 'Stock card report',
                pathName: 'stock_card_report',
                condition: () => Store.get('IS_ART_DRUG_MANAGEMENT_ENABLED')
            },
            {
                name: 'Discrepancy Report',
                pathUrl: '/art/clinic_discrepancy_report',
                condition: () => Store.get('IS_ART_DRUG_MANAGEMENT_ENABLED')
            },
            {
                name: 'TX RTT',
                pathUrl: '/art/report/clinic_tx_rtt'
            },
        ]
    },
    {
        name: 'PEPFAR',
        icon: 'login-logos/PEPFAR.png',
        defaultFilesIcon: 'reports.png',
        files: [
            {
                name: "Tx HIV HTN Report",
                pathUrl: "/art/tx_htn_report"
            },
            {
                name: 'Defaulter list',
                pathName: 'pepfar_defaulters_report'
            },
            {
                name: 'Disaggregated',
                pathName: 'pepfar_disaggregated_report'
            },
            // {
            //     name: 'Regimen Report',
            //     pathName: 'pepfar_regimen_report'
            // },
            // {
            //     name: 'Regimen Switch',
            //     pathName: 'pepfar_regimen_switch'
            // },
            {
                name: 'TB PREV',
                pathName: 'pepfar_tb_prev_report'
            },
            {
                name: 'TX CURR MMD',
                pathName: 'pepfar_tx_curr_mmd_report'
            },
            {
                name: 'TX ML',
                pathName: 'pepfar_tx_ml_report'
            },
            {
                name: 'TX RTT',
                pathName: 'pepfar_tx_rtt'
            },
            {
                name: 'TX_PVLS',
                pathName: 'pepfar_tx_pvls'
            },
            {
                name: 'SC_ARV_DISP',
                pathName: 'sc_arv'
            },
            {
                name: "Sc curr report",
                pathUrl: "/art/sc_curr"
            },
            {
                name: 'TX_TB',
                pathName: 'pepfar_tx_tb'
            },
            {
                name: 'TX_NEW',
                pathUrl: '/art/pepfar_tx_new_report'
            }
        ]
    }
]