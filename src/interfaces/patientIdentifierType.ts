export interface PatientIdentifierType {
    patient_identifier_type_id: number;
    name:                       string;
    description:                string;
    format:                     string;
    check_digit:                number;
    creator:                    number;
    date_created:               Date;
    required:                   number;
    format_description:         string;
    validator:                  null;
    retired:                    number;
    retired_by:                 null;
    date_retired:               null;
    retire_reason:              null;
    uuid:                       string;
}