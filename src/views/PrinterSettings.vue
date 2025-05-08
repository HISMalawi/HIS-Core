<template>
  <his-standard-form
    formID="printer_settings"
    :fields="fields"
    @finish="router.back"
    :skipSummary="true"
    :key="refreshKey"
  />
</template> 
<script lang="ts" setup>
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { PrintoutService } from "@/services/printout_service";
import { Field } from "@/components/Forms/FieldInterface";
import isEmpty from "lodash/isEmpty";
import { PrinterDevice } from "cap-label-printer-plugin";
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";

const router = useRouter();
const printerService = new PrintoutService();
const defaultPrinter = ref({} as PrinterDevice);
const printers = ref<Array<PrinterDevice>>([]);
const refreshKey = ref(0);
const isRefreshingDevices = ref(false);

const fields: Array<Field> = [{
  id: "printer_settings",
  helpText: "Printer Settings",
  type: FieldType.TT_TABLE_VIEWER,
  options: () => [{
    label: "Available Devices",
    value: "",
    other: {
      rowColors: defaultPrinterStyle(),
      columns: ["Available Devices"],
      rows: printers.value.map((printer: PrinterDevice) => [
        printer.name || printer.address,
        {
          type: "button",
          name: "Print Test Label",
          action: () => printerService.printTestLbl(printer)
        },
        (isDefaultPrinter(printer) ? "Default Printer" : {
          type: 'button',
          name: 'Set as Default',
          visible: !isDefaultPrinter(printer),
          action: () => setDefaultPrinter(printer)
        })
      ])
    }
  }],
  config: { 
    hiddenFooterBtns: ["Clear"],
    footerBtns: [
      {
        name: 'Refresh',
        size: "large",
        slot: "end",
        color: "warning",
        visible: true,
        onClick: loadPrinters
      }
    ]
  },
}];

onMounted(async () => {
  defaultPrinter.value = await printerService.getDefaultPrinter() || {} as PrinterDevice;
  printers.value.push(defaultPrinter.value);
  loadPrinters();
});

async function loadPrinters(){
  if (isRefreshingDevices.value) return
  isRefreshingDevices.value = true;
  const unsortedPinters = await printerService.getAllPrinters();
  printers.value = sortPrinters(unsortedPinters);
  isRefreshingDevices.value = false;
  refreshKey.value = Math.random();
}

function diffPrinters(a: PrinterDevice, b: PrinterDevice) {
  return (a.name || a.address).localeCompare(b.name || b.address);
}

function setDefaultPrinter(printer: PrinterDevice) {
  printerService.setDefaultPrinter(printer);
  defaultPrinter.value = printer;
  refreshKey.value = Math.random();
  loadPrinters();
}

function isDefaultPrinter (printer: PrinterDevice) {
  return diffPrinters(printer, defaultPrinter.value) === 0;
}

function sortPrinters(printers: PrinterDevice[]) {
  return printers.sort((a, b) => {
    if (isDefaultPrinter(a) && !isDefaultPrinter(b)) {
      return -1;
    } else if (!isDefaultPrinter(a) && isDefaultPrinter(b)) {
      return 1;
    } else {
      return diffPrinters(a, b);
    }
  });
}

function defaultPrinterStyle() {
  if (!isEmpty(defaultPrinter.value)) {
    return [{ indexes: [0], class: 'adherence-txt-good adherence-col-bg bold' }];
  }
  return [];
}
</script>