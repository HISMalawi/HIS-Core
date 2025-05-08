<script lang="ts">
import { defineComponent } from 'vue'
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field, Option } from "@/components/Forms/FieldInterface"
import { toastWarning } from "@/utils/Alerts"
import { AdherenceService } from "@/apps/ART/services/adherence_service"
import EncounterMixinVue from '../../../../views/EncounterMixin.vue'
import Validation from "@/components/Forms/validations/StandardValidations"
import HisDate from "@/utils/Date"
import { isEmpty } from 'lodash'
import Store from "@/composables/ApiStore"

export default defineComponent({
    mixins: [EncounterMixinVue],
    data: () => ({
        adherence: {} as any,
        drugObs: [] as any,
        askReasonForPoorAdherence: false,
        calculationAgreementObs: [] as any,
    }),
    methods: {
        async saveAdherence() {
            await this.adherence.createEncounter()
            const data = await Promise.all([...this.drugObs, ...this.calculationAgreementObs])
            const obs = await this.adherence.saveObservationList(data)

            if (!obs) return toastWarning('Unable to save patient observations')
        },
        buildAdherenceReport(data: any) {
            const lastVisit = this.adherence.getReceiptDate()
            const daysElapsed = this.adherence.calcTimeElapsed(lastVisit, 'day')
            const timeElapse = ` Last visit: ${HisDate.toStandardHisDisplayFormat(lastVisit)} 
                (${daysElapsed} Days Elapsed)`
            const rowColors = [{ indexes: [0, 3, 6], class: 'adherence-col-bg' }]
            const cellColors: any = []
            const columns = [timeElapse]
            const rows = [
                ['Prescription'],
                ['Tabs given'],
                ['Tabs per'],
                ['Tabs remaining'],
                ['Expected'],
                ['Actual (counted)'],
                ['Adherence'],
                ['Doses missed/ Unaccounted for'],
                ['Doses consumed'],
                ['Art Adherence']
            ]        
            data.forEach((order: any, index: number) => {
                const frequency = this.formatFrequency(order.frequency)
                const expectedPills = this.calcPillsExpected(order)
                const adherence = this.adherence.calculateAdherence(
                    order.quantity, order.pillsBrought, expectedPills
                )
                const adherenceStatus = this.adherence.isAdherenceGood(adherence) 
                    ? 'Good adherence' 
                    : 'Explore problem'
                const unAccountedDoses = this.adherence.calculateUnaccountedOrMissed(
                    expectedPills, order.pillsBrought
                )
                columns.push(order.drug.name)
                rows[0].push('')
                rows[1].push(order.quantity)
                rows[2].push(`${order.equivalent_daily_dose} <b>${frequency}</b>`)
                rows[3].push('')
                rows[4].push(expectedPills < 0 ? 0 : expectedPills)
                rows[5].push(order.pillsBrought)
                rows[6].push('')
                rows[7].push(unAccountedDoses)
                rows[8].push(`${adherence}%`)
                rows[9].push(adherenceStatus)

                cellColors.push({ 
                    index: index+1,
                    row: 9, 
                    class: adherenceStatus.match(/good/i) ? 'adherence-txt-good' : 'adherence-txt-bad' 
                })
            })
            return [
                { 
                    label: 'Selected Medication', 
                    value:'Table', 
                    other: { columns, rows, rowColors, cellColors }
                }      
            ]
        },
        formatFrequency(frequency: string) {
            return `${frequency}`.match(/qod/i) 
                    ? 'QOD'
                    : `${frequency}`.match(/weekly/i) 
                    ? 'QW'
                    : frequency
        },
        calcPillsExpected(d: any) {
            return this.adherence.calculateExpected(
                d.quantity, 
                d.equivalent_daily_dose, 
                d.order.start_date,
                this.formatFrequency(d.frequency) as 'QOD' | 'QW'
            )
        },
        getAdherenceFields(checkDrugsBefore=false): Array<Field> {
            return [
                {
                    id: 'pills_brought',
                    helpText: 'Pills remaining (brought to clinic)',
                    type: FieldType.TT_ADHERENCE_INPUT,
                    init: async () => {
                        this.adherence = new AdherenceService(this.patientID, this.providerID)
                        await this.adherence.loadPreviousDrugs((await Store.get('ASK_HANGING_PILLS')))
                        return true
                    },
                    condition: () => checkDrugsBefore ? this.adherence.receivedDrugsBefore() : true,
                    validation: (val: any) => {
                        if (Validation.required(val)) return ['No drugs available']

                        const empty = val.map((i: Option) => i.value === '')
                        
                        return  empty.some(Boolean) ? ['Some values are missing'] : null
                    },
                    unload: async (data: any) => {
                        this.drugObs = []
                        data.forEach(async(val: Option) => {
                            const {drug, order } = val.other
                            const data = { ...val.other, pillsBrought: val.value }
                            const adherence = this.adherence.calculateAdherence(
                                data.quantity, data.pillsBrought, this.calcPillsExpected(data)
                            )
                            this.drugObs.push(
                                this.adherence.buildAdherenceObs(order.order_id, drug.drug_id, adherence)
                            )
                            this.drugObs.push(
                                this.adherence.buildPillCountObs(order.order_id, val.value)
                            )

                            if (!this.askReasonForPoorAdherence) {
                                this.askReasonForPoorAdherence = !this.adherence.isAdherenceGood(data)
                            }
                        })
                    },
                    options: (fdata: any) => {
                        if (!isEmpty(fdata.pills_brought)) {
                            return fdata.pills_brought
                        }
                        return this.adherence.getLastDrugs().map((data: any) => ({
                            label: data.drug.name,
                            value: '',
                            other: {
                                ...data
                            }
                        }))
                    }
                },
                {
                    id: "adherence_report",
                    helpText: "ART adherence",
                    type: FieldType.TT_TABLE_VIEWER,
                    condition: () => checkDrugsBefore ? this.adherence.receivedDrugsBefore() : true,
                    options: (d: any) => this.buildAdherenceReport(
                        d.pills_brought.map((i: Option) => ({ 
                            ...i.other, pillsBrought: i.value
                        }))
                    ),
                    config: {
                        hiddenFooterBtns: [
                            'Clear'
                        ]
                    }
                },
                {
                    id: "agree_with_calculation",
                    helpText: "Agree with adherence calculation",
                    type: FieldType.TT_SELECT,
                    condition: () => this.askReasonForPoorAdherence,
                    validation: (val: Option) => Validation.required(val),
                    unload: ({ value }: Option) => {
                        this.calculationAgreementObs = [ this.adherence.buildValueCoded(
                            'Reason for poor treatment adherence', value
                        )]
                    },
                    options: () => [
                        { label: 'Yes', value: 'Yes' },
                        { label: 'No', value: 'No' }
                    ]
                }
            ]
        }
    }
})
</script>
