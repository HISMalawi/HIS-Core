import { GlobalPropertyService } from "@/services/global_property_service"

export enum OPD_GLOBAL_PROP {
    PACS_ENABLED = 'enable_pacs',
    ENABLE_SUMMARY_PRINTING = "enable_opd_summary_printing"
}

function enablePACs(isTrue: boolean){
    return GlobalPropertyService.set(OPD_GLOBAL_PROP.PACS_ENABLED, `${isTrue}`)
}

function isPACsEnabled(){
    return GlobalPropertyService.isProp(`${OPD_GLOBAL_PROP.PACS_ENABLED}=true`)
}

function isSummaryPrintingEnabled() {
    return GlobalPropertyService.isProp(`${OPD_GLOBAL_PROP.ENABLE_SUMMARY_PRINTING}=true`);
}

function enableSummaryPrinting(isEnabled: boolean) {
    GlobalPropertyService.set(OPD_GLOBAL_PROP.ENABLE_SUMMARY_PRINTING, `${isEnabled}`);
}

export default {
    enablePACs,
    isPACsEnabled,
    isSummaryPrintingEnabled,
    enableSummaryPrinting,
}