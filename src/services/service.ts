import ApiClient from "./api_client"
import Url from "@/utils/Url"
import HisApp from "@/apps/app_lib"
import { AppInterface } from "@/apps/interfaces/AppInterface"
import useSWRV from "swrv"
import { AuthVariable } from "./auth_service"
import HisApps from "@/apps/his_apps"
import { find, isEmpty } from "lodash"

export class IncompleteEntityError extends Error {
    entity: any
    constructor(message: string, entity: any) {
        super(`ENTITY Error: ${message}`)
        this.entity = entity
    }
}

export class RecordConflictError extends Error {
    errors: any
    constructor(message: string, errors: any) {
        super(message)
        this.errors = errors
    }
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(`RECORD NOT FOUND: ${message}`)
    }
}

export class BadRequestError extends Error {
    errors: any
    constructor(message: string, errors: any) {
        super(message)
        this.errors = errors
    }
}

class ApiServiceError extends Error {
    constructor(message: string) {
        super(`API SERVICE_ERROR: ${message}`)
    }
}

class ApiError extends Error {
    constructor(message: string) {
        super(`API ERROR: ${message}`)
    }
}

export class Service {
    static ajxGet(url: string, params={}) {
        return ApiClient.get(`${url}?${Url.parameterizeObjToString(params)}`)
    }

    static async getText(url: string) {
        const req = await ApiClient.get(url)
        if (req && req.ok) return req?.text()
    }

    static getJsonSWR(url: string, params = {} as Record<string, any>){
        const transformedUrl = `${url}?${Url.parameterizeObjToString(params)}`
        return useSWRV(transformedUrl, key => this.getJson(key)).data
    }

    static async getJson(url: string, params = {} as Record<string, any>) {
        const transformedUrl = `${url}?${Url.parameterizeObjToString(params)}`
        return this.jsonResponseHandler(ApiClient.get(transformedUrl))
    }

    static async postJson(url: string, data: any) {
        return this.jsonResponseHandler(ApiClient.post(url, data))
    }

    static putJson(url: string, data: Record<string, any>) {
        return this.jsonResponseHandler(ApiClient.put(url, data))
    }

    static async void(url: string, reason: Record<string, string>) {
        return this.jsonResponseHandler(ApiClient.remove(url, reason))
    }

    static async getThirdpartyApps() {
        return JSON.parse((await ApiClient.getConfig()).thirdpartyapps)
    }

    private static async jsonResponseHandler(request: Promise<any>) {
        const response = await request
        if (response) {
            if ([200, 201].includes(response.status)) {
                return response?.json()
            }

            if (response.status === 400) {
                const {errors} = await response?.json()
                throw new BadRequestError(response.statusText, errors)
            }

            if (response.status === 404) {
                const {errors} = await response?.json()
                throw new NotFoundError(errors)
            }

            if (response.status === 422) {
                const {errors, entity} = await response?.json()
                throw new IncompleteEntityError(errors, entity)
            }
            if (response.status === 502) {
                const {errors} = await response?.json()
                throw new ApiServiceError(errors || 'Getway Error')
            }
            if (response.status === 409) {
                const {errors} = await response?.json()
                throw new RecordConflictError(response.statusText, errors)
            }
            if (response.status === 500) {
                throw new ApiError('An internal server errror has occured')
            }
        }
    }

    static async getApiDate() {
        const req = await this.getJson('current_time')
        if (req) {
            return req.date
        }
    }

    static getApiVersion() {
        return sessionStorage.getItem('APIVersion') || '-'
    }

    static getActiveApp(): AppInterface { 
        return HisApp.getActiveApp() || {} as AppInterface
    }

    static getUserID(): null | number {
        const userID = sessionStorage.getItem('userID')
        return userID ? parseInt(userID): null
    }

    static getUserLocation() {
        return sessionStorage.getItem('userLocation')
    }

    static getLocationName() {
        return sessionStorage.getItem('locationName')
    }

    static getSessionDate() {
        return sessionStorage.getItem('sessionDate') || '';
    }

    static getCachedApiDate() {
        return sessionStorage.getItem('apiDate')
    }

    static getReasonForBDE() {
        return sessionStorage.getItem('reasonForBDE')
    }

    static async setSessionDate(sessionDate: string, reason='') {
        const apiDate = await this.getApiDate()
        if (apiDate) {
            if (reason) sessionStorage.setItem('reasonForBDE', reason)
            sessionStorage.setItem('apiDate', apiDate)
            sessionStorage.setItem('sessionDate', sessionDate)
            return
        }
        throw 'Unable to set api date'
    }

    static async resetSessionDate() {
        const apiDate = await this.getApiDate()
        if (apiDate) {
            sessionStorage.removeItem('reasonForBDE')
            sessionStorage.removeItem('apiDate')
            sessionStorage.setItem('sessionDate', apiDate)
            return
        }
        throw 'Unable to reset session date'
    }

    static isBDE() {
        const apiDate = sessionStorage.getItem('apiDate')
        const sessionDate = sessionStorage.getItem('sessionDate')
        return apiDate && apiDate != sessionDate
    }

    static getSiteUUID() {
        return sessionStorage.siteUUID || ''
    }

    static getProgramName() {
        const app = this.getActiveApp()
        
        if ('applicationName' in app) return app.applicationName
        
        return '';
    }

    static getSuspendedProgram() {
        return sessionStorage.getItem('suspendedApp') || ''
    }

    static getProgramID() {
        const app = this.getActiveApp()
        
        if ('programID' in app) return app.programID
        
        return 0;
    }

    static getUserRoles() {
       const roles = sessionStorage.getItem('userRoles');
       
       return roles ? JSON.parse(roles) : []
    }

    static getUserName() {
       return sessionStorage.username;
    }

    static getCoreVersion() {
        return localStorage.getItem(AuthVariable.CORE_VERSION) || '-';
    }

    static getAppVersion() {
        return localStorage.getItem(AuthVariable.CORE_VERSION) || '-';
    }

    static getFullVersion() {
        return `${this.getCoreVersion()} / ${this.getApiVersion()}`
    }

    static delay = (ms: number) => new Promise(res => setTimeout(res, ms))

    static getAvailableApps() {
        const userPrograms = JSON.parse(sessionStorage.getItem('userPrograms') || '[]')
            .map((app: any) => app['program_id'])
        const apps = []
        for(const app of JSON.parse(sessionStorage.getItem('apps') || '[]')) {
            const appData: any = find(HisApps, { applicationName : app.name }) || {}
            const userHasPriviledge = isEmpty(userPrograms) || userPrograms.includes(appData.programID)
            if (app.available && !isEmpty(appData)) {
                apps.push({...appData, hasPriviledge: userHasPriviledge})
            }
        }
        return apps
    }
}
