<template>
  <ion-grid>
    <ion-row>
      <ion-col
        :size="iconSize"
        @click="useCameraScanner"
        style="max-height: 100px"
      >
        <img
          id="barcode-img"
          class="clickable"
          src="/assets/images/barcode.svg"
        />
      </ion-col>
      <ion-col :size="inputSize" class="ion-text-center">
        <input
          :readonly="
            activePlatformProfile.keyboard === KeyboardType.HIS_KEYBOARD_ONLY
          "
          id="barcode-inputbox"
          placeholder="Scan barcode or QR Code"
          v-model="typedBarcode"
          :autofocus="true"
          :style="{ fontSize, textShadow: 'wrap' }"
          @input="onInputChange"
          @change="onInputChange"
          @paste="onInputChange"
          @keydown.enter="typedBarcode += '$'"
        />
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from "vue";
import { IonCol, IonGrid, IonRow } from "@ionic/vue";
import usePlatform, { KeyboardType } from "@/composables/usePlatform";
import useBarcode from "@/composables/useBarcode";
import { BarcodeScanner } from "@awesome-cordova-plugins/barcode-scanner";

export default defineComponent({
  name: "BarcodeInput",
  components: { IonRow, IonCol, IonGrid },
  props: {
    clearValue: String,
    virtualText: String,
    size: {
      type: String as PropType<"small" | "medium" | "Large">,
      default: "large",
    },
  },
  emits: ["onScan", "onValue"],
  setup(props, { emit }) {
    const typedBarcode = ref("");
    const lastEmitted = ref("");

    const { activePlatformProfile } = usePlatform();
    const scannedBarcode = useBarcode(handleScan);

    function handleScan(val: string) {
      const cleaned = val.replace(/\$/g, "").trim();
      if (!cleaned || cleaned === lastEmitted.value) return;

      lastEmitted.value = cleaned;
      emit("onScan", cleaned);
      emit("onValue", cleaned);
      typedBarcode.value = "";
    }

    const useCameraScanner = async () => {
      try {
        const data = await BarcodeScanner.scan();
        if (data?.text) {
          scannedBarcode.value = data.text;
          handleScan(data.text);
        }
      } catch (error) {
        console.error("Camera scan failed", error);
      }
    };

    const onInputChange = () => {
      const barcode = typedBarcode.value;
      if (/.+\$$/i.test(barcode)) {
        handleScan(barcode);
      }
    };

    watch(
      () => props.clearValue,
      () => {
        typedBarcode.value = "";
      }
    );

    watch(
      () => props.virtualText,
      (v) => {
        typedBarcode.value = v || "";
      }
    );

    watch(scannedBarcode, (barcode) => {
      if (barcode && !typedBarcode.value.endsWith("$")) {
        typedBarcode.value = `${barcode}$`;
      }
    });

    return {
      typedBarcode,
      KeyboardType,
      activePlatformProfile,
      iconSize: computed(() => (props.size === "small" ? "3" : "2")),
      inputSize: computed(() => (props.size === "small" ? "9" : "10")),
      fontSize: computed(() => (props.size === "small" ? "15px" : "42px")),
      useCameraScanner,
      onInputChange,
    };
  },
});
</script>
<style scoped>
input:focus {
  outline: none !important;
  border-color: #719ece;
}
#barcode-img {
  height: 100% !important;
}
#barcode-inputbox {
  font-weight: bold;
  padding: 0.5em;
  border-style: solid;
  border-width: 0px 0px 1px 0px;
  border-color: #ccc;
  background-color: white;
  width: 100%;
  height: 85%;
}
@media (min-width: 200px) and (max-width: 900px) {
  #barcode-img {
    width: 350px;
  }
}
</style>
