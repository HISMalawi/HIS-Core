/**
 * Map all formElements/components defined in "@/components/FormElements" 
 * in the Enum below by their file name.
 * 
 * Next step is to add FieldType entry in COMPONENT_REFS in the 
 * Array below the FieldType Enum
 */
export enum FieldType {
    TT_DRUG_RETROSPECTIVE_INPUT = 'DrugRetrospectiveInput',
    TT_PASSWORD='HisPasswordInput',
    TT_DR_PRESCRIPTION_INPUT='DrPrescriptionInput',
    TT_DR_REGIMEN_INPUT='DrNewRegimenInput',
    TT_ASYNC_MULTI_SELECT = 'AsyncMultiSelect',
    TT_LINKAGE_CODE = 'LinkageCodeInput',
    TT_MULTI_SELECT_GRID= 'HisMultiSelectGrid',
    TT_AGE_INPUT='HisAgeInput',
    TT_GROUP_SELECTOR = 'HisGroupSelector',
    TT_DATA_TABLE = 'HisDataTable',
    TT_GRID_SELECTOR = 'HisGridSelector',
    TT_NOTE = 'HisNote',
    TT_BARCODE = 'HisBarcodeInput',
    TT_MONTHLY_DAYS="HisMonthlyDays",
    TT_TEXT="HisTextInput",
    TT_NUMBER = "HisNumberInput",
    TT_DATETIME="datetime",
    TT_SELECT="HisSelect",
    TT_MULTIPLE_SELECT="HisMultipleSelect",
    TT_ART_REGIMEN_SELECTION="HisArtRegimenSelection",
    TT_NEXT_VISIT_INTERVAL_SELECTION="HisNextVisitInterval",
    TT_TABLE_VIEWER="HisTableViewer",
    TT_DOSAGE_INPUT="HisDosageInput",
    TT_YES_NO="YesNoSelect",
    TT_MULTIPLE_YES_NO="MultiYesNoSelect",
    TT_SUMMARY="HisSummary",
    TT_WEIGHT_CHART = "HisWeightChart",
    TT_VITALS_ENTRY="HisVitalsEntry",
    TT_ADHERENCE_INPUT = "HisAdherenceInput",
    TT_ART_STAGING_SUMMARY = "ArtStagingSummary",
    TT_LAB_ORDERS = "HisLabOrders",
    TT_APPOINTMENTS_ENTRY = "HisAppointments",
    TT_DISPENSATION_INPUT = 'DrugDispensationSelection',
    TT_PROGRAM_SELECTION = 'ProgramSelection',
    TT_DATE_PICKER = 'HisDatePicker',
    TT_PERSON_RESULT_VIEW = 'PersonSearchView',
    TT_RELATION_SELECTION = 'RelationsSelection',
    TT_FILING_NUMBER_VIEW = 'FilingNumberView',
    TT_CARD_SELECTOR = 'HisCardSelector',
    TT_PERSON_MATCH_VIEW = 'PersonMatchView',
    TT_FULL_DATE = 'HisDateInput',
    TT_BATCH_ENTRY = 'HisBatchEntry',
    TT_BATCH_VERIFICATION = 'HisBatchVerification',
    TT_BATCH_MOVEMENT = 'HisBatchMovement',
    TT_COMPLAINTS_PICKER = 'HisComplaintsPicker',
    TT_RADIOLOGY_PICKER = 'HisRadiologyPicker',
    TT_IP_ADDRESS = 'HisIPAddress',
    TT_TEXT_BANNER = 'HisTextBanner',
    TT_DRUG_DISPENSER = 'GeneralDrugDispenser',
    TT_CLINIC_HOLIDAY_PICKER = 'HisClinicHolidayPicker',
    TT_ANC_PREGNANCY_INPUT_CONFIG = 'AncPregnancyInfoConfig',
    TT_ANC_PREGNANCY_DETAILS_INPUT = 'AncPregnancyDetailsInput',
    TT_ANC_DRUGSET_INPUT = 'AncDrugSetInput',
    TT_DRUG_TRANSFER_IN = 'DrugTransferInput',
    TT_PRESCRIPTION_INPUT = 'HisPrescriptionInput',
    TT_INFINITE_SCROLL_MULTIPLE_SELECT="HisInfiniteScrollMultipleSelect"
}

// Register FieldTypes here that will be registered at runtime
export const COMPONENT_REFS: FieldType[] = [
    FieldType.TT_DRUG_RETROSPECTIVE_INPUT,
    FieldType.TT_PASSWORD,
    FieldType.TT_DR_PRESCRIPTION_INPUT,
    FieldType.TT_DR_REGIMEN_INPUT,
    FieldType.TT_ASYNC_MULTI_SELECT,
    FieldType.TT_LINKAGE_CODE,
    FieldType.TT_MULTI_SELECT_GRID,
    FieldType.TT_AGE_INPUT,
    FieldType.TT_BARCODE,
    FieldType.TT_NOTE,
    FieldType.TT_SELECT,
    FieldType.TT_CARD_SELECTOR,
    FieldType.TT_MULTIPLE_SELECT,
    FieldType.TT_TEXT,
    FieldType.TT_NUMBER,
    FieldType.TT_MONTHLY_DAYS,
    FieldType.TT_ART_REGIMEN_SELECTION,
    FieldType.TT_NEXT_VISIT_INTERVAL_SELECTION,
    FieldType.TT_TABLE_VIEWER,
    FieldType.TT_DOSAGE_INPUT,
    FieldType.TT_YES_NO,
    FieldType.TT_MULTIPLE_YES_NO,
    FieldType.TT_WEIGHT_CHART,
    FieldType.TT_VITALS_ENTRY,
    FieldType.TT_APPOINTMENTS_ENTRY,
    FieldType.TT_COMPLAINTS_PICKER,
    FieldType.TT_CLINIC_HOLIDAY_PICKER,
    FieldType.TT_SUMMARY,
    FieldType.TT_ART_STAGING_SUMMARY,
    FieldType.TT_ADHERENCE_INPUT,
    FieldType.TT_LAB_ORDERS,
    FieldType.TT_PERSON_RESULT_VIEW,
    FieldType.TT_PROGRAM_SELECTION,
    FieldType.TT_DATE_PICKER,
    FieldType.TT_RELATION_SELECTION,
    FieldType.TT_FILING_NUMBER_VIEW,
    FieldType.TT_PERSON_MATCH_VIEW,
    FieldType.TT_FULL_DATE,
    FieldType.TT_BATCH_ENTRY,
    FieldType.TT_BATCH_VERIFICATION,
    FieldType.TT_BATCH_MOVEMENT,
    FieldType.TT_IP_ADDRESS,
    FieldType.TT_TEXT_BANNER,
    FieldType.TT_DISPENSATION_INPUT,
    FieldType.TT_DATA_TABLE,
    FieldType.TT_GROUP_SELECTOR,
    FieldType.TT_ANC_PREGNANCY_INPUT_CONFIG,
    FieldType.TT_ANC_PREGNANCY_DETAILS_INPUT,
    FieldType.TT_DRUG_TRANSFER_IN,
    FieldType.TT_GRID_SELECTOR,
    FieldType.TT_ANC_DRUGSET_INPUT,
    FieldType.TT_RADIOLOGY_PICKER,
    FieldType.TT_PRESCRIPTION_INPUT,
    FieldType.TT_INFINITE_SCROLL_MULTIPLE_SELECT,
    FieldType.TT_DRUG_DISPENSER
]
