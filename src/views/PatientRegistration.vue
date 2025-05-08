<template>
  <ion-page>
    <his-standard-form
        @onIndex="fieldComponent=''"
        :skipSummary="true"
        :activeField="fieldComponent"
        :fields="fields"
        :onFinishAction="onFinish"
    />
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field, Option } from "@/components/Forms/FieldInterface"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import Validation from "@/components/Forms/validations/StandardValidations"
import { Patientservice } from "@/services/patient_service"
import HisDate from "@/utils/Date"
import { STANDARD_DATE_FORMAT } from "@/utils/Date"
import { WorkflowService } from "@/services/workflow_service"
import { isPlainObject, isEmpty } from "lodash"
import PersonField from "@/utils/HisFormHelpers/PersonFieldHelper"
import { PatientRegistrationService } from "@/services/patient_registration_service"
import App from "@/apps/app_lib"
import { AppInterface } from "@/apps/interfaces/AppInterface"
import { nextTask } from "@/utils/WorkflowTaskHelper"
import { isValueEmpty } from "@/utils/Strs"
import { PatientDemographicsExchangeService } from "@/services/patient_demographics_exchange_service"
import { toastDanger, toastWarning } from "@/utils/Alerts"
import { PatientTypeService } from "@/apps/ART/services/patient_type_service";
import { IonPage } from "@ionic/vue"
import { infoActionSheet } from "@/utils/ActionSheets"
import dayjs from "dayjs";
import { delayPromise } from "@/utils/Timers";
import Store from "@/composables/ApiStore"
import { NID_CONFIG } from "@/components/Keyboard/HisKbConfigurations";

