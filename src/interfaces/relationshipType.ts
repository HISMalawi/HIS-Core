export interface RelationshipType {
    relationship_type_id: number;
    a_is_to_b:            string;
    b_is_to_a:            string;
    preferred:            number;
    weight:               number;
    description:          string;
    creator:              number;
    date_created:         Date;
    uuid:                 string;
    retired:              boolean;
    retired_by:           null;
    date_retired:         null;
    retire_reason:        null;
}