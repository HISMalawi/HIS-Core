import { FolderInterface } from "@/apps/interfaces/AppInterface"
import { Service } from "@/services/service"

const centralHospitals = [
    "Queen Elizabeth Central Hospital",
    "Kamuzu Central Hospital",
    "Mzuzu Central Hospital",
    "Zomba Central Hospital"
]

function isFacilictyCentralHospital(): boolean {
    for(const name of centralHospitals) {
        if (name == Service.getLocationName()) {
            return true
        }
    }
    return false
}

export const REPORTS: FolderInterface[] = [
    {
        name: 'MoH',
        icon: 'login-logos/Malawi-Coat_of_arms_of_arms.png',
        defaultFilesIcon: 'reports.png',
        condition: () => true,
        files: [
            {
                name: 'LA report',
                pathName: 'moh_la',
                condition: () => false
            },
            {
                name: 'Drug report',
                pathName: 'moh_drug',
                condition: () => false
            },
            {
                name: 'Malaria report',
                pathName: 'moh_malaria',
                condition: () => true 
            },
            {
                name: 'IPT',
                pathName: 'moh_ipt',
                condition: () => false
            },
            {
                name: 'IDSR Weekly Report',
                pathName: 'idsr_weekly',
            },
            {
                name: 'IDSR Monthly Report',
                pathName: 'idsr_monthly',
            },
            {
                name: 'IDSR Quarterly Report',
                pathName: 'idsr_quarterly',
            },
            {
                name: 'HMIS 15 Report',
                pathName: 'hmis_15',
                condition: () => !isFacilictyCentralHospital()
            },
            {
                name: 'HMIS 17 Report',
                pathName: 'hmis_17',
                condition: () => isFacilictyCentralHospital()
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
                    }
                ]
            },
            {
                name: 'Disaggregated Report',
                pathName: 'clinic_disaggregated'
            },
            {
                name: 'Diagnosis by address',
                pathName: 'clinic_diagnosis_by_address'
            },
            {
                name: 'Diagnosis',
                pathName: 'clinic_diagnosis'
            },
            {
                name: 'Registration report',
                pathName: 'clinic_registration'
            },
            {
                name: 'LA report',
                pathName: 'clinic_la'
            },
            {
                name: 'Cases seen report',
                pathName: 'clinic_cases_seen'
            },
            {
                name: 'Mental health report',
                pathName: 'clinic_mental_health'
            },
            {
                name: 'Drugs Report',
                pathName: 'clinic_drugs_given'
            },
            {
                name: 'With NIDs',
                pathName: 'clinic_with_nids'
            },
        ]
    }
]