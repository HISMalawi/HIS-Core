import { FolderInterface } from "@/apps/interfaces/AppInterface"

export const REPORTS: FolderInterface[] = [
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
    }
]