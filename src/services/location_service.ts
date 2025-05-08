import { Service } from '@/services/service'
import { ConceptService } from '@/services/concept_service';

export class LocationService extends Service {
    constructor() {
        super()
    }

    static async getInternalSections() {
        const sections: Array<any> = await super.getJson('internal_sections');
        return sections.map((s: any) => ({
            value: s.id,
            label: `${s?.name}`.toUpperCase(),
            other: s
        }));
    }

    static createInternalSection(name: string) {
        return super.postJson('internal_sections', { name })
    }

    static getLocation(locationID: number) {
        return this.getJson(`locations/${locationID}`)
    }

    static getCurrentLocation() {
        return this.getJson('/locations/current_facility')
    }

    static createAddress(type: string, name: string, parentLocation: number) {
        return this.postJson('addresses', {
            'address_type': type,
            'addresses_name': name,
            'parent_location': parentLocation
        })
    }

    static getLabs(params={} as Record<string, string | number>) {
        return super.getJson(`/programs/${Service.getProgramID()}/lab_tests/labs`, params)
    }

    static getFacilities(params={} as Record<string, string | number>) {
        return super.getJson('/locations', params)
    }

    static async getSpecialistClinics() {
       const conceptId = await ConceptService.getConceptID('Specialist clinic')       
       return super.getJson('/concept_set', {id:conceptId})
    }

    static getRegions() {
        return super.getJson('/regions')
    }

    static getDistricts(regionID: number) {
        return super.getJson('/districts', {'region_id': regionID, 'page_size': 1000})
    }

    static getVillages(traditionalAuthorityID: number, name='') {
        return super.getJson('/villages', {'traditional_authority_id': traditionalAuthorityID, name})
    }

    static getTraditionalAuthorities(villageID: number, name='') {
        return super.getJson('/traditional_authorities', { 'district_id': villageID, name })
    }
}
