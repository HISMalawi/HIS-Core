import { Role } from "@/interfaces/role"
import ApiClient, { Config } from "./api_client"
import HisDate from "@/utils/Date"
import PACK_CONF from "../../package.json"
import { GlobalPropertyService } from "./global_property_service"
import { GLOBAL_PROP, USER_PROP } from "@/apps/GLOBAL_APP/global_prop"
import dayjs from "dayjs"
import { BadRequestError, NotFoundError, Service } from "./service"
import { toastWarning } from "../utils/Alerts"

export class InvalidAPIVersionError extends Error {
    message: string
    constructor(version: string) {
        super()
        this.message = `Your current API Version of "${version}" does not meet "${PACK_CONF['min-api-version']}". Contact administrator to update your API Version`
    }
}

export class InvalidCredentialsError extends Error {
    message: string
    constructor() {
        super()
        this.message = 'Invalid username/password'
    }
}

export enum AuthVariable {
    CORE_VERSION = 'core_version'
}

export class AuthService {
    username: string
    userID: number
    roles: Role[]
    token: string
    programs: any
    sessionDate: string
    systemVersion: string
    coreVersion: string
    constructor() {
        this.token = ''
        this.username = ''
        this.roles = []
        this.programs = []
        this.userID = -1
        this.sessionDate = ''
        this.systemVersion = ''
        this.coreVersion = ''
    }

    setUsername(username: string) { this.username = username }

    async loadConfig(): Promise<Config> {
        return ApiClient.getFileConfig()        
    }

    async login(password: string) {
        const response = await this.requestLogin(password)
        if (response) {
            const {
                authorization: {
                    token,
                    user
                }
            } = response
            this.token = token
            this.roles = user.roles
            this.programs = user.programs
            this.userID = user.user_id
            this.sessionDate = await this.getSystemDate()
            this.systemVersion = await this.getApiVersion()
            this.coreVersion = this.getHeadVersion()
        } else {
            throw 'Unable to login'
        }
    }

    startSession() {
        sessionStorage.setItem("apiKey", this.token);
        sessionStorage.setItem("username", this.username);
        sessionStorage.setItem("userID", this.userID.toString());
        sessionStorage.setItem("userRoles", JSON.stringify(this.roles));
        sessionStorage.setItem("userPrograms", JSON.stringify(this.programs));
        sessionStorage.setItem("sessionDate", this.sessionDate)
        sessionStorage.setItem("APIVersion", this.systemVersion)
        localStorage.setItem(AuthVariable.CORE_VERSION, this.coreVersion)
    }

    passwordPolicyEnabled() {
        return GlobalPropertyService.isProp(`${GLOBAL_PROP.PASSWORD_POLICY_ENABLED}=true`)
    }

    async passwordExpired() {
        const changeIntervalInDays = await GlobalPropertyService.get(GLOBAL_PROP.PASSWORD_RESET_INTERVAL)
        if (!changeIntervalInDays) return false
        try {
            const lastUpdate = await GlobalPropertyService.getJson('user_properties', {
                property: USER_PROP.LAST_PASSWORD_RESET
            })
            if (lastUpdate && lastUpdate.property_value) {
                const daysGone = dayjs(this.sessionDate).diff(lastUpdate.property_value, "days")
                return daysGone >= changeIntervalInDays
            }
        } catch (e) {
            if (e instanceof NotFoundError) {
                return true
            } else {
                console.error(e)
            }
        }
        return true
    }

    resetUserPasswordChangeCheck() {
        return GlobalPropertyService.postJson('user_properties', {
            property: USER_PROP.LAST_PASSWORD_RESET,
            property_value: this.sessionDate
        })
    }

    clearSession() { sessionStorage.clear() }

    requestLogin(password: string) {
        return this.postLogin(`auth/login`, {
            username: this.username,
            password: password
        })
    }
    /**
     * Validates if the API version meets the minimum required version
    */
    async validateIfCorrectAPIVersion() {
        const apiVersion = await this.getApiVersion()
        // Remove the 'v' prefix if present
        const version = `${apiVersion}`.replace(/^v/, '');
        const minimumVersion = `${PACK_CONF['min-api-version']}`.replace(/^v/, '');

        // Split the versions into arrays of numbers
        const versionParts = version.split('.');
        const minimumVersionParts = minimumVersion.split('.');

        // Compare each part of the version numbers
        for (let i = 0; i < Math.max(versionParts.length, minimumVersionParts.length); i++) {
            const versionPart = parseInt(versionParts[i] || '0');
            const minimumVersionPart = parseInt(minimumVersionParts[i] || '0');

            if (versionPart > minimumVersionPart) {
                return true;
            } else if (versionPart < minimumVersionPart) {
                throw new InvalidAPIVersionError(apiVersion)
            }
        }
        // All parts are equal
        return true;
    }

