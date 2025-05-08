import router from '@/router';
import CountDown from "@/components/CountDown.vue";
import { modalController } from "@ionic/vue";
import { AuthService } from '@/services/auth_service';
import { ref, watch } from "vue";

const MODAL_ID = 'screentime.timeout'
const idleTime = ref(0)
const timeoutInterval = ref()
const logoutNotificationIsActive = ref(false)
export const screenTimeoutStop = ref(false)

function closeTimeoutModal() {
    modalController.getTop().then((activeModal) => activeModal && modalController.dismiss({}, undefined, MODAL_ID))
}

function resetInactivityTimer() {
    clearTimeout(timeoutInterval.value);
    timeoutInterval.value = setTimeout(async () => {
        if (!idleTime.value || screenTimeoutStop.value || logoutNotificationIsActive.value) { return }
        logoutNotificationIsActive.value = true
        const modal = await modalController.create({
            cssClass: "small-modal custom-modal-backdrop",
            backdropDismiss: false,
            component: CountDown,
            id: MODAL_ID,
            componentProps: {
                timeExpiry: 200,
                countDownMessage: "The system will automatically logout in:",
                onTimeout: () => {
                    closeTimeoutModal()
                    clearScreenTimeout()
                    new AuthService().clearSession()
                    router.push('/login')
                },
                onCancel: () => {
                    closeTimeoutModal()
                    resetInactivityTimer()
                }
            }
        })
        modal.present()
        await modal.onDidDismiss()
        logoutNotificationIsActive.value = false
    }, idleTime.value||2500);
}

function configureTimeout(timeout: number) {
    idleTime.value = timeout
    sessionStorage.setItem('screen_timeout', `${timeout}`)
}

function clearScreenTimeout() {
    idleTime.value = 0
    sessionStorage.removeItem('screen_timeout')
}

function initiateSystemIdleMonitor() {
    idleTime.value = parseInt(sessionStorage.getItem('screen_timeout')||'0')
    document.addEventListener("mousemove", resetInactivityTimer);
    document.addEventListener("keydown", resetInactivityTimer);
    resetInactivityTimer()
}

watch(screenTimeoutStop, (stop) => {
    if (stop) {
        closeTimeoutModal()
        resetInactivityTimer() 
    } 
}, { immediate: true })
export default {
    idleTime,
    clearScreenTimeout,
    configureTimeout,
    resetInactivityTimer,
    initiateSystemIdleMonitor
}
