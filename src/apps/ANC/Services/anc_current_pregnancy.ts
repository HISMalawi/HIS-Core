import { AppEncounterService } from "@/services/app_encounter_service";
import { PatientProgramService } from "@/services/patient_program_service"
import dayjs from "dayjs";
import { AppendleadingZero } from "@/utils/Strs";

export class AncCurrentPregnancyService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 81, providerID)
    }

    async enrollPatient() {
        const program = new PatientProgramService(this.patientID)
        /**
         * TODO: Check if patient is already enrolled first
        */
        await program.enrollProgram()
        program.setStateDate(this.date)
        program.setStateId(118) //Currently on treatment state... Please remove this ID hack if you can
        await program.updateState()
    }

    calculateWeekOfFirstVisit(lnmpDate: string) {
        const theDate: any = new Date(lnmpDate)
        theDate.setDate(theDate.getDate() + 7);
        const today: any = new Date(this.getDate());
        const s = today - theDate;
        return Math.floor(s / (24 * 60 * 60 * 7 * 1000));
    }

    calculateGestationDateFromPeriod(period: number) {
        return dayjs(this.date).subtract(period, 'months').endOf('month').format('YYYY-MM-DD')
    }

    estimateDelieveryDate(lnmpDate: string) {
        const theDate: any = new Date(lnmpDate)
        theDate.setDate(theDate.getDate() + 7);
        theDate.setMonth(theDate.getMonth() + 9);
        const month = AppendleadingZero(theDate.getMonth()+1)
        const day = AppendleadingZero(theDate.getDate())
        return `${theDate.getFullYear()}-${month}-${day}`
    }

    estimateLnmpDate(gestationInWeeks: number, from=this.getDate()) {
      return dayjs(from)
        .subtract(gestationInWeeks, 'weeks')
        .subtract(7, 'days')
        .format("YYYY-MM-DD");
    }

    buildDelieveryDateObs(lmpDate: string) {
      if (lmpDate != 'Unknown') {
        return [
          this.buildValueDate('Last menstrual period', lmpDate),
          this.buildValueDate('Estimated date of delivery', 
            this.estimateDelieveryDate(lmpDate)
          ),
          this.buildValueNumber('Week of First Visit', 
            this.calculateWeekOfFirstVisit(lmpDate)
          )
        ]
      }
    }
}
