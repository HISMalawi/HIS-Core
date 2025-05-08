import { Service } from "./service"

export interface NewAttribute {
    person_id: number;
    person_attribute_type_id: number;
    value: number | string;
}

export class PersonAttributeService extends Service { 
    constructor() {
        super()
    }

    static create(attributes: Array<NewAttribute>) { 
        return super.postJson('/person_attributes', attributes) 
    }
}
