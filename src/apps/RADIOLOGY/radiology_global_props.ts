import { GlobalPropertyService } from "@/services/global_property_service"

export enum RADIOLOGY_GLOBAL_PROP {
    DEFAULT_REFERRAL_LOCATION = 'default.referral.location'
}

export default {
    defaultReferralLocation: () => GlobalPropertyService.get(RADIOLOGY_GLOBAL_PROP.DEFAULT_REFERRAL_LOCATION)
}