export interface PersonAttributeType {
    person_attribute_type_id: number;
    name:                     string;
    description:              string;
    format:                   string;
    foreign_key:              null;
    searchable:               number;
    creator:                  number;
    date_created:             Date;
    changed_by:               number;
    date_changed:             Date;
    retired:                  number;
    retired_by:               null;
    date_retired:             null;
    retire_reason:            null;
    edit_privilege:           null;
    uuid:                     string;
    sort_weight:              number;
}