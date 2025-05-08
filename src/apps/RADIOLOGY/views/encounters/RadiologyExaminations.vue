<template>
    <ion-page> 
        <his-standard-form 
            :fields="fields"
            :onFinishAction="onFinish"
            :cancelDestinationPath="cancelDestination" 
        />
    </ion-page>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import EncounterMixinVue from '@/views/EncounterMixin.vue'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { IonPage } from "@ionic/vue";
import { FieldType } from '@/components/Forms/BaseFormElements';
import Validation from "@/components/Forms/validations/StandardValidations";
import { Field, Option } from "@/components/Forms/FieldInterface"
import { RadiologyExaminationService } from "@/apps/RADIOLOGY/services/radiology_examination_service";
import { RadiologyInternalSectionService } from "@/apps/RADIOLOGY/services/radiology_internal_sections_service";
import { isEmpty } from 'lodash';
import { alertConfirmation, toastDanger, toastWarning } from '@/utils/Alerts';
import PersonFieldHelper from '@/utils/HisFormHelpers/PersonFieldHelper';
import RADIOLOGY_GLOBAL_PROP from "@/apps/RADIOLOGY/radiology_global_props"
;
export default defineComponent({
    mixins: [EncounterMixinVue],
    components: {
        IonPage,
        HisStandardForm
    },
    data: () => ({
        service: {} as any,
        examinationOptions: [] as any,
        defaultExternalLocation: '' as string,
        detailedExaminationOptions: [] as any
    }),
    watch: {
        ready: {
            handler(ready: any) {
                if (ready) {
                    this.service = new RadiologyExaminationService(this.patientID, this.providerID)
                    this.fields.push(this.listOfRadiologyTestsField())
                    this.fields.push(this.examinationField())
                    this.fields.push(this.detailedExaminationField())
                    this.fields.push(this.referralTypeField())
                    this.fields.push(this.internalReferralField())
                    this.fields.push(this.externalReferralField())
                    this.fields.push(this.payingField())
                    this.fields.push(this.paymentTypeField())
                    this.fields.push(this.receiptField())
                    this.fields.push(this.paymentAmountField())
                    this.fields.push(this.invoiceField())
                    this.fields.push(this.invoiceAmountField())
                }
            },
            immediate: true
        }
    },
    methods: {
        async getTestsOptions(id: string | number) {
            return (await RadiologyExaminationService.getListOfRadiologyTests(id))
                .map((e: any) => ({
                    label: e.name,
                    value: e.concept_id
                }))
        },
        validateAmount(val: string) {
            return val.match(/([0-9]+\\.[0-9])|Unknown$/i)
                ? ['You must enter a decimal number']
                : null
        },
        async onFinish(_: any, computedValues: any) {
            await this.service.createEncounter()
            const order = await this.service.createOrder({
                'concept_id': computedValues['list_of_radiology_test']['concept'],
                'encounter_id': this.service.encounterID,
                'provider_id': this.providerID
            })
            const obs = (await this.resolveObs(computedValues)).map(obs => {
                obs['order_id'] = order.order_id
                return obs
            })
            await this.service.saveObservationList(obs)
            this.service.printExamination(order.accession_number)
            this.gotoPatientDashboard()
        },
        listOfRadiologyTestsField(): Field {
            let tests = [] as any;
            let selectedTest = -1 as number;
            return {
                id: "list_of_radiology_test",
                helpText: "Please select the type of examination",
                type: FieldType.TT_SELECT,
                validation: (v: Option) => Validation.required(v),
                computedValue: (v: Option) => {
                    return {
                        concept: v.value,
                        obs: this.service.buildValueCoded('RADIOLOGY TEST', v.value)
                    }
                },
                beforeNext: async (v: Option) => {
                    if (selectedTest != v.value) {
                        selectedTest = v.value as number
                        this.examinationOptions = await this.getTestsOptions(v.value)
                    }
                    return true
                },
                options: async () => {
                    if (isEmpty(tests)) {
                        tests = await this.getTestsOptions('LIST OF RADIOLOGY TESTS')
                    }
                    return tests
                }
            }
        },
        examinationField() {
            let selectedExamID = -1
            return {
                id: "examination",
                helpText: "Please select the examination",
                type: FieldType.TT_SELECT,
                validation: (v: Option) => Validation.required(v),
                computedValue: (v: Option) => {
                    return {
                        obs: this.service.buildValueCoded('Examination', v.value)
                    }
                },
                condition: () => !isEmpty(this.examinationOptions),
                beforeNext: async (v: Option, f: any) => {
                    if (selectedExamID != f.list_of_radiology_test.value) {
                        selectedExamID = v.value as number
                        this.detailedExaminationOptions = await this.getTestsOptions(selectedExamID)
                    }
                    return true
                },
                options:() => this.examinationOptions
            }
        },
        detailedExaminationField() {
            return {
                id: "detailed_examination",
                helpText: "Please select the detailed examination",
                type: FieldType.TT_SELECT,
                condition: () => !isEmpty(this.detailedExaminationOptions),
                computedValue: (v: Option) => {
                    return {
                        obs: this.service.buildValueCoded('Detailed examination', v.value),
                    }
                },
            validation: (v: Option) => Validation.required(v),
                options: () => this.detailedExaminationOptions
            }
        },
        referralTypeField() {
            return {
                id: 'referral_type',
                helpText: 'Please select the referral type',
                type: FieldType.TT_SELECT,
                validation: (v: Option) => Validation.required(v),
                computedValue: (v: Option) => {
                    return {
                        obs: this.service.buildValueText('Source of referral', v.label)
                    }
                },
                options: () => {
                    return this.mapStrToOptions([
                        'External', 
                        'Internal'
                    ])
                }
            }
        },
        externalReferralField() {
            const field: Field = PersonFieldHelper.getFacilityLocationField()
            field.id = 'external_referral'
            field.init = async () => {
                this.defaultExternalLocation = await RADIOLOGY_GLOBAL_PROP.defaultReferralLocation()
                return true
            }
            field.defaultValue = () => this.defaultExternalLocation
            field.condition = (f: any) => f.referral_type.value === 'External'
            field.computedValue = (v: Option) => {
                return {
                    obs: this.service.buildValueText('REFERRED FROM', v.label)
                }
            }
            return field
        },
        internalReferralField() {
            let referralSections = [] as Option[]
            return {
                id: "referred_by",
                helpText: "Referred from",
                type: FieldType.TT_SELECT,
                validation: (v: Option) => Validation.required(v),
                condition: (f: any) => f.referral_type.value === 'Internal',
                computedValue: (v: Option) => {
                    return {
                        obs: this.service.buildValueText('REFERRED FROM', v.label)
                    }
                },
                options: async () => {
                    if (isEmpty(referralSections)) {
                        referralSections = (await RadiologyInternalSectionService.getInternalSections())
                            .map((s: any) => ({
                                value: s.id,
                                label: `${s?.name}`.toUpperCase()
                            }))
                    }
                    return referralSections
                },
                config: {
                    showKeyboard: true,
                    footerBtns: [
                        {
                            name: 'Add Referral',
                            slot: 'end',
                            color: 'success',
                            onClick: async (f: any, c: any, field: any) => {
                                if (typeof field.filter != 'string' || field.filter.length < 3) {
                                    return toastWarning(`Please enter a valid name`)
                                }
                                if (field.filtered.some((i: Option) => i.label.toLowerCase() === field.filter.toLowerCase())) {
                                    return toastWarning(`Can't add already existing referral location`)
                                }
                                if ((await alertConfirmation(`Do you want to add referral location?`))) {
                                    const data = await RadiologyInternalSectionService.createInternalSection(field.filter.toUpperCase())
                                    if (data) {
                                        field.filter = data.name
                                        field.listData = [{label: data.name, value: data.id}, ...field.listData]
                                    } else {
                                        toastDanger(`Unable to add ${field.filter}`)
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        },
        payingField() {
            return {
                id: "paying",
                helpText: "Is this a paying patient?",
                type: FieldType.TT_SELECT,
                computedValue: (v: Option) => {
                    return {
                        obs: this.service.buildValueCoded('PAYING', v.value) 
                    }
                },
                validation: (v: Option) => Validation.required(v),
                options: () => {
                    return this.yesNoOptions()
                }
            }
        },
        paymentTypeField() {
            return {
                id: "payment_type",
                helpText: "Select payment method",
                type: FieldType.TT_SELECT,
                validation: (v: Option) => Validation.required(v),
                condition: (f: any) => f.paying.value === 'Yes',
                computedValue: (v: Option) => {
                    return {
                        obs: this.service.buildValueCoded('PAYMENT TYPE', v.value)
                    }
                },
                options: () => {
                    return this.mapStrToOptions([
                        'Cash',
                        'Invoice'
                    ])
                }
            }
        },
        receiptField() {
            return  {
                id: "receipt_number",
                helpText: "Enter receipt number",
                type: FieldType.TT_TEXT,
                condition: (f: any) => f.payment_type.value === 'Cash',
                computedValue: (v: Option) => {
                    return {
                        obs: this.service.buildValueText('RECEIPT NUMBER', v.value)
                    }
                },
                validation: (v: Option) => Validation.validateSeries([
                    () => Validation.required(v),
                    () => this.validateAmount(`${v.value}`)
                ])
            }
        },
        invoiceField() {
            return {
                id: "invoice_number",
                helpText: "Enter invoice number",
                type: FieldType.TT_TEXT,
                computedValue: (v: Option) => {
                    return {
                        obs: this.service.buildValueText('INVOICE NUMBER', v.value)
                    }
                },
                condition: (f: any) => f.payment_type.value === 'Invoice',
                validation: (v: Option) => Validation.required(v)
            }
        },
        paymentAmountField() {
            return {
                id: "payment_amount",
                helpText: "Enter payment amount",
                type: FieldType.TT_NUMBER,
                condition: (f: any) => f.receipt_number.value,
                computedValue: (v: Option) => {
                    return {
                        obs: this.service.buildValueNumber('PAYMENT AMOUNT', v.value)
                    }
                },
                validation: (v: Option) => Validation.validateSeries([
                    () => Validation.required(v),
                    () => this.validateAmount(`${v.value}`)
                ])
            }
        },
        invoiceAmountField() {
            return {
                id: "invoice_amount",
                helpText: "Enter invoice amount",
                type: FieldType.TT_NUMBER,
                condition: (f: any) => f.invoice_number.value,
                computedValue: (v: Option) => {
                    return {
                        obs: this.service.buildValueNumber('INVOICE AMOUNT', v.value)
                    }
                },
                validation: (v: Option) => Validation.validateSeries([
                    () => Validation.required(v),
                    () => this.validateAmount(`${v.value}`)
                ])
            }
        }
    }
})
</script>
