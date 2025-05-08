import { AppInterface } from "../interfaces/AppInterface";
import homeOverviewComponent from "@/apps/LOS/Components/losHomeOverviewComponent.vue";
import customPatientDashboardContentComponent from "@/apps/LOS/Components/losCustomDashboardContent.vue"
import {PRIMARY_ACTIVITIES} from "@/apps/LOS/config/LosProgramActivities"
import Routes from "@/apps/LOS/config/LosRoutes"
import { OrderService } from "@/services/order_service";
import HisDate from "@/utils/Date"

const LOS: AppInterface = {
    programID: 23,
    applicationName: 'LOS',
    applicationIcon: 'order.png',
    applicationDescription: "Lab Order System",
    appRoutes: Routes,
    primaryPatientActivites: PRIMARY_ACTIVITIES,
    secondaryPatientActivites: [],
    globalPropertySettings: [],
    homeOverviewComponent,
    customPatientDashboardContentComponent,
    programPatientIdentifiers: {
        'National Patient ID': {
            id: 3,
            name: "National Patient ID",
            isPrimary: false,
            useForSearch: true,
            prefix: () => '',
            keyboardName: 'Qwerty'
        }
    },
    confirmationSummary: (patient: any) => ({
        'PATIENT IDENTIFIERS': () => {
            return [
                {
                  label: "NPID",
                  value: patient.getNationalID(),
                }
            ]
        },
        'LAB ORDERS': async () => {
            const orders = await OrderService.getOrders(patient.getID())
            return orders.map((t: any) => ({
                label: t.specimen.name,
                value: `${t.accession_number} - ${HisDate.toStandardHisDisplayFormat(t.order_date)}`
            }))
        }
    }),
    programReports: [
        {
            name: 'Clinical',
            icon: 'reports.png',
            defaultFilesIcon: 'reports.png',
            files: [
                {
                    name: "National ID reports",
                    icon: "folder.png",
                    defaultFilesIcon: 'reports.png',
                    files: [
                        {
                            name: "Utilization report",
                            pathUrl: '/art/npid_utilization_report'
                        }
                    ]
                },
                {
                    name: 'Test requested',
                    pathUrl: '/los/report/tests/requests'
                },
                {
                    name: 'Test results',
                    pathUrl: '/los/report/tests/results'
                }
            ]
        }
    ]
}
export default LOS
