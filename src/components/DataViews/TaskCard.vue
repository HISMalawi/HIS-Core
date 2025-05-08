<template>
    <ion-card class="his-card task-card"
        :class="{
            'clickable': !isDisabled,
            'disabled': isDisabled,
        }"
        >
        <ion-item lines="none">
            <ion-thumbnail slot="start">
                <ion-img :src="activeIcon"/>
            </ion-thumbnail>
            <ion-label
                class="his-sm-text ion-text-wrap"
                style="font-weight:600;color:#333!important;">
                <span v-if="!isCompleted"> 
                    {{title}} 
                </span>
                <s v-if="isCompleted">
                    {{title}}
                </s>
            </ion-label>
        </ion-item>
    </ion-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import {
    IonImg,
    IonCard,
    IonThumbnail,
    IonItem,
    IonLabel
} from "@ionic/vue"
import img from "@/utils/Img"

export default defineComponent({
    components: {
        IonImg,
        IonCard, 
        IonThumbnail, 
        IonItem, 
        IonLabel
    },
    props: {
        title: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false
        },
        taskDisabled: {
            type: Boolean,
            required: false
        },
        taskCompleted: {
            type: Boolean,
            required: false
        }
    },
    setup(props) {
        const isCompleted: boolean = typeof props.taskCompleted === 'boolean' 
            ? props.taskCompleted 
            : false;

        const isDisabled: boolean = typeof props.taskDisabled === 'boolean'
            ? props.taskDisabled
            : false;

        const activeIcon = computed(() => {
            if (isDisabled) {
                return img('Disabled.svg')
            } else if (isCompleted) {
                return img('Checkmark.svg')
            } else {
                return props.icon
            }
        }) 

        return {
            activeIcon,
            isDisabled,
            isCompleted
        }
    }
})
</script>
<style scoped>
    ion-item {
        padding: 0;
    }
    .disabled {
        opacity: 0.5!important;
    }
    .task-card {
        padding: 0;
        margin: 0;
        height: 73px;
        overflow: hidden;
    }
</style>
