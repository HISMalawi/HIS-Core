import { AppEncounterService } from "@/services/app_encounter_service"
import { PatientProgramService } from "@/services/patient_program_service"

export async function onRegisterPatient(patientId: number){
  const program = new PatientProgramService(patientId)
  await program.enrollProgram()

  // Create registration encounter
  const encounter = new AppEncounterService(patientId, 5)

  await encounter.createEncounter()
  await encounter.saveValueCodedObs(
    'Type of patient', 'New Patient'
  )
}