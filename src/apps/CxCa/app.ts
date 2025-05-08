import { AppInterface } from "../interfaces/AppInterface";
import homeOverviewComponent from "@/apps/CxCa/Components/CxCaHomeOverviewComponent.vue";
import {PRIMARY_ACTIVITIES} from "@/apps/CxCa/config/CxCaProgramActivities"
import Routes from "@/apps/CxCa/config/CxCaRoutes"
import HisDate from "@/utils/Date"
import { WorkflowService } from "@/services/workflow_service";
import { ObservationService } from "@/services/observation_service";
import { REPORTS } from "@/apps/CxCa/config/CxCaProgramReports"
import { 
    onRegisterPatient,
} from "@/apps/CxCa/config/CxCaAppScripts"
import {PROPERTIES} from "@/apps/CxCa/config/CxCaGlobalPropertySettings"
import Store from "@/composables/ApiStore"
import { ProgramService } from "@/services/program_service";
import { OrderService } from "@/services/order_service";
import { compassSharp } from "ionicons/icons";

/*
* A method to restrieve HIV status info
*/
function patientProgramInfoData(patientID: number) {
    return [
      { 
        label: 'Malawi National ID', 
        value: '...',
        asyncValue: async () => {
          const patient = await Store.get('ACTIVE_PATIENT', { patientID })
          return patient ? patient.getMWNationalID() : 'unknown'
        },
      },
      { 
        label: 'HIV Status',
        value: '...',
        asyncValue: async () => {
          const art_response = await ProgramService.getProgramInformation(patientID, 1)
          if (/\d{2}\/\d{2}\/\d{4}/i.test(`${art_response.art_start_date}`)) {
            return "Positive"
          }
          return (await ObservationService.getFirstValueCoded(patientID, 'HIV Status')) ?? "N/A"
        }
      }
    ]
  }

const CXCA: AppInterface = {
    programID: 24,
    applicationName: 'CxCa',
    applicationIcon: 'ccm.png',
    applicationDescription: "Cervical cancer screening module",
    appRoutes: Routes,
    primaryPatientActivites: PRIMARY_ACTIVITIES,
    secondaryPatientActivites: [],
    globalPropertySettings: PROPERTIES,
    onRegisterPatient,
    patientProgramInfoData,
    homeOverviewComponent,
    getPatientDashboardLabOrderCardItems: async (patientId: number, date: string) => {
      const labOrders = await OrderService.getOrders(patientId, {date})
      return labOrders.map((order: any) => ({
          label: order.tests[0].name,
          value: HisDate.toStandardHisDisplayFormat(order.order_date)
      }))
    },
    confirmationSummary: (patient: any, program: any) => ({
        'PATIENT IDENTIFIERS': () => {
            return [
                {
                  label: "NPID",
                  value: patient.getNationalID(),
                }
            ]
        },
        'OUTCOME': () => {
            return [
                { 
                    label: 'Current Outcome', 
                    value: program.outcome || 'N/A'
                }
            ]
        },
        'PROGRAM INFORMATION': async () => {
            const patientID = patient.getID()
            const data: any = []
            const params = await WorkflowService.getNextTaskParams(patientID)
            data.push({
              label: "Next Task",
              value: params.name ? `${params.name}` : 'NONE',
            })
            const appointMentObs: any[] = await ObservationService.getAll(patientID, 'appointment date');
            const nextAPPT = appointMentObs ? HisDate.toStandardHisDisplayFormat(appointMentObs[0].value_datetime) : 'Not Available'
            data.push({
                label: "Next Appointment",
                value: nextAPPT,
            });
            return data
        },
    }),
    programReports: REPORTS,
    programPatientIdentifiers: {
      'National Patient ID': {
          id: 3,
          name: "National Patient ID",
          isPrimary: false,
          useForSearch: true,
          prefix: () => '',
          keyboardName: 'Qwerty'
      }
    }
}
export default CXCA
