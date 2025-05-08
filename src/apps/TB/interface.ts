export enum ActionType {
    CONFIRM='confirm',
    SELECTION='select',
    INFO='info',
    WARN='warn'
}
export interface DecisionMeta {
    action?: (params?: any) => void;
    break?: boolean;
    title?: string;
    subtitle?: string;
    type?: ActionType;
    conditions: Record<string, (params?: any) => Promise<boolean>|boolean>;
    options?: Record<string, any>;
}