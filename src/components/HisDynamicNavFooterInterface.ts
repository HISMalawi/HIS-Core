export interface NavBtnInterface{
    name: string;
    size: string;
    visible: boolean;
    styleClass?: string;
    visibleOnStateChange?: Function;
    color: string;
    role?: string;
    slot?: string;
    onClick: Function;
}