<template>
    <his-standard-form :skipSummary="true" @onIndex="fieldComponent=''" :activeField="fieldComponent" :cancelDestinationPath="cancelDestination" :fields="fields" :onFinishAction="onSubmit"/>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field, Option } from "@/components/Forms/FieldInterface"
import { RegimenInterface } from "@/interfaces/Regimen"
import Validation from "@/components/Forms/validations/StandardValidations"
import { PrescriptionService } from "@/apps/ART/services/prescription_service"
import { toastWarning, toastSuccess, alertConfirmation } from "@/utils/Alerts"
import HisDate from "@/utils/Date"
import { matchToGuidelines } from "@/utils/GuidelineEngine"
import { isEmpty, isPlainObject } from "lodash"
import EncounterMixinVue from '../../../../views/EncounterMixin.vue'
import { 
    PRESCRIPTION_GUIDELINES,
    DRUG_FREQUENCY_GUIDELINE,
    TargetEvent, 
    Target, 
    FlowState 
} from "@/apps/ART/guidelines/prescription_guidelines"
import { HTN_SESSION_KEY } from '../../services/htn_service'
import { ProgramService } from '@/services/program_service'
import table from "@/components/DataViews/tables/ReportDataTable"
import Store from "@/composables/ApiStore"
import { ConsultationService } from '../../services/consultation_service'
import { PatientTypeService } from '../../services/patient_type_service'

const MEDICATION_STYLE = { style : { fontSize:'1.3rem !important', borderBottom: 'solid 2px #ccc', color: 'black', background: 'white' }}

