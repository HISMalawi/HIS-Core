import { AppInterface } from "../interfaces/AppInterface";
import EncountersToday from "./components/EncountersToday.vue"
import { selectActivities } from '@/utils/WorkflowTaskHelper';
import { OrderService } from "@/services/order_service";
import HisDate from "@/utils/Date";
import Store from "@/composables/ApiStore"
import { Patientservice } from "@/services/patient_service";
import { PRIMARY_ACTIVITIES, SECONDARY_ACTIVITIES } from "./config/activities";
import TbRoutes from "./config/routes"
import TbReports from "./config/reports"
import preferences from "./config/preferences";
import { TbIdentifierType } from "./meta/constants";
import router from "@/router";
import { ProgramService } from "@/services/program_service";
import { toDate } from "@/utils/Strs";
import { LabService } from "./services/lab_service";

const TB: AppInterface = {
    programID: 2,
    applicationName: 'TB',
    applicationIcon: 'tb.png',
    applicationDescription: 'Tuberculosis Program',
    appRoutes: TbRoutes,
    primaryPatientActivites: PRIMARY_ACTIVITIES,
    secondaryPatientActivites: SECONDARY_ACTIVITIES,
    programReports: TbReports,
    globalPropertySettings: preferences,
    homeOverviewComponent: EncountersToday,
    init: () => selectActivities(PRIMARY_ACTIVITIES),
    patientProgramInfoData: (patientId) => {
        let data: any = {}
        return [
            { 
                label: "TB Status",
                value: '...',
                init: async () => {
                    data = await ProgramService.getProgramInformation(patientId)
                },
                staticValue: () => data.tb_positive ? 'Positive' : 'Negative'
            },
            { 
                label: "Program start date",
                value: '...',
                staticValue: () => !/n\/a/i.test(data.program_start_date) ? toDate(data.program_start_date) : 'N/A'
            },
            { 
                label: "Treatment ID",
                value: '...', 
                staticValue: () => data.tb_number
            },
            { 
                label: "Current outcome",
                value: '...', 
                staticValue: () => data.current_outcome
            }
        ]
    },
    getPatientDashboardLabCardRoute: "/tb/lab/activities",
    async getPatientDashboardLabOrderCardItems(patientId: number, date: string) {
        const res = await LabService.getRecentOrders(patientId, date)
        if (res) {
            const orders = await LabService.formatOrderObs(res)
            return orders.map((order: any) => ({
                label: order["Test requested"],
                value: order["time"]
            }))
        }
        return []
    },
    confirmationSummary(data: Patientservice) { 
        return {
            'PATIENT IDENTIFIERS': () => {
                let id = 0
                return [
                    { label: 'NPID', value: data.getNationalID() },
                    ...data.patient.patient_identifiers.reduce((a: any, c: any, i) => {
                        if ([TbIdentifierType.IPT, TbIdentifierType.MDR, TbIdentifierType.TB, TbIdentifierType.MW].includes(c.identifier_type)) {
                            ++id
                            const idMap: any = {
                                [TbIdentifierType.TB] : 'TB',
                                [TbIdentifierType.MDR]: 'DR',
                                [TbIdentifierType.IPT]: 'IPT',
                                [TbIdentifierType.MW]: "MW"
                            }
                            return [...a, { label: `${idMap[c.identifier_type]}#${id}`, value: c.identifier }]
                        }
                        return a
                    }, [])
                ]
            },
            'LABS': async () => {
                return (await OrderService.getOrders(data.getID()))
                    .map((order: any) => {
                        return { 
                            label: order.tests.map((t: any) => t.name).join(' & '),
                            value: HisDate.toStandardHisDisplayFormat(order.order_date) 
                        } 
                    })
            }
        }
    },
    programPatientIdentifiers: {
        'National Patient ID': {
            id: 3,
            name: "National Patient ID",
            isPrimary: false,
            useForSearch: true,
            prefix: () => '',
            keyboardName: 'Qwerty'
        },
        'Malawi National ID': {
            id: 28,
            name: 'Malawi National ID',
            isPrimary: false,
            useForSearch: true,
            prefix: () => '',
            keyboardName: '?123',
            reassignAction: (patientID, id) => router.push(`/tb/mw/id/${patientID}?reassign=${id}`)
        },
        'TB Number': {
            id: TbIdentifierType.TB,
            name: 'TB Number',
            isPrimary: false,
            useForSearch: true,
            keyboardName: '?123',
            prefix: async () => `${(await Store.get('SITE_PREFIX'))}/TB/`,
            reassignAction: (patientID, id, identifier, type) => router.push(`/tb/registration/${patientID}?reassign=${id}&&id=${identifier}&&type=${type}`)
        },
        'IPT Number': {
            id: TbIdentifierType.IPT,
            name: 'IPT Number',
            isPrimary: false,
            useForSearch: true,
            prefix: async () => `${(await Store.get('SITE_PREFIX'))}/IPT/`,
            keyboardName: '?123',
            reassignAction: (patientID, id, identifier, type) => router.push(`/tb/registration/${patientID}?reassign=${id}&&id=${identifier}&&type=${type}`)
        },
        'DR TB Number': {
            id: TbIdentifierType.MDR,
            name: 'DR TB Number',
            isPrimary: false,
            useForSearch: true,
            prefix: async () => `${(await Store.get('SITE_PREFIX'))}/MDR/`,
            keyboardName: '?123',
            reassignAction: (patientID, id, identifier, type) => router.push(`/tb/registration/${patientID}?reassign=${id}&&id=${identifier}&&type=${type}`)
        }
    }
}
export default TB
