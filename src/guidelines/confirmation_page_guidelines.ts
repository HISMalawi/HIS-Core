/**
 * This guideline will manage popup reminders or actions
 * that are brought to a user's attention pertaining to 
 * a Patient's state.
*/
import { GuideLineInterface } from "@/utils/GuidelineEngine"
import { infoActionSheet, tableActionSheet } from "@/utils/ActionSheets"
import { isUnknownOrEmpty } from '@/utils/Strs';

export enum TargetEvent {
    ON_CONTINUE = 'oncontinue',
    ONLOAD = 'onload'
}
export enum FlowState {
    FORCE_EXIT = 'forceExit',
    GO_HOME = 'gotoHome',
    GO_BACK = 'goBack',
    CONTINUE = 'continue',
    ENROLL = 'enroll',
    EXIT = 'exit',
    ACTIVATE_FN = 'activateFn',
    ASSIGN_NPID = 'assignNpid',
    UPDATE_DMG = 'updateDemographics',
    PRINT_NPID = 'printNPID',
    CREATE_NPID_WITH_REMOTE_DIFF = 'createNpiDWithRemote',
    REFRESH_DDE_DEMOGRAPHICS = 'refreshDemographicsDDE',
    UPDATE_LOCAL_DDE_DIFFS = 'updateLocalDiffs',
    RESOLVE_DUPLICATE_NPIDS = 'resolveDuplicateNpids',
    ADD_AS_DRUG_REFILL = 'addAsDrugRefill',
    ADD_AS_NEW_PATIENT = 'addAsNewPatient',
    ADD_AS_EXTERNAL_CONSULTATION = 'addAsExternalConsultation',
    INITIATE_ANC_PREGNANCY = 'initiateNewAncPregnancy',
    VIEW_MERGE_AUDIT_FOR_NPID = 'viewMergeAuditForNpid',
    SEARCH_BY_NAME = 'searchByName',
    SYNCH_ART_STATUS_WITH_TB='syncArtStatusWithTb',
    ALERT_TO_BRING_NATIONAL_ID_NEXT='bringNationalID',
    SCAN_NATIONAL_ID='scanNationalID'
}

