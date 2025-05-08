import { AppEncounterService } from "./app_encounter_service";
import { OrderService } from "./order_service";

export class LabOrderService extends AppEncounterService {
  constructor(patientID: number, providerID: number) {
    super(patientID, 57, providerID);
  }

  createLabResult(measures: Array<any>, testID: number, date: string) {
    return AppEncounterService.postJson(`lab/tests/${testID}/results`, {
      'encounter_id': this.encounterID,
      date,
      measures
    })
  }  

  getTestsWithoutResults() {
    return OrderService.getOrders(this.patientID, {
      status: 'drawn'
    })
  }

  getTestIndicators(testTypeID: number) {
    return OrderService.getJson(
      `lab/test_result_indicators`, {
      'test_type_id': testTypeID
    })
  }
}