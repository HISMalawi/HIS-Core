import { FolderInterface } from "@/apps/interfaces/AppInterface";

export default [
    {
        name: "National ID reports",
        icon: "folder.png",
        defaultFilesIcon: 'reports.png',
        files: [
            {
                name: "Utilization report",
                pathUrl: '/art/npid_utilization_report'
            }
        ]
    },
    {
        name: "NTP",
        icon: 'login-logos/Malawi-Coat_of_arms_of_arms.png',
        files: [
            {
                name: "DR TB Reports",
                icon: "folder.png",
                defaultFilesIcon: 'reports.png',
                files: [
                    {
                        name: "DR Casefinding Report",
                        pathUrl: "/reports/mdr_casefinding"
                    },
                    {
                        name: "MDR Outcomes Report",
                        pathUrl: "/reports/mdr_outcomes"
                    },
                    {
                        name: "MDR Interim Outcomes Report",
                        pathUrl: "/reports/mdr_interim_outcome_report"
                    }
                ]
            },
            {
                name: "Quarterly Treatment Outcomes",
                pathUrl: "/reports/tb_quarterly_treatment_outcomes"
            },
            {
                name: "TB/HIV Reporting Form",
                pathUrl: "/reports/tb_hiv_reporting_form"
            },
            {
                name: "TB Case Finding Report",
                pathUrl: "/reports/tb_case_finding_report"
            },
            {
                name: "Presumptives Report",
                pathUrl: "/reports/tb_presumptives"
            },
            {
                name: "Contact Investigation Report",
                pathUrl: "/reports/tb_contact_investigation"
            },
            {
                name: "Key Populations Report",
                pathUrl: "/reports/tb_high_risk_patients"
            },
            {
                name: "TPT Outcomes Report",
                pathUrl: "/reports/tb_ipt_outcomes"
            },
            {
                name: "Community Interventions Report",
                pathUrl: "/reports/tb_community"
            }
        ]
    },
    {
        name: "PEPFAR",
        icon: 'login-logos/PEPFAR.png',
        files: [
            {
                name: "TB STAT ART Report",
                pathUrl: "/reports/tb_stat_art"
            }
        ]
    },
    {
        name: "Data Cleaning Tools",
        icon: "duplicate.png",
        files: [
            {
                name: "Without Program",
                pathUrl: "/tb_data_cleaning?case=without program"
            },
            {
                name: "Duplicate TB #",
                pathUrl: "/tb_data_cleaning?case=with duplicate tb number"
            },
            {
                name: "Unknown Outcome",
                pathUrl: "/tb_data_cleaning?case=with unknown outcome"
            },
            {
                name: "Dispensation Anomalies",
                pathUrl: "/tb_data_cleaning?case=with dispensation anomalies"
            },
            {
                name: "In Treatment But Completed",
                pathUrl: "/tb_data_cleaning?case=in treatment but completed"
            },
            {
                name: "Bad TB #",
                pathUrl: "/tb_data_cleaning?case=bad tb number"
            },
            {
                name: "Without TB #",
                pathUrl: "/tb_data_cleaning?case=without tb number"
            }
        ]
    }
] as FolderInterface[]