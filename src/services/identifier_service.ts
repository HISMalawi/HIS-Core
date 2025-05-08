import { Service } from "./service";

export interface DuplicateIdentifiersInterface {
    count: number;
    identifier: string;
}

export class IdentifierService extends Service {
    identifierType: number
    constructor() {
        super()
        this.identifierType = -1
    }
 
    static getIdentifierTypes() {
        return super.getJson('types/patient_identifiers')
    }

    static async arvNumberExists(arvNumber: string): Promise<boolean> {
        const data = await super.getJson(`programs/${super.getProgramID()}/lookup_arv_number/${arvNumber}`)
        return data.exists
    }

    getIdentifierType() {
        return this.identifierType
    }

    setIdentifierType(type: number) {
        this.identifierType = type
    }

    getDuplicateIndentifiers(): Promise<DuplicateIdentifiersInterface[]> {
        return Service.getJson(`search/identifiers/duplicates`, {
            'type_id': this.identifierType
        })
    }

    getPatientsByIdentifier(identifier: string) {
        return Service.getJson(`search/patients/by_identifier`,{
            'type_id': this.identifierType,
            'identifier': identifier
        })
    }
    
    getMultipleIdentifiers() {
        return Service.getJson(`search/identifiers/multiples`, {
            'type_id': this.identifierType
        })
    }

    voidMultipleIdentifiers(identifiers: [any], reasons: string,  idType: number) {
        const params: any = { identifiers: identifiers, reason: reasons, "identifier_type": idType }
        return Service.void(`void_multiple_identifiers`,  params );
    }
}
