<template>
    <report-template
        :title="title"
        :period="period"
        :rows="rows" 
        :fields="fields"
        :columns="columns"
        :canExportCsv="false"
        :canExportPDf="false"
        :onReportConfiguration="onPeriod"
        > 
    </report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import { FieldType } from '@/components/Forms/BaseFormElements'
import { Field } from '@/components/Forms/FieldInterface'
import { Option } from '@/components/Forms/FieldInterface'
import table, { RowInterface } from "@/components/DataViews/tables/ReportDataTable"
import { IdentifierService } from "@/services/identifier_service"
import Validation from "@/components/Forms/validations/StandardValidations"
import DrillTable from "@/components/DataViews/DrillTableModal.vue"
import { modalController } from "@ionic/vue";
import HisDate from "@/utils/Date"
import { toastDanger } from '@/utils/Alerts'
import popVoidReason from "@/utils/ActionSheetHelpers/VoidReason";
export default defineComponent({
    components: { ReportTemplate },
    data: () => ({
        service: {} as any,
        dde: {} as any,
        title: 'Multiple Identifiers',
        fields: [] as Field[],
        rows: [] as Array<RowInterface[]>,
        columns: [
            [
                table.thTxt('First Name'), 
                table.thTxt('Last Name'), 
                table.thTxt('Gender'), 
                table.thTxt('Number of identifiers'), 
                table.thTxt('View'),
            ]
        ]
    }),
    async created() {
        this.fields = this.getFormFields()
    },
    methods: {
        async onPeriod({identifier}: any) {
            const idType = parseInt(identifier.value.toString())
            this.title = identifier.label + ' Multiple Identifiers'
            this.service = new IdentifierService()
            this.service.setIdentifierType(idType)
            this.rows = await this.getRows()
        },
        getFormFields(): Array<Field> {
            return [
                {
                    id: 'identifier',
                    helpText: 'Select Identifier type',
                    type: FieldType.TT_SELECT,
                    validation: (val: Option) => Validation.required(val),
                    options: async () => 
                        (await IdentifierService.getIdentifierTypes())
                            .map((i: any) => ({
                                label: i.name,
                                value: i.patient_identifier_type_id
                            }))
                }
            ]
        },
        toDate(date: string | Date) {
            return HisDate.toStandardHisDisplayFormat(date)
        },
        async drillDuplicates(identifiers: any, rowIndex: any){
            const modal = await modalController.create({
                component: DrillTable,
                cssClass: 'custom-modal',
                componentProps: {
                    title: `Identifiers belonging to client`,
                    columns: [
                        'identifier', 'date created', 'void'
                    ],
                    onRows: async () => {
                        return identifiers.map((p: any, index: any) => {
                            try {
                                return [
                                p.identifier, 
                                this.toDate(p.date_created),
                                    {
                                        type: 'button',
                                        name: 'Void',
                                        color: 'danger',
                                        action: async () => {
                                            await this.voidActiveItem(p.patient_identifier_id, identifiers, index, rowIndex);
                                            
                                        },
                                        disabled: identifiers.length > 1 ? false : true
                                    },
                                ]
                            } catch (e) {
                                toastDanger('Unable to load patient details')
                                return ['N/A', 'N/A', 'N/A', 'N/A', 'N/A']
                            }
                        })
                    }
                }
            })
            modal.present()
        },
      //using the multiple identifiers route as we may need to change the interface to allow multiple voids in the future
      voidActiveItem(identifier: number, identifiers: any, index: any, rowIndex: any) {
        popVoidReason(async (reason: string) => {
            try {
                modalController.dismiss().then(async () => {
                    await this.service.voidMultipleIdentifiers([identifier], reason, identifiers[0].identifier_type);
                    const activeIDentifiers = identifiers.splice(index, 1);
                    if(activeIDentifiers.length > 1) {
                        await this.drillDuplicates(activeIDentifiers, rowIndex);
                    }else {
                        this.rows.splice(rowIndex, 1);
                    }
                });
            } catch (e) {
            toastDanger(`${e}`)
            }
            }, 'void-modal custom-modal-backdrop') 
        },
        async getRows() {
            return (await this.service.getMultipleIdentifiers())
                .map((i: any, index: any) => ([
                    table.td(i.given_name),
                    table.td(i.family_name),
                    table.td(i.gender),
                    table.td(i.identifiers.length),
                    table.tdBtn('Select', () => this.drillDuplicates(i.identifiers, index)),
                ]))
        }
    }
})
</script>
