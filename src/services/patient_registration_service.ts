import { Service } from "./service"
import { ProgramService } from "@/services/program_service";
import { Person } from "@/interfaces/person"
import { PersonService } from "@/services/person_service"
import { PersonAttributeService } from '@/services/person_attributes_service'
import { printNpidLbl } from "@/views/Labels";

export class PatientRegistrationService extends Service {
    personId: number
    constructor() {
        super()
        this.personId = 0
    }

    getPersonID() {
        return this.personId
    }

    setPersonID(personID: number) {
        this.personId = personID
    }

    async registerPatient(person: any, personAttributes: any) {
        await this.createPerson(person)
        await this.createPersonAttributes(personAttributes)
        const patient = await this.createPatient()
        await this.printPatient()
        return patient
    }

    async registerGuardian(person: any) {
        return this.createPerson(person)
    }

    updatePerson(person: any) {
       return new PersonService(person).update(this.personId)
    }

    async createPerson(person: any) {
        const data: Person = await new PersonService(person).create()
        this.personId = data.person_id
        return data
    }

    createPatient() {
        return ProgramService.createPatient(this.personId)
    }

    async createPersonAttributes(attributes: Array<any>) {
        for(const index in attributes) {
            await PersonAttributeService.create({
                ...attributes[index],
                'person_id': this.personId
            })
        }
    }

    printPatient() {
        return printNpidLbl(this.personId)
    }
}
