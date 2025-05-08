import { ref } from "vue";
import Store from '@/composables/ApiStore';

export interface CurrentLocation {
  location_id:       number;
  name:              string;
  description:       string;
  address1:          string;
  address2:          string;
  city_village:      string;
  state_province?:    string;
  postal_code:       string;
  country:           string;
  latitude?:          string;
  longitude?:         string;
  creator:           number;
  date_created:      Date;
  county_district?:   string;
  neighborhood_cell?: string;
  region?:            string;
  subregion?:         string;
  township_division?: string;
  retired:           boolean;
  retired_by?:        number;
  date_retired?:      string;
  retire_reason?:     string;
  location_type_id?:  number;
  parent_location?:   string;
  uuid:              string;
  district:          string;
}

const facilityName = ref("");
const facilityUUID = ref("");
const district = ref("");

async function setLocation(){
  const location: CurrentLocation = await Store.get("CURRENT_LOCATION");
  facilityName.value = location.name;
  facilityUUID.value = location.uuid;
  district.value = location.district;

  // Maintained for backward compatibility
  sessionStorage.setItem('locationName', facilityName.value)
  sessionStorage.setItem('location', facilityName.value)
  sessionStorage.setItem('siteUUID', facilityUUID.value)
}

export default function useFacility() {
  return {
    facilityName,
    facilityUUID,
    district,
    setLocation,
  }
}