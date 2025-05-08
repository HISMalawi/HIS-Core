import { modalController } from "@ionic/vue";
import { PRIMARY_ACTIVITIES } from "./ArtProgramActivities";
import { WorkflowService } from "@/services/workflow_service"
import PatientAlerts from "@/services/patient_alerts"
import { RelationshipService } from "@/services/relationship_service";
import { PatientProgramService } from "@/services/patient_program_service";
import { ProgramService } from "@/services/program_service";
import { OrderService } from "@/services/order_service";
import { Observation } from "@/interfaces/observation";
import { ObservationService } from "@/services/observation_service";
import HisDate from "@/utils/Date"
import { GeneralDataInterface } from "@/apps/interfaces/AppInterface";
import { PatientTypeService } from "@/apps/ART/services/patient_type_service"
import DrugModalVue from "@/apps/ART/Components/DrugModal.vue";
import ART_GLOBAL_PROP from "../art_global_props";
import { isEmpty } from "lodash";
import { Order } from "@/interfaces/order";
import { addWorkflowTask, nextTask, selectActivities } from "@/utils/WorkflowTaskHelper";
import dayjs from "dayjs";
import { NotFoundError, Service } from "@/services/service";
import { Patientservice } from '@/services/patient_service';
import Store from "@/composables/ApiStore"
import ART_PROP from "@/apps/ART/art_global_props";
import { StoreDef, isCacheEnabled } from "@/apps/GLOBAL_APP/global_store";
import { toDate } from "@/utils/Strs";
import { ConsultationService } from "@/apps/ART/services/consultation_service";
import { NotificationService } from "@/services/notification_service";
import router from "@/router/index";
import { toastDanger } from "@/utils/Alerts";

export const appStore: Record<string, StoreDef> = {
    'ART_USER_SELECTED_ACTIVITIES': {
        get: async () => {
            try {
                const data = await Service.getJson('user_properties', {
                    property: "activities"
                })
                return data.property_value.split(',')
            } catch (e) {
                return []
            }
        },
        canReloadCache: (data) => {
            return !isCacheEnabled() || !(data.state||[]).length
        }
    },
    'CAN_EDIT_ACTIVITIES': {
        get: async() => {
            try {
                return (await ProgramService.getJson(
                    'user_properties', { property: 'lock_user_to_art_activities'}
                )).property_value
            } catch (e) {
                if (e instanceof NotFoundError) {
                    return 'Yes'
                } else {
                    return '_error_'
                }
            }
        },
        canReloadCache: data => !isCacheEnabled() || !/yes|no/i.test(`${data.state}`)
    },
    'ASK_HANGING_PILLS':  {
        get: () =>  ART_PROP.askPillsRemaining(),
        canReloadCache: data => !isCacheEnabled() || typeof data.state != 'boolean'
    },
    'ART_AUTO_3HP_SELECTION': {
        get: () =>  ART_PROP.threeHPAutoSelectEnabled(),
        canReloadCache: data => !isCacheEnabled() || typeof data.state != 'boolean'
    },
    'IS_ART_FAST_TRACK_ENABLED': {
        get: () => ART_PROP.fastTrackEnabled(),
        canReloadCache: data => !isCacheEnabled() || typeof data.state != 'boolean'
    },
    'IS_ART_HTN_ENABLED' : {
        get: () => ART_PROP.htnEnabled(),
        canReloadCache: data => !isCacheEnabled() || typeof data.state != 'boolean'
    },
    'IS_ART_FILING_NUMBER_ENABLED': {
        get: () => ART_PROP.filingNumbersEnabled(),
        canReloadCache: data => !isCacheEnabled() || typeof data.state != 'boolean'
    },
    'ART_FILING_NUMBER_PREFIX': {
        get: () => ART_PROP.filingNumberPrefix(),
        canReloadCache: data => !isCacheEnabled()  || typeof data.state != 'string'
    },
    'IS_ART_DRUG_MANAGEMENT_ENABLED': {
        get: () => ART_PROP.drugManagementEnabled(),
        canReloadCache: data => !isCacheEnabled() || typeof data.state != 'boolean'
    },
}

async function enrollInArtProgram(patientID: number, patientType: string, clinic: string) {
    const program = new PatientProgramService(patientID)
    await program.enrollProgram()
    const patientTypeService = new PatientTypeService(patientID, -1)

    patientTypeService.setPatientType(patientType)
    patientTypeService.setLocationName(clinic)

    await patientTypeService.createEncounter()
    await patientTypeService.save()
}

/**
 * Present a modal to show drug chart
 */
async function showStockManagementChart() {
    if((await Store.get('IS_ART_DRUG_MANAGEMENT_ENABLED'))){
        const drugModal = await modalController.create({
            component: DrugModalVue,
            cssClass: "large-modal",
            backdropDismiss: false
        });
        drugModal.present() 
        await drugModal.onDidDismiss()
    }
}

