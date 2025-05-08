<template>
    <ion-modal :is-open="modalIsOpen">
        <component 
            v-bind:is="activeModal"
            @onDismissModal="dismissModal"
        ></component>
    </ion-modal>
</template>
<script lang="ts">
import { defineAsyncComponent, defineComponent, ref, watch } from 'vue'
import { IonModal } from "@ionic/vue"

export default defineComponent({
    components: {
        IonModal,
        ZebraModal: defineAsyncComponent(() => import("@/components/ZebraPrinterImage.vue"))
    },
    emits: ['modalDismissed'],
    props: {
        modalName: {
            type: String        
        }
    },
    setup(props, {emit}) {
        const modalIsOpen = ref(false)
        const activeModal = ref('')

        function dismissModal() {
            modalIsOpen.value = false
            emit('modalDismissed')
        }

        watch(props, ({modalName}) => {
            if (modalName) {
                activeModal.value = modalName
                modalIsOpen.value = true
            } else {
                modalIsOpen.value = false
            }
        }, { deep: true })
        
        return {
            dismissModal,
            modalIsOpen,
            activeModal
        }
    }
})
</script>
