<template>
    <view-port>
        <ion-row>
            <ion-col>
                <div class="tool-bar-medium-card"> 
                    <center class="relation-category" :style="{color: '#3880ff'}"> Patient </center>
                    <ul class="his-sm-text"> 
                        <li>Name: <b>{{patient.name}}</b> </li>
                        <li>Birthdate: <b>{{patient.birth_date}}</b> </li>
                        <li>Home Address: <b>{{patient.home_address}}</b></li>
                    </ul>
                </div>
            </ion-col>
            <ion-col size="2"> 
                <center class="relation-category fa-rotate-45">
                    <ion-icon :icon="resize" :style="{fontSize: '3em'}"></ion-icon>
                </center>
            </ion-col>
            <ion-col>
                <div class="his-md-text tool-bar-medium-card"> 
                    <center class="relation-category" :style="{color: '#3dc2ff'}"> Guardian </center>
                    <ul class="his-sm-text"> 
                        <li>Name: <b>{{guardian.name}}</b> </li>
                        <li>Birthdate: <b>{{guardian.birth_date}}</b> </li>
                        <li>Home Address: <b>{{guardian.home_address}}</b></li>
                    </ul>
                </div>
            </ion-col>
        </ion-row>
        <div class="view-port-content">
            <ion-row v-for="(relations, rIndex) in relationList" :key="rIndex">
                <ion-col size="6" v-for="(relation, iIndex) in relations" :key="iIndex">
                    <div class="his-md-text" :class="`his-card clickable ${selected === relation.label ? `active-card-color`: ''}`" 
                        @click="onClick(relation)"> 
                        <ul>
                            <li>Relationship <b>{{relation.label}}</b> </li>
                            <li>Desc <b>{{relation.value}}</b>  </li>
                        </ul>
                    </div>
                </ion-col>
            </ion-row>
        </div>
    </view-port>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { Option } from '../Forms/FieldInterface'
import FieldMixinVue from './FieldMixin.vue'
import Transformer from "@/utils/Transformers"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import { resize } from "ionicons/icons";
import {
    IonCol,
    IonRow,
    IonIcon
} from "@ionic/vue"
export default defineComponent({
    mixins: [FieldMixinVue],
    components: {
        ViewPort,
        IonCol,
        IonRow,
        IonIcon,
    },
    data: () => ({
       patient: {} as any,
       guardian: {} as any,
       selected: '' as string,
       listData: [] as Array<Option> 
    }),
    setup(){
         return {
         resize
        }
    },
    computed: {
        relationList(): Array<any> {
            return Transformer.convertArrayToTurples(this.listData, 2)
        }
    },
    mounted() {
        this.init()
    },
    activated() {
        this.init()
    },
    methods: {
        async init() {
            this.$emit('onFieldActivated', this)
            this.listData = await this.options(this.fdata)
        },
        onClick(relation: any) {
            this.selected = relation.label
            this.$emit('onValue', relation)
        }
    }
})
</script>
<style scoped>
.view-port-content {
    overflow-x: auto;
    height: 81%;
}
.tool-bar-medium-card {
    height: 17vh;    
}
.relation-category {
    margin-top: 1%;
    font-size: 1.9em;
    font-weight: bold;
    text-align: center;
}
.his-card {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
}
li {
    list-style: none;
}
ion-col {
    padding: 0.3%;
}
.fa-rotate-45 {
    -webkit-transform: rotate(45deg);
    -moz-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    -o-transform: rotate(45deg);
    transform: rotate(45deg);
}
</style>