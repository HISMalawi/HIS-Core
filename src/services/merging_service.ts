import { Service } from "./service"

export interface MergeHistory {
    id: number;
    primary_id: number;
    secondary_id: number;
    merge_date: string;
    merge_type: string;
    primary_first_name: string;
    primary_surname: string;
    primary_gender: string;
    primary_birthdate: string;
    secondary_first_name: string;
    secondary_surname: string;
    secondary_gender: string;
    secondary_birthdate: string;
}

export class MergingService extends Service {
    static getMergeHistory(identifier: string): Promise<MergeHistory[] | undefined> {
        return this.getJson(`/rollback/merge_history`, {
            identifier
        })
    }

    static rollback(patientID: number) {
        return this.postJson(`/rollback/rollback_patient`, {
            'patient_id': patientID,
            'program_id': this.getProgramID()
        })
    }
}
