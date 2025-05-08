import { FolderInterface } from "@/apps/interfaces/AppInterface";
import { UserService } from "@/services/user_service"
import { CXCA_GLOBAL_PROP } from "@/apps/CxCa/cxca_global_props";

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
                "Activate Referral site",
                CXCA_GLOBAL_PROP.REFERRAL_SITE_ENABLED
            )
        ]
    }
]