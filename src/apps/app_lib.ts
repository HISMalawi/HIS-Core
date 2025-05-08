import Apps from "@/apps/his_apps";
import ApplicationModal from "@/components/ApplicationModal.vue";
import { modalController } from "@ionic/vue";
import { find, isEmpty } from 'lodash';
import GlobalApp from "@/apps/GLOBAL_APP/global_app"
import { AppInterface } from "./interfaces/AppInterface";
import { marked } from "marked"
import { Service } from "@/services/service";
import { nextTask } from "@/utils/WorkflowTaskHelper"
import { alertConfirmation } from "@/utils/Alerts";

export enum AppSessionVariable {
    SUSPENDED_APP="suspendedApp",
    APPLICATION_NAME="applicationName"
}

/**
* Merge global configurations with app configurations
*/
function applyGlobalConfig(app: AppInterface) {
    const _app = {...app}
    _app.secondaryPatientActivites = [
        ...GlobalApp.GlobalProgramActivities,
        ..._app.secondaryPatientActivites
    ]
    _app.appStore = {
        ...GlobalApp.GlobalStore,
        ...(_app.appStore || {})
    }
    _app.globalPropertySettings = [
        ...GlobalApp.GlobalAppSettings,
        ...(_app.globalPropertySettings || [])
    ]
    return _app
}

async function getReleaseNotes(appName: string) {
    try {
        const req = await fetch(`/ReleaseNotes/${appName}.md`)
        const res = await req.text()
        if (req.ok) {
            if (/doctype html/i.test(`${res}`)) {
                return '<h1>No release notes found!</h1>'
            }
            return marked(res)
        }
    } catch (e) {
        console.error(e)
    }
}

function getActiveApp(): AppInterface | undefined {
    const appName = sessionStorage.getItem(AppSessionVariable.APPLICATION_NAME)

    if (appName) {
        const app: AppInterface | undefined = find(Apps, { applicationName: appName })
        if (app) return applyGlobalConfig(app)
    }
}

/**
 * Mark an aplication as suspended
 */
function suspendActiveApplication() {
    const currentApp = getActiveApp()
    if (currentApp) {
        sessionStorage.setItem(AppSessionVariable.SUSPENDED_APP, currentApp.applicationName)
    }
}

/**
 * Updates global configuration with current running application
 * @param app 
 * @returns 
 */
async function startApplication(app: AppInterface, context='', skipInit=false) {
    sessionStorage.setItem(AppSessionVariable.APPLICATION_NAME, app.applicationName)
    const configuredApp = applyGlobalConfig(app)
    if (typeof app.init === 'function' && !skipInit) await app.init(context)
    return configuredApp
}

/**
 * Mounts a suspended app as active
 * @returns 
 */
function resumeSuspendedApp() {
    const suspendedApp = sessionStorage.getItem(AppSessionVariable.SUSPENDED_APP)
    if (suspendedApp) {
        const app = find(Apps, { applicationName: suspendedApp })
        if (app) {
            sessionStorage.removeItem(AppSessionVariable.SUSPENDED_APP)
            startApplication(app, '', true)
        }
    }
}

/**
 * Perform a silent application switch and go directly to it's workflow
 * @param appName
 * @param patientID
 * @param router
 */
async function switchAppWorkflow(
    appName: string,
    patientID: number,
    router: any,
    beforeNextTask?: () => Promise<any>
    ) {
    const app: AppInterface | undefined = find(Apps, { applicationName: appName })
    if (app) {
        suspendActiveApplication()
        await startApplication(app)
        if (typeof beforeNextTask === 'function') { 
            await beforeNextTask()
        }
        nextTask(patientID, router)
    }
}

/**
 * Presents a modal to the user to select an application and switch to it
 * @param context 
 * @param canClose 
 * @returns 
 */
async function selectApplication(context='', canClose=false) {
    const modal = await modalController.create({
        component: ApplicationModal,
        cssClass: "large-modal",
        backdropDismiss: false,
        componentProps: {
            appVersion: Service.getFullVersion(),
            apps: Service.getAvailableApps(),
            canClose
        }
    })

    modal.present()

    const { data } = await modal.onDidDismiss()

    if (!data || isEmpty(data)) return

    if (sessionStorage.getItem(AppSessionVariable.SUSPENDED_APP)) {
        sessionStorage.removeItem(AppSessionVariable.SUSPENDED_APP)
    }
    return startApplication(data, context)
}

/**
 * Run initialisation checks and notifications. 
 * @returns 
*/
async function doAppManagementTasks() {
    const suspended = sessionStorage.getItem(AppSessionVariable.SUSPENDED_APP)
    if (suspended) {
        const ok = await alertConfirmation(
            'Do you want to resume ' + suspended + ' application?'
        )
        if (ok) return resumeSuspendedApp()
    }
    //TODO: check for if an an app is mounted and initiate application selection
}

export default {
    doAppManagementTasks,
    resumeSuspendedApp,
    startApplication,
    switchAppWorkflow,
    selectApplication,
    getReleaseNotes,
    getActiveApp
}