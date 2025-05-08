import { Person } from "@/interfaces/person"
import { Service } from "./service"

export interface NewPerson {
    person_id?: number;
    given_name: string;
    family_name: string;
    gender: string;
    birthdate: string;
    birthdate_estimated: boolean;
    home_district: string;
    home_traditional_authority: string;
    home_village: string;
    current_district: string;
    current_traditional_authority: string;
    current_village: string;
    landmark: string;
    cell_phone_number: string;
    occupation: string;
    facility_name: string;
    patient_type?: string;
    relationship?: string;
}

export class PersonService extends Service{
    person: Person | NewPerson
    constructor(person: NewPerson | Person){
        super()
        this.person = person
    }

    create() { return Service.postJson('/people', this.person) }

    update(id: number) { return Service.putJson(`people/${id}`, {
        ...this.person, 'program_id': Service.getProgramID()
    })}

    static getPersons(clients: number[]) {
        return super.getJson('clients', { person_ids: clients.join(',') })
    }

    static getTBPersons(clients: number[]) {
        return super.getJson('tb_clients', { person_ids: clients.join(',') })
    }

    static searchFamilyName(name: string) {
        return super.getJson('/search/family_name', {'search_string': name})
    }

    static searchGivenName(name: string) {
        return super.getJson('/search/given_name', {'search_string': name})
    }

    static async getPersonFullName(personId: string | number) {
        const names = await super.getJson(`/people/${personId}/names`)
        return names && names.length ? names[0].given_name + ' ' + names[0].family_name : ''
    }
}
