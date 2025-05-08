<template>
  <form novalidate>
    <HisFormElement
        v-for="(element, counter) in formElements"
        :key="counter"
        :element-name="element.elementName"
        :element-type="element.elementType"
        :element-placeholder="element.elementPlaceholder"
    ></HisFormElement>
  </form>
</template>

<script>
import HisFormElement from "@/components/HisFormElement";

export default {
  name: "HisForm",
  data() {
    return {
      formElements: this.hisFormElements
    }
  },
  components: {
    HisFormElement
  },
  props: {
    hisFormElements: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>

</style>