import { PatientProgramService } from "@/services/patient_program_service";
import { UserService } from "@/services/user_service";
import { Patientservice } from "@/services/patient_service";
import { AuthService } from "@/services/auth_service";
import { isEmpty } from "lodash";
import GLOBAL_PROP from "@/apps/GLOBAL_APP/global_prop"
import { LocationService } from "@/services/location_service";
import { OrderService } from "@/services/order_service";
import Store from "@/composables/ApiStore"
import { Order } from "@/interfaces/order";
import { ObservationService } from "../../services/observation_service";
import { ConceptService } from "@/services/concept_service"

export interface CacheReloadParams  {
    params: any;
    state: any;
}

export interface StoreDef {
    // Define logic for retrieving data to cache.
    get: (params: any) => any;
    // Define condition for whether to retrieve data from cache or not
    canReloadCache: (params: CacheReloadParams) => boolean;
}

// caching can be an optional feature, use this detect if its enabled
export function isCacheEnabled() {
    return new AuthService().cachingIsEnabled()
}

/**
 * Defined cachable items here.
*/
const DEFS: Record<string, StoreDef> = {
    'CURRENT_LOCATION' : {
        get: async () => LocationService.getCurrentLocation(),
        canReloadCache: data => !isCacheEnabled() || isEmpty(data.state)
    },
    'ACTIVE_HOME_TAB': {
        get: () => 1,
        canReloadCache: data => typeof data.state != 'number'
    },
    'ACTIVE_HOME_SUB_TAB_NAME': {
        get: () => [],
        canReloadCache: (data: any) => isEmpty(data)
    },
    'ACTIVE_PATIENT': {
        get: async (params: any) => {
            const res = await Patientservice.findByID(params.patientID)
            return res ? new Patientservice(res) : {}    
        },
        canReloadCache: ({state, params}) => {
            return !isCacheEnabled() || !(!isEmpty(state) && 
                typeof params.patientID === 'number' && 
                typeof state?.getID === 'function' && 
                state.getID() === params.patientID)
        }
    },
    'PATIENT_PROGRAM': {
        get: async (params: any) => new PatientProgramService(params.patientID).getProgram(),
        canReloadCache: ({state, params}) => {
            return !isCacheEnabled() || !(!isEmpty(state) && 
                state?.programID === PatientProgramService.getProgramID() && 
                state.patientID === params.patientID)
        }
    },
    'PROVIDERS': {
        get: () => UserService.getUsers(),
        canReloadCache: data => !isCacheEnabled() || isEmpty(data.state)
    },
    'SITE_PREFIX': {
        get: () => GLOBAL_PROP.sitePrefix(),
        canReloadCache: data => !isCacheEnabled() || typeof data.state !== 'string' 
    },
    'IS_MILITARY_SITE': {
        get: () => GLOBAL_PROP.militarySiteEnabled(),
        canReloadCache: data => !isCacheEnabled() || typeof data.state != 'boolean'
    },
    'IS_DDE_ENABLED': { 
        get: () => GLOBAL_PROP.ddeEnabled(),
        canReloadCache: data => !isCacheEnabled() || typeof data.state != 'boolean'
    },
    'PATIENT_LAB_ORDERS': {
        get: (params: any) => {
            if (typeof params.patientID === 'number') {
                return OrderService.getOrders(params.patientID, params)
            }
            return []
        },
        canReloadCache: ({params, state}) => {
            return !isCacheEnabled() || !(params.patientID && Array.isArray(state) && state.length
                && state[0].patient_id === params.patientID)
        }
    },
    'IS_MW_NATIONAL_ID_SCANNER_ENABLED': {
        get: () => GLOBAL_PROP.malawiNationalIDScannerEnabled(),
        canReloadCache: data => !isCacheEnabled() || typeof data.state != 'boolean'
    },
    'GET_LAB_ORDERS_WITH_GIVEN_RESULT_STATUS': {
        get: async (params: any) => {
            const data = (await Store.get('PATIENT_LAB_ORDERS', {patientID: params.patientID }))
                .map(async (order: Order) => {
                    const remappedOrder: any = { ...order, 'result_given': false }
                    const obsResultID = order.tests.filter(order => order.result != null)
                        .map((tests: any) => tests.result)
                        .reduce((results: any, result: any) => [...results, ...result], [])
                        .reduce((_: any, result: any) => result.id, null)
                    try {
                        remappedOrder['result_given'] = !obsResultID ? 'N/A'
                            : await (await ObservationService.get(obsResultID as number))
                                .children.reduce(async (status: string, obs: any) => {
                                    return (await ConceptService.getConceptID('Result Given to Client')) === obs.concept_id
                                    && (await ConceptService.getConceptName(obs.value_coded)) === 'Yes'
                                        ? 'Yes'
                                        : status
                                }, 'No')
                    } catch (e) {
                        console.error(e)
                    }
                    return remappedOrder
                })
            return await Promise.all(data)
        },
        canReloadCache: () => true
    }
}
export default DEFS
