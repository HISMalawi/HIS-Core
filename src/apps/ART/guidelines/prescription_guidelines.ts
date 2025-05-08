/**
 * QUICK FACTS ABOUT ART REGIMENS (Malawi Clinical HIV Guidelines 2018 Version 1)
 *  - ART regimens are grouped into first and secondline
 *  - Each regimen is identified by a number. 
 *    [0, 2, 4, 5, 6, 8, 9, 10, 11, 13, 14]
 *  - Firstline regimens include [0, 2, 4, 5, 6, 13, 14]
 *  - Secondline regimens include [7, 8, 9, 10, 11]
 *  - Some regimens are "phased in" on initiation (Due to adverse reaction). As such, 
 *    a starter pack is provided for atleast two weeks. Regimens that require a
 *    starter pack include [0, 2, 6]
 */
import { GuideLineInterface } from "@/utils/GuidelineEngine"
import { tableActionSheet, listActionSheet, infoActionSheet, optionsActionSheet } from "@/utils/ActionSheets"

export enum Target {
    ARV_REGIMENS = 'arv_regimens',
    INTERVAL_SELECTION = 'next_visit_interval'
}
export enum FlowState {
    EXIT = 'exit',
    CONTINUE = 'continue'
}
export enum TargetEvent {
    ON_VALUE = 'onValue',
    ON_BUILD = 'onBuild',
    BEFORE_NEXT = 'beforeNext',
}
export const PRESCRIPTION_GUIDELINES: Record<string, GuideLineInterface> = {
    "Do not prescribe LPV regimens together with 3HP": {
        priority: 1,
        actions: {
            alert: async ({ regimenName }: any) => {
                await infoActionSheet(
                    '3HP - LPV/r conflict',
                    regimenName,
                    `Regimens containing LPV/r <b>cannot</b> be prescribed together with 3HP`,
                    [
                        { name: 'Close', slot: 'end', color: 'danger' }
                    ],
                    'his-danger-color'
                    )
                    return FlowState.EXIT
                }
        },
        target: Target.ARV_REGIMENS,
        targetEvent: TargetEvent.ON_VALUE,
        conditions: {
            regimenCode(code: number) {
                return [7, 8, 9, 10, 11, 12].includes(code)
            },
            medicationOrders(orders: Array<string>) {
                return orders.filter(i => `${i}`.match(/3hp/i) ? true : false).length >= 1
            }
        }
    },
    "Check for any adverse effects or contraindications associated with the regimen": {
        priority: 1,
        actions: {
            alert: async ({ regimenCodeStr, sideEffectsTable }: any) => {
                const { columns, rows } = sideEffectsTable
                const action = await tableActionSheet(
                    `Contraindications / Side effects for ${regimenCodeStr}`,'',
                    columns, rows,
                    [
                        { name: 'Select other regimen', slot: 'start'},
                        { name: 'Keep selected regimen', slot: 'end', color: 'danger' }
                    ],
                    'his-danger-color'
                )
                return action === 'Select other regimen' ? FlowState.EXIT : FlowState.CONTINUE
            }
        },
        target: Target.ARV_REGIMENS,
        targetEvent: TargetEvent.BEFORE_NEXT,
        conditions: {
            hasSideEffects(isTrue: boolean){
                return isTrue
            },
            lastSideEffectDate(date: string, { currentDate }: any){
                return date >= currentDate
            }
        }
    },
    "Recommend 2nd line regimen to children under 3": {
        priority: 1,
        actions: {
            alert: async () => {
                const action = await listActionSheet(
                    'Recommendation',
                    '',
                    [
                        "Children under 3 years often have a high viral load and may be infected with drug-resistant HIV from previous exposure to ARVs (mother's ART and/or infant nevirapine prophylaxis)",
                        "Therefore, children under <b>3 years</b> respond better when <b>started immediately on 2nd line regimen</b> (Regimen <b>11</b>)",
                    ],
                    [
                        { name: 'Select another regimen', slot: 'start' }, 
                        { name: 'Keep selected regimen', slot: 'end', color: 'danger' }
                    ],
                    'his-warning-color'
                )
                return action === 'Select another regimen' ? FlowState.EXIT : FlowState.CONTINUE
            }
        },
        target: Target.ARV_REGIMENS,
        targetEvent: TargetEvent.BEFORE_NEXT,
        conditions: {
            age(age: number) {
                return age < 3
            },
            regimenCode(code: number) {
                return code != 11
            }
        }
    }, 
    'Provide a reason for switching regimens when patient already has one': {
        priority: 1,
        actions : {
            alert: async (facts: any) => {
                const modal = await optionsActionSheet(
                    `Are you sure you want to replace ${facts.currentRegimenStr}?`,
                    'Specify reason for switching regimen',
                    [ 
                        'Policy change', 
                        'Ease of administration (pill burden, swallowing)',
                        'Drug drug interaction', 
                        'Pregnancy intention',
                        'Side effects', 
                        'Treatment failure', 
                        'Weight Change', 
                        'Other'
                    ],
                    [
                        { name: 'Cancel', slot:'start', color: 'danger' },
                        { name: 'Continue', slot: 'end', role: 'action' }
                    ]
                )

                if (modal.selection && modal.action != 'Cancel') {
                    facts.reasonForSwitch = modal.selection
                    return FlowState.CONTINUE
                }
                return FlowState.EXIT
            }
        },
        target: Target.ARV_REGIMENS,
        targetEvent: TargetEvent.ON_VALUE,
        conditions: {
            regimenCode(code: string, { currentRegimenCode }: any){
                return currentRegimenCode != -1 && code != currentRegimenCode
            }
        }
    },
    "Provide 14 day starter pack for LPV regimens for children under 3 years old": {
        priority: 3,
        actions: {
            alert: async (facts: any) => {
                const action = await infoActionSheet(
                    'Starter pack needed for 14 days',
                    `${ facts.treatmentInitiationState}`, 
                    `${ facts.regimenName }`,
                    [
                        { name: 'Cancel', slot: 'start', color: 'danger'},
                        { name: 'Prescribe starter pack', slot: 'end' }
                    ],
                    'his-info-color'
                )

                if (action === 'Prescribe starter pack') {
                    facts.starterPackNeeded = true
                    return FlowState.CONTINUE
                }
                return FlowState.EXIT
            },
        },
        target: Target.ARV_REGIMENS,
        targetEvent: TargetEvent.BEFORE_NEXT,
        conditions: {
            age(age: number) {
                return age < 3
            },
            regimenCode(code: number) {
                return code === 11
            },
            treatmentInitiationState(state: string) {
                return ['Initiation', 'Re-initiation'].includes(state)
            }
        }
    },
    "Provide 14 day starter pack for NVP based regimens on newly initiated/re-initiation patients": {
        priority: 3,
        actions: {
            alert: async (facts: any) => {
                const action = await infoActionSheet(
                    'Starter pack needed for 14 days',
                    `${ facts.treatmentInitiationState}`, 
                    `${ facts.regimenName }`,
                    [
                        { name: 'Cancel', slot: 'start', color: 'danger'},
                        { name: 'Prescribe starter pack', slot: 'end' }
                    ],
                    'his-info-color'
                )

                if (action === 'Prescribe starter pack') {
                    facts.starterPackNeeded = true
                    return FlowState.CONTINUE
                }
                return FlowState.EXIT
            },
        },
        target: Target.ARV_REGIMENS,
        targetEvent: TargetEvent.BEFORE_NEXT,
        conditions: {
            regimenCode(code: number) {
                return [0, 2, 6].includes(code)
            },
            treatmentInitiationState(state: string) {
                return ['Initiation', 'Re-initiation'].includes(state)
            }
        }
    },
    "Ask to reuse hanging pills if any": {
        priority: 5,
        actions: {
            alert: async (facts: any) => {
                const action  = await infoActionSheet(
                    'Hanging pills recommendation',
                    'Add hanging pills?', '',
                    [
                        { name: 'No', slot: 'start', color: 'warning'},
                        { name: 'Yes', slot: 'end'}
                    ],
                    'his-info-color'
                )
                if (action === 'Yes') {
                    facts.hangingPillsStatus = 'Optimize - including hanging pills'
                } else {
                    facts.hangingPillsStatus = 'Exact - excluding hanging pills'
                }
                return FlowState.CONTINUE
            }
        },
        target: Target.INTERVAL_SELECTION,
        targetEvent: TargetEvent.BEFORE_NEXT,
        conditions: {
           drugs(d: Array<string>, { hangingPills }: any){
                const hanging = d.map(drug => hangingPills.includes(drug))
                return hanging.some(Boolean)
           }
        }
    },
    "Provide warning of use of DTG regimen to women of reproductive age" : {
        priority: 2,
        actions: {
            alert: async ({regimenName}: any) => {
                const action = await infoActionSheet(
                    `Use of DTG or EFV in women of reproductive age`,
                    regimenName,
                    [
                        'There is currently <u>no confirmation</u>',
                        'that <b>DTG</b> is safe in <u>very early pregnancy</u>',
                        'DTG-based regimens are therefore not used as standard 1st line regimens for',
                        '<u>girls and women</u> who may get pregnancy'
                    ].join(' '),
                    [
                        { name: 'Select another regimen', slot: 'start' }, 
                        { name: 'Continue with regimen', slot: 'end', color: 'danger'}
                    ],
                    'his-danger-color'
                )
                return action === 'Select another regimen' ? FlowState.EXIT : FlowState.CONTINUE
            }
        },
        target: Target.ARV_REGIMENS,
        targetEvent: TargetEvent.BEFORE_NEXT,
        conditions: {
            regimenCode(code: number) {
                return code >= 12
            },
            isChildBearing(isBearing: boolean){
                return isBearing
            }
        }
    },
    "Provide pallet options for LPV regimens for patient's whose weight is between 3 and 25 kgs" : {
        priority: 6,
        actions: {
            alert: async (facts: any) => {
                const action = await infoActionSheet(
                    'Pellets (cups) / Tabs', 
                    '',
                    'Prescribe LPV/r in <b>Pellets (cups)</b> or <b>Tablets</b>?',
                    [
                        { name: 'Granules', slot: 'start' },
                        { name: 'Pellets', slot:'end' },
                        { name: 'Tabs', slot:'end' }
                    ],
                    'his-info-color'
                )
                facts.lpvType = action.toLowerCase()
                return FlowState.CONTINUE
            }
        },
        target: Target.ARV_REGIMENS,
        targetEvent: TargetEvent.BEFORE_NEXT,
        conditions: {
            weight(weight: number){
                return weight >= 3 && weight <= 25
            },
            regimenCode(code: number){
                return code === 11 || code === 9
            }
        }
    },
    "Provide 14 day interval for NVP or LVP Regimen starter pack": {
        priority: 1,
        data: {
            enabled: false
        },
        target: Target.INTERVAL_SELECTION,
        targetEvent: TargetEvent.ON_BUILD,
        conditions: {
            prescriptionType(type: string){
                return type === 'Regimen'
            },
            selectedInterval(interval: number) {
                return interval > 14
            },
            starterPackNeeded(isNeeded: boolean) {
                return isNeeded
            },
            regimenCode(code: number) {
                return [0, 2, 6, 11].includes(code)
            }
        }
    },
    "Restrict Emergency supply prescription to 1 month": {
        priority: 1,
        data: {
            enabled: false
        },
        target: Target.INTERVAL_SELECTION,
        targetEvent: TargetEvent.ON_BUILD,
        conditions: {
            selectedInterval: (interval: number) => interval > 28, 
            patientType: (type: string) => type === "Emergency supply"
        }
    },
    "Provide intervals upto 1 month, 2nd up to 2 months, and 3rd up to 6 months for Patients receiving TPT" : {
        priority: 2,
        data: {
            enabled: false
        },
        target: Target.INTERVAL_SELECTION,
        targetEvent: TargetEvent.ON_BUILD,
        conditions: {
            prescriptionType(type: string){
                return type === 'Regimen'
            },
            medicationOrders(orders: Array<string>) {
                return orders.map(i => `${i}`.match(/3hp/i) ? true : false).some(Boolean)
            },
            tptPrescriptionCount(count: number, {selectedInterval}: any){
                return Math.round(selectedInterval / 30) > count
            }
        }
    }
}

export const DRUG_FREQUENCY_GUIDELINE: Record<string, GuideLineInterface> = {
    'Rifapentine or isoniazid should be taken weekly': {
        concept: 'Weekly (QW)',
        priority: 1,
        conditions: {
            drug(d: string) {
                return `${d}`.match(/Rifapentine|Isoniazid/i)
            }
        }
    },
    'Use daily frequency for any other drugs': {
        concept: 'Daily (QOD)',
        priority: 2,
        conditions: {
            drug(d: string) {
                return !`${d}`.match(/Rifapentine|Isoniazid/i)
            }
        }
    }
}
