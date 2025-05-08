import { AppEncounterService } from "@/services/app_encounter_service";
import { ConceptService } from "@/services/concept_service";

export class PatientTypeService extends AppEncounterService {
  patientType: string
  locationName: string
  constructor(patientID: number, providerID: number) {
    super(patientID, 5, providerID);
    this.patientType = 'N/A'
    this.locationName = ''
  }

  setLocationName(location: string) {
    this.locationName = location
  }

  setPatientType(type: string) {
    this.patientType = type
  }

  getType() {
    return this.patientType
  }

  static getPatientTypes() {
    return ConceptService
      .getConceptsByCategory('art_patient_type')
      .map(({name }: any) => ({ label: name, value: name }))
  }

  static async isDrugRefillPatient(patientID: number) {
    const patientType = await AppEncounterService.getFirstValueCoded(patientID, 'Type of patient')
    return patientType && patientType === 'Emergency supply'
  }

  async loadPatientType() {
    const pType = await this.getFirstValueCoded('Type of patient')

    if (pType) this.patientType = pType
  }

  async save() {
    await this.savePatientType(this.patientType)
    if (this.locationName && [
      'External consultation', 
      'Emergency supply']
      .includes(this.patientType)) {
      await this.saveLocationClinic(this.locationName)
    }
  }

  saveLocationClinic(clinic: string) {
    return this.saveValueTextObs('Art clinic location', clinic)
  }

  savePatientType(type: string) {
    return this.saveValueCodedObs('Type of patient', type)
  }
}