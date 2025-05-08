<template>
    <div class="vertically-align his-lg-text" style="text-align: center;">
        <h1>{{ countDownMessage }}</h1>
        <div id="timer">{{ time }}s</div>
        <div class="ion-padding">
            <ion-button
                v-if="typeof onCancel==='function'" 
                size="large" 
                @click="oncancel">
                Cancel
            </ion-button>
        </div>
    </div>
</template>
<script lang="ts">
import { 
    IonButton
} from "@ionic/vue"
import { defineComponent, onBeforeUnmount, ref, watch } from 'vue';

export default defineComponent({
    props: {
        timeExpiry: {
            type: Number,
            default: 200
        },
        countDownMessage: {
            type: String
        },
        onTimeout: {
            type: Function
        },
        onCancel: {
            type: Function
        }
    },
    components: {
        IonButton
    },
    setup(props) {
        function oncancel() {
            clearInterval(timer)
            if (typeof props.onCancel === 'function') props.onCancel()
        }
        const seconds = ref(props.timeExpiry); // Set the initial number of seconds here
        const timer = setInterval(() => {
            seconds.value--;
            if (seconds.value <= 0) {
                oncancel()
                seconds.value = 0;
                if (typeof props.onTimeout === 'function') props.onTimeout()
            }
        }, 1000); // Update every second (1000 milliseconds)

        // Convert seconds to a computed property for display
        const time = ref(seconds.value);

        watch(seconds, () => { time.value = seconds.value })

        onBeforeUnmount(() => clearInterval(timer));
        return {
            time,
            oncancel
        };
    }
})
</script>
<style scoped>
#timer {
    font-weight: 700;
}
</style>