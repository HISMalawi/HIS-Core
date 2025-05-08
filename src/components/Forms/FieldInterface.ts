import { FieldType } from "@/components/Forms/BaseFormElements"

export interface OptionDescriptionInterface {
    color: 'primary' | 'warning' | 'danger' | 'secondary' | 'light';
    show?: 'onChecked' | 'always';
    text: string;
}

export interface BtnStates {
    visible?: Record<string, (formData: any, computedData: any) => boolean>;
    disabled?: Record<string, (formData: any, computedData: any) => boolean>;
}

export interface ComponentActionsInterface {
    refreshOptions: (
        btnEvent: FooterBtnEvent, 
        currentOptionData: Option | Option[], 
        formData: any, computedData: any
    ) => Option[];
}

/**
 * This event is sent to Form components to update their internal
 * state if applicable
 */
export interface FooterBtnEvent {
    eventIndex: number;
    btnName: string;
    btnOutput: any;
    onClickComponentEvents?: ComponentActionsInterface;
}

export interface FormFooterBtns {
    name: string;
    size?: 'large' | 'small';
    slot?: 'start' | 'end';
    color?: 'success' | 'primary' | 'warning' | 'secondary' | 'danger';
    state?: BtnStates;
    styleClass?: string;
    onClickComponentEvents?: ComponentActionsInterface;
    onClick: (formData: any, computedData: any, fieldContext: any) => any;
}

export type FormOnFinishAction = (formdata: any, computedData: any) => void | Promise<void>
export type FormOnCancelAction = () => void | Promise<void>
export type SingleFieldFormOnFinishAction = (value: any) => void | Promise<void>

export interface Option {
    label: string;
    value: string | number;
    other?: any;
    isChecked?: boolean;
    disabled?: boolean;
    description?: OptionDescriptionInterface;
}

export interface Field {
    id: string | number;
    /**
     * proxyID allows multiple form fields to write to the same
     * value block 
     */
    proxyID?: string | number;
    helpText: string;
    /***
     * If you want to run code one time, do it here. This is ideal for setting up external variables or setting field data
     */
    init?: (formData: any, computedData: any) => boolean | Promise<boolean>;
    /**
     * When form value changes, helpText is updated
     */
    updateHelpTextOnValue?: (value: Option[] | Option, form: any) => string;
    dynamicHelpText?: (form: any) => string;
    type: FieldType;
    group?: string;  // Categories fields with related data
    computedValue?: Function;
    /**
     * @deprecated for setting preset values for fields that support them
     */
    preset?: Option | Record<string, any>;
    /**
     * Preset value for fields that support  strings, numbers or booleans
     */
    defaultValue?: (fdata?: any, cdata?: any, other?: any) => any;
    /**
     * Set default output of the field that is present when it fails to pass
     * a condition
     */
    defaultOutput?: (fdata?: any, cdata?: any, other?: any) => Option | Option[];
    /**
     * Set default computed value output of the field that only appears when
     * the field fails to pass a condition
    */
    defaultComputedOutput?: (fdata?: any, cdata?: any, other?: any) => any;
    /**
     * Hook is called when the field is false. This is helpful for cleanup jobs
     */
    onConditionFalse?: Function;
    /** When true, the onfinish is triggered when next button is clicked without going to the other fields */
    exitsForm?: (formData: any, computedData: any) => boolean;
    condition?: Function;
    validation?: Function;
    beforeNext?: Function;
    onValue?: Function;
    onValueUpdate?: Function;
    onload?: Function;
    unload?: Function;
    summaryMapValue?: Function;
    appearInSummary?: Function;
    options?(fdata?: any, cdata?: any, other?: any): Promise<Option[]> | Array<Option>;
    requireNext?: boolean;
    config?: Record<string, any>;
}
