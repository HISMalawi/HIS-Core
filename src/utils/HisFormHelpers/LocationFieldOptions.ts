import {LocationService} from "@/services/location_service"
import { Option } from "@/components/Forms/FieldInterface"
import { isEmpty } from "lodash"

export async function getFacilities(filter=''): Promise<Option[]> {
    const facilities = await LocationService.getFacilities({name: filter})
    return facilities.filter((f: any) => !isEmpty(f) && f.name.trim() !='')
        .map((facility: any) => ({
            label: facility.name,
            value: facility.location_id,
            other: facility
        }))
}

export async function getLabFacilities(filter=''): Promise<Option[]> {
    const facilities = await LocationService.getLabs({'search_name': filter})
    return facilities.map((facility: any) => ({
            label: facility,
            value: facility
        }))
}

export async function getFacilityWards(filter=''): Promise<Option[]> {
    const wards = await LocationService.getFacilities({
        name: filter,
        tag: 'Facility adult sections'
    })

    return wards.map((ward: any) => ({
        label: ward.name,
        value: ward.name,
        other: ward
    }))
}

export async function getSpecialistClinics(): Promise<Option[]> {
    const clinics = await LocationService.getSpecialistClinics()
    return clinics.map((clinic: any) => ({
        label: clinic.name,
        value: clinic.name,
        other: clinic
    }))
}

export async function getRegions(): Promise<Option[]> {
    const regions = await LocationService.getRegions()
    return regions.map((region: any) => ({
        label: region.name,
        value: region.region_id,
        other: region
    }))
}

export async function getDistricts(regionID: number): Promise<Option[]> {
    const districts = await LocationService.getDistricts(regionID)
    return districts.map((district: any) => ({
        label: district.name,
        value: district.district_id,
        other: district
    }))
}

export async function getTraditionalAuthorities(districtID: number, name=''): Promise<Option[]> {
    const TAs = await LocationService.getTraditionalAuthorities(districtID, name)
    return TAs.map((TA: any) => ({
        label: TA.name,
        value: TA.traditional_authority_id,
        other: TA
    }))
}

export async function getVillages(traditionalAuthorityID: number, name=''): Promise<Option[]> {
    const villages = await LocationService.getVillages(traditionalAuthorityID, name)
    return villages.map((village: any) => ({
        label: village.name,
        value: village.village_id,
        other: village
    }))
}
