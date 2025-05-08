import {PatientIdentifierType} from '@/interfaces/patientIdentifierType';

export interface PatientIdentifier {
    patient_identifier_id: number;
    patient_id:            number;
    identifier:            string;
    identifier_type:       number;
    preferred:             number;
    location_id:           number;
    creator:               number;
    date_created:          Date;
    voided:                number;
    voided_by:             null;
    date_voided:           null;
    void_reason:           null;
    uuid:                  string;
    type:                  PatientIdentifierType;
}
 export const getPatientIdentifier = (patientIdentifiers: PatientIdentifier[], patientIdentifierTypeID: number): string=> {
        const identifiers = patientIdentifiers.filter(identifier => {
          return identifier.type.patient_identifier_type_id === patientIdentifierTypeID;
        });
        return identifiers.length > 0 ? identifiers[0].identifier : "";
}