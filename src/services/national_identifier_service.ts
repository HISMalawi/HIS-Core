import { toSentenceCase } from "@/utils/Strs";
import { Patientservice } from "./patient_service";
import { MALAWI_NATIONAL_ID_TYPE } from "@/constants";
import { PatientRegistrationService } from "./patient_registration_service";
import { parseNrbQr } from "nrb-qr-parser"

const DATA_MAPPING: any = {
    "male": "M",
    "female": "F",
    "m": "M",
    "f": "F"
}

export default class MwiNationalIdentifierService {
    patient?: Patientservice;
    identity?: any;
    parseQrCode(code: string) {
        this.identity = parseNrbQr(code)
        return this.identity
    }

    fmt(attr: string) {
        return DATA_MAPPING[`${attr}`.replace(/\s/g,'').toLowerCase()]||attr
    }

    async findPatientByID() {
        const res = await Patientservice.findByOtherID(MALAWI_NATIONAL_ID_TYPE, this.identity?.identifier||'-1')
        if (Array.isArray(res) && res.length === 1) {
            this.patient = new Patientservice(res[0])
        }
        return res
    }

    findByDemographics() {
        return Patientservice.search({
            given_name: this.identity?.given_name,
            family_name: this.identity?.family_name,
            gender: this.fmt(this.identity?.gender),
            birthdate: this.identity?.birthdate
        })
    }

    hasIdentifierCode() {
        return `${this.identity.identifier||''}`.length === 8
    }

    isDocComplete() {
        return [
            'given_name',
            'family_name',
            'gender',
            'birthdate',
            'identifier'
        ].every((k) => `${this.identity[k]||''}`.replace(/\s/g,'').length > 0)
    }

    verifyIdentity() {
        const dbInfo: any = {
            given_name: this.patient?.getGivenName()||'',
            family_name: this.patient?.getFamilyName()||'',
            gender: this.patient?.getGender()||'',
            birthdate: this.patient?.getBirthdate()||''
        }
        const normalise = (attr: string) => this.fmt(`${attr}`.replace(/\s/g, '').toLowerCase())
        return Object.keys(dbInfo).reduce((a: any, c: string) => {
            if (normalise(this.identity[c]) != normalise(dbInfo[c])) {
                a.push([toSentenceCase(`${c}`.replaceAll('_', ' ')), this.identity[c], dbInfo[c]])
            } 
            return a
        }, [])
    }

    syncWithIdData() {
        const reg = new PatientRegistrationService()
        reg.setPersonID(this.patient?.getID()||-1)
        return reg.updatePerson(this.identity)
    }
}
