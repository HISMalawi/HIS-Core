export interface Location {
    location_id:       number;
    name:              string;
    description:       string;
    address1:          string;
    address2:          string;
    city_village:      string;
    state_province:    string;
    postal_code:       string;
    country:           string;
    latitude:          string;
    longitude:         string;
    creator:           number;
    date_created:      Date;
    county_district:   null;
    neighborhood_cell: null;
    region:            null;
    subregion:         null;
    township_division: null;
    retired:           boolean;
    retired_by:        null;
    date_retired:      null;
    retire_reason:     null;
    location_type_id:  null;
    parent_location:   null;
    uuid:              string;
}