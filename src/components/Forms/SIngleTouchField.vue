<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title class="his-lg-text ion-text-center"> 
                    {{ currentField.helpText }}
                </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <keep-alive> 
                <component
                    :key="currentField.id"
                    :is="currentField.type"
                    :options="currentField.options"
                    :preset="currentField.preset"
                    :clear="valueClearIndex"
                    :fdata="formData"
                    :config="currentField.config"
                    :cdata="computedFormData"
                    :activationState="state"
                    :onValue="currentField.onValue"
                    :defaultValue="currentField.defaultValue"
                    :onValueUpdate="currentField.onValueUpdate"
                    @onValue="onFieldValue"
                >
                </component>
            </keep-alive>
        </ion-content>
        <ion-footer> 
            <ion-toolbar color="light">
                <ion-button :disabled="disableBtn" @click="() => onClose(true)" slot="start" color="danger" size="large"> 
                    Close
                </ion-button>
                <ion-button :disabled="disableBtn" @click="onClear" slot="end" color="warning" size="large"> 
                    Clear
                </ion-button>
                <ion-button :disabled="disableBtn" @click="onDone" slot="end" color="success" size="large"> 
                    Done
                </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>
<script lang="ts">
import { defineComponent, PropType, defineAsyncComponent } from 'vue'
import { Field, Option, SingleFieldFormOnFinishAction } from "@/components/Forms/FieldInterface"
import { toastDanger, toastWarning } from "@/utils/Alerts";
import { COMPONENT_REFS } from "@/components/Forms/BaseFormElements";
import {
    IonToolbar,
    IonContent,
    IonHeader,
    IonTitle,
    IonButton,
    IonPage,
    IonFooter,
    modalController
} from "@ionic/vue"

function buildAsyncComponents() {
  const components: any = {}
  COMPONENT_REFS.forEach((name: string) => {
    components[name] = defineAsyncComponent(() => import(
      /* webpackChunkName: "TouchFormElement"*/`@/components/FormElements/${name}.vue`)
    )
  })
  return components
}

export default defineComponent({
    name: 'SingleFieldTouchForm',
    components: {
        IonPage,
        IonContent,
        IonFooter,
        IonToolbar,
        IonButton,
        IonHeader,
        IonTitle,
        ...buildAsyncComponents()
    },
    props: {
        dismissType: {
            type: String
        },
        onCloseCallback: {
            required: false
        },
        onFinish: {
           type: Function as PropType<SingleFieldFormOnFinishAction>,
           required: true
        },
        currentField: {
            type: Object as PropType<Field>,
            required: true
        }
    },
    data: () => ({
        valueClearIndex: 0 as number,
        formData: {} as any,
        computedFormData: {} as any,
        state: "" as string,
        value: null as Option | Option[] | null,
        disableBtn: false as boolean,
    }),
    methods: {
        onClose(force=true) {
            if (typeof this.onCloseCallback === 'function') {
                modalController.dismiss({ value: this.value, forcedClosed: force })
                this.onCloseCallback(force)
            } else if (this.dismissType === 'modal') {
                modalController.dismiss({ value: this.value, forcedClosed: force })
            } else {
                this.$router.back()
            }
        },
        onClear() {
            this.valueClearIndex += 1
            this.value = null
        },
        onFieldValue(value: any) {
            this.value = value
        },
        onDone() {
            this.disableBtn = true
            if (this.currentField.validation) {
                const errors = this.currentField.validation(this.value)
                this.disableBtn = false
                if (errors) return toastWarning(errors.join(", "), 60000);
            } 
            try {
                this.onFinish(this.value)
            } catch(e) {
                toastDanger(`${e}`)
                console.error(e)
            }
            this.onClose(false)
            this.disableBtn = false
        }
    }
})
</script>
