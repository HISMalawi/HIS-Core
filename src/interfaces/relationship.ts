import { Person } from "./person";
import { RelationshipType } from "./relationshipType";

export interface Relationship {
    relationship_id: number;
    person_a:        number;
    relationship:    number;
    person_b:        number;
    creator:         number;
    date_created:    Date;
    voided:          number;
    voided_by:       null;
    date_voided:     null;
    void_reason:     null;
    uuid:            string;
    type:            RelationshipType;
    relation:        Person;
}