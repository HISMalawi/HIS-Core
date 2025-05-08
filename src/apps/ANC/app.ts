import { AppInterface } from "../interfaces/AppInterface";
import AncRoutes from "./Config/AncRoutes";
import HomePageStats from "@/apps/ANC/Components/HomeStats.vue"
import { PRIMARY_ACTIVITIES, SECONDARY_ACTIVITIES } from "./Config/AncProgramActivites";
import { AppEncounterService } from "@/services/app_encounter_service";
import { selectActivities } from '@/utils/WorkflowTaskHelper';
import { Patientservice } from "@/services/patient_service";
import { OrderService } from "@/services/order_service";
import HisDate from "@/utils/Date";
import { WorkflowService } from "@/services/workflow_service"
import { ProgramService } from "@/services/program_service";
import { RelationshipService } from "@/services/relationship_service";
import { REPORTS } from "./Config/AncProgramReports";
import { toDate } from "@/utils/Strs";

const ANC: AppInterface = {
    programID: 12,
    applicationName: 'ANC',
    applicationIcon: 'anc.png',
    applicationDescription: 'Antenatal Program',
    appRoutes: AncRoutes,
    primaryPatientActivites: PRIMARY_ACTIVITIES,
    secondaryPatientActivites: SECONDARY_ACTIVITIES,
    programReports: REPORTS,
    homeOverviewComponent: HomePageStats,
    init: async () => await selectActivities(PRIMARY_ACTIVITIES),
    getPatientDashboardLabOrderCardItems: async (patientId: number, date: string) => {
        const labOrders = await OrderService.getOrders(patientId, {date})
        return labOrders.map((order: any) => ({
            label: order.tests[0].name,
            value: HisDate.toStandardHisDisplayFormat(order.order_date)
        }))
      },
    patientProgramInfoData: (patientID: number) => {
        let data = {} as any
        return [
            { 
                label: "Date of last ANC visit",
                value: '...', 
                init: async () => {
                    data = await ProgramService.getProgramInformation(patientID)
                },
                staticValue: () => data.last_visit_date || 'N/A' 
            },
            { 
                label: "Gestation:",
                value: '...', 
                staticValue: () => data.gestation ? `${data.gestation} week(s)` : 'N/A' 
            },
            { 
                label: "ANC Visits",
                value: '...', 
                staticValue: () => data.anc_visits || 'N/A' 
            },
            { 
                label: "Current outcome",
                value: '...', 
                staticValue: () => data.current_outcome || 'N/A'
            }
        ]
    },
    confirmationSummary(data: Patientservice, program: any) { 
        const patientID = data.getID()
        const d = (date: string | Date) => HisDate.toStandardHisDisplayFormat(date)
        return {
            'PATIENT IDENTIFIERS': () => {
                return [
                    { label: 'NPID', value: data.getNationalID() },
                    { label: 'National ID', value: data.getMWNationalID() }
                ]
            },
            'PROGRAM INFO': () => {
                let info: any = null
                return [
                    { 
                        label: 'ANC visit', 
                        value: '...',
                        init: async () => {
                            info = await ProgramService.getProgramInformation(patientID)
                        },
                        staticValue: () => info.anc_visits || 'N/A' 
                    },
                    { 
                        label: 'Next Appointment Date', 
                        value: '...',
                        asyncValue: async () => toDate((await data.nextAppointment()))
                    },
                    { 
                        label: 'Gestation Age',
                        value: '...', 
                        staticValue: () => info.gestation ? `${info.gestation} week(s)` : 'N/A' 
                    },
                    { 
                        label: 'Date of LMP', 
                        value: '...',
                        staticValue: () => info.date_of_lnmp ?  d(info.date_of_lnmp) : 'N/A'
                    },
                    { 
                        label: 'EDOD', 
                        staticValue: () => info.edod ? d(info.edod) : 'N/A'
                    },
                    { 
                        label: 'Next task', 
                        value: '...',
                        asyncValue: async () => (await WorkflowService.getNextTaskParams(patientID)).name.toUpperCase() || 'N/A' 
                    }
                ]
            },
            'OUTCOME': () => {
                return [
                    { 
                        label: 'Current Outcome', 
                        value: '...',
                        staticValue: () => program.outcome || 'N/A' 
                    }
                ]
            },
            'LABS': async () => {
                return (await OrderService.getOrders(patientID))
                    .map((order: any) => {
                        return { 
                            label: order.tests.map((t: any) => t.name).join(' & '),
                            value: HisDate.toStandardHisDisplayFormat(order.order_date) 
                        } 
                    })
            },
            'GUARDIANS': async () => {
                const req = await RelationshipService
                    .getGuardianDetails(patientID)
                if (req) {
                    return req.map((r: any) => ({
                        label: r.name,
                        value: r.relationshipType,
                    }))
                } 
                return []
            }
        }
    },
    async onRegisterPatient(patientID: number) {
        // Registration Encounter
        const registration = new AppEncounterService(patientID, 5, -1)
        await registration.createEncounter()
        await registration.saveValueCodedObs('Type of patient', 'New patient')
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
        'National ID': {
            id: 28,
            name: 'Malawi National ID',
            isPrimary: true,
            useForSearch: true,
            prefix: () => '',
            keyboardName: 'Qwerty'
        }
    }
}
export default ANC
