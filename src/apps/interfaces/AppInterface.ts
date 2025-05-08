import { Option } from '@/components/Forms/FieldInterface';
import { RouteRecordRaw } from 'vue-router';
import { TaskInterface } from './TaskInterface';
import { StoreDef } from '../GLOBAL_APP/global_store';
import { NotificationInterface } from '@/composables/notifications';

export interface ActivityInterface {
    value: string;
    selected: boolean;
}

export interface FolderInterface {
    name: string;
    icon?: string;
    defaultFilesIcon?: string;
    condition?: () => boolean | Promise<boolean>;
    action?: () => void;
    pathName?: string;
    pathUrl?: string;
    files?: FolderInterface[]
}

export interface GeneralDataInterface {
    label: string;
    value: number | string;
    init?: () => Promise<void>;
    staticValue?: () => string | number;
    asyncValue?: () => Promise<string | number>;
}

export interface ProgramIdentifierInterface {
    id: number;
    name: string;
    isPrimary: boolean;
    useForSearch: boolean;
    prefix: () => Promise<string> | string;
    validation?: (value: Option) => string[] | null
    visible?: () => boolean | Promise<boolean>;
    reassignAction?: (patientID: number, id: number, identifier: string, typeName: string) => void;
    globalPropertySetting?: string;
    keyboardName?: string
}

export interface AppInterface {
    /**
     * Map primary key value of a program here. All records will
     * associate with this program ID
    */
    readonly programID: number;
    /**
     * Name of the program as it will be presented on the Application Selection
     * list
     */
    readonly applicationName: string;
    /**
     * URL of the applicationIcon 
     */
    readonly applicationIcon: string;
    /**
     * Description of the app as it will appear during Application Selection
     */
    readonly applicationDescription: string;
    /**
     * Routes to different application resources
     */
    readonly appRoutes: Array<RouteRecordRaw>;
    /**
     * Identifiers available for search / reference that are unique to this programme
    */
    readonly programPatientIdentifiers?: Record<
        string, 
        ProgramIdentifierInterface
    >;
    /**
     * Component that is rendered on the landing page that'll typically
     * show some sort of summary of activities
     */
    readonly homeOverviewComponent: any; //Vue component
    /**
     * Overwrites main patient dashboard component with specified one
     */
    readonly customPatientDashboardComponent?: any; // Vue component
    /**
     * Overrites patient dashboard content component
     */
    readonly customPatientDashboardContentComponent?: any;
    /**
     * Define all reports available for program
    */
    readonly programReports?: FolderInterface[];
    /**
     * Define list of all application configurations
     */
    globalPropertySettings?: FolderInterface[];
    /**
     * primary patient activities
     */
    readonly primaryPatientActivites: TaskInterface[];
    /**
     * secondary patient activities
     */
    secondaryPatientActivites: TaskInterface[];
    /**
     * Callback that runs after a patient has been successfully registered
     */
    readonly onRegisterPatient?: (patientID: number, person: any, attributes: any, router: any, route: any) => Promise<any>;
    /**
     * Get program specific patient dashboard alerts
     */
    readonly getPatientDashboardAlertsAndNotes?: (patient: any) => Promise<GeneralDataInterface[]> | GeneralDataInterface[];
    /**
     * Define navigation route for Lab orders on patient dashboard
     */
    readonly getPatientDashboardLabCardRoute?: string;
    /**
     * Onload event when the program is selected
    */
    readonly init?: (context: string) => void;
    /**
     * Specify which cards are accessible or not
     */
    readonly configDefaultPatientDashboardCards? : {
        activitiesEnabled?: boolean;
        alertsEnabled?: boolean;
        medicationsEnabled?: boolean;
        labEnabled?: boolean;
    };
    /**
     * Parse summary data object based on program specific definition and
     * return generic object to be displayed on patient dashboard
     */
    readonly patientProgramInfoData?: (patientId: number) => GeneralDataInterface[];
    /**
     * Callback which retrieves and formats Lab order card on the patient dashboard
     */
    readonly getPatientDashboardLabOrderCardItems?: (patientId: number, date: string) => Promise<Option[]> | Option[];
    /**
     * Summary data that is rendered on patient confirmation page
    */
    readonly confirmationSummary?: (patient: any, program: any, other: any) => Record<string, Function> | Promise<Record<string, Function>>;
    /**
     * Define assets to be cached by the app
    */
    readonly appStore?: Record<string, StoreDef>;
    /**
     * Hook that loads notifications
     */
    downloadAppNotifications?: () => Promise<NotificationInterface[]>
}
