export interface Bmi {
  M: { [key: string]: { [key: string]: string } };
  F: { [key: string]: { [key: string]: string } };
  colors: { [key: string]: string };
}
export class BMIService {
  static async getBMIData(): Promise<Bmi> {
    const req = await fetch(`/bmi.json`);
    return req.json()
  }
  static async getBMIResult(gender: 'M' | 'F', age: number, bmindex: number) {
    let BMIResult = {
      result: '',
      color: '',
      index: bmindex
    }
    if (bmindex <= 0) {
      BMIResult.index = 0
      return BMIResult
    }
    if (age < 5 && age > 0) {
      BMIResult.result = 'Use MUAC to calculate nutrition status';
      BMIResult.color = 'red';
    } else {
      if (age > 18) {
        age = 19;
      }
      const result = await this.getBMIData();
      const dataset = result[gender][age];
      if (dataset) {
        BMIResult = this.buildBounds(Object.keys(dataset), dataset, bmindex, result.colors);
      }
    }
    return BMIResult;

  }

  static buildBounds(bounds: any, dataset: any, bmindex: any, results: any) {
    const BMIResult = {
      result: '',
      color: '',
      index: bmindex
    }
    bounds.forEach((bound: any) => {
      if (bound.indexOf("-") >= 0) {
        const boundsArray = bound.split("-");
        if (bmindex >= parseFloat(boundsArray[0]) && bmindex <= parseFloat(boundsArray[1])) {
          BMIResult.result = dataset[bound];
          BMIResult.color = results[dataset[bound]];
        }
      } else if (bound.indexOf("<") >= 0) {
        const lessThanBounds = bound.replace("<", "");
        if (bmindex < parseFloat(lessThanBounds)) {
          BMIResult.result = dataset[bound];
          BMIResult.color = results[dataset[bound]];
        }
      } else if (bound.indexOf(">=") >= 0) {
        const greaterThanBounds = bound.replace(">=", "");
        if (bmindex >= parseFloat(greaterThanBounds)) {
          BMIResult.result = dataset[bound];
          BMIResult.color = results[dataset[bound]];
        }
      }
    });

    return BMIResult;
  }
  static getBMI(weight: number, height: number, gender: 'M' | 'F', age: number) {
    const bmindex = this.calculateBMI(weight, height); 
    return this.getBMIResult(gender, age, bmindex);

  }
  static calculateBMI(weight: number, height: number) {
    if(height == 0 || weight == 0) {
     return 0 
    }
    let bmindex = (weight / height / height) * 10000;
    return bmindex = Math.round(bmindex * 10) / 10;
  }
}