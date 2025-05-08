<template>
    <his-standard-form
        :key="hisFormKey"
        :activeField="fieldComponent"
        :skipSummary="true"
        :fields="fields"
        @onIndex="fieldComponent=''"
        @onFinish="onFinish"
    />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field, Option } from "@/components/Forms/FieldInterface"
import { toastWarning, toastSuccess, toastDanger } from "@/utils/Alerts"
import Validation from "@/components/Forms/validations/StandardValidations"
import { EstimationFieldType, generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import { ProgramService } from "@/services/program_service"
import { PatientProgramService } from "@/services/patient_program_service"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { find, findIndex, isEmpty } from 'lodash'
import HisDate from "@/utils/Date"
import popVoidReason from "@/utils/ActionSheetHelpers/VoidReason"
import { getFacilities } from "@/utils/HisFormHelpers/LocationFieldOptions"
import Store from "@/composables/ApiStore"

export default defineComponent({
    components: { HisStandardForm },
    data: () => ({
        hisFormKey: 0 as number,
        patient: {} as any,
        patientProgram: {} as any,
        fields: [] as Array<Field>,
        fieldComponent: '' as string,
        activeField: '' as string,
        activeProgram: {} as any,
        programSelectionFieldContext: {} as any
    }),
    watch: {
        fieldComponent(field: string){
            if (field) {
                this.activeField = field
            }
        },
        activeField(field: string) {
            if (field === 'program_selection') {
                // Recent hisFormKey to re-render everything
                this.hisFormKey += 1
            }
        },
        '$route': {
            async handler({params}: any) {
                if (params && params.patient_id) {
                    this.patient = params.patient_id
                    this.patientProgram = new PatientProgramService(this.patient)
                    this.fields = [
                        this.getProgramSelectionField(),
                        this.getProgramEnrollmentField(),
                        ...this.getProgramOutcomeDateFields(),
                        this.getProgramStateField(),
                        this.getTransferOutFacilityFields(),
                        ...this.getTransferoutReasonFields(),
                        this.getStateOutcomeDateFields()
                    ]
                }
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        async onFinish(f: any) {
            switch(this.activeField) {
                case 'program_enrollment':
                    await this.onEnrollProgram()
                    break;
                case 'program_state':
                    await this.onProgramState(f)
                    break;
            }
            Store.invalidate('PATIENT_PROGRAM')
        },
        async patientPrograms() {
            const programs = await this.patientProgram.getPrograms()
            return programs.map((p: any) => ({
                label: p.program.name,
                value: p.program.program_id,
                other: {
                    ...p,
                    programStates: p.patient_states.map((s: any) =>{
                        return {
                            name: s.name,
                            startDate: HisDate.toStandardHisDisplayFormat(s.start_date),
                            endDate: s.end_date ? HisDate.toStandardHisDisplayFormat(s.end_date): 'N/A',
                            actions: this.getStateActions(s)
                        }
                    }) 
                }
            }))
        },
        async allPrograms() {
            const hasPrograms = this.programSelectionFieldContext.listData
            const programs = await ProgramService.getAllPrograms()
            // Build programs while excluding already existing ones
            return programs.map((p: any) => ({
                label: p.name,
                value: p.program_id,
                disabled: find(hasPrograms, { value: p.program_id }),
                other: { ...p }
            }))
        },
        async programWorkflows() {
            const workflows = await ProgramService.getProgramWorkflows(this.patientProgram.getProgramId())
            if (!isEmpty(workflows)) {
                return workflows[0].states.map((s: any) => ({
                    label: s.name, 
                    value: s.program_workflow_state_id,
                    other: { ...s }
                }))
            }
        },
        getStateActions(s: any) {
            const actions = [
                {
                    name: 'Void',
                    color: 'danger',
                    action: async (pg: any, sIndex: number) => {
                        await this.onVoidState(s.patient_state_id, pg, sIndex)
                    } 
                }
            ]
            if (s.name === 'Patient transferred out') {
                actions.push({
                    name: 'Print',
                    color: 'primary',
                    action: async () => await this.patientProgram.printTransferout(s.start_date)
                })
            }
            return actions
        },
        onUpdateState() {
            if (this.patientProgram.getProgramId() === -1) {
                return toastWarning('Please select a program')
            }
            this.fieldComponent = 'program_state'
        },
        async onProgramState(f: any) {
            try {
                await this.patientProgram.updateState()
                this.fieldComponent = 'program_selection'
                if (f.transfer_out_state) {
                    await this.patientProgram.transferOutEncounter(
                        f.transfer_out_state.other, 
                        f.reason_for_transferrout.value
                    )
                } 
                toastSuccess('State has been updated')
            } catch(e) {
                toastDanger(`${e}`)
            }
        },
        async onEnrollProgram() {
            const programId = this.patientProgram.getProgramId()
            if (programId === -1) {
                return toastWarning('Please select a program')
            }
            try {
                this.activeProgram = await this.patientProgram.enrollProgram()
                this.fieldComponent = 'program_state'
                toastSuccess('Patient has been enrolled!')
            }catch(e) {
                this.activeProgram = {}
                toastDanger(`${e}`)
            }
        },
        async onVoidState(state: any, activeProgram: any, stateIndex: number) {
            await popVoidReason(async (reason: string) => {
                try {
                    this.patientProgram.setStateId(state)
                    await this.patientProgram.voidState(reason)
                    this.patientProgram.setStateId(-1)
                    activeProgram.other.programStates.splice(stateIndex, 1)
                    toastSuccess('State has been voided')
                }catch(e) {
                  toastDanger(`${e}`)
                }
            })
        },
        async onVoidProgram() {
            const patientProgramId = this.patientProgram.getPatientProgramId()
            if (patientProgramId === -1) {
                return toastWarning('Please select a program')
            }
            await popVoidReason(async (reason: string) => {
                try {
                    await this.patientProgram.voidProgram(reason)
                    const fieldContext = this.programSelectionFieldContext
                    const programIndex = findIndex(fieldContext.listData, { value: this.patientProgram.getProgramId() })
                    fieldContext.listData.splice(programIndex, 1)
                    fieldContext.activeProgram = {}
                    this.patientProgram.setPatientProgramId(-1)
                    this.patientProgram.setProgramId(-1)
                    toastSuccess('Program removed')
                } catch(e) {
                    console.error(e)
                    toastDanger(`${e}`)
                }
            })
        },
        getStateOutcomeDateFields(): Field {
            return {
                id: 'state_outcome_date',
                helpText: 'Select Outcome date',
                type: FieldType.TT_DATE_PICKER,
                defaultValue: () => ProgramService.getSessionDate(),
                validation: (val: any) => Validation.required(val),
                condition: (f: any) => f.program_state,
                computedValue: (date: string) => this.patientProgram.setStateDate(date),
                config: {
                    minDate: () => this.patientProgram.getProgramDate(),
                    maxDate: () => ProgramService.getSessionDate(),
                    infoItems: (date: string) => {
                        return [{
                            label: 'Selected Outcome Date',
                            value: HisDate.toStandardHisDisplayFormat(date)
                        }]
                   } 
                }
            }
        },
        getTransferOutFacilityFields(): Field {
            return {
                id: "transfer_out_state",
                helpText: 'Please Select facility name',
                type: FieldType.TT_SELECT,
                validation: (val: Option) => Validation.required(val),
                condition: (f: any) => f.program_state.label === 'Patient transferred out',
                options: (_: any, filter='') => getFacilities(filter),
                config: {
                    showKeyboard: true,
                    isFilterDataViaApi: true
                }
            }
        },
        getTransferoutReasonFields(): Field[] {
            return [
                {
                    id: "transferout_reasons",
                    proxyID: 'reason_for_transferrout',
                    helpText: "Reason for Transferring out",
                    type: FieldType.TT_SELECT,
                    validation: (v: Option) => Validation.required(v),
                    condition: (f: any) => f.program_state.label === "Patient transferred out",
                    options: () => {
                        const opt: any = (val: string) => ({label: val, value: val})
                        return [
                            opt('Workplace transfer/lost job-related reasons'),
                            opt('Relocation to another place/home village'),
                            opt('Transport due to long distance'),
                            opt('School'),
                            opt('Business'),
                            opt('Marriage'),
                            opt('Unknown'),
                            opt('Clinic not helping'),
                            opt('Other')
                        ]
                    }
                },
                {
                    id: 'transferout_other',
                    proxyID: 'reason_for_transferrout',
                    helpText: 'Other Reason for Transferring out',
                    type: FieldType.TT_TEXT,
                    condition: (f: any) => f.transferout_reasons.value === 'Other',
                    validation: (v: Option) => Validation.required(v)
                }
            ]
        },
        getProgramStateField(): Field {
            return {
                id: "program_state",
                helpText: "State",
                type: FieldType.TT_SELECT,
                validation: (val: Option) => Validation.required(val),
                options: () => this.programWorkflows(),
                condition: () => this.activeField === 'program_state',
                unload: (val: Option) => this.patientProgram.setStateId(val.value)
            }
        },
        getProgramEnrollmentField(): Field {
            return {
                id: "program_enrollment",
                helpText: "Please select a programme",
                type: FieldType.TT_SELECT,
                condition: () => this.activeField === 'program_enrollment',
                unload: (val: Option) => this.patientProgram.setProgramId(val.value),
                options: () => this.allPrograms(),
                validation: (val: any) => Validation.required(val),
                config: {
                    showKeyboard: true
                }
            }
        },
        getProgramOutcomeDateFields(): Array<Field> {
            return generateDateFields({
                id: 'program_outcome_date',
                helpText: 'Outcome',
                required: true,
                minDate: () => HisDate.estimateDateFromAge(100),
                maxDate: () => ProgramService.getSessionDate(),
                condition: () => this.activeField === 'program_enrollment',
                estimation: {
                    allowUnknown: true,
                    estimationFieldType: EstimationFieldType.MONTH_ESTIMATE_FIELD
                },
                computeValue: (date: string) => this.patientProgram.setProgramDate(date)
            })
        },
        getProgramSelectionField(): Field {
            const btnVisibilityCondition = (form: any) => {
                return !isEmpty(form.program_selection)
            }
            return {
                id: 'program_selection',
                helpText: 'Programs',
                type: FieldType.TT_PROGRAM_SELECTION,
                onload: (context: any) => {
                    this.activeField = 'program_selection'
                    this.programSelectionFieldContext = context
                },
                onValue: (val: Option) => {
                    if (val) {
                        this.activeProgram = val.other
                        this.patientProgram.setProgramId(val.value)
                        this.patientProgram.setPatientProgramId(val.other.patient_program_id)
                        this.patientProgram.setProgramDate(
                            HisDate.toStandardHisFormat(val.other.date_enrolled)
                        )
                    }
                    return true
                },
                validation: (val: any) => Validation.required(val),
                options: () => this.patientPrograms(),
                config: {
                    onVoidState: this.onVoidState,
                    hiddenFooterBtns: [
                        'Back',
                        'Next',
                        'Clear'
                    ],
                    footerBtns: [
                        {
                            name: 'Void Program',
                            slot: 'end',
                            color: 'danger',
                            state: {
                                visible: {
                                    default: (_: any, form: any) => btnVisibilityCondition(form),
                                    onValue: (_: any, form: any) => btnVisibilityCondition(form)
                                }
                            },
                            onClick:  async () => {
                                await this.onVoidProgram()
                            }
                        },
                        {
                            name: 'Update state',
                            slot: 'end',
                            state: {
                                visible: {
                                    default: (_: any, form: any) => btnVisibilityCondition(form),
                                    onValue: (_: any, form: any) => btnVisibilityCondition(form)
                                }
                            },
                            onClick: async () => {
                                await this.onUpdateState()
                            }
                        },
                        {
                            name: 'Enroll',
                            color: 'success',
                            slot: 'end',
                            onClick: () => {
                                this.fieldComponent = 'program_enrollment'
                            }
                        }
                    ] 
                }
            }
        }
    }
})
</script>
