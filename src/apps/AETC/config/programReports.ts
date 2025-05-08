import { FolderInterface } from "@/apps/interfaces/AppInterface"

export const REPORTS: FolderInterface[] = [
    {
        name: 'MoH',
        icon: 'login-logos/Malawi-Coat_of_arms_of_arms.png',
        defaultFilesIcon: 'reports.png',
        condition: () => true,
        files: [
            {
                name: 'Malaria Report',
                pathName: 'aetc_malaria_report'
            },
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
                    }
                ]
            },
            {
                name: 'AETC Diagnosis Report',
                pathName: 'aetc_diagnosis'
            },
            {
                name: 'Diagnosis Specific Report',
                pathName: 'aetc_diagnosis_specific'
            },
            {
                name: 'Disaggregated Diagnosis',
                pathName: 'aetc_disaggregated_diagnosis'
            },
            {
                name: 'OPD General',
                pathName: 'aetc_opd_general_report'
            },
            {
                name: 'Referrals',
                pathName: 'aetc_referral_report'
            },
            {
                name: 'Total Registered',
                pathName: 'aetc_total_registered_report'
            },
            {
                name: 'Update DHIS2',
                pathName: 'aetc_dhis2_report',
                pathUrl: '/aetc/reports/clinic/dhis2'
            }
        ]
    }
]