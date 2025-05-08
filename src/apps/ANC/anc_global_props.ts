import { GlobalPropertyService } from "@/services/global_property_service"

export enum ANC_GLOBAL_PROP {
    RECENCY_ESSAY_ACTIVATED = 'recency_essay_activated'
}

function recencyEssayActivated() {
    return GlobalPropertyService.isProp(`${ANC_GLOBAL_PROP.RECENCY_ESSAY_ACTIVATED}=Yes`)
}

export default {
    recencyEssayActivated
}