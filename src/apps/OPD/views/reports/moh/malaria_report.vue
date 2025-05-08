<template>
    <ion-loading :is-open="isLoading" message="Please wait...">
   </ion-loading>
   <his-standard-form v-if="!reportReady" @onFinish="onPeriod" :skipSummary="true" :fields="fields">
   </his-standard-form>
   <ion-page v-if="reportReady">
   <ion-content >
   <div id="report-content" v-if="malariaData">
     <idsr-h :key="componentKey" :reportName="reportName" :rangeLabel="rangeLabel" :range="range" ref="header" :periodLabel="periodLabel" :periodDates="periodDates" :clinicName="clinicName" :totalOPDVisits="TotalOPDVisits">
     </idsr-h>
     <table class="my-table" style="margin: auto; width: 95%; margin-top: 3%; margin-bottom: 3%;">
     
     <tr>
       <td rowspan="2" class="td-span-width"><b>Out Patient Department</b></td>
       <td colspan="2" class="td-span-width"> <b>Out Patient Number></b></td>
     </tr>
     <tr>
       <td class=" td-span-width"><b>&#60; 5 yrs</b></td>
       <td class=" td-span-width"><b> > 5 yrs</b></td>
     </tr>
     <tr>
       <td class="td-text-align-left"><b>A:</b> Confirmed (Co) Malaria Cases</td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed (Co) Malaria Cases < 5yrs',malariaData.confrim_non_pregnant_less_5yrs)">
         <a>
           {{malariaData.confrim_non_pregnant_less_5yrs.length}}
         </a>
       </td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed (Co) Malaria Cases > 5yrs',malariaData.confrim_non_pregnant_more_5yrs)">
         <a>
           {{malariaData.confrim_non_pregnant_more_5yrs.length}}
         </a>
       </td>
     </tr>
     <tr>
       <td class="td-text-align-left"><b>B:</b> Presumed (Pr) Malaria Cases (Clinically Diagnosed)</td>
       <td class="td-text-align-left" @click="onDrillDown('Presumed (Pr) Malaria Cases (Clinically Diagnosed) < 5yrs',malariaData.presume_non_pregnant_less_5yrs)">
         <a>
           {{malariaData.presume_non_pregnant_less_5yrs.length}}
         </a>
       </td>
       <td class="td-text-align-left" @click="onDrillDown('Presumed (Pr) Malaria Cases (Clinically Diagnosed) > 5yrs',malariaData.presume_non_pregnant_more_5yrs)">
       <a>
         {{malariaData.presume_non_pregnant_more_5yrs.length}}
       </a>
     </td>
     </tr>
     <tr>
       <td class="td-text-align-left"><b>C:</b> Confirmed malaria in pregnant woman (c)</td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed malaria in pregnant woman (c) < 5yrs',malariaData.confirm_pregnant_less_5yrs)">
         <a>
           {{malariaData.confirm_pregnant_less_5yrs.length}}
         </a>
       </td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed malaria in pregnant woman (c) > 5yrs',malariaData.confirm_pregnant_more_5yrs)">
         <a>
           {{malariaData.confirm_pregnant_more_5yrs.length}}
         </a>
       </td>
     </tr>
     <tr>
       <td class="td-text-align-left"><b>D:</b> Presumed (clinically diagnosed) malaria in pregnant woman (d)</td>
       <td class="td-text-align-left" @click="onDrillDown('Presumed (clinically diagnosed) malaria in pregnant woman (d) < 5yrs',malariaData.presume_pregnant_less_5yrs)">
         <a>
           {{malariaData.presume_pregnant_less_5yrs.length}}
         </a>
       </td>
       <td class="td-text-align-left" @click="onDrillDown('Presumed (clinically diagnosed) malaria in pregnant woman (d) > 5yrs',malariaData.presume_pregnant_more_5yrs)">
         <a>
           {{malariaData.presume_pregnant_more_5yrs.length}}
         </a>
       </td>
     </tr>
     <tr>
       <td class=""> Total OPD Malaria Cases <b>(A+B+C+D)</b></td>
       <td class="td-text-align-left" @click="onDrillDown(`Total OPD Malaria Cases (A+B+C+D) < 5yrs`,malariaData.total_OPD_malaria_cases_less_5yrs)">
         <a>
           {{malariaData.total_OPD_malaria_cases_less_5yrs.length}}
         </a>
       </td>
       <td class="td-text-align-left" @click="onDrillDown(`Total OPD Malaria Cases (A+B+C+D) > 5yrs`,malariaData.total_OPD_malaria_cases_more_5yrs)">
         <a>
           {{malariaData.total_OPD_malaria_cases_more_5yrs.length}}
         </a>
       </td>
     </tr>
     <tr>
       <td class="td-text-align-left" ><b>F:</b> Total OPD Attendance: All causes (Including malaria cases)</td>
       <td class="td-text-align-left" @click="onDrillDown('Total OPD Attendance: All causes (Including malaria cases) < 5yrs',malariaData.total_OPD_attendance.total_patient_less_5yrs)">
         <span v-if="malariaData.total_OPD_attendance.total_patient_less_5yrs">
           
           <a>
             {{malariaData.total_OPD_attendance.total_patient_less_5yrs.length}}
           </a>
         </span>
       </td>
       <td class="td-text-align-left" @click="onDrillDown('Total OPD Attendance: All causes (Including malaria cases) > 5yrs',malariaData.total_OPD_attendance.total_patient_more_5yrs)">
         <span v-if="malariaData.total_OPD_attendance.total_patient_more_5yrs">
           
           <a>
             {{malariaData.total_OPD_attendance.total_patient_more_5yrs.length}}
           </a>
         </span>
       </td>
     </tr>
     <tr>
       <td class="td-text-align-left"><b>G:</b> Confirmed malaria treatment failure (tf)</td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed malaria treatment failure (tf) < 5yrs',malariaData.confirmed_malaria_treatment_failure_less_5yrs)">
         <a>
           {{malariaData.confirmed_malaria_treatment_failure_less_5yrs.length}}
         </a>
       </td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed malaria treatment failure (tf) > 5yrs',malariaData.confirmed_malaria_treatment_failure_more_5yrs)">
         <a>
           {{malariaData.confirmed_malaria_treatment_failure_more_5yrs.length}}
         </a>
       </td>
     </tr>
     <tr>
       <td colspan="3" class=""><b>Treatment in OPD</b></td>
     </tr>
     <tr>
       <td class="td-text-align-left" ><b>H:</b> Confirmed cases receiving first-line anti malarial medication (LA)</td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed cases receiving first-line anti malarial medication (LA) < 5yrs',malariaData.confirmed_malaria_LA_less_5yrs)">
         <a>
           {{malariaData.confirmed_malaria_LA_less_5yrs.length}}
         </a>
       </td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed cases receiving first-line anti malarial medication (LA) > 5yrs',malariaData.confirmed_malaria_LA_more_5yrs)">
         <a>
           {{malariaData.confirmed_malaria_LA_more_5yrs.length}}
         </a>
       </td>
     </tr>
     <tr>
       <td class="td-text-align-left" ><b>I:</b> Presumed malaria cases receiving first-line anti malarial medication(LA)</td>
       <td class="td-text-align-left" @click="onDrillDown('Presumed malaria cases receiving first-line anti malarial medication(LA) < 5yrs',malariaData.presumed_malaria_LA_less_5yrs)">
         <a>
           {{malariaData.presumed_malaria_LA_less_5yrs.length}}
         </a>
       </td>
       <td class="td-text-align-left" @click="onDrillDown('Presumed malaria cases receiving first-line anti malarial medication(LA) > 5yrs',malariaData.presumed_malaria_LA_more_5yrs)">
         <a>
           {{malariaData.presumed_malaria_LA_more_5yrs.length}}
         </a>
       </td>
     </tr>
     <tr>
       <td class="td-text-align-left"><b>J:</b> Confirmed cases receiving second-line anti malarial medication (ASAQ)</td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed cases receiving second-line anti malarial medication (ASAQ) < 5yrs',malariaData.confirmed_malaria_ASAQ_less_5yrs)">
         <a>
           {{malariaData.confirmed_malaria_ASAQ_less_5yrs.length}}
         </a>
       </td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed cases receiving second-line anti malarial medication (ASAQ) > 5yrs',malariaData.confirmed_malaria_ASAQ_more_5yrs)">
         <a>
           {{malariaData.confirmed_malaria_ASAQ_more_5yrs.length}}
         </a>
       </td>
     </tr>
     <tr>
       <td class="td-text-align-left"><b>K:</b> Presumed malaria cases receiving second-line anti malarial medication(ASAQ)</td>
       <td class="td-text-align-left" @click="onDrillDown('Presumed malaria cases receiving second-line anti malarial medication(ASAQ) < 5yrs',malariaData.presumed_malaria_ASAQ_less_5yrs)">
         <a>
           {{malariaData.presumed_malaria_ASAQ_less_5yrs.length}}
         </a>
       </td>
       <td class="td-text-align-left" @click="onDrillDown('Presumed malaria cases receiving second-line anti malarial medication(ASAQ) > 5yrs',malariaData.presumed_malaria_ASAQ_more_5yrs)">
         <a>
           {{malariaData.presumed_malaria_ASAQ_more_5yrs.length}}
         </a>
       </td>
     </tr>
     <tr>
       <td colspan="3" class=""><b>Lab/mRDT in OPD</b></td>
     </tr>
     <tr>
       <td class="td-text-align-left"><b>L:</b> Suspected malaria cases tested (mRDT)</td>
       <td class="td-text-align-left" @click="onDrillDown('Suspected malaria cases tested (mRDT) < 5yrs',malariaData.suspected_malaria_mRDT_less_5yrs)">
         <a>
           {{malariaData.suspected_malaria_mRDT_less_5yrs.length}}
         </a>
       </td>
       <td class="td-text-align-left" @click="onDrillDown('Suspected malaria cases tested (mRDT) > 5yrs',malariaData.suspected_malaria_mRDT_more_5yrs)">
         <a>
           {{malariaData.suspected_malaria_mRDT_more_5yrs.length}}
         </a>
       </td>
     </tr>
     <tr>
       <td class="td-text-align-left"><b>M:</b> Positive malaria cases (mRDT)</td>
       <td class="td-text-align-left" @click="onDrillDown('Positive malaria cases (mRDT) < 5yrs',malariaData.positive_malaria_mRDT_less_5yrs)">
         <a>
           {{malariaData.positive_malaria_mRDT_less_5yrs.length}}
         </a>
       </td>
       <td class="td-text-align-left" @click="onDrillDown('Positive malaria cases (mRDT) > 5yrs',malariaData.positive_malaria_mRDT_more_5yrs)">
         <a>
           {{malariaData.positive_malaria_mRDT_more_5yrs.length}}
         </a>
       </td>
     </tr>
     <tr>
       <td class="td-text-align-left" ><b>N:</b> Suspected malaria cases tested (microscopy)</td>
       <td class="td-text-align-left" @click="onDrillDown('Suspected malaria cases tested (microscopy) < 5yrs',malariaData.suspected_malaria_microscopy_less_5yrs)">
         <a>
           {{malariaData.suspected_malaria_microscopy_less_5yrs.length}}
         </a>
       </td>
       <td class="td-text-align-left" @click="onDrillDown('Suspected malaria cases tested (microscopy) > 5yrs',malariaData.suspected_malaria_microscopy_more_5yrs)">
         <a>
           {{malariaData.suspected_malaria_microscopy_more_5yrs.length}}
         </a>
       </td>
     </tr>
     <tr>
       <td class="td-text-align-left"><b>O:</b> Positive malaria cases (microscopy)</td>
       <td class="td-text-align-left" @click="onDrillDown('Positive malaria cases (microscopy) < 5yrs',malariaData.positive_malaria_microscopy_less_5yrs)">
         <a>
           {{malariaData.positive_malaria_microscopy_less_5yrs.length}}
         </a>
       </td>
       <td class="td-text-align-left" @click="onDrillDown('Positive malaria cases (microscopy) > 5yrs',malariaData.positive_malaria_microscopy_more_5yrs)">
         <a>
           {{malariaData.positive_malaria_microscopy_more_5yrs.length}}
         </a>
       </td>
     </tr>
     <tr>
       <td class="">    Total suspected malaria cases <b>(B+D+L+N)</b></td>
       <td class="td-text-align-left" @click="onDrillDown('Total suspected malaria cases (B+D+L+N) < 5yrs',malariaData.total_suspected_malaria_cases_less_5yrs)">
         <a>
           {{malariaData.total_suspected_malaria_cases_less_5yrs.length}}
         </a>
       </td>
       <td class="td-text-align-left" @click="onDrillDown('Total suspected malaria cases (B+D+L+N) > 5yrs',malariaData.total_suspected_malaria_cases_more_5yrs)">
         <a>
           {{malariaData.total_suspected_malaria_cases_more_5yrs.length}}
         </a>
       </td>
     </tr>
     <tr>
       <td rowspan="2" class="td-span-width"> <b>In Patient Department</b></td>
       <td colspan="2" class="td-span-width"> <b>In Patient Numbers</b></td>
     </tr>
     <tr>
       <td class="td-span-width"><b> &#60; 5 yrs</b></td>
       <td class="td-span-width"><b> > 5 yrs</b></td>
     </tr>
     <tr>
       <td class="td-text-align-left"><b>Q:</b> Total suspected malaria cases tested (microscopy)</td>
       <td class="td-text-align-left" @click="onDrillDown('Total suspected malaria cases tested (microscopy) < 5yrs',malariaData)"></td>
       <td class="td-text-align-left" @click="onDrillDown('Total suspected malaria cases tested (microscopy) > 5yrs',malariaData)"></td>
     </tr>
     <tr>
       <td class="td-text-align-left"><b>R:</b> Confirmed malaria cases (microscopy)</td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed malaria cases (microscopy) < 5yrs',malariaData)"></td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed malaria cases (microscopy) > 5yrs',malariaData)"></td>
     </tr>
     <tr>
       <td class="td-text-align-left"><b>S:</b> Presumed malaria cases (clinically diagnosed without test)</td>
       <td class="td-text-align-left" @click="onDrillDown('Presumed malaria cases (clinically diagnosed without test) < 5yrs',malariaData)"></td>
       <td class="td-text-align-left" @click="onDrillDown('Presumed malaria cases (clinically diagnosed without test) > 5yrs',malariaData)"></td>
     </tr>
     <tr>
       <td class="td-text-align-left"><b>T:</b> Confirmed malaria in pregnant woman (c)</td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed malaria in pregnant woman (c) < 5yrs',malariaData)"></td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed malaria in pregnant woman (c) > 5yrs',malariaData)"></td>
     </tr>
     <tr>
       <td class="td-text-align-left"><b>U:</b> Presumed (clinically diagnosed) malaria in pregnant woman (d)</td>
       <td class="td-text-align-left" @click="onDrillDown('Presumed (clinically diagnosed) malaria in pregnant woman (d) < 5yrs',malariaData)"></td>
       <td class="td-text-align-left" @click="onDrillDown('Presumed (clinically diagnosed) malaria in pregnant woman (d) > 5yrs',malariaData)"></td>
     </tr>
     <tr>
       <td class="td-text-align-left"><b>V:</b> Total suspected malaria cases (Q+S+U)</td>
       <td class="td-text-align-left" @click="onDrillDown('Total suspected malaria cases (Q+S+U)',malariaData)"></td>
       <td class="td-text-align-left" @click="onDrillDown('Total suspected malaria cases (Q+S+U)',malariaData)"></td>
     </tr>
     <tr>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed',malariaData)"> <b>W:</b> Total malaria cases (R+S+T+U) </td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed',malariaData)"></td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed',malariaData)"></td>
     </tr>
     <tr>
       <td class="td-text-align-left"><b>X:</b> Confirmed malaria treatment failure (tf)</td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed',malariaData)"></td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed',malariaData)"></td>
     </tr>
     <tr>
       <td class="td-text-align-left"><b>Y:</b> Total inpatient malaria deaths</td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed',malariaData)"></td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed',malariaData)"></td>
     </tr>
     <tr>
       <td class="td-text-align-left"><b>Z:</b> Total Inpatient: all causes</td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed',malariaData)"></td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed',malariaData)"></td>
     </tr>
     <tr>
       <td class="td-text-align-left"><b>ZA:</b> Total Inpatient Deaths: all causes</td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed',malariaData)"></td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed',malariaData)"></td>
     </tr>
     <tr>
       <td colspan="3" class=""><b>Commodities Used</b></td>
     </tr>
     <tr>
       <td class=""><b>Item</b></td>
       <td class="" ><b>Unit of Issue</b></td>
       <td class="" ><b>Quantity Dispensed/Used</b></td>
     </tr>
     <tr>
       <td class="td-text-align-left">LA 1X6</td>
       <td class="" >tab</td>
       <td class="td-text-align-left" @click="onDrillDown('LA 1X6',malariaData.LA_1X6)" >
         <a>
           {{malariaData.LA_1X6.length *1*6}}
         </a>
       </td>
     </tr>
     <tr>
       <td class="td-text-align-left">LA 2X6</td>
       <td class="" >tab</td>
       <td class="td-text-align-left" @click="onDrillDown('LA 2X6',malariaData.LA_2X6)" >
         <a>
           {{malariaData.LA_2X6.length *2*6}}
         </a>
       </td>
     </tr>
     <tr>
       <td class="td-text-align-left">LA 3X6</td>
       <td class="" >tab</td>
       <td class="td-text-align-left" @click="onDrillDown('LA 3X6',malariaData.LA_3X6)" >
         <a>
           {{malariaData.LA_3X6.length *3*6}}
         </a>
       </td>
     </tr>
     <tr>
       <td class="td-text-align-left">LA 4X6</td>
       <td class="" >tab</td>
       <td class="td-text-align-left" @click="onDrillDown('LA 4X6',malariaData.LA_4X6)" >
         <a>
           {{malariaData.LA_4X6.length * 6 * 4}}
         </a>
       </td>
     </tr>
     <tr>
       <td class="td-text-align-left" >ITN Distributed to Pregnant women</td>
       <td class="" >net</td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed',malariaData)" ></td>
     </tr>
     <tr>
       <td class="td-text-align-left" >ITN Distributed to Newborn babies</td>
       <td class="" >net</td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed',malariaData)" ></td>
     </tr>
     <tr>
       <td class="td-text-align-left" >SP</td>
       <td class="" >tab</td>
       <td class="td-text-align-left" @click="onDrillDown('SP',malariaData.sp)" >
         <a>
           {{malariaData.sp.length}}
         </a>
       </td>
     </tr>
     <tr>
       <td class="td-text-align-left" >RDTs</td>
       <td class="" >test</td>
       <td class="td-text-align-left" @click="onDrillDown('Confirmed',malariaData)" ></td>
     </tr>
     <tr>
       <td class="td-text-align-left" >ASAQ 25mg/67.5mg (3 tablets)</td>
       <td class="" >tab</td>
       <td class="td-text-align-left" @click="onDrillDown('ASAQ 25mg/67.5mg (3 tablets)',malariaData.ASAQ_25mg)" >
         <a>
           {{malariaData.ASAQ_25mg.length*3}}
         </a>
       </td>
     </tr>
     <tr>
       <td class="td-text-align-left" >ASAQ 50mg/135mg (3 tablets)</td>
       <td class="" >tab</td>
       <td class="td-text-align-left" @click="onDrillDown('ASAQ 50mg/135mg (3 tablets)',malariaData.ASAQ_50mg)" >
         <a>
           {{malariaData.ASAQ_50mg.length*3}}
         </a>
       </td>
     </tr>
     <tr>
       <td class="td-text-align-left" >ASAQ 100mg/270mg (3 tablets)</td>
       <td class="" >tab</td>
       <td class="td-text-align-left" @click="onDrillDown('ASAQ 100mg/270mg (3 tablets)',malariaData.ASAQ_100mg_3tabs)" >
         <a>
           {{malariaData.ASAQ_100mg_3tabs.length*3}}
         </a>
       </td>
     </tr>
     <tr>
       <td class="td-text-align-left" >ASAQ 100mg/270mg (6 tablets)</td>
       <td class="" >tab</td>
       <td class="td-text-align-left" @click="onDrillDown('ASAQ 100mg/270mg (6 tablets)',malariaData.ASAQ_100mg_6tabs)" >
         <a>
           {{malariaData.ASAQ_100mg_6tabs.length*6}}
         </a>
       </td>
     </tr>
     </table>
   </div>
   </ion-content>
     <his-footer :btns="btns"></his-footer>
   </ion-page>
 </template>
 
 <script lang="ts">
 import { defineComponent } from 'vue'
 import { IDSRReportService } from "@/apps/OPD/services/idsr_service"
 import { OpdReportService } from "@/apps/OPD/services/opd_report_service"
 import { Service } from "@/services/service"
 import dayjs from 'dayjs';
 
 import HisFooter from "@/components/HisDynamicNavFooter.vue";
 import { IonPage, IonContent, IonLoading } from "@ionic/vue"
 import { Field } from '@/components/Forms/FieldInterface'
 import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
 import ReportMixinVue from "../ReportMixin.vue";
 import IdsrH from "@/apps/OPD/views/reports/moh/MOHReportHeader.vue"
 import { toCsv } from "@/utils/Export"
 
 export default defineComponent({
   mixins: [ReportMixinVue],
   components: { IonLoading, HisStandardForm, HisFooter, IonPage, IonContent,IdsrH },
   data: function(){
     return {
       show: true,
       conditions: [] as any,
       formData: {} as any,
       lessThanFiveYears: " < 5 yrs",
       greaterAndEqualFiveYears: " >= 5 yrs",
       total: ' Total',
       btns: [] as Array<any>,
       fields: [] as Array<Field>,
       reportReady: false as boolean,
       reportService: {} as any,
       malariaData: '' as any,
       confirmMalaria: '' as any,
 
       componentKey: 0 as number,
       computedFormData: {} as any,
       idsr: {} as any,
       isLoading: false as boolean,
       reportID: -1 as any,
       periodLabel: 'Month Dates',
       periodDates: '' as string,
       reportName: 'MALARIA HEALTH FACILITY MONTHLY REPORT',
       reportTitle: '',
       rangeLabel: 'Month',
       range: '' as string,
       TotalOPDVisits: 0 as number,
       clinicName: IDSRReportService.getLocationName(),
     }
   },
   props: ['params', 'epiweek', 'quarter'],
   created() {
     this.btns = this.getBtns()
     this.fields = this.getMonthlyFields()
   },
   methods: {
    renderResults() {
      const report = new IDSRReportService()
      const Conditions = report.renderResults(this.params)
      if(Conditions.length){
       this.conditions = Conditions
       this.show = false
      }
    },
    exportToCsv() {
      const headers = ['Indicator', 'Value']
      const rows = Object.entries(this.malariaData).map(([key, value]: any) => {
        return key == 'total_OPD_attendance' 
          ? [key, (value['total_patient_more_5yrs']?.length + value['total_patient_less_5yrs']?.length) || 0] 
          : [key, value?.length || 0]
      })
      
      toCsv([headers], [
        ...rows,
        ['',''],
        [`Date Created: ${dayjs().format('DD/MMM/YYYY HH:MM:ss')}`],
        [`HIS-Core Version: ${Service.getCoreVersion()}`],
        [`Report Period: ${this.period}`],
        [`API Version: ${Service.getApiVersion()}`],
        [`Site: ${Service.getLocationName()}`],
        [`Site UUID: ${Service.getSiteUUID()}`]
      ], this.reportTitle)
    },
    async onPeriod(form: any) {
     try {
       this.reportReady = true
       this.isLoading = false
       this.reportService = new OpdReportService()
       this.reportService.setStartDate(form.idsrmonth.other.start)
       this.reportService.setEndDate(form.idsrmonth.other.end)
       this.period = this.reportService.getDateIntervalPeriod()
       this.malariaData = await this.reportService.getMalariaReport()
       this.periodDates = this.reportService.getReportPeriod()
       this.range = form.idsrmonth.label.split(" ")[0]
       this.reportTitle = `MOH ${Service.getLocationName()} Malaria report ${this.period}`
 
       if(this.malariaData.total_OPD_attendance.total_patient_less_5yrs)
         this.TotalOPDVisits = this.malariaData.total_OPD_attendance.total_patient_less_5yrs.length
       if(this.malariaData.total_OPD_attendance.total_patient_more_5yrs)
         this.TotalOPDVisits = this.malariaData.total_OPD_attendance.total_patient_more_5yrs.length + this.TotalOPDVisits
     } catch (error) {
       console.log(error)
     } finally {
         this.isLoading = false
     }
 
     },
   
    getBtns() {
       return [
         {
           name: "CSV",
           size: "large",
           slot: "start",
           color: "primary",
           visible: true,
           onClick: () => this.exportToCsv()
         },
         {
           name: "PDF",
           size: "large",
           slot: "start",
           color: "primary",
           visible: true,
           onClick: () => this.exportToCustomPDF(this.reportTitle)
         },
         {
           name: "Back",
           size: "large",
           slot: "end",
           color: "warning",
           visible: true,
           onClick: () => this.reportReady = false
         },
         {
           name: "Refresh",
           size: "large",
           slot: "end",
           color: "warning",
           visible: true,
           onClick: async () => await this.onPeriod(this.formData)
         },
         {
           name: "Finish",
           size: "large",
           slot: "end",
           color: "success",
           visible: true,
           onClick: () => this.$router.push({ path: '/' })
         }
       ]
     },
   }
   // watch: {
   //   params: {
   //     immediate: true,
   //     handler() {
   //       this.renderResults();
   //     }
   //   }
   // }
 })
 </script>
 
 <style scoped>
 table {
   width: 100%;
   border-collapse: collapse;
 }
 tr {
   height: 45px;
 }
 
 td {
   border: 0.1px solid grey;
   text-align: center;
 }
 .td-text-align-left{
   text-align: left;
   padding-left: 10px;
 }
 
 
 </style>