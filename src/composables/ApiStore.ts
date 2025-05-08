import { ref } from "vue";
import GlobalStore from "@/apps/GLOBAL_APP/global_store"
import App from "@/apps/app_lib"

// Track all cached items in this reactive object
const STATES = ref({} as any)
const REQUEST_OBJECTS = ref({} as Promise<any> | any)

export default {
    /**
     * Getter for retrieving data from cache or regenerating it if necessary.
     * Regenerating data is based on hook "canReloadCache"
     * @param name 
     * @param params 
     * @returns 
     */
    async get(name: string, params={} as any) {
        const Store = App.getActiveApp()?.appStore || GlobalStore
        if (name in Store) {
            const p = params || {}
            if (typeof Store[name]?.canReloadCache === 'function' && 
            Store[name]?.canReloadCache({ params: p, state: STATES.value[name]})) {
                // Promise objects should be cached in singleton object to prevent duplication 
                // of requests
                if (!REQUEST_OBJECTS.value[name]) {
                    REQUEST_OBJECTS.value[name] = Store[name]?.get(p)
                }
                STATES.value[name] = await REQUEST_OBJECTS.value[name]
                // Clear after successful request
                REQUEST_OBJECTS.value[name] = undefined
            }
            return STATES.value[name]
        } else {
            throw `Store ${name} not found`
        }
    },
    set(name: string, data: any) {
        STATES.value[name] = data
        return STATES.value[name]
    },
    invalidate(name: string) { 
        STATES.value[name] = undefined
    },
    invalidateAll() {
        Object.keys(STATES.value).forEach(k => {
            STATES.value[k] = undefined
        })
    }
}
