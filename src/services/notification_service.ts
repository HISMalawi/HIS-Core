import { Service } from "./service";

export class NotificationService extends Service {
    static getlogs(startDate: string, endDate: string) {
        return this.getJson('notification/logs', {
            startDate, endDate
        })
    }

    static clear(id: number|string) {
        return this.putJson(`notifications/clear/${ id }`, { id });
    }

    static read(Notifications: any) {
        return this.putJson('notifications/update', { alerts: Notifications });
    }

    static unread() {
        return this.getJson('notifications');
    }
}
