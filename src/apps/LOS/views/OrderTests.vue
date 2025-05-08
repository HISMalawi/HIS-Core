<template>
    <his-standard-form 
        :fields="fields" 
        :onFinishAction="onSubmit"
    />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field, Option } from "@/components/Forms/FieldInterface"
import EncounterMixinVue from '@/views/EncounterMixin.vue'
import {getFacilities} from "@/utils/HisFormHelpers/LocationFieldOptions"
import Validation from "@/components/Forms/validations/StandardValidations"
import { PatientLabService } from "@/apps/LOS/services/patient_lab_service"
import { OrderService } from "@/services/order_service"
import { ConceptService } from '@/services/concept_service'
import PersonField from "@/utils/HisFormHelpers/PersonFieldHelper"
import ART_GLOBAL_PROP from "@/apps/ART/art_global_props"
import HisDate from "@/utils/Date"
import { LabOrderService } from "@/services/lab_order_service"
import Store from "@/composables/ApiStore"
import { alertConfirmation, toastDanger, toastWarning } from "@/utils/Alerts"
import { Service } from '@/services/service'
import { loadingController } from "@ionic/vue";

export default defineComponent({
    mixins: [EncounterMixinVue],
    data: () => ({
        patientID: -1,
        service: {} as any,
        fields: [] as Field[],
        barcode: '' as any,
        activityType: '' as 'DRAW_SAMPLES' | 'ORDER_TESTS',
        canScanDBS: false as boolean,
        isNextBtnDisabled: true as boolean,
        verifyingBarcode: false
    }),
    async created() {
        this.canScanDBS = await ART_GLOBAL_PROP.canScanDBS()
    },
    watch: {
        '$route': {
            handler({query, params}: any) {
                if (query && params) {
                    this.patientID = params.patient_id
                    this.activityType = query.type
                    this.service = new PatientLabService(this.patientID)
                    this.fields = [
                        this.getClinianGivenNameField(),
                        this.getClinianFamilyNameField(),
                        this.getFacililityLocationField(),
                        this.getReasonForTestField(),
                        this.getTestSpecimensField(),
                        this.getTestSelectionField(),
                        this.getBarcodeInput(),
                        this.getTestCombinationField()
                    ]
                }
            },
            immediate: true,
            deep: true
        },
    },
    methods: {
        async onSubmit(_: any, computed: any) {
            const conceptIdToDelete = await ConceptService.getConceptID('HIV viral load') 
            const plasmaConceptId = await ConceptService.getConceptID('Plasma') 

            if(computed.specimen.concept_id != plasmaConceptId){
                const indexToDelete = computed.tests.findIndex((test: any) => test.concept_id === conceptIdToDelete);
                if (indexToDelete !== -1) {
                    const orders = new LabOrderService(parseInt(this.patientID), this.providerID);
                    const encounter = await orders.createEncounter();

                    if(encounter) {
                        const deletedTest = computed.tests.splice(indexToDelete, 1)[0];
                        const formattedOrders: any = this.buildLabOrders(computed, deletedTest.concept_id,encounter)
                        const d =await  OrderService.saveOrdersArray(encounter.encounter_id, formattedOrders);
            
                        if(!d) return toastWarning('Unable to save lab orders')

                        Store.invalidate('PATIENT_LAB_ORDERS')
                        const canPrintOrders = await alertConfirmation('Lab orders and encounter created!, print out your last orders?', { 
                        confirmBtnLabel: 'Yes',
                        cancelBtnLabel: 'No'
                        })
                        if(canPrintOrders) await this.service.printSpecimenLabel(d[0].order_id)
                        if(computed.tests.length <= 0) this.$router.push(`/patient/dashboard/${this.patientID}`)
                    }
                } 
            }
            
            if(computed.tests.length > 0){
                const req = await this.service.placeOrder(computed)
                if (req) {
                    await this.service.printSpecimenLabel(req[0].order_id)
                    this.$router.push(`/patient/dashboard/${this.patientID}`)
                } 
            }
        },
        buildLabOrders(computed: any, concept_id: any,encounter: any) {
            return [{
                ...(this.barcode  ? {'accession_number': this.barcode} : {}),
                'encounter_id': encounter.encounter_id,
                'tests': [{ 'concept_id': concept_id }],
                'reason_for_test_id': computed.reason_for_test_id,
                'target_lab': computed.target_lab,
                'date': HisDate.toStandardHisFormat(Service.getSessionDate()),
                'requesting_clinician': computed.requesting_clinician,
                'specimen':{"concept_id": computed.specimen.concept_id}
            }]
        },
        async verifyingScanedBarcode(barcode: string) {
            this.verifyingBarcode = !this.verifyingBarcode;
            if (this.verifyingBarcode) return false;
            (await loadingController.create({ message: `Checking ${barcode}`})).present()
            this.isNextBtnDisabled = true
            // Expected barcode examples: L5728043 or 57280438
            const barcodeOk = /^([A-Z]{1})?[0-9]{7,8}$/i.test(`${barcode}`.trim())
            if (!barcodeOk) {
                toastWarning("Invalid Barcode")
                this.verifyingBarcode = false
                loadingController.getTop().then(v => v && loadingController.dismiss())
                return false ;
            }
            /**
             * Verify with API if barcode was already used:
             */
            try {
                if (!(await OrderService.accessionNumExists(barcode))) {
                    this.barcode = barcode
                    this.isNextBtnDisabled = false
                    return true
                } else {
                toastWarning(`Barcode ${barcode} was already used`)
                }
            } catch (e) {
                toastDanger("Failed to confirm barcode " + barcode + ", Please try again later", 8000)  
            }
            this.verifyingBarcode = false
            loadingController.getTop().then(v => v && loadingController.dismiss())
        },
        getFacililityLocationField(): Field {
            return {
                id: 'target_lab',
                helpText: 'Requesting location',
                type: FieldType.TT_SELECT,
                defaultValue: () => PatientLabService.getLocationName(),
                validation: (val: Option) => Validation.required(val),
                options: (_: any, filter='') => getFacilities(filter),
                computedValue: (val: Option) => val.label,
                config: {
                    showKeyboard: true,
                    isFilterDataViaApi: true
                }
            }
        },
        getClinianGivenNameField(): Field {
            const field = PersonField.getGivenNameField()
            field.helpText = 'Requesting clinician - First name'
            field.proxyID = 'requesting_clinician'
            field.condition = () => this.activityType === 'DRAW_SAMPLES'
            field.appearInSummary = () => false
            return field
        },
        getClinianFamilyNameField(): Field {
            const field = PersonField.getFamilyNameField()
            field.helpText = 'Requesting clinician - Last name'
            field.proxyID = 'requesting_clinician'
            field.condition = () => this.activityType === 'DRAW_SAMPLES'
            field.summaryMapValue = (v: any, f: any) => {
                return {
                    label: 'Clinician name', 
                    value: `${f.given_name.value} ${v.value}`
                }
            },
            field.computedValue = (v: Option, f: any) => `${f.given_name.value} ${v.value}`
            return field
        },
        getReasonForTestField(): Field {
            return {
                id: 'reason_for_test_id',
                helpText: 'Reason for test',
                type: FieldType.TT_SELECT,
                validation: (val: Option) => Validation.required(val),
                computedValue: (val: any) => ConceptService.getCachedConceptID(
                    val.value, true
                ),
                options: () => [
                    {label: 'Routine', value: 'Routine'},
                    {label: 'Targeted', value: 'Targeted'},
                    {label: 'Confirmatory', value: 'Confirmatory'},
                    {label: 'Repeat / Missing', value: 'Repeat / Missing'},
                    {label: 'Stat', value: 'Stat'}
                ]
            }
        },
        getTestSpecimensField(): Field {
            return { 
                id: 'specimen',
                helpText: 'Select specimen',
                type: FieldType.TT_SELECT,
                condition: () => this.activityType === 'DRAW_SAMPLES',
                validation: (val: Option) => Validation.required(val),
                computedValue: (v: Option) => ({'concept_id': v.value}),
                options: async () => {
                    const req = await OrderService.getSpecimens('')
                    return req.map((d: any) => ({
                        label: d.name, 
                        value: d.concept_id
                    }))
                },
                config: {
                    showKeyboard: true
                }
            }
        },
        getTestSelectionField(): Field {
            let activeSpecimen = ''
            return {
                id: 'tests',
                helpText: 'Select tests',
                type: FieldType.TT_GRID_SELECTOR,
                validation: (val: Option) => Validation.required(val),
                computedValue: (val: Array<Option>) => {
                    return val.map(v => ({'concept_id': v.value}))
                },
                options: async (f: any, c: any, listData: Option[]) => {
                    if (f.specimen && f.specimen.label != activeSpecimen) {
                        activeSpecimen = f.specimen.label
                        const req = await OrderService.getTestTypesBySpecimen(
                            f.specimen.label
                        )
                        return req.map((t: any) => ({
                            label: t.name,
                            value: t.concept_id,
                            isChecked: false,
                            other: t
                        }))
                    } else {
                        return listData
                    }
                }
            }
        },
        getBarcodeInput(): Field{
            return  {
            id: "barcode",
            helpText: "Scan viral load barcode",
            type: FieldType.TT_BARCODE,
            onValue: async (id: string) => {
                return await this.verifyingScanedBarcode(id)
            },
            summaryMapValue: (v: any) => {
                    return {
                        label: "Scaned Barcode",
                        value: v
                    }
                },
            condition: (val: any) => val.tests.some((item: any) => item.label === 'HIV viral load' && this.canScanDBS) &&
            val.specimen.label !== "Plasma",
            config : {
                hiddenFooterBtns : ['Clear'],
                overrideDefaultFooterBtns: {
                    nextBtn: {
                        name: 'Next',
                        state: {
                            disabled: {
                                default: () => this.isNextBtnDisabled
                            }
                        },
                    }
                },
                showScannedBarcode: true,
            },
        }

        },
        getTestCombinationField(): Field {
            return {
                id: 'combine_tests',
                helpText: 'Combine test(s) in one order',
                type: FieldType.TT_SELECT,
                computedValue: (val: Option) => val.value === 'Yes',
                condition: (f: any) => f.tests.length > 1,
                validation: (val: Option) => Validation.required(val),
                options: () => this.yesNoOptions()
            }
        }
    }
})
</script>
