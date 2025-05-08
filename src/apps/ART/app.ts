import { AppInterface } from "../interfaces/AppInterface";
import appRoutes from "./Config/ArtRoutes"
import homeOverviewComponent from "@/apps/ART/Components/ArtOverviewComponent.vue"
import { REPORTS } from "@/apps/ART/Config/ArtProgramReports"
import {PROPERTIES} from "@/apps/ART/Config/ArtGlobalPropertySettings"
import { PRIMARY_ACTIVITIES, SECONDARY_ACTIVITIES } from "@/apps/ART/Config/ArtProgramActivities"
import { 
    init, 
    appStore,
    confirmationSummary,
    onRegisterPatient,
    patientProgramInfoData,
    getPatientDashboardAlertsAndNotes,
    getPatientDashboardLabOrderCardItems,
    downloadAppNotifications
} from "@/apps/ART/Config/ArtAppScripts"
import Store from "@/composables/ApiStore"
import Validation from '@/components/Forms/validations/StandardValidations';

const ART: AppInterface = {
    init,
    programID: 1,
    applicationName: 'ART',
    applicationIcon: 'aids.png',
    applicationDescription: "HIV Client management app",
    appRoutes,
    primaryPatientActivites: PRIMARY_ACTIVITIES,
    secondaryPatientActivites: SECONDARY_ACTIVITIES,
    globalPropertySettings: PROPERTIES,
    programReports: REPORTS,
    appStore,
    homeOverviewComponent,
    confirmationSummary,
    patientProgramInfoData,
    getPatientDashboardAlertsAndNotes,
    onRegisterPatient,
    getPatientDashboardLabOrderCardItems,
    downloadAppNotifications,
    programPatientIdentifiers: {
        'ARV Number': {
            id: 4,
            name: 'ARV Number',
            isPrimary: true,
            useForSearch: true,
            keyboardName: '0-9',
            prefix: async () => `${(await Store.get('SITE_PREFIX'))}-ARV-`
        },
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
        'Filing number': {
            id: 17,
            name: 'Active Filing number',
            isPrimary: false,
            useForSearch: true,
            prefix: async () => {
                try {
                    const [active] = (await Store.get('ART_FILING_NUMBER_PREFIX')).split(',')
                    return active
                } catch (e) {
                    console.warn(e)
                    return ''
                }
            },
            visible: () => Store.get('IS_ART_FILING_NUMBER_ENABLED')
        },
        'Archived filing number': {
            id: 18,
            name: 'Archived filing number',
            isPrimary: false,
            useForSearch: true,
            prefix: async () => {
                try {
                    return (await Store.get('ART_FILING_NUMBER_PREFIX')).split(',')[1] || ''
                } catch (e) {
                    console.warn(e)
                    return ''
                }
            },
            visible: () => Store.get('IS_ART_FILING_NUMBER_ENABLED')
        }
    }
}
export default ART