export default defineComponent({
    mixins: [EncounterMixinVue],
    data: () => ({
        drugs: [] as Array<RegimenInterface>,
        prescription: {} as any,
        patientToolbar: [] as Array<Option>,
        fieldComponent: '' as string,
        regimenExtras: [] as Array<any>,
        programInfo: [] as any,
        allDrugs: [] as any,
        htnDrugs: [] as any,
        facts: {
            age: -1 as number,
            gender: '' as string,
            weight: -1 as number,
            currentDate: '' as string,
            isChildBearing: false as boolean,
            prescriptionType: '' as 'Custom' | 'Regimen',
            patientType: "",
            tptStatus: {} as any,
            tptPrescriptionCount: 0,
            currentRegimenCode: -1 as number,
            currentRegimenStr: '' as string,
            drug: '' as string,
            drugs: [] as Array<any>,
            contraindications: {} as any,
            hasSideEffects: false as boolean,
            sideEffectsTable: {} as any,
            lastSideEffectDate: '' as string,
            regimenCode: -1 as number,
            regimenCodeStr: '' as string,
            regimenName: '' as string,
            regimenDrugs: [] as any,
            hangingPills: [] as Array<any>,
            reasonForSwitch: '' as string,
            starterPackNeeded: false as boolean,
            hangingPillsStatus: '' as string,
            treatmentInitiationState: '' as string,
            lpvType: '' as string,
            medicationOrders: [] as Array<any>,
            selectedInterval: 0 as number
        }
    }),
    watch: {
        ready: {
            async handler(ready: boolean) {
                if (!ready) return
                this.prescription = new PrescriptionService(this.patientID, this.providerID)
                await this.prescription.loadMedicationOrders()
                await this.prescription.loadFastTrackStatus()
                if (!this.prescription.medicationOrdersAvailable() && !this.prescription.isFastTrack()) {
                    toastWarning('Patient is not eligible for treatment Today! Please check HIV Clinic Consultation')
                    return this.gotoPatientDashboard()
                }
                if ((await Store.get('ASK_HANGING_PILLS'))) {
                    await this.prescription.loadHangingPills()
                }
                await this.prescription.loadRegimenExtras()
                await this.prescription.loadTreatmentState()
                await this.prescription.loadDrugInduced()
                await this.prescription.loadContraindications()
                await this.prescription.loadTptPrescriptionCount()

                await this.initFacts(this.patient)

                if (this.prescription.shouldPrescribeExtras()) {
                    this.regimenExtras = this.prescription.getRegimenExtras()
                }

                this.htnDrugs = this.resolveHtnDrugs()

                if (this.prescription.isFastTrack()) {
                    await this.prescription.loadFastTrackMedications()
                    this.drugs = this.prescription.getFastTrackMedications()
                    this.fieldComponent = 'next_visit_interval'

                } else if (!this.prescription.shouldPrescribeArvs()) {
                    this.drugs = [...this.regimenExtras||[], ...this.htnDrugs||[]]
                }
                this.patientToolbar = await this.getPatientToolBar()
                this.fields = this.getFields()
            },
            immediate: true
        },
        drugs: {
            handler(drugs: Array<any>) {
                this.facts.drugs = drugs.map(d => d.drug_id)
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        async initFacts(patient: any) {
            this.programInfo = await ProgramService.getProgramInformation(patient.getID())
            this.facts.age = patient.getAge()
            this.facts.gender = patient.getGender()
            this.facts.weight = await patient.getRecentWeight()
            this.facts.hangingPills = this.prescription.getHangingPills()
            this.facts.treatmentInitiationState = this.prescription.getTreatmentState()
            this.facts.currentRegimenStr = this.programInfo.current_regimen
            this.facts.currentRegimenCode = this.extractRegimenCode(this.programInfo.current_regimen)
            this.facts.medicationOrders = this.prescription.getMedicationOrders()
            this.facts.contraindications = this.prescription.getContraindications()
            this.facts.tptPrescriptionCount = this.prescription.getTptPrescriptionCount()
            this.facts.lastSideEffectDate = this.prescription.getLastSideEffectDate()
            this.facts.currentDate = PrescriptionService.getSessionDate()
            this.facts.isChildBearing = patient.isChildBearing()
            this.facts.tptStatus = await new ConsultationService(this.patientID, this.providerID).getTptTreatmentStatus()
            const patientType = new PatientTypeService(this.patientID, this.providerID)
            await patientType.loadPatientType()
            this.facts.patientType = patientType.patientType
        },
        async onSubmit(form: any, computedData: any) {
            const encounter = await this.prescription.createEncounter()

            this.prescription.setNextVisitInterval(form[Target.INTERVAL_SELECTION].value)

            const payload = this.mapOrder(this.drugs)

            if (!encounter) return toastWarning('Unable to create treatment encounter')

            const drugOrder = await this.prescription.createDrugOrder(payload) 

            if(!drugOrder) return toastWarning('Unable to create drug orders!')

            if (this.facts.reasonForSwitch) {
                await this.prescription.createRegimenSwitchObs(this.facts.reasonForSwitch)
            }

            if (this.facts.hangingPillsStatus) {
                await this.prescription.createHangingPillsObs(this.facts.hangingPillsStatus)
            }

            if (Object.keys(computedData).length) {
                await this.prescription.saveObservationList((await this.resolveObs(computedData)))
            }

            toastSuccess('Drug order has been created')
            Store.invalidate('PATIENT_PROGRAM')
            this.nextTask()
        },
        async onEvent(target: Target, targetEvent: TargetEvent) {
            const findings = matchToGuidelines(this.facts, PRESCRIPTION_GUIDELINES, target, targetEvent)
            for(const index in findings) {
                const finding = findings[index]

                if (finding?.actions?.alert) {
                    const state = await finding?.actions?.alert(this.facts)
                    if (state === FlowState.EXIT)
                        return false
                }
            }
            return true
        },
        onBuildOptions(target: Target, targetEvent: TargetEvent){
            const findings = matchToGuidelines(this.facts, PRESCRIPTION_GUIDELINES, target, targetEvent)
            for(const index in findings) {
                const finding = findings[index]

                if (finding.data) return finding.data
            }
            return {}
        },
        async onRegimen({ label, value, other }: Option) {
            this.facts.lpvType = ''
            this.facts.hangingPillsStatus = ''
            this.facts.starterPackNeeded = false
            this.facts.regimenName = `${value} (${label})`
            this.facts.regimenCodeStr = value.toString()
            this.facts.regimenCode = this.extractRegimenCode(value.toString())
            this.facts.regimenDrugs = other.regimenDrugs
            this.facts.drugs = other.regimenDrugs.map((d: any) => d.drug_id)

            const sideEffects = this.prescription.findAndGroupDrugSideEffects(this.facts.drugs)
            this.facts.hasSideEffects = !isEmpty(sideEffects)
            this.facts.sideEffectsTable = this.buildSideEffectsTable(sideEffects)
        },
        async onBeforeRegimenNext() {
            const event = await this.onEvent(Target.ARV_REGIMENS, TargetEvent.BEFORE_NEXT)
            let drugs = []

            if (!event) return false

            if (this.facts.lpvType) {
               drugs = await this.getLpvDrugs()
            } else if (this.facts.starterPackNeeded) {
               drugs = await this.getStarterPackDrugs()
               if (isEmpty(drugs)) {
                    drugs = this.facts.regimenDrugs
               }
            } else {
                drugs = this.facts.regimenDrugs
            }
            this.drugs = [...this.regimenExtras,...this.htnDrugs, ...drugs]
            return true
        },
        getLpvDrugs() {
            return this.prescription.getLvpDrugsByType(
                this.facts.lpvType, this.facts.regimenCode
            ) 
        },
        resolveHtnDrugs() {
            try {
                const sessionData = sessionStorage.getItem(HTN_SESSION_KEY.Prescription)
                if (typeof sessionData === 'string') {
                    const data = JSON.parse(sessionData)
                    if (isPlainObject(data) && data[this.patientID]) {
                        return data[this.patientID]
                    }
                }
            } catch (e) {
                console.warn(e)
            }
            return []
        },
        getStarterPackDrugs() {
            return this.prescription.getRegimenStarterpack(
                this.facts.regimenCode, this.facts.weight
            )
        },
        setCustomDrugs(drugs: any) {
            this.drugs = [...this.htnDrugs, ...drugs.map((drug: Option) => drug.other)]
        },
        buildSideEffectsTable(sideEffects: any) {
            const columns = ['Date', 'Contraindication(s)', 'Side effect(s)']
            const rows = []
            for(const date in sideEffects) {
                const contraindications = this.facts.contraindications[date] || []
                rows.push([
                    HisDate.toStandardHisDisplayFormat(date), 
                    contraindications.join(', '),
                    sideEffects[date].join(', ')
                ])
            }
            return { columns, rows }
        },
        async buildRegimenOptions() {
            const regimenCategories = await this.prescription.getPatientRegimens()
            const options = []
            for(const value in regimenCategories) {
                const regimenDrugs = regimenCategories[value]
                const label = regimenDrugs.map((r: RegimenInterface) => 
                    r.alternative_drug_name || r.concept_name).sort().join(' + ')

                options.push({ 
                    label, 
                    value, 
                    other: {
                        regimenDrugs 
                    } 
                })
            }
            return options
        },
        buildIntervalOptions() {
            const intervals = [
                { label: '2 weeks', value: 14 },
                { label: '1 month', value: 28 },
                { label: '2 months', value: 56 },
                { label: '3 months', value: 84 },
                { label: '4 months', value: 112 },
                { label: '5 months', value: 140 },
                { label: '6 months', value: 168 },
                { label: '7 months', value: 196 },
                { label: '8 months', value: 224 },
                { label: '9 months', value: 252 },
                { label: '10 months', value: 280 },
                { label: '11 months', value: 308 },                        
                { label: '12 months', value: 336 },
            ]
            return intervals.map(({label, value}: Option) => {
                this.facts.selectedInterval = parseInt(value.toString())
                const config = this.onBuildOptions(Target.INTERVAL_SELECTION, TargetEvent.ON_BUILD)
                return {
                    label,
                    value,
                    other: {
                        ...config,
                        ...this.getDrugEstimates(this.drugs, this.facts.selectedInterval)
                    }
                }
            })
        },
        getDrugFrequency(drugName: string){
            this.facts.drug = drugName
            const findings = matchToGuidelines(this.facts, DRUG_FREQUENCY_GUIDELINE)

            if (!isEmpty(findings)) {
                return findings[0].concept
            }
        },
        extractRegimenCode(regimen: string): number {
          try {
               if (regimen.match(/n\/a/i)) return -1

               return parseInt(regimen.substring(0, regimen.length))
           } catch (e) {
               console.warn(e)
               return -1
           }
        },
        getDrugEstimates(regimens: any, interval: number) {
            this.prescription.setNextVisitInterval(interval)
            const nextAppointment = this.prescription.calculateDateFromInterval()
            const drugPacks = regimens.map((regimen: RegimenInterface) => {
                const packSize = this.prescription.getDrugPackSize(regimen)
                const pillsPerDay = this.prescription.calculatePillsPerDay(regimen.am, regimen.noon, regimen.pm)
                const estimatedPackSize = this.prescription.estimatePackSize(pillsPerDay, packSize)     
                return {
                    label: regimen.alternative_drug_name || regimen.drug_name,
                    value: estimatedPackSize
                } 
            })
            return {
                label: 'Medication run-out date:',
                value: HisDate.toStandardHisDisplayFormat(nextAppointment),
                other: {
                    label: "Estimated packs/tins:",
                    value: drugPacks
                }
            }
        },
        mapOrder(regimens: Array<RegimenInterface>) {
            return regimens.map((regimen: any) => {
                return this.prescription.toOrderObj(
                    regimen.drug_id, 
                    regimen.alternative_drug_name || regimen.drug_name,
                    regimen.units, 
                    regimen.am, 
                    regimen.pm,
                    regimen.frequency || this.getDrugFrequency(regimen.drug_name)
                )
            })
        },
        async getPatientToolBar() {
            const reasonForSwitch = await this.prescription.getReasonForRegimenSwitch()
            return [
                { label: 'Age', value: `${this.patient.getAge()} Year(s)` },
                { label: 'Gender', value: this.patient.getGender() },
                { label: 'Current Regimen', value: this.programInfo.current_regimen },
                { label: 'Current weight', value: `${this.facts.weight} kg(s)` || 'Unknown' },
                { label: 'Reason for change', value: reasonForSwitch }
            ]
        },
        getFields(): Array<Field> {
            return [
                {
                    id: Target.ARV_REGIMENS,
                    helpText: 'ARV Regimen(s)',
                    type: FieldType.TT_ART_REGIMEN_SELECTION,
                    condition: () => this.prescription.shouldPrescribeArvs(),
                    validation: (val: Option) => Validation.required(val),
                    options: () => this.buildRegimenOptions(),
                    onload: () => this.facts.prescriptionType = 'Regimen',
                    onValue: (regimen: Option) => {
                        this.onRegimen(regimen)
                        return this.onEvent(Target.ARV_REGIMENS, TargetEvent.ON_VALUE)
                    },
                    beforeNext: () => this.onBeforeRegimenNext(),
                    config: {
                        toolbarInfo: this.patientToolbar,
                        footerBtns: [
                            {
                                name: 'Custom Regimen',
                                slot: 'end',
                                onClick: () => {
                                    this.fieldComponent = 'custom_regimen'
                                }
                            }
                        ]
                    }
                },
                {
                    id: 'custom_regimen',
                    helpText: 'Custom prescription',
                    type: FieldType.TT_MULTIPLE_SELECT,
                    condition: () => this.facts.prescriptionType === 'Custom',
                    onload: () => this.facts.prescriptionType = 'Custom',
                    validation: (val: Option) => Validation.required(val),
                    beforeNext: async (options: Option[]) => {
                        const selected = options.map(o => o.other.concept_id)
                        const areRequiredDrugsSelected = this.regimenExtras.map(v => v.concept_id)
                            .every(conceptID => selected.includes(conceptID))
                        if (!areRequiredDrugsSelected) {
                            return (await alertConfirmation(`One or more required drugs in "${this.regimenExtras.map((d: any) => d.drug_name)}" is missing from your selection, do you want to proceed?`))
                        }
                        return true
                    },
                    options: async () => {
                        if (isEmpty(this.allDrugs)) {
                            this.allDrugs = await this.prescription.getCustomIngridients()
                        }
                        return this.allDrugs.map((drug: any) => {
                            const option: Option = {
                                label: drug.name,
                                value: drug.drug_id,
                                other: { ...drug }
                            }
                            if (this.facts.tptStatus.tpt != null && /INH|3HP|RIF|Isoniazid/i.test(drug.name)) {
                                if (this.facts.tptStatus.tb_treatment) {
                                    return {
                                        ...option,
                                        disabled: true,
                                        description: {
                                            color: 'danger',
                                            show: 'always',
                                            text: 'Client on TB Treatment'
                                        }
                                    }
                                }
                                if (this.facts.tptStatus.completed) {
                                    return {
                                        ...option,
                                        disabled: true,
                                        description: {
                                            color: 'danger',
                                            show: 'always',
                                            text: 'Client completed ' + this.facts.tptStatus.tpt
                                        }
                                    }
                                }
                                if (/IPT/i.test(this.facts.tptStatus.tpt) && /3HP|RIF/i.test(drug.name)) {
                                    return {
                                        ...option,
                                        disabled: true,
                                        description: {
                                            color: "danger",
                                            show: "always",
                                            text: "Client is on IPT"
                                        }
                                    }
                                }
                            }
                            return option
                        })
                    },
                    config: {
                        showKeyboard: true,
                        hiddenFooterBtns: [ 'Back' ],
                        footerBtns: [
                            {
                                name: 'Standard Regimen',
                                size: 'large',
                                slot: 'end',
                                color: 'primary',
                                visible: false,
                                onClick: () => {
                                    this.fieldComponent = 'arv_regimens'
                                }
                            }
                        ]
                    }
                },
                {
                    id: 'custom_dosage',
                    helpText: 'Custom dose',
                    type: FieldType.TT_DOSAGE_INPUT,
                    condition: (f: any) => !isEmpty(f.custom_regimen),
                    validation: (val: Array<Option>) => {
                        if (Validation.required(val)) return ['Drugs are not available']

                        const empty = val.map(({ other }: Option) => other.am <= 0 && other.pm <= 0)
                        return empty.some(Boolean) ? ['Missing dosage configuration on some drugs'] : null
                    },
                    unload: (data: any) => this.setCustomDrugs(data),
                    summaryMapValue: ({other}: any) => ({
                        label: 'Dosages', 
                        value: this.prescription.getInstructions(
                            other.drug_name, other.am, other.pm, other.units
                        ) 
                    }),
                    options: (fdata: any) => {
                        return fdata.custom_regimen.map((regimen: Option) => ({
                            label: regimen.label,
                            value: regimen.value,
                            other: {
                                'drug_id': regimen.other.drug_id,
                                'drug_name': regimen.label,
                                'barcodes': regimen.other.barcodes,
                                'units': regimen.other.units,
                                'am': 0,
                                'noon': 0,
                                'pm': 0,
                                'frequency': this.getDrugFrequency(regimen.label)
                            }
                        }))
                    }
                },
                {
                    id: 'selected_meds',
                    helpText: 'Selected medication',
                    type: FieldType.TT_DATA_TABLE,
                    config: {
                        toolbarInfo: this.patientToolbar,
                        hiddenFooterBtns: [ 'Clear' ],
                        dataTableConfig: {
                            showIndex: false
                        },
                        viewPortStyle: {
                            height: '76vh'
                        },
                        columns: () => [
                            [
                                table.thTxt('Drug name', MEDICATION_STYLE),
                                table.thTxt('Units', MEDICATION_STYLE),
                                table.thTxt('AM', MEDICATION_STYLE),
                                table.thTxt('Noon',  MEDICATION_STYLE),
                                table.thTxt('PM', MEDICATION_STYLE),
                                table.thTxt('Frequency', MEDICATION_STYLE)
                            ]
                        ],
                        rows: () => this.drugs.map((d: any) => {
                            const conf = {
                                style: {
                                    'height': '6vh'
                                },
                                cssClass:  (() => {
                                    if (d.drug_name.match(/cotrimoxazole/i)) {
                                        return 'adult-regimen-formulation'
                                    }
                                    switch(d.regimen_category) {
                                        case 'A':
                                            return 'adult-regimen-formulation'
                                        case 'P':
                                            return 'peads-regimen-formulation'
                                    }
                                })()
                            }
                            return [
                                table.td(d.alternative_drug_name || d.drug_name, conf),
                                table.td(d.units, conf),
                                table.td(d.am, conf),
                                table.td(d.noon, conf),
                                table.td(d.pm, conf),
                                table.td(d.frequency || this.getDrugFrequency(d.drug_name), conf)
                            ]         
                        })
                    }
                },
                {
                    id: Target.INTERVAL_SELECTION,
                    helpText: 'Interval to next visit',
                    type: FieldType.TT_NEXT_VISIT_INTERVAL_SELECTION,
                    validation: (val: Option) => Validation.required(val),
                    options: () => this.buildIntervalOptions(),
                    onValue: () => this.onEvent(Target.INTERVAL_SELECTION, TargetEvent.ON_VALUE),
                    beforeNext: () => this.onEvent(Target.INTERVAL_SELECTION, TargetEvent.BEFORE_NEXT), 
                    config: {
                        showRegimenCardTitle: false
                    }
                },
                {
                    id: "reason_for_longer_duration",
                    helpText: "Specify reason for prescribing medication over 6 months",
                    type: FieldType.TT_NOTE,
                    condition: (f: any) => f[Target.INTERVAL_SELECTION].value > 168,
                    validation: (val: Option) => Validation.required(val),
                    computedValue: (val: Option) => {
                        return {
                            obs: this.prescription.buildValueText(
                                "Why prescribe medication for more than 6 months?",
                                `${val.value}`
                            )
                        }
                    }
                }
            ]
        }
    }
})
</script>
