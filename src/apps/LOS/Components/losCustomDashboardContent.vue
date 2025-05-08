<template>
    <p/>
    <ion-segment scrollable :value="activeTab" class="ion-justify-content-center">
        <ion-segment-button value="openOrders" @click="activeTab='openOrders'">
            <ion-label class="his-lg-text">Open</ion-label>
        </ion-segment-button>
        <ion-segment-button class="his-lg-text" value="drawnOrders" @click="activeTab='drawnOrders'">
            <ion-label>Drawn</ion-label>
        </ion-segment-button>
    </ion-segment>
    <p/>
    <!-- Action Table -->
    <div :style="{overflowX: 'auto', height:'84%'}"> 
        <report-table
            v-if="activeTab === 'openOrders'" 
            :config="{ showIndex: false }"
            :rows="labOrderRows"
            :columns="openColumns">
        </report-table>
        <report-table
            v-if="activeTab === 'drawnOrders'" 
            :config="{ showIndex: false }"
            :rows="drawnOrders"
            :columns="drawnColumns">
        </report-table>
    </div>
    <!---Specimen selection modal--->
    <ion-modal :is-open="showSpecimenModal" class="custom-modal"> 
        <ion-page>
             <ion-header>
                <ion-toolbar>
                    <ion-title>                        
                        <b>Select specimen</b>
                    </ion-title>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding"> 
                <ion-row>
                    <ion-col> 
                        <ion-list>
                            <ion-item
                                v-for="(specimen, index) in specimens"
                                :key="index"
                                :color="selectedSpecimen.name === specimen.name ? 'primary': ''"
                                @click="selectedSpecimen = specimen"
                                >
                                <ion-label>{{specimen.name}}</ion-label>
                            </ion-item>
                        </ion-list>
                    </ion-col>
                    <ion-col> 
                        <ion-list>
                            <ion-item 
                                lines="none"
                                :key="index"
                                v-for="(test, index) in order.tests"
                                >
                                <ion-chip color="success">Test: <b>{{test.name}}</b></ion-chip>
                            </ion-item>
                        </ion-list>
                    </ion-col>
                </ion-row>
            </ion-content>
            <ion-footer> 
                <ion-toolbar> 
                    <ion-button 
                        color="danger" 
                        slot="start"
                        @click="showSpecimenModal=false;selectedSpecimen={}"
                        > 
                        Close 
                    </ion-button>
                    <ion-button
                        :disabled="!selectedSpecimen.name"
                        color="success" 
                        slot="end"
                        @click="() => { showSpecimenModal=true;drawOrder() }">
                        Submit 
                    </ion-button>
                </ion-toolbar>
            </ion-footer>
        </ion-page>
    </ion-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ReportTable from "@/components/DataViews/tables/ReportDataTable.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { ColumnInterface, RowInterface } from '@/components/DataViews/tables/ReportDataTable';
import { PatientLabService} from "@/apps/LOS/services/patient_lab_service"
import { voidWithReason } from "@/utils/VoidHelper"
import {
    IonTitle,
    IonCol,
    IonRow,
    IonButton,
    IonFooter,
    IonToolbar,
    IonHeader,
    IonModal,
    IonList,
    IonItem,
    IonChip,
    IonPage,
    IonContent,
    IonSegment,
    IonLabel,
    IonSegmentButton,
} from "@ionic/vue";
import { toastDanger, toastWarning } from '@/utils/Alerts';
import HisDate from "@/utils/Date"
import { toDate } from '@/utils/Strs';
import { Service } from '@/services/service';

