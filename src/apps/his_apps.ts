import ART from '@/apps/ART/app';
import LOS from '@/apps/LOS/app';
import OPD from '@/apps/OPD/app';
import ANC from '@/apps/ANC/app'
import CXCA from '@/apps/CxCa/app';
import AETC from '@/apps/AETC/app';
import { RouteRecordRaw } from 'vue-router';
import RADIOLOGY from '@/apps/RADIOLOGY/app';
import Registration from '@/apps/Registration/app';
import CRVS from '@/apps/CRVS/app';
import SPINE from './SPINE/app';
import TB from "./TB/app"
/**
 * Register Program Applications here that conform to the AppInterface
*/
const APPS = [
    TB,
    ART,
    LOS,
    OPD,
    ANC,
    CXCA,
    AETC,
    SPINE,
    RADIOLOGY,
    CRVS,
    Registration
]
export function  AllAppRoutes() {
    return APPS.reduce((all, app) => 
        all.concat(app.appRoutes), [] as RouteRecordRaw[])
}
export default APPS