    async checkTimeIntegrity() {
        const serverDate = await this.getSystemDate()
        const localDate = HisDate.currentDate()
        if (!serverDate) throw 'Unable to fetch server date'
        return localDate === serverDate
    }

    initDateSync(interval = 1000) {
        setInterval(async () => {
            const date = await this.getSystemDate()
            /**
             * This condition exists to prevent overriding BDE Date
             * by checking presence of apiDate. We update ApiDate
             * if found else we update SessionDate.
             */
            if (sessionStorage.getItem('apiDate')) {
                sessionStorage.setItem('apiDate', date)
            } else {
                sessionStorage.setItem('sessionDate', date)
            }
        }, interval)
    }

    setActiveVersion(version: string) {
        return localStorage.setItem(AuthVariable.CORE_VERSION, version)
    }

    getActiveCoreVersion() {
        return localStorage.getItem(AuthVariable.CORE_VERSION)
    }

    async getApkVersion() {
        const res = await this.getJson('apk_version');
        return res.version ?? '-';
    }


    async getApkDownloadLink(version: string) {
        return ApiClient.expandPath(`apk_download?version=${version}`);
    }

    getHeadVersion(): string {
        return PACK_CONF['version']
    }

    cachingIsEnabled() {
        const val = this.getAppConf('dataCaching')
        return typeof val === 'boolean' ? val : true
    }

    versionLockingIsEnabled() {
        const val = this.getAppConf('enableVersionLocking')
        // Version locking is enabled by default if no config isset
        return  typeof val === 'boolean' ? val : true
    }

    getAppConf(confKey: 'promptFullScreenDialog' | 'showUpdateNotifications' | 'enableVersionLocking' | 'dataCaching') {
        const conf: any = sessionStorage.getItem('appConf')
        if (conf) {
            try {
                const confObj = JSON.parse(conf)
                return confObj[confKey]
            } catch (e) {
                console.error(e)
            }
        }
        return null
    }

    async getPreviousReleasesRead() {
        try {
            const prop = await this.getJson('user_properties?property=version_releases_read')
            return prop.property_value.split(',')
        } catch (e) {
            console.error(e)
            return []
        }
    }

    async hasUserReadCurrentVersionRelease() {
        return (await this.getPreviousReleasesRead()).includes(this.getHeadVersion())
    }

    async updateVersionReleaseAsRead() {
        return ApiClient.put('user_properties', {
            property: 'version_releases_read', 
            property_value: [
                this.getHeadVersion(), 
                ...(await this.getPreviousReleasesRead())
            ].join(',') 
        })    
    }

    async getApiVersion(): Promise<string> {
        const api: any = await this.getJson('version')
        return api && api['System version'] ? api['System version'] : '-'
    }

    async getSystemDate(): Promise<string> {
        const { date } = await this.getJson('current_time')
        return date
    }

    private async getJson(url: string) {
        const req = await ApiClient.get(url)
        if (req && req.ok)
            return req?.json()
    }

    private async postLogin(url: string, params: Record<string, number | string>) {
        const req = await ApiClient.post(url, params)
        if (!req)
            return

        if (req.ok) {
            return req.json()
        }

        if (req.status === 401)
            throw new InvalidCredentialsError()
    }

    async validateResetPasswordToken(code: string) {
        try {
            const {
                authorization: {
                    token,
                    user
                }
            } = await Service.postJson(`auth/reset_password?code=${code}`, {});
            this.token = token
            this.roles = user.roles
            this.programs = user.programs
            this.userID = user.user_id
            this.sessionDate = await this.getSystemDate()
            this.systemVersion = await this.getApiVersion()
            this.coreVersion = this.getHeadVersion()
            this.startSession();
            return true
        } catch (e: any){
            if (e instanceof BadRequestError) toastWarning(e.errors.join(', '))
            else toastWarning(`${e}`)
            console.error(e)
            return false
        }
    }
}
