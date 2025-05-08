import { AppEncounterService } from "@/services/app_encounter_service";
import { isArray } from "lodash";
import { Option } from '@/components/Forms/FieldInterface';
export class VitalsService extends AppEncounterService{
  constructor(patientID: number, providerID: number) {
    super(patientID, 6, providerID);
  }
  isNotEmptyandNumber(vital: Option) {
    return `${vital.value}`.match(/^-?\d+\.?\d*$/) ? null : [`Invalid entry for ${vital.label}`]
  }
  isNotEmptyandFloat(vital: Option) {
    return `${vital.value}`.match(/^\d{1,3}\.\d{1,5}$/) 
      ? null 
      : [`Invalid entry for ${vital.label}. Don't forget to add a decimal. e.g. 56.2 ${vital.other.modifier}`]
  }
  checkMinMax(val: Option, min: number, max: number) {
    const p = [];
    if (parseFloat(`${val.value}`) < min) {
      p.push([`${val.label} entered is less than minimum ${min} ${val?.other?.modifier || ''}`])
    }
    if (parseFloat(`${val.value}`) > max) {
      p.push([`${val.label} entered is greater than maximum ${max} ${val?.other?.modifier || ''}`])
    }
    return p.length > 0 ? p : null;
  }
  validateAll(vitals: Option[]) {
    const p: any = [];
    vitals.map((vital: any) => {
      const j = this.validator(vital);
      return isArray(j) ? p.push(j) : null
    })
    return p.length > 0 ? p : null;
  }

  mergeErrors(errors: any[]) {
    const holder: any = [];
    errors.forEach(element => {
      if (isArray(element)) {
        holder.push(element)
      }
    });
    return holder.length > 0 ? holder : null
  }
  isValidBPReading(vital: any) {
    const p = [];
    const isValidBP =  `${vital.value}`.match(/^\d{1,3}\/\d{1,3}$/g) ? null : ['Invalid BP reading']
    p.push(isValidBP);
    if(isValidBP == null) {
      const value = `${vital.value}`.split('/');
      
      const bpSystolic = {
        label: 'Systolic',
        value: value[0]
      };
      const bpDiastolic = {
        label: 'Diastolic',
        value: value[1]
      };
      p.push(this.checkMinMax(bpDiastolic, 30, 200))
      p.push(this.checkMinMax(bpSystolic, 40, 250))
    }
    return this.mergeErrors(p)
  }
  validator(vital: Option) {
    const values = [
      {
        name: "Weight",
        validator: (val: Option) => {
          const emptyErrors = this.isNotEmptyandFloat(val);
          const minErrors = this.checkMinMax(val, 2.0, 250.0);
          return this.mergeErrors([emptyErrors, minErrors]); 
        },
      },
      {
        name: "Height",
        validator: (val: Option) => {
          const errors = []
          errors.push(this.isNotEmptyandNumber(val))
          errors.push(this.checkMinMax(val, 40, 220))
          return this.mergeErrors(errors); 
        },
      }, {
        name: "BP",
        validator: (val: any) => {
          return this.isValidBPReading(val)
        },
      }, {
        name: "Temp",
        validator: (val: any) => {
          const emptyErrors = this.isNotEmptyandNumber(val);
          const minErrors = this.checkMinMax(val, 30, 42);
          return this.mergeErrors([emptyErrors, minErrors]); 
        },
      }, {
        name: "SP02",
        validator: (val: any) => {
          const minErrors = this.checkMinMax(val, 40, 100);
          return this.mergeErrors([minErrors]); 
        },
      }, {
        name: "Pulse",
        validator: (val: any) => {
          const minErrors = this.checkMinMax(val, 50, 120);
          return this.mergeErrors([minErrors]); 
        },
      }
    ]
    const v = values.filter(element => {
      return element.name === vital.label;
    });
    if (v.length > 0) {
      return v[0].validator(vital);
    }
    return null
  }
}