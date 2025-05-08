import { Service } from "./service"

export class PatientIdentifierService extends Service { 
    constructor() {
        super()
    }

    static voidIdentifier(id: number, reason: string) {
      return Service.void(`patient_identifiers/${id}`, { reason })
    }

    static update(id: number, identifier: string) {
      return super.putJson(`patient_identifiers/${id}`, { identifier })
    }
  
    static create(patientId: number, type: number, identifier: string) { 
      return super.postJson('patient_identifiers', {
        'identifier': identifier,
        'identifier_type': type, 
        'patient_id': patientId
      })
    }
}
