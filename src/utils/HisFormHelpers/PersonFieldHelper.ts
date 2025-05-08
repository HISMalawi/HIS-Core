import {
    getFacilities,
    getRegions,
    getDistricts,
    getTraditionalAuthorities,
    getVillages
} from '@/utils/HisFormHelpers/LocationFieldOptions'
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field, Option } from "@/components/Forms/FieldInterface"
import Validation from "@/components/Forms/validations/StandardValidations"
import {PersonService} from "@/services/person_service"
import { EstimationFieldType } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import HisDate from "@/utils/Date"
import { DateFieldInterface } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import { Patientservice } from "@/services/patient_service"
import { isPlainObject, isEmpty } from "lodash"
import { alertConfirmation, toastWarning } from '../Alerts'
import { LocationService } from '@/services/location_service'
import { Service } from '@/services/service'

function mapToOption(listOptions: Array<string>): Array<Option> {
    return listOptions.map((item: any) => ({ 
        label: item, value: item 
    })) 
}
export default {
    resolvePerson(computedForm: any) {
        let data: any = {}
        for(const attr in computedForm) {
            const values = computedForm[attr]
            if (isPlainObject(values) && 'person' in values) {
                if (isPlainObject(values.person)) {
                    data = {...data, ...values.person}
                } else {
                    data[attr] = values['person']
                }
            }
        }
        return data   
    },
    getGivenNameField(): Field {
        return {
            id: 'given_name',
            helpText: 'First name',
            type: FieldType.TT_TEXT,
            computedValue: (val: Option) => ({person: val.value}),
            validation: (val: any) => Validation.isName(val),
            options: async (form: any) => {
                if (form.given_name) {
                    const names = await PersonService.searchGivenName(form.given_name.value)
                    return mapToOption(names)
                } 
                return []
            }
        }
    },
    getFamilyNameField(): Field {
        return {
            id: 'family_name',
            helpText: "Last name",
            type: FieldType.TT_TEXT,
            computedValue: (val: Option) => ({person: val.value}),
            validation: (val: any) => Validation.isName(val),
            options: async (form: any) => {
                if (form.family_name) {
                    const names = await PersonService.searchFamilyName(form.family_name.value)
                    return mapToOption(names)
                } 
                return []
            }
        }
    },
    getGenderField(): Field {
        return  {
            id: 'gender',
            helpText: 'Gender',
            type: FieldType.TT_SELECT,
            computedValue: (val: Option) => ({person: val.value}),
            validation: (val: any) => Validation.required(val),
            options: () => ([
                {
                    label: 'Female',
                    value: 'F'
                },
                { 
                    label: 'Male',
                    value: 'M'
                }
            ])
        }
    },
    getDobConfig(): DateFieldInterface {
        return  {
            id: 'birth_date',
            summaryLabel: 'Date of Birth',
            helpText: 'Birth',
            required: true,
            minDate: () => HisDate.estimateDateFromAge(100),
            maxDate: () => PersonService.getSessionDate(),
            estimation: {
                allowUnknown: true,
                allowUnknownMonthDay: true,
                estimationFieldType: EstimationFieldType.AGE_ESTIMATE_FIELD
            },
            computeValue: (date: string, isEstimate: boolean) => {
                return {
                    date,
                    isEstimate,
                    person: {
                        birthdate: date,
                        'birthdate_estimated': isEstimate
                    }
                }
            }
        }
    },
    getHomeRegionField(): Field {
        return {
            id: 'home_region',
            helpText: 'Region of origin',
            type: FieldType.TT_SELECT,
            group: 'person',
            requireNext: false,
            computedValue: (val: Option) => ({person: val.label}),
            validation: (val: any) => Validation.required(val),
            options: () => getRegions()
        }
    },
    getHomeDistrictField() {
        return  {
            id: 'home_district',
            helpText: 'Home District',
            type: FieldType.TT_SELECT,
            requireNext: false,
            dynamicHelpText: (f: any) => {
                if (f.home_region && f.home_region.label.match(/foreign/i)) {
                    return 'Home Country'
                }
                return 'Home District'
            },
            computedValue: (val: Option) => ({person: val.label}),
            options: (form: any) => getDistricts(form.home_region.value)
        }
    },
    addCustomLocationBtnForTAorVillage(BtnName: string, formParentAddressRef: string) {
        return {
            name: `Add ${BtnName}`,
            slot: "end",
            color: "success",
            onClick: async (f: any, c: any, field: any) => {
                 if (typeof field.filter != 'string' || field.filter.length < 3) {
                    return toastWarning(`Please enter a valid ${BtnName}`)
                 }
                 if (!isEmpty(field.filtered)) {
                    return toastWarning(`Can't add existing ${BtnName}`)
                 } 
                 const ok = await alertConfirmation(`Do you want to add ${BtnName} ${field.filter}?`)

                 if (!ok) return

                 const address = await LocationService.createAddress(BtnName, field.filter, f[formParentAddressRef].value)
                 if (address) {
                    // Hack to force the list to reload the list with new data
                    field.filter = field.filter.toUpperCase() 
                 } else {
                    return toastWarning(`Unable to add ${BtnName}`)
                 }
            }
         }
    },
    getHomeTaField() {
        return  {
            id: 'home_traditional_authority',
            helpText: 'Home TA',
            type: FieldType.TT_SELECT,
            requireNext: false,
            config: {
                showKeyboard: true,
                isFilterDataViaApi: true,
                footerBtns: [
                    this.addCustomLocationBtnForTAorVillage('TA', 'home_district')
                ]
            },
            defaultOutput: () => ({label: 'N/A', value: 'N/A'}),
            defaultComputedOutput: (f: any) => {
                if (f.home_region && f.home_region.label.match(/foreign/i)) {
                    return { person: 'Unknown'}
                }
                return null
            },
            computedValue: (val: Option) => ({person: val.label}),
            validation: (val: any) => Validation.required(val),
            options: (form: any, filter: string) => getTraditionalAuthorities(form.home_district.value, filter)
        }
    },
    getHomeVillageField() {
        return {
            id: 'home_village',
            helpText: 'Home Village',
            type: FieldType.TT_SELECT,
            config: {
                showKeyboard: true,
                isFilterDataViaApi: true,
                footerBtns: [
                    this.addCustomLocationBtnForTAorVillage('Village', 'home_traditional_authority')
                ]
            },
            requireNext: false,
            defaultOutput: () => ({ label: 'N/A', value: 'N/A' }),
            defaultComputedOutput: (f: any) => {
                if (f.home_region && f.home_region.label.match(/foreign/i)) {
                    return { person: 'Unknown'}
                }
                return null
            },
            computedValue: (val: Option) => ({person: val.label}),
            validation: (val: any) => Validation.required(val),
            options: (form: any, filter: string) => getVillages(form.home_traditional_authority.value, filter)
        }
    },
    getCurrentRegionField() {
        return {
            id: 'current_region',
            helpText: 'Current Region',
            requireNext: false,
            type: FieldType.TT_SELECT,
            computedValue: (val: Option) => ({person: val.label}),
            validation: (val: any) => Validation.required(val),
            options: () => getRegions()
        }
    },
    getCurrentDistrictField() {
        return {
            id: 'current_district',
            helpText: 'District',
            requireNext: false,
            type: FieldType.TT_SELECT,
            dynamicHelpText: (f: any) => {
                if (f.current_region && f.current_region.label.match(/foreign/i)) {
                    return 'Current Country'
                }
                return 'Current District'
            },
            computedValue: (val: Option) => ({person: val.label}),
            validation: (val: any) => Validation.required(val),
            options: (form: any) => getDistricts(form.current_region.value)
        }
    },
    getCurrentTAfield() {
        return    {
            id: 'current_traditional_authority',
            helpText: 'Current TA',
            requireNext: false,
            type: FieldType.TT_SELECT,
            config: {
                showKeyboard: true,
                isFilterDataViaApi: true,
                footerBtns: [
                    this.addCustomLocationBtnForTAorVillage('TA', 'current_district')
                ]
            },
            defaultOutput: () => ({label: 'N/A', value: 'N/A'}),
            defaultComputedOutput: (f: any) => {
                if (f.current_region && f.current_region.label.match(/foreign/i)) {
                    return { person: 'Unknown'}
                }
                return null
            },
            computedValue: (val: Option) => ({person: val.label}),
            validation: (val: any) => Validation.required(val),
            options: (form: any, filter: string) => getTraditionalAuthorities(form.current_district.value, filter)
        }
    },
    getCurrentVillageField() {
        return {
            id: 'current_village',
            helpText: 'Current Village',
            requireNext: false,
            type: FieldType.TT_SELECT,
            config: {
                showKeyboard: true,
                isFilterDataViaApi: true,
                footerBtns: [
                    this.addCustomLocationBtnForTAorVillage('Village', 'current_traditional_authority')
                ]
            },
            defaultOutput: () => ({label: 'N/A', value: 'N/A'}),
            defaultComputedOutput: (f: any) => {
                if (f.current_region && f.current_region.label.match(/foreign/i)) {
                    return { person: 'Unknown'}
                }
                return null
            },
            computedValue: (val: Option) => ({person: val.label}),
            validation: (val: any) => Validation.required(val),
            options: (form: any, filter: string) => getVillages(form.current_traditional_authority.value, filter)
        }
    },
    getCellNumberField() {
        return   {
            id: 'cell_phone_number',
            helpText: 'Cell phone number',
            group: 'person',
            type: FieldType.TT_TEXT,
            computedValue: (val: Option) => ({person: val.label}),
            validation: (val: any) => {
                if (val) {
                    if (val.value.match(/Unknown|n\/a/i)) {
                        return null
                    }
                    for(const number of `${val.value}`.split('/')) {
                        if (Validation.isMWPhoneNumber({label: number, value: number})) {
                            return [`"${number}" is not a valid phone number`]
                        }
                    }
                    return null
                }
                return ['Phone number cannot be empty']
            },
            config: {
                customKeyboard: [
                    [
                        ['1', '2', '3'],
                        ['4', '5', '6'],
                        ['7', '8', '9'],
                        ['',  '0', '']
                    ],
                    [ 
                        [ '+265', '/'],
                        [ 'Unknown', 'N/A' ],
                        [ 'Delete' ]
                    ]
                ]
            }
        }
    },
    getLandmarkFields(): Field[] {
        return [
            {
                id: 'default_landmarks',
                proxyID: 'landmark',
                helpText: 'Closest Landmark or Plot Number',
                type: FieldType.TT_SELECT,
                appearInSummary: (f: any) => f.default_landmarks.value != 'Other',
                computedValue: (val: Option) => ({person: val.value}),
                validation: (val: any) => Validation.required(val),
                options: () => mapToOption([
                    'Catholic Church',
                    'CCAP',
                    'Seventh Day',
                    'Mosque',
                    'Primary School',
                    'Borehole',
                    'Secondary School',
                    'College',
                    'Market',
                    'Football Ground',
                    'Other'
                ])
            },
            {
                id: 'other_landmark',
                proxyID: 'landmark',
                helpText: 'Closest Landmark or Plot Number',
                type: FieldType.TT_NOTE,
                condition: (f: any) => f.default_landmarks.value === 'Other',
                computedValue: (val: Option) => ({person: val.value}),
                validation: (v: Option) => Validation.required(v)
            }
        ]
    },
    getFacilityLocationField() {
        return  {
            id: 'location',
            helpText: 'Please select facility name',
            type: FieldType.TT_SELECT,
            computedValue: (val: Option) => ({person: val.label}),
            validation: (val: any) => Validation.required(val),
            options: (_: any, filter='') => getFacilities(filter),
            config: {
                showKeyboard: true,
                isFilterDataViaApi: true
            }
        }
    },
    getPersonNameFromPersonObj(personObj: any, type: 'given_name' | 'family_name') {
        if (personObj.names.length) {
            return personObj.names[0][type]
        }
        return ''
    },
    getAttrFromPersonObj(personObj: any, type: 'Landmark Or Plot Number' | 'Cell Phone Number') {
        if (Array.isArray(personObj.person_attributes) && personObj.person_attributes.length) {
            return personObj.person_attributes.reduce((v: string, c: any) => {
                if (c.type.name === type) {
                    return c.value
                }
                return v
            }, '')
        }
        return ''
    },
    getAddressFromPersonObj(personObj: any, 
        type: 'home_region' | 
        'home_district' | 
        'home_region' | 
        'home_village' | 
        'home_traditional_authority' | 
        'current_region' |
        'current_traditional_authority' | 
        'current_district') {
        if (Array.isArray(personObj.addresses) && personObj.addresses.length) {
            const address: any = personObj.addresses[0]
            const addressMap: Record<string, string> = {
                'home_district': 'address2', 
                'home_village': 'neighborhood_cell',
                'home_traditional_authority': 'county_district', 
                'current_village': 'city_village',
                'current_traditional_authority' : 'township_division',
                'current_district': 'state_province'
            }
            return address[addressMap[type]]
        }
        return ''
    },
    mapPersonData(personObj: any) {
        const givenName = this.getPersonNameFromPersonObj(personObj, 'given_name')
        const familyName = this.getPersonNameFromPersonObj(personObj, 'family_name')
        const homeDistrict = this.getAddressFromPersonObj(personObj, 'home_district')
        const homeVillage = this.getAddressFromPersonObj(personObj, 'home_village')
        const homeTA = this.getAddressFromPersonObj(personObj, 'home_traditional_authority')
        return {
            'id': personObj.person_id,
            'name': `${givenName} ${familyName}`,
            'given_name': givenName,
            'family_name': familyName,
            'gender': personObj.gender,
            'birth_date': personObj.birthdate,
            'birthdate_estimated': personObj.birthdate_estimated,
            'home_district': homeDistrict,
            'home_village': homeVillage,
            'home_traditional_authority': homeTA,
            'home_address': `${homeDistrict} ${homeVillage}`,
            'current_district': this.getAddressFromPersonObj(personObj, 'current_district'),
            'current_traditional_authority': this.getAddressFromPersonObj(personObj, 'current_traditional_authority'),
            'cell_phone_number': this.getAttrFromPersonObj(personObj, 'Cell Phone Number'),
            'landmark': this.getAttrFromPersonObj(personObj, 'Landmark Or Plot Number')
        }
    },
    getPersonAttributeOptions(person: any) {
        const patient = new Patientservice(person);
        const prop = (patient: any, prop: string) => prop in patient ? patient[prop]() : '-'
        return {
            label: patient.getPatientInfoString(),
            value: patient.getID() || patient.getNationalID(),
            other: {
                patientID: patient.getID(),
                npid: patient.getNationalID(),
                person,
                options: [
                    {
                        label: "National ID",
                        value: prop(patient, 'getNationalID')
                    },
                    {
                        label: 'ARV Number',
                        value: prop(patient, 'getArvNumber'),
                        other: {
                            show: () => Service.getProgramName() === "ART" 
                        }
                    },
                    {
                        label: "Name",
                        value: prop(patient, 'getFullName'),
                    },
                    {
                        label: "Gender",
                        value: prop(patient, 'getGender'),
                    },
                    {
                        label: "Birthdate",
                        value: prop(patient, 'getBirthdate'),
                    },
                    {
                        label: "Home District",
                        value: prop(patient, 'getHomeDistrict'),
                    },
                    {
                        label: "Home Village",
                        value: prop(patient, 'getHomeVillage'),
                    },
                    {
                        label: "Current District",
                        value: prop(patient, 'getCurrentDistrict'),
                    },
                    {
                        label: "Current T/A",
                        value: prop(patient, 'getCurrentTA'),
                    },
                    {
                        label: 'Cellphone',
                        value: prop(patient, 'getPhoneNumber')
                    }
                ]
            }
        }    
    }
}
