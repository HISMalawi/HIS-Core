import { infoActionSheet, optionsActionSheet } from "@/utils/ActionSheets";
import { GuideLineInterface } from "@/utils/GuidelineEngine";
import HisDate from '@/utils/Date'

export enum FlowState {
    SET_PROVIDER = 'SET_PROVIDER',
    CHANGE_SESSION_DATE = 'change_session_date',
    GO_TO_PATIENT_DASHBOARD = 'go_to_patient_dashboard',
    CHANGE_PATIENT_OUTCOME = 'change_outcome',
    CONTINUE = 'continue',
    EXIT = 'exit'
}
const dformat = (d: string) => HisDate.toStandardHisDisplayFormat(d)

export const ENCOUNTER_GUIDELINES: Record<string, GuideLineInterface> = {
    "Warn if attempting to create new encounters for a deceased patient": {
        priority: 1,
        actions: {
            alert: async ({ outcomeStartDate }: any) => {
                const action = await infoActionSheet(
                    'Data Integrity Issue Found',
                    `Patient died on ${dformat(outcomeStartDate)}`,
                    'Proceeding with this outcome might affect accuracy of some reports',
                    [
                        { name: 'Cancel', slot: 'end', color: 'primary'},
                        { name: 'Change outcome', slot: 'end', color: 'primary'},
                        { name: 'Continue Anyway', slot: 'end', color: 'danger'}
                    ]
                )
                return action === 'Cancel'
                    ? FlowState.GO_TO_PATIENT_DASHBOARD
                    : action === 'Change outcome'
                    ? FlowState.CHANGE_PATIENT_OUTCOME
                    : FlowState.CONTINUE
            }
        },
        conditions: {
            outcome(outcome: string) {
                return outcome === 'Patient died'
            },
            outcomeStartDate(startDate: string, { sessionDate }: any) {
                return sessionDate >= startDate
            }
        }
    },
    "A patient's date of birth must not be less than Session Date": {
        priority: 2,
        actions: {
            alert: async ({ birthDate, sessionDate}: any) => {
                const action = await infoActionSheet(
                    'Data integrity issue found', '',
                    `Session date ${dformat(sessionDate)} is less than birth date of ${dformat(birthDate)}`,
                    [
                        { name: 'Cancel', slot: 'end', color: 'danger'},
                        { name: 'Change session date', slot: 'end', color: 'success'}
                    ]
                )
                return action === 'Change session date'
                    ? FlowState.CHANGE_SESSION_DATE
                    : FlowState.GO_TO_PATIENT_DASHBOARD
            }
        },
        conditions: {
            birthDate(birthDate: string, { sessionDate }: any) {
                return sessionDate < birthDate
            }
        }
    },
    "Select Encounter provider when in back data entry": {
        priority: 3,
        actions: {
            selection: async ({ providers, encounterName, sessionDate, apiDate }: any) => {
                const modal = await optionsActionSheet(
                    `Please select a provider for ${encounterName}`,
                    `BDE: ${dformat(sessionDate)} | Current: ${dformat(apiDate)}`,
                    providers,
                    [
                        { name: 'Cancel', color: 'danger', slot: 'start', role: 'default'},
                        { name: 'Confirm', slot: 'end', role: 'action' }
                    ],
                    '',
                    'full-modal'
                )
                return modal.action === 'Cancel' 
                    ? { value: -1, flowState: FlowState.GO_TO_PATIENT_DASHBOARD }
                    : { value: modal.selection, flowState: FlowState.SET_PROVIDER }
            }
        },
        conditions: {
            isBdeMode(isBDE: boolean) {
                return isBDE
            }
        }
    }
}