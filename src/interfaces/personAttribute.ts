import { PersonAttributeType } from '@/interfaces/personAttributeType';
export interface PersonAttribute {
    person_attribute_id?: number;
    person_id: number;
    value: string;
    person_attribute_type_id: number;
    creator?: number;
    date_created?: Date;
    changed_by?: null;
    date_changed?: null;
    voided?: number;
    voided_by?: null;
    date_voided?: null;
    void_reason?: null;
    uuid?: string;
    type?: PersonAttributeType;
}

export const getPersonAttribute = (personAttributes: PersonAttribute[], personAttributeTypeID: number) => {
    const attributes = personAttributes.filter(attr => {
        return attr.person_attribute_type_id == personAttributeTypeID;
    });
    return attributes.length > 0 ? attributes[0].value : "";
}