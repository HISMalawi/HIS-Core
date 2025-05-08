<template>
  <his-standard-form
    :skipSummary="true" 
    :activeField="fieldComponent"
    @onIndex="fieldComponent=''"
    :fields="fields">
  </his-standard-form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { isEmpty } from 'lodash';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { loadingController, modalController } from "@ionic/vue"
import { Patientservice } from '@/services/patient_service';
import { FilingNumberService } from '@/apps/ART/services/filing_number_service'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations"
import { alertConfirmation, toastDanger, toastWarning  } from "@/utils/Alerts"
import HisDate from "@/utils/Date"
import Keypad from "@/components/Keyboard/HisKeypad.vue"
import { nextTask } from '@/utils/WorkflowTaskHelper';
import Store from "@/composables/ApiStore"

/**
 * Manages filing number assignment
 * Can view filing number trail
 * Can swap filing numbers between candidates
 */
export default defineComponent({
    components: { HisStandardForm },
    data: () => ({
        service: {} as any,
        patient: {} as any,
        fieldComponent: '' as string,
        fields: [] as Array<Field>,
        nextWorkflowRouteName: '' as string,
        filingNumberAssignment: {} as Record<string, Option>,
    }),
    watch: {
        /**
         * Initiates service and Detects parameters 
         * in the url and switch to appropriate actions
         */
        '$route': {
            async handler({query, params}: any) {
                if (params && params.patient_id) {
                    this.service = new FilingNumberService()
                    this.service.setPatientID(params.patient_id)
                    this.patient = await this.getPatient(params.patient_id)
                    await this.service.loadFilingPrefix()
                }
                if (query) {
                    this.fields = [
                        this.getFilingNumberField(),
                        this.getCandidateSelectionField(),
                        this.getFilingNumberHistoryField()
                    ]
                    if (query.archive === "true") {
                        await this.archiveFilingNumber()
                        return 
                    }
                    if (query.assign === "true") {
                        await this.onAssignFilingNumber()
                    }
                    if (query.trail === "true") {
                       this.fieldComponent = 'view_filing_history'
                    }
                    if (query.next_workflow_task) {
                        this.nextWorkflowRouteName = query.next_workflow_task
                    }
                }             
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        /**
         * Helper method for formatting filing numbers 
         * for display purposes only!
         */
        toFID(filingID: string) {
            return this.service.formatNumber(filingID)
        },
        async onAssignFilingNumber() {
            const assigned = await this.newFilingNumber()
            if (assigned) {
                this.filingNumberAssignment = assigned
                this.fieldComponent = 'filing_number_management'
                Store.invalidate('ACTIVE_PATIENT')
            } else {
                this.fieldComponent = 'select_candidate_to_swap'
                toastWarning('Out of filing numbers, Please select eligible candidate')
            }
        },
        /**
         * Assigns and creates filing number assignment object
         */
        async newFilingNumber(): Promise<Record<string, Option> | undefined> {
            const assignment: Record<string, Option> = {
                primary: {
                    label: 'Dormant → Active',
                    value: this.patient.name,
                    other: {
                        activeNumber: this.patient.filingID 
                            ? this.toFID(this.patient.filingID)
                            : 'N/A', 
                        dormantNumber: 'N/A'
                    }
                },
                archived:  {
                    label: 'Active → Dormant',
                    value: 'N/A',
                    other: {
                        activeNumber: 'N/A', 
                        dormantNumber: 'N/A'
                    }
                }
            }
            /**
             * Do assign a new filing number if the patient already
             * has one
             */
            if (this.service.isActiveFilingNum(this.patient.filingID)) {
                return assignment
            }

            await this.presentLoading()

            const assigned = await this.service.assignFilingNumber()

            loadingController.dismiss()

            if (isEmpty(assigned)) return

            assignment.primary.other = {
                activeNumber: this.toFID(
                    assigned.new_identifier.identifier
                ),
                dormantNumber: this.service
                    .isDormantFilingNum(this.patient.filingID) 
                    ? this.toFID(this.patient.filingID)
                    : 'N/A'
            }

            if (!isEmpty(assigned.archived_identifier)) {
                const patient = await this.getPatient(
                    assigned.archived_identifier.patient_id
                )
                assignment.archived = {
                    label: 'Active → Dormant',
                    value: patient.name,
                    other: {
                        activeNumber: this.toFID(
                            assigned.archived_identifier.identifier
                        ), 
                        dormantNumber: this.toFID(
                            assigned.new_identifier.identifier
                        )
                    }
                }
            }
            return assignment
        },
        /**
         * Swap filing numbers between an active candidate with a dormant candidate
        */
        async swapExistingFilingNumbers(candidate: any) {
            const swapped = await this.service.archivePatient(
               candidate.patient_id, candidate.identifier
            )
            if (swapped) {
                return {
                    primary: {
                        label: 'Dormant → Active',
                        value: this.patient.name,
                        other: {
                            activeNumber: this.toFID(swapped.active_number), 
                            dormantNumber: this.toFID(this.patient.filingID) || 'N/A'
                        }
                    },
                    archived:  {
                        label: 'Active → Dormant',
                        value: `${candidate.given_name} ${candidate.family_name}`,
                        other: {
                            patientID: candidate.patient_id,
                            activeNumber: this.toFID(swapped.dormant_number), 
                            dormantNumber:this.toFID(swapped.active_number)
                        }
                    }
                }
            }
        },
        async presentLoading(message="Please wait...") {
            const loading = await loadingController.create({
                message, backdropDismiss: false
            })
            await loading.present()
        },
        async getPatient(patientID: number): Promise<Record<string, number | string>> {
            const patient = await Patientservice.findByID(patientID)
            if (patient) {
                const _patient = new Patientservice(patient)
                return {
                    id: _patient.getID(),
                    filingID: _patient.getFilingNumber(),
                    name: `${_patient.getGivenName()} ${_patient.getFamilyName()}`
                }
            }
            return {}
        },
        /**
         * Archives currrent patient and routes to the previous page view
         */
        async archiveFilingNumber() {
            await this.presentLoading('Archiving filing number')
            try {
                await this.service.archiveFilingNumber()
                await this.service.printFilingNumber()
                Store.invalidate('ACTIVE_PATIENT')
            }catch(e) {
                toastDanger(`${e}`)
            }
            await loadingController.dismiss()
            this.$router.back()
        },
        async filingNumberSearchKeypad() {
            const modal = await modalController.create({
                component: Keypad,
                backdropDismiss: false,
                cssClass: 'keypad-modal',
                componentProps: {
                    title: 'Find Active number',
                    strictNumbers: false,
                    onKeyPress: () => {
                        //TODO: do nothing!
                    }
                }
            })
            await modal.present()
            const { data } = await modal.onDidDismiss()
            return data
        },
        async getArchivingCandidates(pageNumber=0): Promise<Option[]> {
            const candidates = await this.service.getArchivingCandidates(pageNumber)
            return this.formatCandidateOptions(candidates)
        },
        /**
         * Converts array of objects with candidates to a list options array
         */
        formatCandidateOptions(candidates: Array<any>): Option[] {
            return candidates.map((candidate: any) => ({
                label: `${candidate.given_name} ${candidate.family_name} (${candidate.state})`,
                value: candidate.identifier,
                other: {
                    data: candidate,
                    list: [
                        {
                            label: 'Filing #',
                            value: this.toFID(candidate.identifier),
                            style: {
                                color: 'green', 
                                fontWeight: 'bold'
                            }
                        },
                        {
                            label: 'Given name',
                            value: candidate.given_name
                        },
                        {
                            label: 'Family name',
                            value: candidate.family_name
                        },
                        {
                            label: 'Outcome',
                            value: candidate.state.match(/trans/i)
                                ? 'TO'
                                : candidate.state.match(/stop/i) 
                                ? 'Tx stopped'
                                : candidate.state
                        },
                        {
                            label: 'LAD',
                            value: HisDate.toStandardHisDisplayFormat(
                                candidate.appointment_date
                            )
                        }
                    ]   
                }
            }))
        },
        /*
        * Form field that a table of all filing numbers assigned to a patient
         */
        getFilingNumberHistoryField(): Field {
            return {
                id: 'view_filing_history',
                type: FieldType.TT_TABLE_VIEWER,
                helpText: 'Filing Number Trail',
                condition: () => false,
                options: async () => {
                    const columns = ['Status', 'Filing #', 'Date Created', 'Date voided']
                    const data = await this.service.getPastFilingNumbers()
                    const rows = data.map((d: any) => {
                        const isActive = d.voided === 0
                        return [
                            isActive ? 'Active' : 'Voided',
                            this.toFID(d.identifier),
                            HisDate.toStandardHisDisplayFormat(d.date_created),
                            !isActive ? HisDate.toStandardHisDisplayFormat(d.date_voided): 'N/A'
                        ]
                    })
                    return [
                        {
                            label: 'Filing Number Trail',
                            value: 'Trail',
                            other: { columns, rows }
                        }
                    ]
                },
                config: {
                    toolbarInfo: [
                        {
                            label: 'Current filing #',
                            value: this.toFID(this.patient.filingID)
                        },
                        {
                            label: 'Status',
                            value: this.service.isActiveFilingNum(
                                this.patient.filingID
                            )
                            ?
                            'Active'
                            : this.service.isDormantFilingNum(
                                this.patient.filingID
                            )
                            ?
                            'Dormant'
                            :
                            'N/A'
                        }
                    ],
                    hiddenFooterBtns: [
                        'Clear',
                        'Next',
                        'Back',
                        'Finish'
                    ],
                    footerBtns: [
                        /**
                         * Navigate to get new filing number if they have dormant one.
                         */
                        {
                            name: 'Get filing #',
                            slot: 'end',
                            state: {
                                visible: {
                                    default: () => this.service.isDormantFilingNum(
                                        this.patient.filingID
                                    )
                                }
                            },
                            onClick: async () => await this.onAssignFilingNumber()
                        }
                    ]
                }
            }
        },
        /**
         * A form field that displays a list of patients with filing numbers
         * to swap with
         */
        getCandidateSelectionField(): Field {
            // Keeps track of the component object that's presented on the screen
            let selectorInstance: any = {}
            // Candidate list is paginated, tracking page here
            let pageNumber = 0
            let filingNumbeSearchTerm = ''
            // Restore point for archived candidates
            let filingOptionsBackup: Option[] = []

            return {
                id: 'select_candidate_to_swap',
                type: FieldType.TT_CARD_SELECTOR,
                helpText: 'Filing Number (Archive)',
                condition: () => false,
                validation: (val: Option) => Validation.required(val),
                onload: (instance: any) => selectorInstance = instance,
                onValue: async (val: Option) => {
                    if(val) {
                        const ok = await alertConfirmation(`Do you want to archive ${val.value}`)
                        if (ok) {
                            const swapped = await this.swapExistingFilingNumbers(
                                val.other.data
                            )
                            if (swapped) {
                                this.filingNumberAssignment = swapped
                                this.fieldComponent = 'filing_number_management'
                                return true
                            }                     
                        }
                    }
                    return false
                },
                options: () => this.getArchivingCandidates(),
                config: {
                    hiddenFooterBtns: [
                        'Clear',
                        'Back',
                        'Finish',
                        'Next'
                    ],
                    footerBtns: [
                        /**
                         * Resets listData to previous state after a search term was triggerred.
                         * Note: Only visible when users searches filing numbers
                         */
                        {
                            name: 'Reset',
                            slot: 'end',
                            color: 'warning',
                            state: {
                                visible: {
                                    default: () => filingNumbeSearchTerm ? true : false 
                                }
                            },
                            onClick: () => {
                                // Clear values and restore previous listData prior to search 
                                // results
                                filingNumbeSearchTerm = ''
                                selectorInstance.listData = filingOptionsBackup
                                filingOptionsBackup = []
                            }
                        },
                        /**
                         * Loads a key pad for searching for a filing candidate
                         */
                        {
                            name: 'Specify',
                            slot: 'end',
                            color: 'success',
                            onClick: async () => {
                                filingNumbeSearchTerm = await this.filingNumberSearchKeypad()
                                if (filingNumbeSearchTerm) {
                                    const filingNumbers = await this.service.getFilingNumber(
                                        filingNumbeSearchTerm
                                    )
                                    // Create a restore point for archived candidates
                                    filingOptionsBackup = [...selectorInstance.listData]
                                    selectorInstance.listData = this.formatCandidateOptions(filingNumbers)
                                }
                            }
                        },
                        /**
                         * List pagination button that decrements the page number.
                         * Note: this button will only appear when no filing number were manually searched.
                         * It will also appear when pageNumber is greater than 1
                         */
                        {
                            name: 'Previous batch',
                            slot: 'end',
                            state: {
                                visible: {
                                    default: () => !filingNumbeSearchTerm
                                },
                                disabled: {
                                    default: () => pageNumber <= 0 
                                }
                            },
                            onClick: async () => {
                                pageNumber -= 1
                                selectorInstance.listData = await this.getArchivingCandidates(pageNumber)
                            }
                        },
                        /**
                         * List pagination button that increments the page number.
                         * Note: this button will only appear when no filing number were manually searched
                         * and if the list has 10 or more items
                         */
                        {
                            name: 'Next batch',
                            slot: 'end',
                            state: {
                                visible: {
                                    default: () => !filingNumbeSearchTerm
                                },
                                disabled: {
                                    default: () => (
                                        selectorInstance.listData 
                                        && selectorInstance.listData.length <= 1
                                    ) 
                                }
                            },
                            onClick: async () => {
                                pageNumber += 1
                                selectorInstance.listData = await this.getArchivingCandidates(pageNumber)
                            }
                        }
                    ]
                }
            }
        },
        /**
         * Form field that displays new filing number assigned to a
         * Patient
         */
        getFilingNumberField(): Field {
            return {
                id: "filing_number_management",
                type: FieldType.TT_FILING_NUMBER_VIEW,
                helpText: "Filing Number Management",
                onload: async () => await this.service.printFilingNumber(),
                condition: () => false,
                options: () => [ 
                    this.filingNumberAssignment.primary, 
                    this.filingNumberAssignment.archived 
                ],
                config: {
                    hiddenFooterBtns: [
                        'Cancel',
                        'Clear',
                        'Next'
                    ],
                    footerBtns: [
                        {
                            name: 'Print #',
                            slot: 'start',
                            onClick: async () => this.service.printFilingNumber()
                        },
                        {
                            name: 'Print Dormant#',
                            slot: 'start',
                            state: {
                                visible: {
                                    default: () => this.filingNumberAssignment
                                        ?.archived
                                        ?.other
                                        ?.patientID ? true : false
                                }
                            },
                            onClick: async () => {
                                const dormantPatient = new FilingNumberService()
                                dormantPatient.setPatientID(
                                    this.filingNumberAssignment
                                    .archived
                                    .other
                                    .patientID
                                )
                                await dormantPatient.printFilingNumber()
                            }
                        },
                        {
                            name: 'Continue',
                            color: 'success',
                            slot: 'end',
                            onClick: () => nextTask(this.patient.id, this.$router, this.$route)
                        }
                    ]
                }
            }
        }
    }
})
</script>
