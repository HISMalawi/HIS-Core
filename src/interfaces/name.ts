export interface Name {
    person_name_id:     number;
    preferred:          number;
    person_id:          number;
    prefix:             null;
    given_name:         string;
    middle_name:        null;
    family_name_prefix: null;
    family_name:        string;
    family_name2:       null;
    family_name_suffix: null;
    degree:             null;
    creator:            number;
    date_created:       Date;
    voided:             number;
    voided_by:          null;
    date_voided:        null;
    void_reason:        null;
    changed_by:         null;
    date_changed:       null;
    uuid:               string;
}

export const getFullName = (name: Name): string=>{
    const firstName = name.given_name;
    const lastName = name.family_name;
    const middleName = name.middle_name ? name.middle_name : '';
    return `${firstName} ${middleName} ${lastName}`
}