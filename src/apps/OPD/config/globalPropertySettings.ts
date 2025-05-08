import { FolderInterface } from "@/apps/interfaces/AppInterface";
import { UserService } from "@/services/user_service"
import { OPD_GLOBAL_PROP } from "@/apps/OPD/opd_global_props";

function globalPropConfig(label: string, prop: string) {
    return {
        name: label,
        pathUrl: `/preferences?label=${label}&property=${prop}`
    }
}

export const PROPERTIES: FolderInterface[] = [
    {
        name: 'System Preferences',
        icon: 'diagnosis.png',
        condition: () => UserService.isAdmin(),
        files: [
            globalPropConfig(
                "Activate PACs",
                OPD_GLOBAL_PROP.PACS_ENABLED
            ), 
            globalPropConfig("Activate Summary Printing", OPD_GLOBAL_PROP.ENABLE_SUMMARY_PRINTING),
        ]
    }
]