export const CONFIRMATION_PAGE_GUIDELINES: Record<string, GuideLineInterface> = {
    "[DDE NOT ENABLED] Do not proceed if patient is not found in the system" : {
        weight: 98,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async () => {
                const action = await infoActionSheet(
                    ' 0 Search results',
                    'Patient has not been found',
                    'Choose how to proceed',
                    [
                        { 
                            name: 'Close', 
                            slot: 'start', 
                            color: 'primary',
                        },
                        {
                            name: 'Search by name',
                            slot: 'end',
                            color: 'success'
                        }
                    ],
                    'his-danger-color'
                )
                return action === 'Search by name' 
                    ? FlowState.SEARCH_BY_NAME
                    : FlowState.GO_HOME
            }
        },
        conditions: {
            globalProperties({ddeEnabled}: any) {
                return ddeEnabled === false
            },
            patientFound(yes: boolean) {
                return yes === false
            }
        }
    },
    "[DDE ENABLED] Show invalid attributes for a patient whose remote": {
        weight: 78,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async (facts: any) => {
                await tableActionSheet(
                    `DDE Entity Error`,
                    'Remote patient has invalid attributes',
                    [ 'Attribute', 'Errors' ],
                    facts.demographics.invalidDemographics,
                    [
                        { 
                            name: 'Close', 
                            slot: 'start', 
                            color: 'danger',
                        }
                    ],
                    'his-danger-color'
                )
                return FlowState.GO_BACK
            }
        },
        conditions: {
            demographics({hasInvalidDemographics}: any) {
                return hasInvalidDemographics === true
            }
        }
    },
    "[DDE ENABLED] Do not proceed if NPID is not found and Provide history of voided NPIDS" : {
        weight: 98,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async (facts: any) => {
                const action = await tableActionSheet(
                    `Voided patients with ID ${facts.scannedNpid}`,
                    'NPID was not found. Please review available patient with similar ID',
                    facts.dde.voidedNpids.cols,
                    facts.dde.voidedNpids.rows,
                    [
                        { 
                            name: 'Close', 
                            slot: 'start', 
                            color: 'primary',
                        },
                        {
                            name: 'Merge history',
                            slot: 'end',
                            color: 'primary'
                        },
                        {
                            name: 'Search by name',
                            slot: 'end',
                            color: 'success'
                        }
                        
                    ],
                    'his-danger-color'
                )
                return action === 'Merge history' 
                    ?  FlowState.VIEW_MERGE_AUDIT_FOR_NPID 
                    : action === 'Search by name' 
                    ? FlowState.SEARCH_BY_NAME
                    : FlowState.GO_HOME
            }
        },
        conditions: {
            globalProperties({ddeEnabled}: any) {
                return ddeEnabled === true
            },
            patientFound(yes: boolean) {
                return yes === false
            }
        }
    },
    "[DDE NOT ENABLED] Notify the user to proceed with Remote NPID if local NPID does not match remote": {
        weight: 77,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async ({dde}: any) => {
                await infoActionSheet(
                    'Missing Local NPID',
                    `Local NPID of "${dde.localNpidDiff}" does not match remote "${dde.remoteNpidDiff}"`,
                    `Proceed to Fix issue`,
                    [
                        { 
                            name: 'Resolve issue', 
                            slot: 'start', 
                            color: 'danger'
                        }
                    ],
                    'his-danger-color'
                )
                return FlowState.CREATE_NPID_WITH_REMOTE_DIFF
            }
        },
        conditions: {
            dde({localNpidDiff, remoteNpidDiff}: any) {
                return localNpidDiff != remoteNpidDiff
            },
            globalProperties({ddeEnabled}: any) {
                return ddeEnabled === true
            }
        }
    },
    "Warn if patient is missing National ID and assign them one": {
        weight: 75,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async () => {
                await infoActionSheet(
                    'Missing National ID',
                    'Patient was found BUT has no National ID',
                    'The system is going to assign the patient with a new ID',
                    [
                        { 
                            name: 'OK', 
                            slot: 'start', 
                            color: 'primary'
                        }
                    ],
                    'his-danger-color'
                )
                return FlowState.ASSIGN_NPID
            }
        },
        conditions: {
            currentNpid: (npid: string) => isUnknownOrEmpty(npid)
        }
    },
    "Detect NPID over 5 duplicates and prompt the user to resolve them" : {
        weight: 99,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async ({ scannedNpid }: any) => {
                const action = await infoActionSheet(
                    'More than 5 duplicates found',
                    `There are more than 5 duplicates for this NPID (${scannedNpid}). Please search by name and gender`,
                    `Choose how to proceed`,
                    [
                        { 
                            name: 'Close', 
                            slot: 'start', 
                            color: 'danger',
                        },
                        { 
                            name: 'Search by name', 
                            slot: 'start', 
                            color: 'primary'
                        }
                    ],
                    'his-danger-color'
                )
                return action === 'Search by name' ? FlowState.SEARCH_BY_NAME : FlowState.GO_HOME
            }
        },
        conditions: {
            npidHasOverFiveDuplicates(isTrue: boolean) {
                return isTrue
            }
        }
    },
    "Detect NPID duplicates and prompt the user to resolve them" : {
        weight: 99,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async ({ scannedNpid }: any) => {
                await infoActionSheet(
                    'DUPLICATE NPID',
                    `NPID ${scannedNpid} is currently assigned to multiple patients`,
                    'Proceed to resolve the issue',
                    [
                        { 
                            name: 'Resolve Duplicate NPIDs', 
                            slot: 'start', 
                            color: 'danger'
                        }
                    ],
                    'his-danger-color'
                )
                return FlowState.RESOLVE_DUPLICATE_NPIDS
            }
        },
        conditions: {
            npidHasDuplicates(isTrue: boolean) {
                return isTrue
            }
        }
    },
    "Enquire if patient has brought a national ID": {
        weight: 95,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async () => {
                const action = await infoActionSheet(
                    'Malawi National ID',
                    'Has Client brought a National ID Card or Birth Certificate?',
                    '',
                    [
                        {
                            name: "Yes",
                            slot: "start",
                            color: "primary"
                        },
                        {
                            name: "No",
                            slot: "end",
                            color: "primary"
                        }
                    ]
                )
                return action == 'Yes' ? FlowState.SCAN_NATIONAL_ID : FlowState.ALERT_TO_BRING_NATIONAL_ID_NEXT
            }
        },
        conditions: {
            isMalawiNationalIDFeaturesEnabled: (enabled: boolean) => enabled,
            hasMalawiNationalID: (hasID: boolean) => !hasID            
        }
    },
    "Warn before proceeding if patient is deceased based on current Patient state": {
        weight: 50,
        targetEvent: TargetEvent.ON_CONTINUE,
        actions: {
            alert: async () => {
                const action = await infoActionSheet(
                    'Deceased Patient',
                    'Patient outcome is Died!',
                    'Do you want to continue?',
                    [
                        { 
                            name: 'Yes', 
                            slot: 'start', 
                            color: 'danger'
                        },
                        { 
                            name: 'No',  
                            slot: 'end', 
                            color: 'success'
                        }
                    ],
                    'his-warning-color'
                )
                return action === 'Yes' ? FlowState.CONTINUE : FlowState.FORCE_EXIT
            }
        },
        conditions: { 
            currentOutcome: (outcome: string) => outcome === 'Patient died' 
        }
    },
    "Warn before proceeding if patient stopped treatment based on current Patient state": {
        weight: 49,
        targetEvent: TargetEvent.ON_CONTINUE,
        actions: {
            alert: async () => {
                const action = await infoActionSheet(
                    'Stopped Treatment',
                    'Patient outcome is Stopped Treatment ',
                    'Do you want to continue?',
                    [
                        { 
                            name: 'Yes', 
                            slot: 'start', 
                            color: 'danger'
                        },
                        { 
                            name: 'No',  
                            slot: 'end', 
                            color: 'success'
                        }
                    ],
                    'his-warning-color'
                )
                return action === 'Yes' ? FlowState.CONTINUE : FlowState.FORCE_EXIT
            }
        },
        conditions: {
            currentOutcome: (outcome: string) => outcome === 'Treatment stopped'
        }
    },
    "[ART patient visit purpose] Select purpose of visit if patient is Transferred out or Emergency supply": {
        weight: 70,
        targetEvent: TargetEvent.ON_CONTINUE,
        actions: {
            alert: async ({patientType, currentOutcome}: any) => {
                let contextualBtn: any = []
                if (patientType === 'External consultation' || currentOutcome === 'Patient transferred out') { 
                    contextualBtn = [
                        {
                            name: 'Emergency supply', 
                            slot: 'start', 
                            color: 'primary'
                        },
                        { 
                            name: 'New Patient',
                            slot: 'end',
                            color: 'primary'
                        }
                    ]
                }  
                if (patientType === 'Emergency supply') {
                    contextualBtn = [
                        { 
                            name: 'External Consultation',
                            slot: 'start', 
                            color: 'primary'
                        },
                        { 
                            name: 'New Patient',
                            slot: 'end',
                            color: 'primary'
                        }
                    ]
                }
                if (patientType === 'New patient') {
                    contextualBtn = [
                        { 
                            name: 'External Consultation',
                            slot: 'start', 
                            color: 'primary'
                        },
                        {
                            name: 'Emergency supply', 
                            slot: 'start', 
                            color: 'primary'
                        }
                    ] 
                }
                const action = await infoActionSheet(
                    'Purpose of visit',
                    `Patient type: ${patientType} | State: ${currentOutcome}`,
                    'Please select purpose of the visit',
                    [
                        ...contextualBtn,
                        {
                            name: 'Continue',
                            slot: 'end',
                            color: 'success'
                        }
                    ]
                )
                switch(action) { 
                    case 'Emergency supply':
                        return FlowState.ADD_AS_DRUG_REFILL
                    case 'External Consultation':
                        return FlowState.ADD_AS_EXTERNAL_CONSULTATION
                    case 'New Patient':
                        return FlowState.ADD_AS_NEW_PATIENT
                    default: 
                        return FlowState.CONTINUE
                }
            }
        },
        conditions: {
            programName: (name: string) => name === 'ART',
            patientType: (type: string, { currentOutcome }: any) => {
                return ['Emergency supply', 'External consultation'].includes(type) ||
                    currentOutcome === 'Patient transferred out'
            }
        }
    },
    "Prompt patient enrollment in current programme if not enrolled" : {
        weight: 30,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async () => {
                const action = await infoActionSheet(
                    'Programme Enrollment',
                    'Patient is not enrolled in current programme, do you want to enroll?',
                    '',
                    [
                        { 
                            name: 'Yes', 
                            slot: 'start', 
                            color: 'success'
                        },
                        { 
                            name: 'No',  
                            slot: 'end', 
                            color: 'danger'
                        }
                    ]
                )
                return action === 'Yes' ? FlowState.ENROLL : FlowState.EXIT
            }
        },
        conditions: {
            enrolledInProgram: (enrolled: boolean) => enrolled === false
        }
    },
    "(ART Filing numbers) Prompt dormant filing number reactivation if patient has a dormant filing number": {
        weight: 25,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async () => {
                const action = await infoActionSheet(
                    'Filing Numbers',
                    'Activate dormant #?',
                    '',
                    [
                        { 
                            name: 'Yes', 
                            slot: 'start', 
                            color: 'success'
                        },
                        { 
                            name: 'No',  
                            slot: 'end', 
                            color: 'danger'
                        }
                    ]
                )
                return action === 'Yes' ? FlowState.ACTIVATE_FN : FlowState.EXIT
            }
        },
        conditions: {
            programName: (programName: string) => programName === 'ART',
            identifiers: (identifiers: string[]) => identifiers.includes('Archived filing number'),
            currentOutcome: (outcome: string) => ![
                'Treatment stopped', 
                'Patient transferred out', 
                'Patient died'
            ].includes(outcome),
            globalProperties({useFilingNumbers}: Record<string, boolean>) {
                return useFilingNumbers
            }
        }
    },
    "[DDE OFF] Prompt the user to update patient demographics when data is incomplete": {
        weight: 92,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async () => {
                const action = await infoActionSheet(
                    'Demographics',
                    'Patient data is incomplete',
                    'Do you want to review and update now?',
                    [
                        { 
                            name: 'Yes', 
                            slot: 'start', 
                            color: 'success'
                        },
                        { 
                            name: 'No',  
                            slot: 'end', 
                            color: 'danger'
                        }
                    ],
                    'his-danger-color'
                )
                return action === 'Yes' ? FlowState.UPDATE_DMG : FlowState.EXIT
            }
        },
        conditions: {
            globalProperties({ddeEnabled}: any) {
                return ddeEnabled === false
            },
            demographics: ({patientIsComplete}: any) => {
                return patientIsComplete === false
            },
            patientFound: (isFound: boolean) => {
                return isFound === true
            }
        }
    },
    "[DDE] Alert When remote Patient demographics dont match Local Demographics ": {
        weight: 93,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async ({dde}: any) => {
                const action = await tableActionSheet(
                    'Demographics Mismatch',
                    'Local Demographics do not match Remote Demographics',
                    ['Attributes', 'Local', 'Remote'],
                    dde.diffRows,
                    [
                        { 
                            name: 'Use Local',
                            slot: 'start', 
                            color: 'primary'
                        },
                        { 
                            name: 'Use Remote', 
                            slot: 'start', 
                            color: 'primary'
                        }
                    ], 
                    'his-danger-color',
                    dde.diffRowColors
                )
                return action === 'Use Local' 
                    ? FlowState.UPDATE_LOCAL_DDE_DIFFS
                    : FlowState.REFRESH_DDE_DEMOGRAPHICS
            }
        },
        conditions: {
            dde({hasDemographicConflict}: any) {
                return hasDemographicConflict
            }
        }
    },
    "[DDE] Alert to print newer NPID when the scanned NPID doesnt match active NPID": {
        weight: 69,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async ({ currentNpid }: any) => {
                await infoActionSheet(
                    '[DDE] NATIONAL ID',
                    `Patient has a newer National Identifier ${currentNpid}`,
                    'Print and proceed',
                    [
                        { 
                            name: 'Print', 
                            slot: 'start', 
                            color: 'primary'
                        }
                    ])
                return FlowState.PRINT_NPID
            }
        },
        conditions: {
            globalProperties({ddeEnabled}: any) {
                return ddeEnabled === true
            },
            scannedNpid(scannedNpid: string, {currentNpid}: any) {
                return !scannedNpid.match(new RegExp(currentNpid, 'i'))
            }
        }
    },
    "assign newer NPID when the current one is invalid": {
        weight: 68,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async ({ currentNpid }: any) => {
                await infoActionSheet(
                    'NATIONAL ID',
                    `Current NPID ${currentNpid} is invalid`,
                    'Reasign and Print',
                    [
                        { 
                            name: 'Reassign', 
                            slot: 'start', 
                            color: 'primary'
                        }
                    ]
                )
                return FlowState.ASSIGN_NPID
            }
        },
        conditions: {
            demographics: ({patientIsComplete}: any) => {
                return patientIsComplete === true
            },
            patientFound: (isFound: boolean) => {
                return isFound === true
            },
            hasInvalidNpid(isTrue: boolean) {
                return isTrue
            }
        }
    },
    "[DDE ON] Warn program managers when Patient has incomplete demographics. Dont force them to update though": {
        weight: 91,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async () => {
                const action = await infoActionSheet(
                    'Demographics',
                    'Patient data is incomplete data',
                    'Do you want to review and update now?',
                    [
                        { 
                            name: 'Yes', 
                            slot: 'start', 
                            color: 'success'
                        },
                        { 
                            name: 'No',  
                            slot: 'end', 
                            color: 'danger'
                        }
                    ],
                    'his-danger-color'
                )
                return action === 'Yes' ? FlowState.UPDATE_DMG : FlowState.CONTINUE
            }
        },
        conditions: {
            globalProperties({ddeEnabled}: any) {
                return ddeEnabled === true
            },
            demographics: ({patientIsComplete}: any) => {
                return patientIsComplete === false
            },
            patientFound: (isFound: boolean) => {
                return isFound === true
            },
            userRoles(roles: string[]) {
                return roles.includes("Program Manager") === true
            }
        }
    },
    "[DDE ON] Force Users to update Incomplete Patient demographics": {
        weight: 92,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async () => {
                const action = await infoActionSheet(
                    'Patient Demographics',
                    'Demographic data is incomplete',
                    'Continue to update',
                    [
                        { 
                            name: 'Update', 
                            slot: 'start', 
                            color: 'success'
                        },
                        { 
                            name: 'Cancel', 
                            slot: 'start', 
                            color: 'danger'
                        }
                    ],
                    'his-warning-color'
                )
                return action === 'Cancel' ? FlowState.GO_HOME : FlowState.UPDATE_DMG
            }
        },
        conditions: {
            globalProperties({ddeEnabled}: any) {
                return ddeEnabled === true
            },
            demographics: ({patientIsComplete}: any) => {
                return patientIsComplete === false
            },
            userRoles: (roles: string[]) => {
                return roles.includes('Program Manager') === false
            }
        }
    },
    "Warn the user when patient has high viral load": {
        weight: 45,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async () => {
                await infoActionSheet(
                    'High Viral Load',
                    'Patient has a high viral load, please take immediate action!',
                    '',
                    [
                        { 
                            name: 'OK',  
                            slot: 'end', 
                            color: 'danger'
                        }
                    ],
                    'his-danger-color'
                )
                return FlowState.CONTINUE
            }
        },
        conditions: {
            hasHighViralLoad: (isHigh: boolean)  => isHigh === true
        }
    },
    "[ANC] Warn last LMP is more than 8 months ago and ask to initiate new pregnancy": {
        weight: 32,
        targetEvent: TargetEvent.ON_CONTINUE,
        actions: {
            alert: async ({anc}: any) => {
                const action = await infoActionSheet(
                    'Pregancy overdue',
                    `Last menstrual period was ${anc.lmpMonths} months ago!`,
                    'Would you like to initiate new pregnancy?',
                    [
                        { 
                            name: 'Yes',  
                            slot: 'end', 
                            color: 'success'
                        },
                        { 
                            name: 'No',  
                            slot: 'end', 
                            color: 'danger'
                        }
                    ],
                    'his-danger-color'
                )
                return action === 'Yes' 
                    ? FlowState.INITIATE_ANC_PREGNANCY 
                    : FlowState.CONTINUE
            }
        },
        conditions: {
            programName: (name: string) => name === 'ANC',
            anc: (anc: any)  => anc.currentPregnancyIsOverdue === true
        }        
    },
    "[ANC] Exit if client is NOT ELIGIBLE for ANC": {
        weight: 89,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async () => {
                const action = await infoActionSheet(
                    'Client not eligible for ANC',
                    `This program is for women eligible for ANC only`,
                    'If this is a mistake, please update client Demographics or Exit',
                    [
                        { 
                            name: 'EXIT',
                            slot: 'end', 
                            color: 'success'
                        },
                        { 
                            name: 'EDIT DEMOGRAPHICS',
                            slot: 'end', 
                            color: 'danger'
                        }
                    ],
                    'his-danger-color'
                )
                return action === 'EXIT' ? FlowState.GO_HOME : FlowState.UPDATE_DMG
            }
        },
        conditions: {
            demographics: ({gender}: any) => {
                const g = gender.toLowerCase()
                return g === 'm' || g === 'male'
            },
            programName: (name: string) => {
                return name === 'ANC'
            } 
        }
    },
    "Alert the provider that the client is on ART and record needs to be synched with TB": {
        weight: 89,
        targetEvent: TargetEvent.ON_CONTINUE,
        actions: {
            alert: async () => {
                const action = await infoActionSheet(
                    'TB PROGRAM ALERT',
                    'Client was enrolled in the ART program',
                    'Do you want to synchronize ART status into TB program?',
                    [
                        { 
                            name: 'No',
                            slot: 'end', 
                            color: 'primary'
                        },
                        { 
                            name: 'Yes',
                            slot: 'end', 
                            color: 'success'
                        }
                    ],
                    'his-danger-color'
                )
                return action === 'No' ? FlowState.CONTINUE : FlowState.SYNCH_ART_STATUS_WITH_TB
            }
        },
        conditions: {
            programName: (name: string) => name === 'TB',
            tb: ({noHivPositiveRecordInTB, clientEnrolledInArtProgram}: any) => clientEnrolledInArtProgram && noHivPositiveRecordInTB
        }
    }
}