export default defineComponent({
  components: { HisStandardForm, IonPage },
  data: () => ({
    app: App.getActiveApp() as AppInterface,
    ddeInstance: {} as any,
    ddeDocID: '' as string,
    ddeIsReassign: false as boolean,
    skipSummary: false as boolean,
    currentAddressAttributes: [
        'current_region',
        'current_district',
        'current_village',
        'current_traditional_authority'
    ] as string[],
    homeAddressAttributes: [
        'home_region',
        'home_district',
        'home_traditional_authority',
        'home_village'
    ] as string[],
    hasIncompleteData: false as boolean,
    patient: {} as any,
    editPersonData: {} as any,
    editPerson: -1 as number,
    personAttribute: '' as string,
    activeField: '' as string,
    fieldComponent: '' as string,
    fields: [] as Array<Field>,
    isMilitarySite: false,
    presets: {} as any,
    registrationSummary: {} as any,
    form: {} as Record<string, Option> | Record<string, null>,
    ddeEnabled: false as boolean,
  }),
  watch: {
    '$route': {
        async handler({query}: any) {
           this.ddeInstance = new PatientDemographicsExchangeService()
           if (query.edit_person) {
                this.ddeIsReassign = query.dde_reassign
                this.ddeDocID = query.doc_id
                this.ddeInstance.setPatientID(query.edit_person)
                if(query.person_attribute) this.personAttribute = query.person_attribute
                await this.initEditMode(query.edit_person)
            } else {
                this.presets = query
            }
            this.fields = this.getFields()
        },
        immediate: true,
        deep: true
    }
  },
  methods: {
    getFields(): Array<Field> {
        let fields: Array<Field> = []
        fields.push(this.personIndexField())
        fields.push(this.givenNameField())
        fields.push(this.familyNameField())
        fields.push(this.genderField())
        fields.push(this.searchResultField())
        fields = fields.concat(this.dobFields())
        fields.push(this.homeRegionField())
        fields.push(this.homeDistrictField())
        fields.push(this.homeTAField())
        fields.push(this.homeVillageField())
        fields.push(this.currentAddressSameAsHome())
        fields.push(this.currentRegionField())
        fields.push(this.currentDistrictField())
        fields.push(this.currentTAField())
        fields.push(this.currentVillage())
        fields = fields.concat(this.landmarkFields())
        fields.push(this.cellPhoneField())
        fields.push(this.patientTypeField())
        fields.push(this.facilityLocationField())
        fields.push(this.occupationField())
        fields.push(this.relationshipField())
        fields.push(this.hasMalawiNationalIdField())
        fields.push(this.malawiNationalIdField())
        fields.push(this.possibleDuplicatesField())
        fields.push(this.patientRegistrationSummary())
        return fields
    },
    isEditMode() {
        return this.editPerson >= 1
    },
    isMinor(computedData: any) {
        const dob: string = this.presets?.birthdate||computedData?.birth_date?.date
        return dob 
            ? dayjs(PatientRegistrationService.getSessionDate()).diff(dob, 'years') < 18
            : false
    },
    async initEditMode(personId: number) {
        this.editPerson = personId
        this.patient = await Store.get('ACTIVE_PATIENT', { patientID: parseInt(`${this.editPerson}`)})
        const {
            ancestryDistrict,
            ancestryTA,
            ancestryVillage,
            currentDistrict,
            currentVillage,
            currentTA
        } = this.patient.getAddresses()
        this.editPersonData = {
            'given_name': this.patient.getGivenName(),
            'family_name': this.patient.getFamilyName(),
            'gender': this.patient.getGender(),
            'birthdate': this.patient.getBirthdate(),
            'home_district': ancestryDistrict,
            'home_traditional_authority': ancestryTA,
            'home_village': ancestryVillage,
            'current_district': currentDistrict,
            'current_village': currentVillage,
            'current_traditional_authority': currentTA,
            'cell_phone_number': this.patient.getPhoneNumber(),
            'landmark': this.patient.getClosestLandmark(),
            'occupation': this.patient.getOccupation(),
            'national_id': this.patient.getMWNationalID()
        }
        this.presets = this.editPersonData
        this.skipSummary = true
        if(this.personAttribute) {
            this.activeField = this.personAttribute
            this.fieldComponent = this.activeField
        }
    },
    async onFinish(form: Record<string, Option> | Record<string, null>, computedData: any) {
        if (!this.isEditMode()) {
            return this.create(form, computedData)
        } else {
            if (form.malawi_national_identifier?.value) { 
                await this.patient.updateMWNationalId(form.malawi_national_identifier?.value)
                this.editPersonData.national_id = form.malawi_national_identifier?.value
            }
            return this.update(computedData)
        }
    },
    async create(f: any, computedData: any) {
        let person: any = PersonField.resolvePerson(computedData)
        person = this.presets.nationalIDStatus == "true" ? this.appendNationalIDData(person) : person
        const attributes: Array<any> = this.resolvePersonAttributes(computedData)
        const registration: any = new PatientRegistrationService()
        const patient = new Patientservice((await registration.registerPatient(person, attributes)))
        const patientID = registration.getPersonID()

        Store.set('ACTIVE_PATIENT', patient) // update patient store
 
        let malawiNationalID = ''

        if (this.presets.nationalIDStatus == "true") {
            malawiNationalID = this.presets?.identifier
        } else if (f.has_malawi_id?.value === 'Yes') {
            malawiNationalID = f.malawi_national_identifier?.value
        }

        if(malawiNationalID) { 
            this.patient = patient
            await this.patient.updateMWNationalId(malawiNationalID)
            Store.invalidate('ACTIVE_PATIENT')
        }

        if (this.app.onRegisterPatient) {
            const exit = await this.app.onRegisterPatient(
                patientID, person, attributes, this.$router, this.$route
            )
            if (exit) return
        }
        if (person.relationship === 'Yes') {
            return this.$router.push(`/guardian/registration/${patientID}`)
        }
        await nextTask(patientID, this.$router)
    },
    appendNationalIDData(person: any){
       return Object.assign(person,{
            'given_name': this.presets.given_name,
            'family_name': this.presets.family_name,
            'gender': this.presets.gender,
            'birthdate': this.presets.birthdate,
            'birthdate_estimated': false
        })
    },
    async update(computedData: any) {
        const person: any = PersonField.resolvePerson(computedData)
        const update = new PatientRegistrationService()

        update.setPersonID(this.editPerson)
        await update.updatePerson(person)
        for(const attr in person) {
            if (attr in this.editPersonData) {
                this.editPersonData[attr] = person[attr]
            }
        }
        Store.invalidate('ACTIVE_PATIENT')
        if(!this.personAttribute) return this.fieldComponent = 'edit_user'
        this.$router.back()
    },
    editConditionCheck(attributes=[] as Array<string>): boolean {
        if (this.isEditMode() && !attributes.includes(this.activeField)) {
            return false
        }
        return true
    },
    async confirmPatient() {
        // Attempt to assign or reassign a patient's NPID if they dont have a valid one
        if (this.ddeEnabled && (!this.patient.getDocID() 
            || (this.patient.getDocID() && this.patient.getNationalID().match(/unknown/i)))) {
                try {
                    await this.patient.assignNpid()
                    await this.patient.printNationalID()
                    await delayPromise(300)
               } catch (e) {
                    toastDanger(`Failed to assign new NPID: ${e}`)
                }
        }
        this.$router.push(`/patients/confirm?person_id=${this.patient.getID()}`)
    },
    resolvePersonAttributes(form: Record<string, Option> | Record<string, null>) {
        return Object.values(form)
                    .filter((d: any) => isPlainObject(d) && 'personAttributes' in d)
                    .map(({personAttributes}: any) => personAttributes)
    },
    mapToOption(listOptions: Array<string>): Array<Option> {
        return listOptions.map((item: any) => ({ label: item, value: item }))
    },
    givenNameField(): Field {
        const name: Field = PersonField.getGivenNameField()
        name.condition = () => this.editConditionCheck(['given_name']) && (!this.presets.given_name && this.presets.nationalIDStatus == 'true' || this.presets.nationalIDStatus != "true")
        name.defaultValue = () => this.presets.given_name
        return name
    },
    familyNameField(): Field {
        const name: Field = PersonField.getFamilyNameField()
        name.condition = () => this.editConditionCheck(['family_name']) && (!this.presets.family_name && this.presets.nationalIDStatus == 'true' || this.presets.nationalIDStatus != "true")
        name.defaultValue = () => this.presets.family_name
        return name
    },
    genderField(): Field {
        const IS_ANC_APP = this.app.applicationName === 'ANC'
        const IS_CXCA = this.app.applicationName === 'CxCa'
        const gender: Field = PersonField.getGenderField()
        gender.requireNext = this.isEditMode()
        gender.defaultValue = () => this.presets.gender
        gender.condition = () => {
            if (!this.isEditMode() && (IS_ANC_APP || IS_CXCA)) {
                return false
            }
            return this.editConditionCheck(['gender']) && (!this.presets.gender && this.presets.nationalIDStatus == 'true' || this.presets.nationalIDStatus != "true")
        }
        if ((IS_ANC_APP || IS_CXCA) && !this.isEditMode()) {
            gender.defaultOutput = () => ({ label: 'Female', value: 'F' })
            gender.defaultComputedOutput = () => ({ person: 'F' })
        } 

        gender.beforeNext = async (data: Option) => {
            /**
             * Provide warning when changing gender in edit mode
            */
            const newGender = data.value
            const oldGender = this.presets.gender
            if (this.isEditMode() && newGender != oldGender) {
                const action = await infoActionSheet(
                    'Warning',
                    `Changing gender from ${oldGender} to ${newGender}`,
                    "This change will cause data inconsistency and will affect alot of Reports.",
                    [
                        {
                            name: 'Cancel', slot: 'start'
                        },
                        {
                            name: 'Change gender', slot: 'end', color: 'danger'
                        }
                    ]
                )
                return action === 'Change gender'
            }
            return true
        }
        return gender
    },
    dobFields(): Array<Field> {
        const dobConfig = PersonField.getDobConfig()
        dobConfig.defaultValue = () => this.presets.birthdate
        dobConfig.condition = () => !(this.presets.birthdate && 
            this.presets.nationalIDStatus) && this.editConditionCheck([
                'year_birth_date', 'month_birth_date', 'day_birth_date'
            ])
        // ANC validation to ensure that we are not registering
        // Non child bearing youngsters
        if (this.app.applicationName === 'ANC') {
            const sdate = Patientservice.getSessionDate()
            const childBearingAgeInYrs = 12
            dobConfig.maxDate = () => dayjs(sdate)
                .subtract(childBearingAgeInYrs, 'years')
                .format(STANDARD_DATE_FORMAT)
        }
        return generateDateFields(dobConfig)
    },
    currentAddressSameAsHome(): Field {
        return {
            id: "same_as_home",
            helpText: "Is the client currently based in the specified home address?",
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            condition: () => !this.isEditMode(),
            options: () => ([
                { label: "Yes", value: 1 },
                { label: "No", value: 0 }
            ])
        }
    },
    homeRegionField(): Field {
        const region: Field = PersonField.getHomeRegionField()
        region.condition = () => this.editConditionCheck(this.homeAddressAttributes)
        return region
    },
    homeDistrictField(): Field {
        const district: Field = PersonField.getHomeDistrictField()
        district.condition = () => this.editConditionCheck(this.homeAddressAttributes)
        return district
    },
    homeTAField(): Field {
        const homeTA: Field = PersonField.getHomeTaField()
        homeTA.condition = (form: any) => this.editConditionCheck(this.homeAddressAttributes)
            && !form.home_region.label.match(/foreign/i)
        return homeTA
    },
    homeVillageField(): Field {
        const homeVillage: Field = PersonField.getHomeVillageField()
        homeVillage.condition = (form: any) => this.editConditionCheck(this.homeAddressAttributes)
            && !form.home_region.label.match(/foreign/i)
        return homeVillage
    },
    currentRegionField(): Field {
        const currentRegion: Field = PersonField.getCurrentRegionField()
        currentRegion.defaultOutput = (f: any) => {
            if (/yes/i.test(`${f.same_as_home?.label}`)) {
                return f.home_region
            }
        }
        currentRegion.defaultComputedOutput = (f: any, c: any) => {
            if (/yes/i.test(`${f.same_as_home?.label}`)) {
                return c.home_region
            }
        }
        currentRegion.condition = (f: any) => this.editConditionCheck(this.currentAddressAttributes) &&
            f.same_as_home ? /No/i.test(f.same_as_home.label) : true
        return currentRegion
    },
    currentDistrictField(): Field {
        const currentDistrict: Field = PersonField.getCurrentDistrictField()
        currentDistrict.defaultOutput = (f: any) => {
            if (/yes/i.test(`${f.same_as_home?.label}`)) {
                return f.home_district
            }
        }
        currentDistrict.defaultComputedOutput = (f: any, c: any) => {
            if (/yes/i.test(`${f.same_as_home?.label}`)) {
                return c.home_district
            }
        }
        currentDistrict.condition = (f: any) => this.editConditionCheck(this.currentAddressAttributes) &&
           f.same_as_home ? /No/i.test(f.same_as_home.label) : true
        return currentDistrict
    },
    currentTAField(): Field {
        const currentTA: Field = PersonField.getCurrentTAfield()
        currentTA.defaultOutput = (f: any) => {
            if (/yes/i.test(`${f.same_as_home?.label}`)) {
                return f.home_traditional_authority
            }
        }
        currentTA.defaultComputedOutput = (f: any, c: any) => {
            if (/yes/i.test(`${f.same_as_home?.label}`)) {
                return c.home_traditional_authority
            }
        }
        currentTA.condition = (form: any) => this.editConditionCheck(this.currentAddressAttributes)
            && !form.current_region.label.match(/foreign/i) 
            && form.same_as_home ? /No/i.test(form.same_as_home.label) : true
        return currentTA
    },
    currentVillage(): Field {
        const currentVillage: Field = PersonField.getCurrentVillageField()
        currentVillage.defaultOutput = (f: any) => {
            if (/yes/i.test(`${f.same_as_home?.label}`)) {
                return f.home_village
            }
        }
        currentVillage.defaultComputedOutput = (f: any, c: any) => {
            if (/yes/i.test(`${f.same_as_home?.label}`)) {
                return c.home_village
            }
        }
        currentVillage.condition = (form: any) => this.editConditionCheck(this.currentAddressAttributes)
            && !form.current_region.label.match(/foreign/i)
            && form.same_as_home ? /No/i.test(form.same_as_home.label) : true
        return currentVillage
    },
    cellPhoneField(): Field {
        const cellPhone: Field = PersonField.getCellNumberField()
        cellPhone.condition = () => this.editConditionCheck(['cell_phone_number'])
        cellPhone.defaultValue = () => this.presets.cell_phone_number
        return cellPhone
    },
    facilityLocationField(): Field {
       const facility: Field = PersonField.getFacilityLocationField()
       facility.condition = (form: any) => [
           'Emergency supply',
           'External consultation'
       ].includes(form.patient_type.value)
       return facility
    },
    landmarkFields(): Field[] {
        const landmarks: Field[] = PersonField.getLandmarkFields()
        landmarks[0].condition = () => this.editConditionCheck(['default_landmarks'])
        return landmarks
    },
    patientTypeField(): Field {
        return {
            id: 'patient_type',
            helpText: 'Type of patient',
            type: FieldType.TT_SELECT,
            computedValue: (val: Option) => ({person: val.value}),
            condition: () => this.editConditionCheck(['patient_type'])
                && this.app.applicationName === 'ART',
            validation: (val: any) => Validation.required(val),
            options: () => PatientTypeService.getPatientTypes()
        }
    },
    occupationField(): Field {
        const IS_AETC = this.app.applicationName === 'AETC'
        return {
            id: 'occupation',
            helpText: 'Occupation',
            type: FieldType.TT_SELECT,
            init: async () => {
               this.isMilitarySite = await Store.get('IS_MILITARY_SITE')
               return true
            },
            computedValue: (val: Option) => ({ person: val.value }),
            defaultOutput: (_: any, c: any) => {
                if (this.editConditionCheck(['occupation']) && this.isMinor(c) && this.isMilitarySite) {
                    return { label: 'Civilian', value: 'Civilian' }
                }
            },
            defaultComputedOutput: (f: any, c: any) => {
                if (this.editConditionCheck(['occupation']) && this.isMinor(c) && this.isMilitarySite) {
                    return { person: 'Civilian' }
                }
            },
            condition: (_: any, c: any) => this.editConditionCheck(['occupation']) && !this.isMinor(c) && this.isMilitarySite || IS_AETC,
            validation: (val: any) => Validation.required(val),
            options: () => {
                const baseOptions = ['Military', 'Civilian'];
                if (IS_AETC) {
                    // Adding extra options for the 'AETC' condition
                    const extraOptions = [
                        'Business',
                        'Craftsman',
                        'Domestic Worker',
                        'Driver',
                        'Farmer',
                        'Healthcare Worker',
                        'House Wife',
                        'Mechanic',
                        'Messenger',
                        'Office Worker',
                        'Police',
                        'Preschool Child',
                        'Prisoner',
                        'Sales Person',
                        'Security Guard',
                        'Soldier',
                        'Student',
                        'Teacher',
                        'Other',
                        'unknown',
                    ];
                    return this.mapToOption([...baseOptions, ...extraOptions]);
                } else {
                    return this.mapToOption(baseOptions);
                }
            }
        }
    },
    regimentField(): Field {
        return {
            id: 'person_regiment_id',
            helpText: 'Regiment ID',
            type: FieldType.TT_TEXT,
            computedValue: ({value}: Option) => ({
                personAttributes: {
                    'person_attribute_type_id': 35,
                    'value': value
                }
            }),
            condition: (form: any) => this.editConditionCheck(['person_regiment_id', 'occupation']) && form.occupation && form.occupation.value.match(/Military/i),
            validation: (val: any) => Validation.required(val)
        }
    },
    rankField(): Field {
        return {
            id: 'rank',
            helpText: 'Rank',
            type: FieldType.TT_SELECT,
            validation: (val: any) => Validation.required(val),
            computedValue: ({value}: Option) => ({
                personAttributes: {
                    'person_attribute_type_id': 36,
                    'value': value
                }
            }),
            condition: (form: any) => this.editConditionCheck(['rank', 'occupation']) && form.occupation && form.occupation.value.match(/Military/i),
            options: () => this.mapToOption([
                'First Lieutenant',
                'Captain',
                'Major',
                'Lieutenant Colonel',
                'Colonel',
                'Brigadier General',
                'Lieutenant General',
                'General',
                'Private',
                'Corporal',
                'Lance Corporal',
                'Seargent',
                'Staff Seargent',
                'Warrant Officer class 1',
                'Warrant Officer class 2'
            ])
        }
    },
    dateJoinedMilitaryFields(): Array<Field> {
        return generateDateFields({
            id: 'person_date_joined_military',
            helpText: 'Joined Military',
            required: true,
            condition: (form: any) =>  this.editConditionCheck([
                'year_person_date_joined_military',
                'month_person_date_joined_military',
                'day_person_date_joined_military',
                'occupation'
            ]) && form.occupation && form.occupation.value.match(/Military/i),
            minDate: () => HisDate.estimateDateFromAge(100),
            maxDate: () => WorkflowService.getSessionDate(),
            estimation: {
                allowUnknown: false
            },
            computeValue: (date: string) => ({
                date,
                personAttributes : {
                    'person_attribute_type_id': 37, 'value': date
                }
            })
        })
    },
    relationshipField(): Field {
        const IS_CXCA = this.app.applicationName === 'CxCa'
        const OPD = this.app.applicationName === 'OPD'
        const Registration = this.app.applicationName === 'Registration'
        const TB = this.app.applicationName === 'TB'
        return {
            id: 'relationship',
            helpText: 'Register guardian?',
            type: FieldType.TT_SELECT,
            computedValue: (val: Option) => ({person: val.value}),
            condition: () => this.editConditionCheck(['relationship']) && !IS_CXCA && !OPD && !Registration && !TB,
            validation: (val: any) => Validation.required(val),
            options: () => this.mapToOption(['Yes', 'No'])
        }
    },
    searchResultField(): Field {
        return {
            id: 'results',
            helpText: 'Search results',
            type: FieldType.TT_PERSON_RESULT_VIEW,
            init: async () => {
                if (!this.isEditMode()) { 
                    this.ddeEnabled = await Store.get('IS_DDE_ENABLED')
                }
                return true
            },
            dynamicHelpText: (form: any) => {
                return this.presets.nationalIDStatus == "true" ?
                 `Search results for "${this.presets.given_name} ${this.presets.family_name} | ${this.presets.gender}"` : 
                 `Search results for "${form.given_name.value} ${form.family_name.value} | ${form.gender.label}"`;
            },
            appearInSummary: () => false,
            condition: () => !this.$route.query.skipSearch && !this.isEditMode(),
            validation: (val: Option) => Validation.required(val),
            options: async (form: any) => {
                let payload;
                if(this.presets.nationalIDStatus == "true"){
                    this.presets.gender = this.presets.gender == "Male" ? "M" : "F"
                    payload  = {
                        'given_name': this.presets.given_name,
                        'family_name': this.presets.family_name,
                        'gender': this.presets.gender
                    } 
                }
                else{
                    payload = {
                        'given_name': form.given_name.value,
                        'family_name': form.family_name.value,
                        'gender': form.gender.value
                    }
                }
                // DDE enabled search
                if (this.ddeEnabled) {
                    const patients = await this.ddeInstance.searchDemographics(payload)
                    return patients.map((item: any) => {
                        const itemData = PersonField.getPersonAttributeOptions(item)
                        itemData.other.options.push({
                            label: 'Patient Type',
                            value: item.patient_type
                        })
                        itemData.other.options.push({
                            label: 'Doc ID',
                            value: item.doc_id
                        })
                        return itemData
                    })
                }
                // Regular search
                const patients = await Patientservice.search(payload);
                return patients.map((item: any) => PersonField.getPersonAttributeOptions(item))
            },
            config: {
                hiddenFooterBtns: [
                    'Clear',
                    'Next',
                    'Back'
                ],
                footerBtns: [
                    {
                        name: 'Edit Search',
                        slot: 'end',
                        onClick: () => {
                            this.fieldComponent = 'given_name'
                        }
                    },
                    {
                        name: 'New Patient',
                        slot: 'end',
                        onClick: () => {
                            this.presets.nationalIDStatus != "true"?
                            this.fieldComponent = 'year_birth_date':
                            this.fieldComponent = 'home_region'
                        }
                    },
                    {
                        name: 'Continue',
                        color: 'success',
                        slot: 'end',
                        state: {
                            disabled: {
                                default: () => true,
                                onValue(_: any,form: any) {
                                    return isEmpty(form.results)
                                }
                            }
                        },
                        onClick: (form: any) => {
                            if (form.results.other.patientID) {
                                return this.$router.push(`/patients/confirm?person_id=${form.results.value}`)
                            }
                            return this.$router.push(`/patients/confirm?patient_barcode=${form.results.value}`)
                        }
                    }
                ]
            }
        }
    },
    possibleDuplicatesField(): Field {
        let createdPerson: any = {}
        let duplicatePatients: any = {}
        return {
            id: 'possible_duplicates',
            helpText: 'Possible Duplicate(s)',
            type: FieldType.TT_PERSON_MATCH_VIEW,
            condition: async (_: any, c: any) => {
                if (this.ddeEnabled && this.editPerson <= 0) {
                    createdPerson = PersonField.resolvePerson(c)
                    duplicatePatients = await this.ddeInstance
                        .checkPotentialDuplicates(createdPerson)
                    return duplicatePatients.length >= 1
                }
                return false
            },
            options: async () => {
                const toDate = (date: string) => HisDate.toStandardHisDisplayFormat(date)
                return duplicatePatients.map(({ score, person }: any) => {
                    const name = `${person.given_name} ${person.family_name}`
                    return {
                        label: name,
                        value: person.patient_id,
                        other: {
                            score: `${score * 100}%`,
                            newPerson: createdPerson,
                            foundPerson: person,
                            docID: person.id,
                            comparisons: [
                                [
                                    'Name',
                                    `${createdPerson.given_name} ${createdPerson.family_name}`,
                                    `${person.given_name} ${person.family_name}`
                                ],
                                [
                                    'Gender',
                                    createdPerson.gender,
                                    person.gender
                                ],
                                [
                                    'Birthdate',
                                    toDate(createdPerson.birthdate),
                                    toDate(person.birthdate)
                                ],
                                [
                                    'Home District',
                                    createdPerson.home_district,
                                    person.home_district
                                ],
                                [
                                    'Home TA',
                                    createdPerson.home_traditional_authority,
                                    person.home_traditional_authority
                                ]
                            ]
                        }
                    }
                })
            },
            config: {
                hiddenFooterBtns: [
                    'Clear',
                    'Next'
                ],
                footerBtns: [
                    {
                        name: 'Not Duplicate',
                        slot: 'start',
                        state: {
                            visible: {
                                default: () => false,
                                onValue: (_: any, f: any) => !isEmpty(f.possible_duplicates)
                            }
                        },
                        onClick: () => {
                            this.fieldComponent = '_NEXT_FIELD_'
                        }
                    },
                    {
                        name: 'Select',
                        slot: 'end',
                        color: 'success',
                        state: {
                            visible: {
                                default: () => false,
                                onValue: (_: any, f: any) => !isEmpty(f.possible_duplicates)
                            }
                        },
                        onClick: (form: any) => {
                            this.ddeInstance.importPatient(form.possible_duplicates.other.docID)
                                .then((result: any) => {
                                    this.$router.push(`/patients/confirm?person_id=${result.patient_id}`)
                                }).catch(() => {
                                    this.$router.push(`/patients/confirm?person_id=${form.possible_duplicates.value}`)
                                })
                        }
                    }
                ]
            }
        }
    },
    hasMalawiNationalIdField(): Field {
        return {
            id: "has_malawi_id",
            helpText: "Does client have/remembers their Malawi National ID Number?",
            type: FieldType.TT_SELECT,
            condition: () => this.editConditionCheck(['has_malawi_id']) && this.presets.nationalIDStatus != "true",
            validation: (v: Option) => Validation.required(v),
            options: () => [
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" }
            ]
        }
    },
    malawiNationalIdField(): Field {
        return {
            id: 'malawi_national_identifier',
            helpText: 'Malawi National ID',
            type: FieldType.TT_TEXT,
            computedValue: (v: Option) => ({ mwID: v.value }),
            condition: (f: any) => this.editConditionCheck(['has_malawi_id']) && f.has_malawi_id.value === 'Yes',
            validation: (v: Option) => Validation.validateSeries([
                () => Validation.required(v),
                () => Validation.isMWNationalID(v)
            ]),
            config: {
                customKeyboard: NID_CONFIG
            }
        }
    },
    personIndexField(): Field {
        return {
            id: 'edit_user',
            helpText: 'Edit Demographics',
            type: FieldType.TT_TABLE_VIEWER,
            init: async () => {
                if (this.isEditMode()) {
                    this.ddeEnabled = await Store.get('IS_DDE_ENABLED')
                    this.isMilitarySite = await Store.get('IS_MILITARY_SITE')
                }
                return true
            },
            condition: () => this.isEditMode(),
            options: async () => {
                const editButton = (attribute: string) => ({
                    name: 'Edit',
                    type: 'button',
                    action: () => {
                        this.activeField = attribute
                        this.fieldComponent = this.activeField
                    }
                })
                const columns = ['Attributes', 'Values', 'Edit']
                const rows = [
                    ['Malawi National ID', this.editPersonData.national_id, /unknown/i.test(this.editPersonData.national_id) ? editButton('has_malawi_id') : 'N/A'],
                    ['Given Name', this.editPersonData.given_name, editButton('given_name')],
                    ['Family Name', this.editPersonData.family_name, editButton('family_name')],
                    ['Gender', this.editPersonData.gender,  editButton('gender')],
                    ['Birthdate', HisDate.toStandardHisDisplayFormat(this.editPersonData.birthdate),  editButton('year_birth_date')],
                    ['Cell Phone Number', this.editPersonData.cell_phone_number, editButton('cell_phone_number')],
                    ['Home District', this.editPersonData.home_district, editButton('home_region')],
                    ['Home TA', this.editPersonData.home_traditional_authority,  editButton('home_region')],
                    ['Home Village', this.editPersonData.home_village,  editButton('home_region')],
                    ['Current district',this.editPersonData.current_district, editButton('current_region')],
                    ['Current Village',this.editPersonData.current_village, editButton('current_region')],
                    ['Current T/A', this.editPersonData.current_traditional_authority, editButton('current_region')],
                    ['Landmark', this.editPersonData.landmark, editButton('default_landmarks')]
                ]
                if (this.isMilitarySite) {
                    rows.push(['Occupation', this.editPersonData.occupation, editButton('occupation')])
                }
                // Tag rows with empty values
                const emptySets: any = {indexes: [], class: 'his-empty-set-color'}
                rows.forEach((r: any, i: number) => {
                    if (isValueEmpty(r[1])) 
                        emptySets.indexes.push(i)
                })
                this.hasIncompleteData = emptySets.indexes.length >= 1
                return [{
                    label: '', 
                    value: '',
                    other: {
                        rows,
                        columns,
                        rowColors: [emptySets]
                    }
                }]
            },
            config: {
                footerBtns: [
                    /**
                     * Custom button that Appears when DDE wants to
                     * Reassign a patient with incomplete data
                    */
                    {
                        name: 'Reassign',
                        slot: 'end',
                        color: 'success',
                        state: {
                            visible: {
                                default: () => false,
                                onload: () => (
                                    this.ddeEnabled
                                    && this.ddeIsReassign
                                    && !this.hasIncompleteData
                                )
                            }
                        },
                        onClick: async () => {
                            try {
                                await this.ddeInstance.reassignNpid(this.ddeDocID, this.editPerson)
                                await this.ddeInstance.printNpid()
                                this.$router.push(`/patients/confirm?person_id=${this.editPerson}`)
                            } catch(e) {
                                toastWarning(`${e}`)
                            }
                        }
                    },
                    /**
                     * Custom button that redirects to patient confirmation page
                     */
                    {
                        name: 'Confirm',
                        slot: 'end',
                        color: 'warning',
                        state: {
                            visible: {
                                onload: () => !this.ddeIsReassign && !this.hasIncompleteData
                            }
                        },
                        onClick: async () => this.confirmPatient()
                    }
                ],
                hiddenFooterBtns: ['Clear', 'Next']
            }
        }
    },
    patientRegistrationSummary(): Field 
    {
        return{
          id: "registration_summary",
          helpText: "Summary",
          type: FieldType.TT_SUMMARY,
          condition: () => !this.skipSummary,
          options: (f: any, c: any) => {  
                return this.buildRegistrationSummary(c)
          },
          config: {
            hiddenFooterBtns: ["Clear"],
          }
        }
    },
    buildRegistrationSummary(data: any){
        data = Object.keys(data).map(function(key) {
            if(data[key] != null){
                return {
                'label': key.replace(/_/g,' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()),
                'value': key == "birth_date" ? data[key]['date'] : data[key]['mwID'] || data[key]['person']
                } 
            }
        });
        data = data.filter((x: any)=>{
            return x != undefined
        })

       const nationalIDData = [
            {
                'label': "Given Name",
                'value': this.presets.given_name
            },
            {
                'label': "Family Name",
                'value': this.presets.family_name
            },
            {
                'label': "Gender",
                'value': this.presets.gender
            },
            {
                'label': "Birthdate",
                'value': this.presets.birthdate
            },
            {
                'label': "Malawi National ID",
                'value': this.presets.identifier
            } 
        ]
        if(this.presets.nationalIDStatus == "true")
            data = nationalIDData.concat(data)

        return data
    }
  }
})
</script>
