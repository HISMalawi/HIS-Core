export interface ConceptName {
    concept_id:        number;
    name:              string;
    locale:            string;
    creator:           number;
    date_created:      Date;
    concept_name_id:   number;
    voided:            number;
    voided_by:         null;
    date_voided:       null;
    void_reason:       null;
    uuid:              string;
    concept_name_type: string;
    locale_preferred:  number;
}