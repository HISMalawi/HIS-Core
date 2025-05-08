<template>
    <ion-row>
        <ion-col v-if="showPerPageFilter">
            <select class="input_display" v-model="itemsPerPage" :disabled="disablePerPageFilter">
                <option :selected="itemsPerPage === 5" :value="5">5 rows/page</option>
                <option :selected="itemsPerPage === 10" :value="10">10 rows/page</option>
                <option :selected="itemsPerPage === 20" :value="20">20 rows/page</option>
                <option :selected="itemsPerPage === 50" :value="50">50 rows/page</option>
                <option :selected="itemsPerPage === 100" :value="100">100 rows/page</option>
                <option :selected="itemsPerPage === 1000" :value="1000">1000 rows/page</option>
                <option :selected="itemsPerPage === totalRowCount" :value="totalRowCount">Show all rows({{totalRowCount}})</option>
            </select>
        </ion-col>
        <!-- This section is a hack-->
        <ion-col v-if="typeof customFilter === 'function'">
            <ion-input
                class="input_display"
                :value="customFilterValue"
                @click="launchFilter"
                placeholder="Filter...">
            </ion-input>
        </ion-col>
        <ion-col>
            <ion-item lines="none"> 
                <ion-input
                    :disabled="disableSearchFilter"
                    class="input_display"
                    :value="searchFilter"
                    @click="launchSearcher"
                    placeholder="Search here...">
                </ion-input>
                <ion-button v-if="searchFilter" class="reset_button" size="large" @click="reset()" color="secondary">
                    Reset
                </ion-button>
            </ion-item>
        </ion-col>
    </ion-row>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import {
    IonCol,
    IonRow,
    IonButton,
    IonInput,
    IonItem,
    modalController
} from "@ionic/vue"
import TouchField from "@/components/Forms/SIngleTouchField.vue"
import { Field, SingleFieldFormOnFinishAction } from "@/components/Forms/FieldInterface";
import { FieldType } from "@/components/Forms/BaseFormElements";

export default defineComponent({
    emits: [ 'onItemsPerPage', 'onSearchFilter','onItemsVLtype' ],
    components: { 
        IonItem,
        IonCol, 
        IonRow, 
        IonInput,
        IonButton
    },
    props: {
        customFilter: {
            type: Function
        },
        totalRowCount: {
            type: Number,
            default: 15000
        },
        disableSearchFilter: {
            type: Boolean,
            default: false
        },
        disablePerPageFilter: {
            type: Boolean,
            default: false
        },
        showPerPageFilter: {
            type: Boolean,
            default: false
        }
    },
    setup(props, {emit}) {
        const itemsPerPage = ref(50)
        const searchFilter = ref('')
        const customFilterValue = ref('')

        async function launchKeyboard(currentField: Field, onFinish: SingleFieldFormOnFinishAction) {
          const modal = await modalController.create({
            component: TouchField,
            backdropDismiss: false,
            cssClass: "full-modal",
            componentProps: {
              dismissType: 'modal',
              currentField,
              onFinish
            }
          });
          modal.present();
        }

        function onSearchFilter(value: string) {
            emit('onSearchFilter', value)
        }

        function reset() {
            searchFilter.value = ''
            onSearchFilter('')
        }

        async function launchFilter() {
            if (typeof props.customFilter === 'function') {
                customFilterValue.value = await props.customFilter()
            }
        }

        function launchSearcher() {
           launchKeyboard({
                id: 'search',
                helpText: 'Search table data',
                defaultValue: () => searchFilter.value,
                type: FieldType.TT_TEXT,
            }, 
            (data: any) => {
                searchFilter.value = data ? data.value : ''
                onSearchFilter(searchFilter.value)
            })
        }

        watch(itemsPerPage, (newValue) => {
            if(typeof newValue === 'number') emit('onItemsPerPage', newValue)
        }, 
        { 
            immediate: true 
        })
        return {
            reset,
            itemsPerPage,
            searchFilter,
            launchFilter,
            launchKeyboard,
            launchSearcher,
            customFilterValue
        }
    },
})
</script>
<style scoped>
    .reset_button {
        height: 5vh;
    }
    .input_display {
        text-align: left;
        font-size: var(--his-sm-font-size);
        width: 30vw;
        height: 5vh;
        margin-bottom: 2%;
        border: solid 1px #9d9b9b;
        border-radius: 5px;
        padding: 9px;
        margin-top: 2%;
    }
</style>
