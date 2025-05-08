<template>
  <ion-list class="get-centered">
    <ion-item>
      <ion-input
          :name="elementName"
          :type="elementType"
          spellcheck="false"
          autocapitalize="off"
          required
          :placeholder="elementPlaceholder"
          v-show="elementType !== 'date'"
      ></ion-input>
      <ion-datetime
          value="2019-10-01T15:43:40.394Z"
          display-timezone="utc"
          :name="elementName"
          :type="elementType"
          :placeholder="elementPlaceholder"
          v-show="elementType === 'date'"
      ></ion-datetime>
    </ion-item>
  </ion-list>
</template>

<script>
import {IonDatetime, IonInput, IonItem, IonList} from "@ionic/vue";

export default {
name: "HisFormElement",
  components: {
  IonList,
    IonInput,
    IonItem,
    IonDatetime
  },
  props: {
    elementName: {
      type: String,
      required: true
    },
    elementType: {
      type: String,
      required: true
    },
    elementPlaceholder: {
      type: String
    },
    elementValue: {
      type: String
    }
  }
}
</script>

<style scoped>

</style>