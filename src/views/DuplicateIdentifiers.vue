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
import { IdentifierService, DuplicateIdentifiersInterface } from "@/services/identifier_service"
import Validation from "@/components/Forms/validations/StandardValidations"
import DrillTable from "@/components/DataViews/DrillTableModal.vue"
import { modalController } from "@ionic/vue";
import { Patientservice } from "@/services/patient_service"
import HisDate from "@/utils/Date"
import {PatientDemographicsExchangeService} from "@/services/patient_demographics_exchange_service"
import { toastDanger } from '@/utils/Alerts'
export default defineComponent({
    components: { ReportTemplate },
    data: () => ({
        service: {} as any,
        dde: {} as any,
        title: 'Duplicate Identifiers',
        fields: [] as Field[],
        rows: [] as Array<RowInterface[]>,
        columns: [
            [
                table.thTxt('Identifier'), 
                table.thTxt('Count'), 
                table.thTxt('View'),
                table.thTxt('Resolve')
            ]
        ]
    }),
    async created() {
        this.fields = this.getFormFields()
        this.dde = new PatientDemographicsExchangeService()
        await this.dde.loadDDEStatus()
    },
    methods: {
        async onPeriod({identifier}: any) {
            const idType = parseInt(identifier.value.toString())
            this.title = identifier.label + ' Duplicates'
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
        async drillDuplicates(identifier: string){
            const modal = await modalController.create({
                component: DrillTable,
                cssClass: 'custom-modal',
                componentProps: {
                    title: `Persons using identifier ${identifier}`,
                    columns: [
                        'Given name', 'Family name', 'Gender', 'Birth date', 'Action'
                    ],
                    onRows: async () => {
                        const patients = await this.service.getPatientsByIdentifier(identifier)
                        return patients.map((p: any) => {
                            try {
                                const patient = new Patientservice(p)
                                return [
                                    patient.getGivenName(),
                                    patient.getFamilyName(),
                                    patient.getGender(),
                                    this.toDate(patient.getBirthdate()),
                                    {
                                        type: 'button',
                                        name: 'View',
                                        action: () => {
                                            modalController.dismiss().then(() => {
                                                this.$router.push(`/patient/dashboard/${patient.getID()}`)
                                            })
                                        }
                                    }
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
        async getRows() {
            return (await this.service.getDuplicateIndentifiers())
                .map((i: DuplicateIdentifiersInterface) => ([
                    table.td(i.identifier),
                    table.td(i.count),
                    table.tdBtn('Select', () => this.drillDuplicates(i.identifier)),
                    table.tdBtn('Resolve', () => {
                        this.$router.push(`/npid/duplicates/${i.identifier}`)
                    }, {
                        event: {
                            disabled: this.service.getIdentifierType() != 3
                        }
                    }, 'danger')
                ]))
        }
    }
})
</script>
