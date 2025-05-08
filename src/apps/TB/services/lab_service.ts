import { Service } from "@/services/service";
import { ObservationService } from "@/services/observation_service";
import dayjs from "dayjs";
import { toDate } from "@/utils/Strs";

export class LabService extends Service {
    static getRecentOrders(patientID: number, date=super.getSessionDate()) {
        return Service.getJson(`patients/${patientID}/most_recent_lab_order`, {
            patient_id: patientID,
            program_id: Service.getProgramID(),
            date
        })
    }

    static async formatOrderObs(data: any) {
        let index = 0
        const items: any = []
        for (const obs of data.observations) {
            const concept = obs.concept?.concept_names?.[0]?.name
            if (/test type/i.test(concept)) {
                if (items.length) ++index
                items[index] = {}
            }
            if (["Lab", "Test requested", "Sample", "Reason for test"].includes(concept)) {
                items[index][concept] = (await ObservationService.resolvePrimaryValue(obs)) ?? "Unk"
                items[index]["time"] = dayjs(obs.obs_datetime).format("HH:mm")
                items[index]["date"] = toDate(obs.obs_datetime)
            }
        }
        return items
    }
}
