import { FolderInterface } from "@/apps/interfaces/AppInterface";
import { UserService } from "@/services/user_service"
import { ART_GLOBAL_PROP } from "@/apps/ART/art_global_props"
import { GLOBAL_PROP } from "@/apps/GLOBAL_APP/global_prop";
import Store from "@/composables/ApiStore"
import { DateSelectionPreference } from "@/utils/ReportDateSelectionPrompt";

function globalPropConfig(label: string, prop: string) {
    return {
        name: label,
        pathUrl: `/preferences?label=${label}&property=${prop}`
    }
}

export const PROPERTIES: FolderInterface[] = [
    {
        name: "Drug Management",
        icon: "drug.png",
        condition: async () => UserService.isAdmin() && (await Store.get('IS_ART_DRUG_MANAGEMENT_ENABLED')),
        files: [
            {
                name: "Enter Receipts",
                pathUrl: "/art/stock/enter",
            },
            {
                name: "Enter Product relocation/Disposal",
                pathUrl: "/art/stock/move",
            },
            {
                name: "Enter verified physical stock count",
                pathUrl: "/art/stock/verify",
            },
            {
                name: "Print Barcode",
                pathUrl: "/drug/print",
            },
            {
                name: "Audit Trail",
                pathUrl: "/art/stock/trail",
            },
            {
                name: "Stock report",
                pathUrl: "/art/stock/report",
            }  
        ]
    },
    {
        name: 'System Preferences',
        icon: 'hiv-staging.png',
        condition: () => UserService.isAdmin(),
        files: [
            {
                name: "Clinic Preferences",
                icon: "folder.png",
                defaultFilesIcon: "sys-setting.png",
                files:[
                    {
                        name: "Filing number Preferences",
                        icon: "folder.png",
                        defaultFilesIcon: "sys-setting.png",
                        files: [
                            globalPropConfig(
                                "Activate Filing Numbers", 
                                ART_GLOBAL_PROP.FILING_NUMBERS
                            ),
                            {
                                name: "Set Filing Numbers Limit",
                                pathUrl: "/art/preferences/fn/limit"
                            }
                        ]
                    },
                    globalPropConfig(
                        "Is this a military site?",
                        GLOBAL_PROP.MILITARY_SITE
                    ),
                    {
                        name: "Set Clinic Days",
                        pathUrl: "/art/preferences/clinic_days"
                    },
                    {
                        name: "Set Appointment Limit",
                        pathUrl: "/art/preferences/appointment/limit"
                    },
                    {
                        name: "Set Clinic Holidays",
                        pathUrl: "/art/preferences/clinic_holidays"
                    }
                ]
            },
            {
                name: "Hypertension Preferences",
                icon: "folder.png",
                defaultFilesIcon: "sys-setting.png",
                files: [
                    globalPropConfig(
                        "Activate Hypertension screening", 
                        ART_GLOBAL_PROP.HTN_ENHANCEMENT
                    ),
                    {
                        name: "Set Hypertension Thresholds",
                        pathUrl: "/art/preferences/bp_thresholds"
                    },
                    {
                        name: "Set HTN Age",
                        pathUrl: "/art/preferences/htn_age"
                    }
                ]
            },
            {
                name: "Viral-load Preferences",
                icon: "folder.png",
                defaultFilesIcon: "sys-setting.png",
                files: [
                    globalPropConfig(
                        'Activate VL routine check',
                        ART_GLOBAL_PROP.VL_ROUTINE_CHECK
                    ),
                    globalPropConfig(
                        "Scan DBS barcode",
                        ART_GLOBAL_PROP.CAN_SCAN_DBS_BARCODE
                    )
                ]
            },
            {
                name: "Lab Preferences",
                icon: "folder.png",
                defaultFilesIcon: "sys-setting.png",
                files: [
                    globalPropConfig(
                        'Activate Extended Lab',
                        ART_GLOBAL_PROP.EXTENDED_LABS
                    ),
                    {
                        name: "Lab Order print copies",
                        pathUrl: '/art/preferences/lab_print_copies'
                    },
                    {
                        name: "Target lab",
                        pathUrl: "/art/preferences/target_lab"
                    }
                ]
            },
            {
                name: "View Systems settings",
                pathUrl: "/art/preferences"
            },
            {
                name: "Report preferences",
                action: () => DateSelectionPreference()
            },
            globalPropConfig(
                "Activate drug management", 
                ART_GLOBAL_PROP.DRUG_MANAGEMENT
            ),
            globalPropConfig(
                "Activate fast track", 
                ART_GLOBAL_PROP.FAST_TRACK
            ),
            globalPropConfig(
                "Activate 3HP auto select",
                ART_GLOBAL_PROP.THREE_HP_AUTO_SELECT
            ),
            globalPropConfig(
                "Ask pills remaining at home",
                ART_GLOBAL_PROP.PILLS_REMAINING
            ),
            globalPropConfig(
                "(DATA CLEANING) Exclude External and Emergency supply",
                ART_GLOBAL_PROP.EXCLUDE_EXTERNAL_AND_DRUG_REFILLS
            ),
            {
                name: "Activate CxCa Screening",
                pathUrl: "/art/preferences/cervical_cancer_screening"
            },
            {
                name: "Set Auto Cleaning Alert Days",
                pathUrl: "/art/preferences/notification_period"
            },
        ]
    }
]