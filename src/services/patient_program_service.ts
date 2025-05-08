import { ProgramService } from "./program_service";
import { AppEncounterService } from "./app_encounter_service";
import { isEmpty } from "lodash";
import { printArtTransferoutLbl } from "@/apps/ART/Labels";

export class PatientProgramService extends ProgramService {
    patientId: number
    programId: number
    stateId: number
    patientProgramId: number
    programDate: string
    stateDate: string
    constructor(patientId: number) {
        super()
        this.patientId = patientId
        this.patientProgramId = -1
        this.programId = ProgramService.getProgramID()
        this.stateId = -1
        this.programDate = ProgramService.getSessionDate()
        this.stateDate = ''
    }

    getProgramId() {
        return this.programId
    }

    getStateDate() {
        return this.stateDate
    }

    getProgramDate() {
        return this.programDate
    }

    getPatientProgramId() {
        return this.patientProgramId
    }

    getPrograms() {
        return ProgramService.getPatientPrograms(this.patientId)
    }

    /**
     * Get Patient program information by Session Program ID
     * @returns 
     */
    async getProgram() {
        const defaults = { patientID: -1, programID: -1, program: 'N/A', outcome: 'N/A', startDate: '', endDate: '' }
        const req = await this.getPrograms()
        if (isEmpty(req)) return defaults
        /**
         * Filter programs by sessionID
         */
        const programs = req.filter((p: any) => p.program.program_id === ProgramService.getProgramID())
            .map((p: any) => {
            /**
             * Find active state/outcome by checking if the 
             * end_date is empty
             */
            const availableStates = p.patient_states
            let outComeStartDate = ''
            let outComeEndDate = ''
            let currentOutcome = 'N/A'
            if (!isEmpty(availableStates)) {
                // get last state as current outcome
                const index = availableStates.length-1
                outComeStartDate = availableStates[index].start_date
                outComeEndDate = availableStates[index].end_date
                currentOutcome = availableStates[index].name
            }
            return {
                patientID: p.patient_id,
                programID: p.program_id,
                program: p.program.name, 
                outcome: currentOutcome,
                startDate: outComeStartDate,
                endDate: outComeEndDate
            }
        })
        return !isEmpty(programs) 
            ? programs[0] 
            : defaults
    }

    getProgramStates() {
        return ProgramService.getPatientStates(this.patientId, this.programId)
    }

    voidProgram(reason: string) {
        return ProgramService.voidProgram(this.patientProgramId, reason)
    }

    voidState(reason: string) {
        return ProgramService.voidState(this.patientId, this.programId, this.stateId, reason)
    }

    enrollProgram() {
        return ProgramService.enrollProgram(this.patientId, this.programId, this.programDate)
    }

    printTransferout(date: string) {
        return printArtTransferoutLbl(this.patientId, date)   
    }
    async transferOutEncounter(facility: any, reason= '') {
        const transferOut = new AppEncounterService(this.patientId, 119)
        transferOut.setDate(this.stateDate)
        const encounter = await transferOut.createEncounter()
        if (!encounter) {
            throw 'Unable to transfer out encounter'
        }
        if (reason) await transferOut.saveValueTextObs('Reason for transfer out', reason)
        return transferOut.saveValueTextObs('Transfer to', facility.name)
    }

    updateState() {
        return ProgramService.createState(this.patientId, this.programId, {
            state: this.stateId, date: this.stateDate
        })
    }

    setProgramDate(date: string) {
        this.programDate = date
    }

    setStateDate(date: string) {
        this.stateDate = date
    }

    setPatientProgramId(id: number) {
        this.patientProgramId = id
    }

    setProgramId(program: number) {
        this.programId = program
    }

    setStateId(state: number) {
        this.stateId = state
    }
}
