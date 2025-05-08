import { PatientProgramService } from '@/services/patient_program_service';
import { TbState } from "@/apps/TB/meta/constants"
import { PrintoutService } from "@/services/printout_service"
import { Service } from "@/services/service"
import Url from "@/utils/Url"
import { ProgramService } from "@/services/program_service";
import { isDateString, toDate } from '@/utils/Strs';
import dayjs from 'dayjs';
import { STANDARD_DATE_FORMAT } from '@/utils/Date';
import { ObservationService } from '@/services/observation_service';
import { getConceptID, getConceptNameById } from './util';
import { PatientPrintoutService } from '@/services/patient_printout_service';
import { ObservationService } from '../../../services/observation_service';

export default class TbService extends Service {
    static  async enrollMDR(patientID: number) {
        const program = new PatientProgramService(patientID)
        try {
            await program.enrollProgram()
        } catch (e) {
            console.warn(`${e}`)
        }
        program.setStateDate(Service.getSessionDate())
        program.setStateId(TbState.MDR)
        await program.updateState()
    }

    static async enrollTb(patientID: number) {
        const program = new PatientProgramService(patientID)
        try {
            await program.enrollProgram()
        } catch (e) {
            console.warn(`${e}`)
        }
        program.setStateDate(Service.getSessionDate())
        program.setStateId(TbState.CURRENTLY_ON_TREATMENT)
        await program.updateState()
    }

    static printTBNumber(patient: number) {
        return (new PrintoutService()).printLbl(`patients/${patient}/labels/print_tb_number?patient_id=${patient}`)
    }

    static printLabOrder(patientID: number, orderPayload={}) {
        const urlParams = Url.parameterizeObjToString({
            ...orderPayload,
            patient_id: patientID,
            session_date: Service.getSessionDate()
        })
        return (new PrintoutService()).printLbl(`patients/${patientID}/labels/print_tb_lab_order_summary?${urlParams}`)
    }

    static async shouldTransferToExternalFacility(patientID: number) {
        const livesNear = await ObservationService.getFirstValueCoded(patientID, 'Patient lives or works near?')
        const needsTransfer = await ObservationService.getFirstValueCoded(patientID, 'Patient transferred(external facility)')
        return livesNear === 'No' && needsTransfer === 'Yes'
    }

    
    static isOnTreatment(outcomeName: string) {
        const treatmentOucomes = [
            'Multi drug resistance treatment', 
            'Currently in treatment', 
            'Tuberculosis Preventitve Treatment (TPT)'
        ]
        return treatmentOucomes.includes(outcomeName)
    }

    static async generateArtStatusFromArt(patientID: number, date: string) {
        const art = await ProgramService.getProgramInformation(patientID, 1)
        if (!art || !isDateString(art.art_start_date)) return
        const tb = await ProgramService.getProgramInformation(patientID)
        const artStartDate = (() => {
            const [day, month, year] = `${art.art_start_date}`.split('/')
            return `${year}-${month}-${day}`
        })()
        let tbStartDate = ''
        if (isDateString(tb.current_outcome_date)) {
            tbStartDate = dayjs(tb.current_outcome_date).format(STANDARD_DATE_FORMAT)
        }
        const artBeforeTB = tbStartDate 
            ? dayjs(artStartDate).isBefore(tbStartDate)
            : true
        const orders = await ObservationService.getAll(patientID, 'Medication orders')
        const cptOrders = orders.filter((t: any) => getConceptNameById(t.value_coded))
        return {
            hivStatus: {
                label: "HIV Status",
                value: "Positive",
                _recordedStatusInTB: tb.hiv,
                obs: {
                    concept_id: getConceptID('HIV_STATUS'),
                    value_coded: getConceptID("POSITIVE"),
                    obs_datetime: date
                }
            },
            timeOfHIVTest: {
                label: "Time of HIV Test",
                value: artBeforeTB ? "Tested Positive Before TB" : "Tested Positive After TB",
                obs: {
                    concept_id: getConceptID('TIME_OF_HIV_TEST'),
                    value_coded: getConceptID(artBeforeTB ? "HIV_BEFORE_TB" : "HIV_AFTER_TB"),
                    obs_datetime: date
                }
            },
            artStatus: {
                label: "On ART?",
                value: "Yes",
                obs: {
                    concept_id: getConceptID('ON_ART'),
                    value_coded: getConceptID("YES_ANSWER"),
                    obs_datetime: date
                }    
            },
            arvStatus: {
                label: "ARV Status",
                value: artBeforeTB ? "Started ARVs before TB" : "Started ARVs while  on TB",
                obs: {
                    concept_id: getConceptID('ARV_STATUS'),
                    value_coded: getConceptID(artBeforeTB ? "ARV_BEFORE_TB" : "ARV_WHILE_TB"),
                    obs_datetime: date
                }
            },
            cptStatus: {
                label: "On CPT?",
                value: cptOrders.length ? 'Yes' : 'No',
                obs: {
                    concept_id: getConceptID('ON_CPT'),
                    value_coded: getConceptID(cptOrders.length ? 'YES_ANSWER' : 'NO_ANSWER'),
                    obs_datetime: date
                }
            },
            cptStartDate: (() => {
                const cptDate = cptOrders?.[cptOrders.length-1]?.obs_datetime 
                ? dayjs(cptOrders?.[cptOrders.length-1]?.obs_datetime).format(STANDARD_DATE_FORMAT)
                : 'Unknown'

                if (isDateString(cptDate)) {
                    return {
                        label: "CPT Start date",
                        value: toDate(cptDate),
                        obs: {
                            concept_id: getConceptID('CPT_START_DATE'),
                            value_datetime: cptDate,
                            obs_datetime: date
                        }
                    }
                }
                return {
                    label: "CPT Start date",
                    value: "Unknown",
                    obs: {
                        concept_id: getConceptID('CPT_START_DATE'),
                        value_text: "Unknown",
                        obs_datetime: date
                    }
                }
            })()
        }
    }
}