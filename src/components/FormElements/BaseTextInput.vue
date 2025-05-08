<template>
  <ion-input
    ref="input"
    class="input_display"
    v-model="text"
    :type="type"
    :disabled="disabled"
    :readonly="readOnly"
    autocapitalize="sentences"
    :placeholder="placeholder"
  />
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import { IonInput } from "@ionic/vue";
import usePlatform from "@/composables/usePlatform"

export default defineComponent({
  name: "HisInput",
  components: { IonInput },
  setup() {
    const { activePlatformProfile } = usePlatform()
    const readOnly = computed(() => activePlatformProfile.value.keyboard === 'HIS_KEYBOARD_ONLY')
    return {
      readOnly
    }
  },
  data:() => ({
    text: '' as string | number
  }),
  watch: {
    value(val: number | string) {
      this.text = val
    },
    text(text: string | number) {
      this.$emit('onValue', text)
    }
  },
  props: {
    value: {
      required: false,
    },
    type: {
      type: String,
      default: () => "text",
    },
    disabled: {
      type: Boolean,
      default: () => false,
    },
    placeholder: {
      type: String,
      default: () => "",
    }
  },
});
</script>
<style scoped>
.input_display {
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid silver;
  width: 99.5%;
  font-family: "Nimbus Sans L","Arial Narrow",sans-serif;
  font-size: 2.2em;
  background: none;
  padding-left: 5px;
}
</style>