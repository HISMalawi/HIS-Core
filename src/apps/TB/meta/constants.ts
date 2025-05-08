export const TB_PROGRAM_ID = 2

export enum EncounterType {
    DIAGNOSIS = 41,
    TB_INITIAL = 14,
    EXAMINATION = 28,
    TB_RECEPTION = 77,
    TREATMENT = 25,
    LAB_ORDER = 57,
    TB_REGISTRATION = 78,
    LAB_RESULTS = 32,
    HIV_STATUS = 39,
    SIDE_EFFECTS = 31,
    REFERRAL = 114,
    ADHERENCE = 87,
    UPDATE_PREGNANCY_STATUS = 76,
    UPDATE_HIV_STATUS = 39,
    APPOINTMENT = 7,
    COMPLICATIONS = 31
}

export enum TbRelations {
    TB_CONTACT = 10
}

export enum TbGlobals {
    CLINIC_APPOINTMENT_LIMIT="clinic.appointment.limit",
    MICROSCOPY_RESULT_TURN_AROUND="MICROSCOPY__turnaround_period",
    XPERT_MTB_RIF_RESULT_TURN_AROUND="XPERT_MTB_RIF__turnaround_period",
    XPERT_MTB_RIF_ULTRA_RESULT_TURN_AROUND="XPERT_MTB_RIF_ULTRA__turnaround_period",
    CULTURE_AND_DST_RESULT_TURN_AROUND="CULTURE_AND_DST__turnaround_period",
    LPA_RESULT_TURN_AROUND="LPA__turnaround_period",
    LAM_RESULT_TURN_AROUND="LAM__turnaround_period"
}

export enum TbIdentifierType {
    TB = 7,
    IPT = 29,
    MDR = 11,
    MW = 28
}
export enum TbState {
    TPT = 173,
    MDR = 174,
    TRANSFER_OUT = 95,
    CURRENTLY_ON_TREATMENT=92
}
export const TPT_ELIGIBLE_AGE = 5
