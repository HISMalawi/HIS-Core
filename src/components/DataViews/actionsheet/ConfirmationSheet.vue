<template>
    <action-header v-show="title || subtitle" :title="title" :subtitle="subtitle" :color="color"> </action-header>
    <ion-content style="text-align: center">
        <h2 class="vertically-align ion-padding-horizontal">{{ body }}</h2>
    </ion-content>
    <action-footer :buttons="actionButtons"> </action-footer>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import ActionSheetMixin from "@/components/DataViews/actionsheet/ActionSheetMixin.vue"

export default defineComponent({
    mixins: [ActionSheetMixin],
    props: {
        body: {
            type: String,
            require: true
        }
    }

})
</script>
