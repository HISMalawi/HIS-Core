import EventBus from '@/utils/EventBus';

export enum ApiBusEvents {
    BEFORE_API_REQUEST = 'before_api_request',
    AFTER_API_REQUEST = 'after_api_request',
    ON_API_CRASH = 'un_reachable_api',
}
export interface Config {
    host: string;
    port: string;
    protocol: string;
    thirdpartyapps: string;
    otherApps: Array<any>;
}

const ApiClient = (() => {

    async function getFileConfig(): Promise<Config> {
        const response = await fetch('/config.json')
        if (!response.ok) {
            throw 'Unable to retrieve configuration file/ Invalid config.json'
        }
        try {
            const { 
                apiURL, 
                apiPort, 
                apiProtocol, 
                appConf, 
                apps, 
                thirdpartyApps, 
                platformProfiles,
                otherApps,
            } = await response.json()
            sessionStorage.setItem("apiURL", apiURL);
            sessionStorage.setItem("apiPort", apiPort);
            sessionStorage.setItem("apiProtocol", apiProtocol);
            sessionStorage.setItem("appConf", JSON.stringify(appConf));
            sessionStorage.setItem("apps", JSON.stringify(apps));
            sessionStorage.setItem("thirdpartyApps", JSON.stringify(thirdpartyApps))
            sessionStorage.setItem("platformProfiles", JSON.stringify(platformProfiles));
            sessionStorage.setItem("otherApps", JSON.stringify(otherApps))
            return {
                host: apiURL,
                port: apiPort,
                protocol: apiProtocol,
                thirdpartyapps: thirdpartyApps,
                otherApps,
            }
        } catch (e) {
            console.error(e)
            throw 'API Configuration file "/config.json" has errors. Please check console log for more details'
        }
    }

    function getLocalConfig(): Config | undefined {
        const host = localStorage.apiURL;
        const port = localStorage.apiPort;
        const protocol = localStorage.apiProtocol;
        const thirdpartyapps = localStorage.thirdpartyApps
        const otherApps = localStorage.otherApps || []

        if ((host && port && protocol))
            return { host, port, protocol, thirdpartyapps, otherApps }
    }

    function getSessionConfig(): Config | undefined {
        const host = sessionStorage.apiURL
        const port = sessionStorage.apiPort
        const protocol = sessionStorage.apiProtocol
        const thirdpartyapps = sessionStorage.thirdpartyApps
        const otherApps = sessionStorage.otherApps

        if ((host && port && protocol))
            return { host, port, protocol, thirdpartyapps, otherApps }
    }

    function getConfig(): Promise<Config> | Config {
        const localConfig: Config | undefined = getLocalConfig()
        const sessionConfig: Config | undefined = getSessionConfig()

        if (localStorage.useLocalStorage && localConfig)
            return localConfig

        if (sessionConfig) return sessionConfig
        
        return getFileConfig()
    }

    async function expandPath(resourcePath: string) {
        const config: Promise<Config> | Config = await getConfig();
        return `${config.protocol}://${config.host}:${config.port}/api/v1/${resourcePath}`
    }

    function headers() {
        return {
            'Authorization': sessionStorage.apiKey,
            'Content-Type': 'application/json'
        };
    }

    function setLocalStorage(protocol: string, ipAddress: string, port: string) {
        localStorage.setItem('useLocalStorage', 'true');
        localStorage.setItem('apiURL', ipAddress);
        localStorage.setItem('apiPort', port);
        localStorage.setItem('apiProtocol', protocol);
    }

    function removeOnly(inclusions: string[]) {
        inclusions.forEach(element => {
           inclusions.includes(element) && localStorage.removeItem(element)
        })
    }

    async function execFetch(uri: string, params: any) {        
        params = { ...params, mode: 'cors' };
        
        if (!('headers' in params)) {
            params = { ...params, headers: headers() };
        }

        const url = await expandPath(uri)

        try {
            EventBus.emit(ApiBusEvents.BEFORE_API_REQUEST, uri)
            const response = await fetch(url, params);
            EventBus.emit(ApiBusEvents.AFTER_API_REQUEST, response)            
            return response
        } catch (e) {
            console.error(e)
            if (`${e}`.match(/NetworkError|Failed to fetch/i)) {
                EventBus.emit(ApiBusEvents.ON_API_CRASH, e)
            } else {
                EventBus.emit(ApiBusEvents.AFTER_API_REQUEST, {})
            }
        }
    }
    
    // /**
    //  * Perform a POST request on the API
    //  * 
    //  * @param {string} uri Path to resource being accessed. 
    //  * @param {Object} data Parameters to send to API.
    //  * 
    //  * Example:
    //  *   const response = post('people', {given_name: 'Foo', family_name: 'Bar}).then((response) => console.log(response));
    //  */
    const get = (uri: string) => execFetch(uri, { method: 'GET' })
    const post = (uri: string, data: object) => execFetch(uri, { method: 'POST', body: JSON.stringify(data) });
    const remove = (uri: string, data: object) => execFetch(uri, { method: 'DELETE', body: JSON.stringify(data)});
    const put = (uri: string, data: object) => execFetch(uri, { method: 'PUT', body: JSON.stringify(data) });
    const healthCheck = () => get('_health')
    return { get, post, put, remove, getConfig, setLocalStorage, removeOnly, expandPath, healthCheck, getFileConfig };
})();

export default ApiClient;
