<template>
  <his-standard-form
    @onIndex="fieldComponent=''" 
    :skipSummary="true"
    :activeField="fieldComponent" 
    :fields="fields" 
    :onFinishAction="onFinish"
    :cancelDestinationPath="`/patient/dashboard/${patientData.id}`"
 />
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
import { RelationsService } from "@/services/relations_service"
import { isEmpty } from "lodash"
import PersonField from "@/utils/HisFormHelpers/PersonFieldHelper"
import { PatientRegistrationService } from "@/services/patient_registration_service"
import { nextTask } from "@/utils/WorkflowTaskHelper"
import { toastWarning } from "@/utils/Alerts";
import { RelationshipService } from "@/services/relationship_service";
import PersonFieldHelper from "@/utils/HisFormHelpers/PersonFieldHelper";
import { infoActionSheet } from "@/utils/ActionSheets";
import { delayPromise } from "@/utils/Timers";
import popVoidReason from "@/utils/ActionSheetHelpers/VoidReason";
import Nrb from "@/composables/nationalIdFlow"

export default defineComponent({
  components: { HisStandardForm },
  data: () => ({
    patientData: {} as any,
    guardianData: {} as any,
    nationalIDPresets: {} as Record<string, string|number>,
    fieldAction: '' as 'Scan' | 'Search' | 'Registration' | 'edit',
    fieldComponent: '' as string,
    fields: [] as Array<Field>,
    form: {} as Record<string, Option> | Record<string, null>,
    redirectURL: '' as string,
    activeField: '' as string,
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
    ] as string[]
  }),
  watch: {
    '$route': {
        async handler({params, query}: any) {
            if (params.patient_id) {
                const patient = await Patientservice.findByID(params.patient_id)
                if (patient) {
                    this.patientData = PersonFieldHelper.mapPersonData(patient.person)
                    if (query.edit_guardian) {
                        this.fieldAction = 'edit'
                    }
                    this.fields = this.getFields()
                }
            }
            if(query.source) this.redirectURL = query.source
        },
        immediate: true,
        deep: true
    }
  },
  methods: {
    getFields(): Array<Field> {
        let fields: Array<Field> = []
        fields.push(this.guardianSelection())
        fields.push(this.guardianIndex())
        fields.push(this.scanGuardian())
        fields.push(this.givenNameField())
        fields.push(this.familyNameField())
        fields.push(this.genderField())
        fields.push(this.searchResultField())
        fields = fields.concat(this.dobFields())
        fields.push(this.homeRegionField())
        fields.push(this.homeDistrictField())
        fields.push(this.homeTAField())
        fields.push(this.homeVillageField())
        fields.push(this.currentRegionField())
        fields.push(this.currentDistrictField())
        fields.push(this.currentTAField())
        fields.push(this.currentVillage())
        fields = fields.concat(this.landmarkFields())
        fields.push(this.cellPhoneField())
        fields.push(this.relationsField())
        return fields
    },
    async onFinish(form: any, computedData: any) {
        if (this.isEditMode()) {
            if (this.activeField != 'relations') {
                const reg = new PatientRegistrationService()
                reg.setPersonID(this.guardianData.id)
                await reg.updatePerson(PersonField.resolvePerson(computedData))
                // Patch updated values
                Object.keys(computedData).forEach((i: string) => {
                    if (i in this.guardianData) {
                        this.guardianData[i] = computedData[i]?.date || computedData[i].person
                    }
                })
            } else {
                if (this.guardianData?.relation) {
                    const relation = await RelationsService.amendRelation(
                        this.patientData.id,
                        this.guardianData.id,
                        this.guardianData.relation.relationship_id,
                        form.relations.other.relationship_type_id
                    )
                    if (relation) {
                        this.guardianData.relation = relation
                    }
                }
            }
            this.fieldComponent = 'guardian_index'
        } else {
            if(this.isSameAsPatient(this.resolvePerson(computedData))) {
                toastWarning("Guardian cannot be the same patient")
            } else {
                let guardianID = -1
                if (this.isRegistrationMode()) {
                    const guardian: any = new PatientRegistrationService()
                    await guardian.registerGuardian(this.resolvePerson(computedData))
                    guardianID = guardian.getPersonID()
                } else {
                    guardianID = this.guardianData.id
                }
                await RelationsService.createRelation(
                    this.patientData.id, guardianID, form.relations.other.relationship_type_id
                )                
                if(this.redirectURL) this.$router.push({name: this.redirectURL})
                else if (this.$route.query.edit_guardian) this.fieldComponent = 'select_guardian'
                else return nextTask(this.patientData.id, this.$router, this.$route)
            }   
        }
        location.reload()
    },
    isEditMode() {
        return this.fieldAction === 'edit'
    },
    isSearchMode() {
        return ['Search', 'Registration'].includes(this.fieldAction)
    },
    isRegistrationMode() {
        return this.fieldAction === 'Registration'
    },
    canEdit(groups: Array<string|number>, defaultCondition=true, mandatoryCondition=true) {
        if (this.isEditMode()) {
            return groups.includes(this.activeField) && mandatoryCondition
        }
        return defaultCondition
    },
    resolvePerson(computedValue: any) {
        return {...PersonField.resolvePerson(computedValue), ...this.nationalIDPresets}
    },
    applyNationalIDPresets(field: Field) {
        return {
            ...field,
            defaultOutput: () => this.nationalIDPresets[field.id],
            defaultComputedOutput: () =>  this.nationalIDPresets ? ({ person: this.nationalIDPresets[field.id] }): undefined,
            condition: (f: any) => (field.condition ? field.condition(f) : true) && isEmpty(this.nationalIDPresets)
        }
    },
    isSameAsPatient(guardian: any) {
        let birthdate = ''
        let name = ''
        let gender = ''

        if(this.isRegistrationMode()) {
            birthdate = HisDate.toStandardHisDisplayFormat(guardian.birth_date)
            name = guardian.given_name && guardian.family_name
            gender = guardian.gender
        } else {
            birthdate = this.guardianData.birth_date
            name = this.guardianData.name
            gender = this.guardianData.gender  
        }

        return (name.toLowerCase() === this.patientData.name.toLowerCase()) 
            && (birthdate === this.patientData.birth_date)
            && (gender === this.patientData.gender)
    },
    guardianSelection(): Field {
        return {
            id: 'select_guardian',
            helpText: 'Select guardian to edit/view',
            type: FieldType.TT_SELECT,
            condition: () => this.isEditMode(),
            validation: (v: Option) => Validation.required(v),
            options: async () => {
                const relationship = await RelationshipService.getRelationships(this.patientData.id)
                if (!isEmpty(relationship)) {
                    return relationship.map((r: any) => {
                        const guardian = PersonField.mapPersonData(r.relation)
                        return {
                            label: `${guardian.name} (${r.type.b_is_to_a})`, 
                            value: r.relation.person_id, 
                            other: {
                                relations: r, 
                                details: guardian 
                            }
                        }
                    })
                } else {
                    await delayPromise(450)
                    const action = await infoActionSheet(
                        'Patient has no guardians', '',
                        'Select option to proceed',
                        [
                            {
                                name: 'Cancel',
                                slot: 'start',
                                color: 'danger'
                            },
                            {
                                name: 'Register new',
                                slot: 'start',
                                color: 'success'
                            }
                        ]
                    )
                    if (action === 'Register new') {
                        this.guardianData = {}
                        this.nationalIDPresets = {}
                        this.fieldAction = 'Registration'
                        this.fieldComponent = 'scan'
                    } else {
                        this.$router.back()
                    }
                }
                return []
            },
            config: {
                footerBtns: [
                    {
                        name: 'New Guardian',
                        slot: 'end',
                        color: 'primary',
                        onClick: () => {
                            this.guardianData = {}
                            this.nationalIDPresets = {}
                            this.fieldAction = 'Registration'
                            this.fieldComponent = 'scan'
                        }
                    }
                ]
            }
        }
    },
    getDefaultVal(fieldID: string | number) {
        try {
            return this.guardianData[fieldID]
        } catch (e) {
            return ''
        }
    },
    guardianIndex(): Field {
        return {
            id: 'guardian_index',
            helpText: 'Guardian details',
            type: FieldType.TT_TABLE_VIEWER,
            condition: (f: any) => f.select_guardian.value, 
            options: (f: any) => {
                if (this.guardianData && this.guardianData.id != f.select_guardian.value) {
                    this.guardianData = {
                        ...f.select_guardian.other.details,
                        relation: f.select_guardian.other.relations
                    }
                }
                const editButton = (attribute: string) => ({
                    name: 'Edit',
                    type: 'button',
                    action: () => {
                        this.activeField = attribute
                        this.fieldComponent = this.activeField
                    }
                })
                const rows = [
                    ['Given Name', this.guardianData.given_name, editButton('given_name')],
                    ['Family Name', this.guardianData.family_name, editButton('family_name')],
                    ['Gender', this.guardianData.gender, editButton('gender')],
                    ['Birthdate', HisDate.toStandardHisDisplayFormat(this.guardianData.birth_date), editButton('year_birth_date')],
                    ['Cell Phone Number', this.guardianData.cell_phone_number, editButton('cell_phone_number')],
                    ['Home District', this.guardianData.home_district, editButton('home_region')],
                    ['Home TA', this.guardianData.home_traditional_authority, editButton('home_region')],
                    ['Home Village', this.guardianData.home_village,  editButton('home_region')],
                    ['Current district', this.guardianData.current_district, editButton('current_region')],
                    ['Current T/A', this.guardianData.current_traditional_authority, editButton('current_region')],
                    ['Landmark', this.guardianData.landmark, editButton('default_landmarks')],
                    ['Relation', this.guardianData.relation.type.b_is_to_a, editButton('relations')]
                ]
                return [{
                    label: '', 
                    value: '',
                    other: {
                        rows
                    }
                }]
            },
            config : {
                overrideDefaultFooterBtns: {
                    nextBtn: {
                        name: 'Finish',
                        slot: 'end',
                        color: 'success',
                        onClick: () => this.fieldComponent = 'select_guardian'
                    }
                },
                footerBtns: [
                    {
                        name: 'Void Relation',
                        slot: 'start',
                        color: 'danger',
                        onClick: async () => {
                            popVoidReason(async (reason: string) => {
                                await RelationsService.voidRelation(
                                    this.patientData.id, 
                                    this.guardianData.relation.relationship_id,
                                    reason
                                )
                                this.fieldComponent = 'select_guardian'
                                location.reload()
                            })
                        }
                    }
                ],
                hiddenFooterBtns: ['Clear', 'Back']
            }
        }
    },
    givenNameField(): Field {
        const name: Field = PersonField.getGivenNameField()
        name.helpText = 'Guardian First name'
        name.defaultValue = () => this.getDefaultVal(name.id)
        name.condition = () => this.canEdit([name.id], this.isSearchMode())
        return this.applyNationalIDPresets(name) as any
    },
    familyNameField(): Field {
        const name: Field = PersonField.getFamilyNameField()
        name.helpText = 'Guardian Last name'
        name.defaultValue = () => this.getDefaultVal(name.id)
        name.condition = () => this.canEdit([name.id], this.isSearchMode())
        return this.applyNationalIDPresets(name) as any
    },
    genderField(): Field {
        const gender: Field = PersonField.getGenderField()
        gender.defaultValue = () => this.getDefaultVal(gender.id)
        gender.condition = () => this.canEdit([gender.id], this.isSearchMode())
        return this.applyNationalIDPresets(gender) as any
    },
    dobFields(): Array<Field> {
        const dob =PersonField.getDobConfig()
        dob.defaultValue = () => this.getDefaultVal('birth_date')
        dob.condition = () => this.canEdit([
            'year_birth_date', 
            'month_birth_date', 
            'day_birth_date'
            ], 
            this.isRegistrationMode() && isEmpty(this.nationalIDPresets)
        ) 
        return generateDateFields(dob)
    },
    homeRegionField(): Field {
        const home: Field = PersonField.getHomeRegionField()
        home.condition = () => this.canEdit(this.homeAddressAttributes, this.isRegistrationMode())
        return home
    },
    homeDistrictField(): Field {
        const district: Field = PersonField.getHomeDistrictField()
        district.condition = () => this.canEdit(this.homeAddressAttributes, this.isRegistrationMode())
        return district
    },
    homeTAField(): Field {
        const ta: Field =  PersonField.getHomeTaField()
        ta.condition = (form: any) => this.canEdit(
            this.homeAddressAttributes, 
            this.isRegistrationMode() && !form.home_region.label.match(/foreign/i),
            !form.home_region.label.match(/foreign/i)
        )
        return ta
    },
    homeVillageField(): Field {
        const village: Field = PersonField.getHomeVillageField()
        village.condition = (form: any) => this.canEdit(
            this.homeAddressAttributes, 
            this.isRegistrationMode() && !form.home_region.label.match(/foreign/i),
            !form.home_region.label.match(/foreign/i)
        )
        return village
    },
    currentRegionField(): Field {
        const region: Field = PersonField.getCurrentRegionField()
        region.condition = () => this.canEdit(this.currentAddressAttributes, this.isRegistrationMode())
        return region
    },
    currentDistrictField(): Field {
        const currentDistrict: Field = PersonField.getCurrentDistrictField()
        currentDistrict.condition = () => this.canEdit(this.currentAddressAttributes, this.isRegistrationMode())
        return currentDistrict
    },
    currentTAField(): Field {
        const currentTA: Field = PersonField.getCurrentTAfield()
        currentTA.condition = (form: any) => this.canEdit(
            this.currentAddressAttributes, 
            this.isRegistrationMode() && !form.current_region.label.match(/foreign/i),
            !form.current_region.label.match(/foreign/i)
        )
        return currentTA
    },
    currentVillage(): Field {
        const currentVillage: Field = PersonField.getCurrentVillageField()
        currentVillage.condition = (form: any) => this.canEdit(
            this.currentAddressAttributes, 
            this.isRegistrationMode() && !form.current_region.label.match(/foreign/i),
            !form.current_region.label.match(/foreign/i)
        )
        return currentVillage
    },
    cellPhoneField(): Field {
        const cellPhone: Field = PersonField.getCellNumberField()
        cellPhone.condition = () => this.canEdit([cellPhone.id], this.isRegistrationMode())
        return cellPhone 
    },
    landmarkFields(): Field[] {
        const landmarks: Field[] = PersonField.getLandmarkFields()
        const id = landmarks[0].proxyID || landmarks[0].id
        landmarks[0].defaultValue =  () => this.getDefaultVal(id)
        landmarks[0].condition = () => this.canEdit([id], this.isRegistrationMode())
        return landmarks
    },
    relationsField(): Field {
        return {
            id: 'relations',
            helpText: 'Select relationship type',
            type: FieldType.TT_RELATION_SELECTION,
            defaultValue: () => this.getDefaultVal('relations'),
            validation: (val: Option) => Validation.required(val),
            condition: () => this.canEdit(['relations']),
            onload: (context: any) => {
                context.patient = this.patientData
                if (this.isRegistrationMode()) {
                    const person = this.resolvePerson(context.cdata)
                    context.guardian = {
                        'name': `${person.given_name} ${person.family_name}`,
                        'birth_date': HisDate.toStandardHisDisplayFormat(person.birthdate),
                        'home_address': `${person.home_district} ${person.home_traditional_authority}`
                    }
                } else {
                    context.guardian = this.guardianData
                }
            },
            options: async() => {
                const relationships = await RelationsService.getRelations()
                return relationships.map((r: any) => ({
                    label: r.b_is_to_a, 
                    value: r.description, 
                    other: r
                }))
            },
            config: {
                hiddenFooterBtns: [
                  'Clear'
                ]
            }
        }
    },
    scanGuardian(): Field {
        return {
            id: 'scan',
            helpText: 'Scan or Register Guardian',
            type: FieldType.TT_BARCODE,
            requireNext: false,
            onload: () => this.nationalIDPresets = {},
            condition: () => !this.isEditMode(),
            onValue: async (id: string) => {
                if (Nrb.isNrbType(id)) {
                    const data: any = await Nrb.onScanQr(id)
                    if (data.person) {
                        this.guardianData = PersonFieldHelper.mapPersonData(data.person.person)
                        this.fieldComponent = 'relations'
                        this.fieldAction = 'Scan'
                        return false
                    } else if (data.qrData) {
                        this.nationalIDPresets = {
                            ...data.qrData, 
                            birth_date: data.qrData.birthdate,
                            birthdate_estimated: false
                        }
                        this.fieldAction = 'Registration'
                    }
                    return true
                } else {
                    const searchResults = await Patientservice.findByNpid(id)
                    if (!isEmpty(searchResults)) {
                        this.guardianData = PersonFieldHelper.mapPersonData(searchResults[0].person)
                        this.fieldComponent = 'relations'
                        this.fieldAction = 'Scan'
                    }
                }
                return false
            },
            config: {
                hiddenFooterBtns: [
                    'Clear',
                    'Next',
                    'Back'
                ],
                footerBtns : [
                    {
                        name: 'Find or Register Guardian',
                        color: 'success',
                        slot: 'end',
                        onClick: () => {
                            this.fieldAction = 'Search'
                            this.fieldComponent = 'given_name'
                        }
                    }
                ]
            }
        }
    },
    searchResultField(): Field {
        return {
            id: 'results',
            helpText: 'Search results',
            type: FieldType.TT_PERSON_RESULT_VIEW,
            dynamicHelpText: (f: any) => {
                return `Search results for 
                "${f.given_name.value} ${f.family_name.value} | ${f.gender.label}"
                `
            },
            appearInSummary: () => false,
            condition: () => this.isSearchMode() && isEmpty(this.nationalIDPresets),
            validation: (val: Option) => Validation.required(val),
            options: async (form: any) => {
                const patients = await Patientservice.search({
                    'given_name': form.given_name.value, 
                    'family_name': form.family_name.value, 
                    'gender': form.gender.value, 
                });
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
                            this.fieldAction = 'Search'
                            this.fieldComponent = 'given_name'
                        }
                    },
                    {
                        name: 'New Guardian',
                        slot: 'end',
                        onClick: () => {
                            this.fieldAction = 'Registration'
                            this.fieldComponent = 'year_birth_date'
                        }
                    },
                    {
                        name: 'Continue Guardian',
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
                            this.guardianData = PersonFieldHelper.mapPersonData(
                                form.results.other.person.person
                            )
                            this.fieldComponent = 'relations'
                            this.fieldAction = 'Search'
                        }
                    }
                ]
            }
        }
    }
  }
})
</script>