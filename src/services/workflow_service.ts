import { Service } from "./service";

export class WorkflowService extends Service {
    constructor() {
        super()
    }

    static nextTask(patientID: number) {
        return super.getJson(`/workflows/${super.getProgramID()}/${patientID}`, {
            date: super.getSessionDate()
        });
    }

    static async getNextTaskParams(patientID: number, taskName='') {
        let task: string = taskName
        try {
            if (!task) {
                const { name } = await WorkflowService.nextTask(patientID)
                task = name
            }
        } catch(e) {
            task = ''
        }
        return {
            name: task.toLowerCase(),
            params: {
                'patient_id': patientID
            }
        }
    }
}
