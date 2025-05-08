import { Service } from "@/services/service";

export class MohCxCaMonthlyService extends Service {
    programID: number;
    startDate: string;
    endDate: string;
    date: string;

    constructor() {
        super()
        this.endDate = ''
        this.startDate = ''
        this.date = Service.getSessionDate()
        this.programID = Service.getProgramID()
    }

    setStartDate(startDate: string) {
        this.startDate = startDate
    }  

    setEndDate(endDate: string) {
        this.endDate = endDate
    }

    async getReportSectionOne():Promise<any> {
      const authKey: string = sessionStorage.getItem("apiKey") as string
        //prep end point
        let url = "http" + "://" + "localhost" + ":" + "3000" + "/api/v1";
        url += "/screened_for_cxca?date=" + sessionStorage.sessionDate;
        url += `&program_id=24`;
          url += `&report_name=CANCER SUSPECTS`;
        url += `&start_date=${this.startDate}&end_date=${this.endDate}`; 

        const xhttp = new XMLHttpRequest();
        
        xhttp.open("GET", url, true);
        xhttp.setRequestHeader('Authorization', authKey);
        xhttp.setRequestHeader('Content-type', "application/json");
        xhttp.send();

        return xhttp;
    }

    async loadedSectionOne(xhttp: any): Promise<boolean> {
      let temp: boolean
      temp = false
      xhttp.onload = function() {
        if (this.readyState == 4 && (this.status == 201 || this.status == 200)) {
            const obj = JSON.parse(this.responseText);
            temp = true
            return temp
        }
      }
      return temp
    }

    static loadClientsSectionOne(data: any): any {
      const formatted_data = [];
        const age_groups = [
          ['<25 years', 0],
          ['25-29 years',0],
          ['30-44 years',0],
          ['45-49 years',0],
          ['>49 years', 0],
          ['Unknown', 0]
        ];
      
        let count = 1;
        for (const group_cont of age_groups){
          for (const record of data) {
            const age_in_years = record.age_in_years;
            //const patient_id = record.patient_id;
            if(group_cont[0] == MohCxCaMonthlyService.calculatedAgeGroupSectionOne(age_in_years)){
                //cast to number
                let tempTotal: number = group_cont[1] as number
                tempTotal += 1
                //assign to group_cont[1]
                group_cont[1] = tempTotal
            }
          } 
          formatted_data.push([count++, group_cont[0], group_cont[1]]);
        }
        //return array
        return age_groups
    }

    static calculatedAgeGroupSectionOne(age: any){
        if(age < 25){
          return '<25 years';
        }else if(age <= 29){
          return '25-29 years';
        }else if(age <= 44){
          return '30-44 years'
        }else if(age <= 49){
          return '45-49 years'
        }else if(age > 49){
          return '>49 years'
        }else{
          return 'Unknown'
        }
    }
}