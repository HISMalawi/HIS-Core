import { FolderInterface } from "@/apps/interfaces/AppInterface"

export const REPORTS: FolderInterface[] = [
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
            name: 'Diagnosis Report',
            pathName: 'Spine Clinic Diagnosis Report'
        },
        {
            name: 'Patient Outcomes',
            pathName: 'Spine Clinic Outcomes Report',
            condition: () => false
        }
    ]
},
]