function orderToString(order: Order, showDate = true) {
    const test = order.tests[0];
    const result = test.result[0];
    const date = showDate ? `<br> Result date: &nbsp; ${HisDate.toStandardHisDisplayFormat(result.date)}` : ''
    const status = OrderService.isHighViralLoadResult(result) ? '(<b style="color: #eb445a;">High</b>)' : ''
    return `${test.name} &nbsp; ${result.value_modifier}${result.value} ${status} ${date}`;
}

export async function init(context='') {
    switch((await Store.get('CAN_EDIT_ACTIVITIES'))) {
        case 'Yes':
            Store.invalidate('ART_USER_SELECTED_ACTIVITIES')
            await selectActivities(PRIMARY_ACTIVITIES)
            break;
        case 'No':
            break;
        case '_error_':
            toastDanger("Unable to determine user activites. Workflows may not work properly", 10000)
            break;
    }
    if (context === 'HomePage') {
        await showStockManagementChart()
    }
}

export async function onRegisterPatient(patientID: number, person: any, attr: any, router: any, route: any) {
    await enrollInArtProgram(patientID, person.patient_type, person.location)
    if (person.relationship === 'Yes') {
        addWorkflowTask(patientID, {
            from: 'Patient Registration',
            to: `/guardian/registration/${patientID}`
        })
    }
    if ((await ART_GLOBAL_PROP.filingNumbersEnabled()) && person.patient_type === "New patient") {
        addWorkflowTask(patientID, {
            from: person?.relationship === 'Yes' 
                ? 'Guardian Registration'
                : 'Patient Registration',
            to: `/art/filing_numbers/${patientID}?assign=true`
        })
    }
    nextTask(patientID, router, route)
    return true
}

export async function getPatientDashboardAlertsAndNotes(patient: any): Promise<GeneralDataInterface[]>{
    const notesObs = await ObservationService.getFirstObs(patient.getID(), "Notes");
    const sideEffects: Observation[] = await PatientAlerts.alertSideEffects(patient.getID())
    const bmi = await patient.getBMI()
    return [
        {
            label: "Side effects",
            value: `${sideEffects.length}`,
        },
        {
            label: "Patient BMI is",
            value: `${bmi.result}`
        },
        {
            label: "Note:",
            value: notesObs?.value_text ?? ""
        }
    ]
}

export function patientProgramInfoData(patientID: number) {
    let data: any = {}
    return  [
        { 
            label: "ART- Start Date", 
            value: '...',
            init: async () => {
                data = await ProgramService.getProgramInformation(patientID)
            },
            staticValue: () => {
                const [day, month, year] = data.art_start_date.split('/')
                const durationOnArt = !data.art_start_date.match(/n\/a/i)
                    ? `(${dayjs(Service.getSessionDate()).diff(`${year}-${month}-${day}`, 'months')} Month(s))`
                    : ''
                return `${data.art_start_date} ${durationOnArt}`
            } 
        },
        { 
            label: "ARV Number", 
            value: '...',
            staticValue: () => `${data.arv_number} | Regimen: ${data.current_regimen}`
        },
        { 
            label: "File Number", 
            value: '...',
            staticValue: () => data.filing_number.number
        },
        { 
            label: "Current Outcome", 
            value: '...',
            staticValue: () => data.current_outcome
        }
    ]
}

/**
 * Loads lab result card data
 * @param patientId 
 * @param date 
 * @returns 
 */
export async function getPatientDashboardLabOrderCardItems(patientId: number) {
    const data = (await Store.get('PATIENT_LAB_ORDERS', { patientID: patientId }))
        .reduce((results: any, order: any) => results.concat(OrderService.getVLResults(order)), [])
        .map((result: any) => {
            const vlStatus = OrderService.isHighViralLoadResult(result) ? '(<b style="color: #eb445a;">High</b>)' : ''
            return {
                label: `${result.indicator.name} &nbsp ${result.value_modifier}${result.value} ${vlStatus}`,
                value: HisDate.toStandardHisDisplayFormat(result.date),
                other: {
                    wrapTxt: true
                }
            }
        }).sort((a: any, b: any) => new Date(a.value) > new Date(b.value) ? -1 : 1)
    if (data.length >= 2) {
        const [result1, result2] = data
        return [result1, result2]
    }
    return data
}

