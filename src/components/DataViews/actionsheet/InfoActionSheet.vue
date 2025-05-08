<template>
    <action-header :title="title" :subtitle="subtitle" :color="color"> </action-header>
    <ion-content>
        <div class="info-content his-md-text"> 
            <h2 :class="color" v-html="bodyTitle">
            </h2>
            <p class='description' v-html="bodyText"> </p> 
        </div>
    </ion-content>
    <action-footer :buttons="actionButtons"> </action-footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ActionSheetMixin from "@/components/DataViews/actionsheet/ActionSheetMixin.vue"
export default defineComponent({
    mixins: [ActionSheetMixin],
    props: {
        bodyTitle: {
            type: String,
            required: true
        },
        bodyText: {
            type: String,
            required: false
        }
    }
})
</script>
<style scoped>
    .info-content {
        margin: auto;
        padding: 80px 0;
        text-align: center;
    }
    .description {
        font-size: 1.3em;
        padding: 10px;
    }
</style>
