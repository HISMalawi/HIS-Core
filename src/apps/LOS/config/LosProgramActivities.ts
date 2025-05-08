import { TaskInterface } from "../../interfaces/TaskInterface"

export const PRIMARY_ACTIVITIES: TaskInterface[] = [
  {
    id: "draw samples",
    name: "Draw Samples",
    icon: "social_history.png",
    action: ({patient}: any, router: any) => {
      router.push(`/los/forms/order/${patient.patient_id}?type=DRAW_SAMPLES`)
    }
  }
]
