import { computed, ref } from "vue";
import { NotificationService } from "@/services/notification_service"
import { alertConfirmation, toastWarning } from "@/utils/Alerts";
import { Service } from "@/services/service";
import { AppInterface } from "@/apps/interfaces/AppInterface";

export interface NotificationInterface {
    id: number;
    title: string;
    message: any;
    vlMessageObs: any;
    read?: boolean;
    date?: string;
    handler?: () => void;
}

const notificationData = ref([] as NotificationInterface[])

const activeApp = ref<AppInterface>(Service.getActiveApp() as any)

export function Notification() {
    const unReadNotifications = computed((): NotificationInterface[] => {
        return notificationData.value.filter(n => !n.read)
    })

    const hasNotifications = computed((): boolean =>  {
        return notificationData.value.length > 0
    })

    const hasUnreadNotifications = computed((): boolean =>  {
        return unReadNotifications.value.length > 0
    })

    const notificationCount = computed((): number => {
        return unReadNotifications.value.length
    })

    const sortedNotifications = computed((): NotificationInterface[] => {
        return notificationData.value.sort((a, b) => {
            return new Date(a.date as string) > new Date(b.date as string) ? -1 : 1
        })
    })

    function clearNotification(id: number|string, callback: (id) => void) {
        alertConfirmation("Are you sure you want to clear notification?")
            .then((ok) => {
                if (ok) {
                    NotificationService.clear(id)
                        .then(() => {
                            notificationData.value = notificationData.value.filter(
                                (notice) => notice.id != id
                            )
                            callback(id)
                            loadNotifications(activeApp.value)
                        }).catch((e) => {
                            console.error(e)
                            toastWarning("Unable to clear notification")
                        })
                }
            })
    }

    async function loadNotifications(application: AppInterface) {
        activeApp.value = application
        if (typeof application.downloadAppNotifications === 'function') {
            notificationData.value = (await application.downloadAppNotifications()) || []
            if (notificationData.value.length) {
                toastWarning(`You have ${notificationData.value.length} unread notification(s)`)
            }
        } else {
            notificationData.value = []
        }
    }

    async function markAsRead(notification: NotificationInterface) {
        NotificationService.read([notification.id])
            .then(() => notification.read = true)
    }

    function openNotification(notification: NotificationInterface) {
        if (typeof notification.handler === 'function') {
            markAsRead(notification)
            notification.handler()
        }
    }

    return {
        markAsRead,
        openNotification,
        loadNotifications,
        clearNotification,
        sortedNotifications,
        hasUnreadNotifications,
        notificationCount,
        hasNotifications,
        notificationData
    }
}
