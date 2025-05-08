import { FolderInterface } from "@/apps/interfaces/AppInterface";
import { UserService } from "@/services/user_service"

export default [
    {
        name: "System preferences",
        condition: async () => UserService.isAdmin(),
        files: [            
            {
                name: "Set TB Site Code",
                pathUrl: "/tb_preference?config=tb_site_prefix"
            },
            {
                name: "Set Site Location",
                pathUrl: "/location/update/site"
            },
            {
                name: "Set Catchment Population",
                pathUrl: "/tb_preference?config=facility_catchment_population"
            },
            {
                name: "Set Functional Sputum Collection Points",
                pathUrl: "/tb_preference?config=functional_sputum_collection_points_in_catchment"
            },
            {
                name: "Set Newly Established Sputum Collection Points",
                pathUrl: "/tb_preference?config=newly_established_sputum_collection_points"
            }
        ]
    }
] as FolderInterface[]