export async function downloadAppNotifications() {
    const notifications = await NotificationService.unread()
    if (!isEmpty(notifications)) {
        const vlMessageObs : any = {'highVL':[],'normalVL':[],'rejectedVL':[]}
        let vlMessage = {}
        return notifications.map((n: any) => {
            let type = 'General'
            const message = n.text
            let handler = null
            try {
            
                const t = JSON.parse(n.text)
                if (t['Type'].match(/lims/i)) {
                    handler = () => router.push(`/art/encounters/lab/${t['PatientID']}`)
                    type = `${t['Test type']} results for ${t['ARV-Number'] || t['Accession number']}`
                    const viralLoadStatus = OrderService.detectHighVl(t['Result'][0]['value'],t['Result'][0]['value_modifier'])
                    vlMessage = {
                        'handler':handler,
                        'id':n.alert_id,
                        'arv':t['ARV-Number'] ,
                        'accession':t['Accession number'] ,
                        'order_date':toDate(t['Orde date']),
                        'results': t['Result'][0]['value_modifier'] +" "+ t['Result'][0]['value'],
                        'results_date':toDate(t['Result'][0]['date'])
                    }

                    if(viralLoadStatus)
                    {
                        vlMessageObs.highVL.push(vlMessage)
                        
                    }else
                    if(t['rejection_reason']){
                        vlMessage = {
                            'handler':handler,
                            'id':n.alert_id,
                            'arv':t['arv_number'] ,
                            'accession':t['accession_number'] ,
                            'order_date':toDate(t['order_date']),
                            'rejection_reason':t['rejection_reason']
                        }
                        vlMessageObs.rejectedVL.push(vlMessage)

                    }else
                    if(!viralLoadStatus)
                    {
                        vlMessageObs.normalVL.push(vlMessage)
                    }
                    
                }
            } catch (e) {
                console.warn(e)
            }
            return {
                handler,
                message,
                vlMessageObs,
                title: type,
                id: n.alert_id,
                date: toDate(n.date_created)
            }
        })
    }
}

export function confirmationSummary(patient: Patientservice) {
    Store.invalidate('PATIENT_LAB_ORDERS')
    const patientID = !isEmpty(patient) ? patient?.getID() : -1
    let programInfo: any = null
    let tptStatus: Record<string, any> = {}
    return {
        'PROGRAM INFORMATION' : () => [
            {
                label: 'Next Task',
                value: '...',
                asyncValue: async () => {
                    const params = await WorkflowService.getNextTaskParams(patientID)
                    return params.name ? `${params.name}` : 'NONE'
                }
            },
            {
                label: 'ART Duration',
                value: '...',
                init: async () => {
                    programInfo = await ProgramService.getProgramInformation(patientID)
                },
                asyncValue: async () => {
                    return programInfo.art_duration
                }
            },
            {
                label: 'Fast Track',
                value: '...',
                asyncValue: async () => {
                    const task = await ProgramService.getFastTrackStatus(patientID)
                    return task["Continue FT"] === true ? "Yes" : "No"
                }
            },
            {
                label: 'Next Appointment',
                value: '...',
                asyncValue: async () => toDate((await patient.nextAppointment()))
            },
            {
                label: "TPT start",
                value: '...',
                init: async () => {
                    const service = new ConsultationService(patientID, -1)
                    tptStatus = (await service.getTptTreatmentStatus())||{}
                },
                asyncValue: async () => toDate(tptStatus?.tpt_init_date) || 'N/A'
            },
            {
                label: "TPT expected end date",
                value: '...',
                asyncValue: async () => toDate(tptStatus?.tpt_end_date||tptStatus?.tpt_complete_date) || 'N/A'
            }
        ],
        'PATIENT IDENTIFIERS': () => [
            {
                label: 'ARV Number',
                value: '...',
                staticValue: () => patient.getArvNumber(),
            },
            {
                label: 'NPID',
                value: '...',
                staticValue: () => patient.getNationalID(),
            },
            {
                label: 'Filing Number',
                value: '...',
                staticValue: () => patient.getFilingNumber()
            }
        ],
        'ALERTS': () => [
            {
                label: "Is Hypertensive",
                value: "...",
                asyncValue: async () => {
                    const res = await ObservationService.getFirstValueCoded(patient.getID(), "Patient has hypertension")
                    return res ?? "Unkn"
                }
            },
            {
                label: 'Side effects',
                value: '...',
                asyncValue: async () => { 
                    return (await PatientAlerts.alertSideEffects(patientID)).length
                }
            }, 
            {
                label: 'Patient BMI is',
                value: '...',
                asyncValue: async () => {
                    const bmi = await patient.getBMI()
                    return bmi.result
                }
            }
        ],
        'LAB ORDERS': async () => {
            const data: any = []
            await Store.get('PATIENT_LAB_ORDERS', { patientID })
                .then((orders) => {
                    const VLOrders = OrderService.getOrdersWithResults(orders);
                    for(let i = 0; i < 2 && i < VLOrders.length; i++) {
                        data.push({
                            value: orderToString(VLOrders[i]),
                            label: ``,
                        });
                    }
                });
            return data
        },
        'OUTCOME': () => [
            {
                label: 'Current Outcome',
                value: '...',
                staticValue: () => programInfo.current_outcome || 'N/A'
            }
        ],
        'GUARDIAN': async () => {
            const data: any = []
            const req = (await RelationshipService.getGuardianDetails(patientID) || [])
            if (req.length) {
                req.forEach(element => {
                    data.push( {
                        label: element.name,
                        value: element.relationshipType
                    }) 
                    data.push({
                        label: "Phone",
                        value: element.phoneNumber
                    })
                })
                return data
            }
            return []
        } 
    }
}
