import { onMounted, onUnmounted, ref } from "vue";
import onScan from "onscan.js";

export default function useBarcode(scanEvent = null as any) {
  const keyBuffer = ref("");
  const barcode = ref("")
  const TERMINATING_KEYS = ["$", "Enter"];

  function initScan() {
    onScan.attachTo(document, {
      minLength: 4,
      timeBeforeScanTest: 200,
      avgTimeByChar: 40,
      preventDefault: true,
      reactToPaste: true,
      ignoreIfFocusOn: 'input' as any,
      onKeyDetect(_, event) {
        if (event.key.length > 1 && !TERMINATING_KEYS.includes(event.key))
          return;

        if (
          TERMINATING_KEYS.includes(event.key) &&
          typeof scanEvent === "function"
        ) {
          barcode.value = keyBuffer.value 
          scanEvent(keyBuffer.value);
          keyBuffer.value = "";
        } else {
          keyBuffer.value += event.key;
        }
      },
    });
  }

  function stopScan() {
    onScan.detachFrom(document);
  }

  onMounted(() => initScan());
  onUnmounted(() => stopScan());

  return barcode
}
