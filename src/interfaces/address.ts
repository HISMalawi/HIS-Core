export interface Address {
    person_address_id: number;
    person_id:         number;
    preferred:         number;
    address1:          null;
    address2:          string;
    city_village:      string;
    state_province:    string;
    postal_code:       null;
    country:           null;
    latitude:          null;
    longitude:         null;
    creator:           number;
    date_created:      Date;
    voided:            number;
    voided_by:         null;
    date_voided:       null;
    void_reason:       null;
    county_district:   string;
    neighborhood_cell: string;
    region:            null;
    subregion:         null;
    township_division: string;
    uuid:              string;
}