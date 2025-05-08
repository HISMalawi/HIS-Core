import { AppInterface, GeneralDataInterface } from '@/apps/interfaces/AppInterface';
import HomeOverview from "@/apps/OPD/components/HomeOverview.vue";
import { PRIMARY_ACTIVITIES, SECONDARY_ACTIVITIES } from '@/apps/OPD/config/programActivities';
import { REPORTS } from '@/apps/OPD/config/programReports';
import opdRoutes from '@/apps/OPD/config/routes';
import { PatientProgramService } from '@/services/patient_program_service';
import { AppEncounterService } from "@/services/app_encounter_service"
import PatientAlerts from "@/services/patient_alerts"
import { Observation } from '@/interfaces/observation';
import { OrderService } from '@/services/order_service';
import { RelationshipService } from '@/services/relationship_service';
import { Order } from '@/interfaces/order';
import {PROPERTIES} from "@/apps/OPD/config/globalPropertySettings"
import { selectActivities } from '@/utils/WorkflowTaskHelper';
import Validation from '@/components/Forms/validations/StandardValidations';
import { ObservationService } from '@/services/observation_service';
import Store from "@/composables/ApiStore"
import HisDate from "@/utils/Date";
import { Patientservice } from '@/services/patient_service';

declare global {
  interface Navigator {
     msSaveBlob: (blob: Blob,fileName: string) => boolean;
    }
}

async function onRegisterPatient(patientId: number) {
  const program = new PatientProgramService(patientId)
  await program.enrollProgram()

  // Create registration encounter
  const encounter = new AppEncounterService(patientId, 5)

  await encounter.createEncounter()
  await encounter.saveValueCodedObs(
    'Type of patient', 'New Patient'
  )
}

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
      asyncValue: async () => (await ObservationService.getFirstValueText(patientID, 'HIV Status')) || 'N/A'
    }
  ]
}

async function getPatientDashboardAlerts(patient: any): Promise<GeneralDataInterface[]> {
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
    }
  ]
}

function orderToString(order: Order) {
  const test = order.tests[0];
  const result = test.result[0];
  const status = OrderService.isHighViralLoadResult(result) ? '(<b style="color: #eb445a;">High</b>)' : ''
  return `${test.name} ${result.value_modifier}${result.value} ${status}`;
}

function confirmationSummary(patient: any, program: any) {
  return {
    'PATIENT IDENTIFIERS': () => ([
      {
        label: "NPID",
        value: patient.getNationalID(),
      }
    ]),
    'ALERTS': () => getPatientDashboardAlerts(patient),
    'LAB ORDERS': async () => {
      const data: any = []
      await OrderService.getOrders(patient.getID())
        .then((orders) => {
          const VLOrders = OrderService.getOrdersWithResults(orders);
          VLOrders.forEach((order) => {
            data.push({
              value: orderToString(order),
              label: ``,
            });
          });
        });
      return data
    },
    'OUTCOME': () => ([
      {
        label: 'Current Outcome',
        value: program.outcome || 'N/A'
      }
    ]),
    'GUARDIAN': async () => {
      const req = await RelationshipService
        .getGuardianDetails(
          patient.getID()
        )
      if (req) {
        return req.map((r: any) => ({
          label: r.name,
          value: r.relationshipType,
        }))
      }
      return []
    }
  }
}

async function getPatientDashboardAlertsAndNotes(patient: Patientservice) {
  const notesObs = await ObservationService.getFirstObs(patient.getID(), "'Clinical notes construct'");
  return [
    {
      label: "Note:",
      value: notesObs?.value_text ?? ""
    }
  ]
}

const OPD: AppInterface = {
  programID: 14,
  applicationName: 'OPD',
  applicationIcon: 'opd.png',
  applicationDescription: 'Outpatient Program',
  appRoutes: opdRoutes,
  programReports: REPORTS,
  primaryPatientActivites: PRIMARY_ACTIVITIES,
  secondaryPatientActivites: SECONDARY_ACTIVITIES,
  homeOverviewComponent: HomeOverview,
  globalPropertySettings: PROPERTIES,
  getPatientDashboardAlertsAndNotes,
  getPatientDashboardLabOrderCardItems: async (patientId: number, date: string) => {
    const labOrders = await OrderService.getOrders(patientId, {date})
    return labOrders.map((order: any) => ({
        label: order.tests[0].name,
        value: HisDate.toStandardHisDisplayFormat(order.order_date)
    }))
  },
  onRegisterPatient,
  patientProgramInfoData,
  confirmationSummary,
  init: async () => await selectActivities(PRIMARY_ACTIVITIES, 'OPD_activities'),
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
      validation: (value) => Validation.isMWNationalID(value),
      keyboardName: 'Qwerty'
    },
  }
}

export default OPD