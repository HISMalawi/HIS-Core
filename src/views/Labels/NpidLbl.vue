<template>
    <div ref="npidLbl" id="container">
        <div v-if="!useQrCode">
            <div>
                <div>
                    <div>{{ name }}</div>
                    <div>{{ national_id }} {{ birthdate }} {{ sex }}</div>
                    <div>{{ address }}</div>
                </div>
                <svg id="patient-barcode"></svg>
            </div>
        </div>
        <div v-else>
            <div>
                <div style="display: flex; align-items: center;"> 
                    <div>
                        <canvas id="patient-qrcode"></canvas>
                    </div>
                    <div>
                        <div>{{ name }}</div>
                        <div>{{ national_id }}</div>
                        <div>{{ birthdate }}</div>
                        <div>{{ sex }}</div>
                        <div>{{ address }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import JsBarcode from "jsbarcode";
import { onMounted, PropType, ref } from "vue";
import QRCode from 'qrcode'
import { toastWarning } from "@/utils/Alerts";
import domtoimage from 'dom-to-image-more';

const emit = defineEmits(['label-out'])

const npidLbl = ref(null)

const props = defineProps({
    imageOut: {
        type: Object as PropType<(img: string[]) => void>
    },
    name: {
        type: String,
        default: "??"
    },
    national_id: {
        type: String,
        required: true,
        default: "??"
    },
    birthdate: {
        type: String,
        default: "??"
    },
    sex: {
        type: String,
        gender: "??"
    },
    address: {
        type: String,
        default: "??"
    },
    useQrCode: {
        type: Boolean
    },
    qr: {
        type: String
    }
})

onMounted(() => {
    if (!props.useQrCode) {
        JsBarcode("#patient-barcode", props.national_id, {
            height: 56,
            width: 2,
            displayValue: false,
            format: "CODE128"
        })
    } else {
        const canvas = document.getElementById("patient-qrcode")
        if (canvas && props.qr) {
            QRCode.toCanvas(canvas, props.qr, { width: 100 }, (error: any) => {
                if (error) {
                    console.log(error)
                    toastWarning("Unable to generate QR code")
                }
            })
        }
    }
    domtoimage.toPng(npidLbl.value, { height: 250, width: 500 }).then((dataUrl: string) => {
        emit('label-out', dataUrl)
        if (typeof props.imageOut === 'function') props.imageOut([dataUrl])
    })
})
</script>
<style scoped>
#container {
    font-size: 30px;
    overflow: hidden;
}
</style>