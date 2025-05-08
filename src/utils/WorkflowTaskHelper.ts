import { TaskInterface } from "@/apps/interfaces/TaskInterface";
import ActivitiesModal  from '@/components/ActivitiesSelection.vue'
import { WorkflowService } from "@/services/workflow_service"
import { modalController } from "@ionic/vue";
import { isEmpty } from "lodash"
import Apps from "@/apps/app_lib"

export enum WorkflowSessionKeys {
    NextTask = 'next-task'
}

export interface NextWorkflow {
    from: string;
    to: string;
}

export function addWorkflowTask(patientID: number, task: NextWorkflow) {
    if (!sessionStorage.getItem(WorkflowSessionKeys.NextTask)) {
        sessionStorage.setItem(
            WorkflowSessionKeys.NextTask,
            JSON.stringify({ patientID, tasks: [] })
        )
    } 
    const data = JSON.parse(sessionStorage.getItem(WorkflowSessionKeys.NextTask) as any)
    if (patientID === data.patientID) {
        data.tasks.push(task)
    } else {
        data.patientID = patientID
        data.tasks = [task]
    }
    sessionStorage.setItem(WorkflowSessionKeys.NextTask, JSON.stringify(data))
}

function goToNextSessionTask(patientID: number, router: any, curRoute: any) {
    const sessionData = sessionStorage.getItem(WorkflowSessionKeys.NextTask)

    if (!sessionData) return -1

    const data = JSON.parse(sessionData)

    if (patientID != data.patientID) return -1

    let task = ''
    let index = -1
    data.tasks.forEach((t: NextWorkflow, i: number) => {
        if (t.from === curRoute.name) {
            task = t.to
            index = i
        } 
    })
    if (task) {
        data.tasks.splice(index, 1)
        sessionStorage.setItem(WorkflowSessionKeys.NextTask, JSON.stringify(data))
        router.push(task)
        return 1
    }
    return -1
}

export async function nextTask(patientID: number, router: any, curRoute: any = {}) {
   try {
        // Run a custom workflow if curRoute information is provided
        if (!isEmpty(curRoute)) {
            const sessionTask = goToNextSessionTask(patientID, router, curRoute)
            // Exit when the next task is defined in session storage
            if (sessionTask != -1) return
        }
        // Next task from workflow Engine
        const { name } = await WorkflowService.nextTask(patientID)
        if (name) {
            const taskName = name.toLowerCase()
            let task;
            // Get reference configuration for current workflow task name
            const activeApp = Apps.getActiveApp()
            if (activeApp) {
                task = activeApp.primaryPatientActivites.find(
                    (task) => {
                        return task?.workflowID === taskName || task.name.toLowerCase() === taskName
                    }
                )
                // Check workflow task config for any default actions defined
                // and run them instead of default redirection action
                if (task && typeof task.action === 'function') {
                    return task.action({ patientID, router })
                }
            }
            // Default workflow task action
            router.push({ name: task?.id ?? taskName, params: {'patient_id': patientID } })
            return
        }
    } catch (e) { 
       console.warn(e)
    }
    // Fallback redirection if workflow has no tasks/ if a funny error happens
    router.push(`/patient/dashboard/${patientID}`)
}

export async function selectActivities(programActivities: TaskInterface[], property = 'activities') {
  const activities = programActivities
    .filter(a => (typeof a.availableOnActivitySelection === 'boolean'
      && a.availableOnActivitySelection)
      || typeof a.availableOnActivitySelection !== 'boolean'
    )
    .map((activity: TaskInterface) => ({
      value: activity.workflowID
        || activity.name,
      selected: false
    }))
  
  const modal = await modalController.create({
    component: ActivitiesModal,
    cssClass:  "large-modal",
    backdropDismiss: false,
    componentProps: {
      activities,
      property
    }
  })
  modal.present();
  await modal.onDidDismiss()
}