const HEADER_STYLE = {
    style: {
        background: '#f1f1f1',
        color: "#333",
        fontSize: '1.1rem !important'
    }
}
export default defineComponent({
    components: {
        IonTitle,
        IonCol,
        IonRow,
        IonButton,
        IonList,
        IonFooter,
        IonToolbar,
        IonHeader,
        IonItem,
        IonChip,
        IonModal,
        IonContent,
        IonPage,
        ReportTable,
        IonSegment,
        IonLabel,
        IonSegmentButton
    },
    data: () => ({
        initiated: false as boolean,
        showSpecimenModal: false as boolean,
        specimens: [] as any,
        order: {} as Record<string, any>,
        selectedSpecimen: {} as any,
        service: {} as any,
        activeTab: 'openOrders' as 'openOrders' | 'drawnOrders',
        drawnColumns: [
            [
                table.thTxt('Accession #', HEADER_STYLE),
                table.thTxt('Test', HEADER_STYLE),
                table.thTxt('Actions', HEADER_STYLE)
            ]
        ] as Array<ColumnInterface[]>,
        openColumns: [
            [
                table.thTxt('Accession #', HEADER_STYLE),
                table.thTxt('Test', HEADER_STYLE),
                table.thTxt('Reason for test', HEADER_STYLE),
                table.thTxt('Drawn', HEADER_STYLE),
                table.thTxt('Void', HEADER_STYLE)
            ]
        ] as Array<ColumnInterface[]>,
        drawnOrdersData: [] as any,
        openOrdersData: [] as any,
        drawnOrders: [] as Array<RowInterface[]>,
        labOrderRows: [] as Array<RowInterface[]>
    }),
    watch: {
        visitDate: {
            async handler(date: string) {
                if (!this.initiated) {
                    await this.init()
                    this.initiated = true
                }
                if (date && this.activeTab) {
                    this.drawnOrders = this.getdrawnOrders(
                        this.drawnOrdersData.filter((d: any) => this.toDate(d.order_date) === date)
                    )
                    this.labOrderRows = this.getLabOrderRows(
                        this.openOrdersData.filter((d: any) => this.toDate(d.order_date) === date)
                    )
                }
            },
            immediate: true
        }
    },
    methods : {
        async init() {
            this.service = new PatientLabService(this.patient.getID())
            this.openOrdersData = await this.service.getOrders('ordered')
            this.drawnOrdersData = await this.service.getOrders('drawn')
        },
        toDate(date: string) {
            return HisDate.toStandardHisFormat(date)
        },
        removeLabOrderRow(orderID: number) {
            this.labOrderRows = this.labOrderRows.filter((r: any) => r[0]?.value?.orderID != orderID)
        },
        async drawOrder() {
            try {
                const req = await this.service.updateOrderSpecimen(
                    this.order.order_id, this.selectedSpecimen.concept_id
                )
                if (req) {
                    // Update drawn order rows
                    this.drawnOrders = this.drawnOrders.concat(this.getdrawnOrders([req]))
                    this.removeLabOrderRow(this.order.order_id)
                    this.showSpecimenModal = false
                    if (this.order.tests.some((test: any) => !['FBS', 'RBS'].includes(test.name))) {
                        this.service.printSpecimenLabel(this.order.order_id)
                    }
                } else {
                    throw 'Unable to draw sample'
                }
            }catch(e) {
                console.error(e)
                toastDanger(`${e}`)
            }
        },
        getLabOrderRows(data: any): Array<RowInterface[]> {
            return data.map((d: any) => ([
                table.td(d.accession_number, { value: { orderID: d.order_id }}),
                table.td(d.tests.map((t: any) => t.name).join(',')),
                table.td(d.reason_for_test.name || 'N/A'),
                table.tdBtn('Draw', async () => {
                    this.order = d
                    this.showSpecimenModal = true
                    this.specimens = await PatientLabService.getSpecimensForTests(d.tests)
                }, {}, 'success'),
                table.tdBtn('Void', async () => {
                    voidWithReason(
                        async (reason: string) => {
                            try {
                                await this.service.voidOrder(d.order_id, reason)
                                this.removeLabOrderRow(d.order_id)
                            } catch (e) {
                                toastDanger(`${e}`)
                            }
                        },
                        [
                            'Duplicate order',
                            'Wrong client'
                        ]
                    )
                }, { event: { disabled : d.delivery_mode != 'test_results_delivered_to_site_manually' && (data.result??[]).length >= 1 }}, 'danger')
            ]))
        },
        getdrawnOrders(data: any): Array<RowInterface[]> {
            return data.map((d: any) => ([
                table.td(d.accession_number),
                table.td(d.tests.map((t: any) => t.name).join(',')),
                table.tdBtn('Print', () => {
                    if (toDate(d.order_date) != toDate(Service.getSessionDate())) {
                        return toastWarning(`Printing order #${d.accession_number} is restricted to today. Consider using BDE mode/set session date to the order date`)
                    }
                    this.service.printSpecimenLabel(d.order_id)
                })
            ]))
        }
    },
    props: {
        patient: {
            type: Object,
            required: true
        },
        visitDate: {
            type: String
        }
    }
})
</script>
