import { FolderInterface } from "@/apps/interfaces/AppInterface";
import { UserService } from "@/services/user_service"
import { AETC_GLOBAL_PROP } from "@/apps/AETC/aetc_global_props";

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
                "Activate Malaria Feature",
                AETC_GLOBAL_PROP.MALARIA_FEATURE
            ),
            globalPropConfig(
                "Ask Life threatening questions",
                AETC_GLOBAL_PROP.LIFE_THREATENING_QUESTIONS
            ),
            globalPropConfig(
                "Ask complaints before diagnosis",
                AETC_GLOBAL_PROP.COMPLAINTS_BEFORE_DIAGNOSIS
            ),
            globalPropConfig(
                "Ask complaints under vitals",
                AETC_GLOBAL_PROP.COMPLAINTS_UNDER_VITALS
            ),
            globalPropConfig(
                "Ask social determinats questions",
                AETC_GLOBAL_PROP.SOCIAL_DETERMINATES_QUESTIONS
            ),
            globalPropConfig(
                "Ask social history questions",
                AETC_GLOBAL_PROP.SOCIAL_HISTORY_QUESTIONS
            ),
            globalPropConfig(
                "Ask triage category questions",
                AETC_GLOBAL_PROP.TRIAGE_CATEGORY_QUESTIONS
            ),
            globalPropConfig(
                "Ask vitals before diagnosis (children)",
                AETC_GLOBAL_PROP.VITALS_BEFORE_DIAGNOSIS
            ),
            globalPropConfig(
                "Confirm patient creation",
                AETC_GLOBAL_PROP.CONFIRM_PATIENT_CREATION
            ),
            globalPropConfig(
                "Point of care system ?",
                AETC_GLOBAL_PROP.POINT_OF_CARE_SYSTEM
            ),
            globalPropConfig(
                "Share Database with BART2 ?",
                AETC_GLOBAL_PROP.SHARE_DATABASE_WITH_BART2
            ),
            globalPropConfig(
                "Show LAB Results",
                AETC_GLOBAL_PROP.SHOW_LAB_RESULTS
            ),
            globalPropConfig(
                "Show Tasks button on patient dashboard",
                AETC_GLOBAL_PROP.SHOW_TASKS_BUTTON_ON_PATIENT_DASHBOARD
            ),
            globalPropConfig(
                "Show column prescription interface",
                AETC_GLOBAL_PROP.SHOW_COLUMN_PRESCRIPTION_INTERFACE
            ),
            {
                name: "Set Top Ten Diagnosis",
                pathUrl: "/aetc/preferences/top_ten_diagnosis"
            },
            {
                name: "Set Top Ten Drugs",
                pathUrl: "/aetc/preferences/top_ten_drugs"
            }
        ]
    }
]