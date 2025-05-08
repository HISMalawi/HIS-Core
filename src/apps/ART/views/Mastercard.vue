<template>
  <ion-page style="background: #fff">
    <information-header
      :items="patientCardInfo"
      :numberOfColumns="4"
      @addGuardian="addGuardian"
      @update="updateDemographics"
      @updateARVNumber="updateARVNumber"
    ></information-header>
    <ion-content>
      <report-table
        :paginated="true"
        :rows="rows"
        :columns="columns"
        :rowsPerPage="itemsPerPage"
        :newPage="currentPage"
        :asyncRowParser="onNewRow"
        @onPagination="(p) => totalPages = p.length"
      ></report-table>
      <preloader v-if="!visitDatesInitialised" :itemCount="5"/>
      <pagination
        :perPage="itemsPerPage"
        :maxVisibleButtons="20"
        :totalPages="totalPages"
        @onChangePage="(p) => currentPage = p"
        />
    </ion-content>
    <his-footer :btns="btns" />
  </ion-page>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import HisDate from "@/utils/Date";
import { Patientservice } from "@/services/patient_service";
import { ObservationService } from "@/services/observation_service";
import InformationHeader from "@/components/InformationHeader.vue";
import HisFooter from "@/components/HisDynamicNavFooter.vue";
import { isEmpty } from "lodash";
import { IonPage, IonContent, modalController } from "@ionic/vue";
import { RelationshipService } from "@/services/relationship_service";
import { alertConfirmation, toastDanger } from "@/utils/Alerts";
import { ProgramService } from "@/services/program_service";
import { NavBtnInterface } from "@/components/HisDynamicNavFooterInterface";
import Store from "@/composables/ApiStore"
import ReportTable from "@/components/DataViews/tables/ReportDataTable.vue"
import table, { ColumnInterface } from "@/components/DataViews/tables/ReportDataTable"
import Pagination from "@/components/Pagination.vue"
import Preloader from "@/components/TextSkeleton.vue"
import MastercardDetails from "@/components/MastercardDetails.vue";
import { toDate } from "@/utils/Strs";
import { printArtVisitLbl } from "../Labels";

export default defineComponent({
  components: {
    Preloader,
    Pagination,
    IonPage,
    ReportTable,
    IonContent,
    HisFooter,
    InformationHeader
  },
  data: () => ({
    patientId: 0 as any,
    patient: {} as any,
    patientCardInfo: [] as any,
    btns: [] as Array<NavBtnInterface>,
    itemsPerPage: 10 as number,
    currentPage: 0 as number,
    totalPages: 0 as number,
    pages: [] as any,
    visitDates: [] as string[],
    tbStats: [] as Array<any>,
    visitDatesInitialised: false as boolean,
    columns: [[
      table.thTxt('VISIT DATE'),
      table.thTxt('WEIGHT (Kg)'),
      table.thTxt('REG'),
      table.thTxt('VIRAL LOAD'),
      table.thTxt('TB STATUS'),
      table.thTxt('OUTCOME'),
      table.thTxt('PILLS DISPENSED'),
      table.thTxt('ACTIONS')
    ]] as ColumnInterface[][],
    rows: [] as any
  }),
  created() {
    this.setPatientCards()
    this.patientId = parseInt(`${this.$route.params.patient_id}`)
    Patientservice.getPatientVisits(this.patientId, true)
      .then(dates =>  {
        this.visitDatesInitialised = true
        this.visitDates = dates
        this.rows = dates.map((date) => {
          return [
            table.tdBtn(HisDate.toStandardHisDisplayFormat(date), 
              () => printArtVisitLbl(this.patientId, date)),
            table.td('...'),
            table.td('...'),
            table.td('...'),
            table.td('...'),
            table.td('...'),
            table.td('...'),
            table.td('...')
          ]
        })
      }).catch((e) =>{
        this.visitDatesInitialised = true
        toastDanger(`${e}`)
        console.error(e)
      })
    this.btns.push({
      name: "Finish",
      color: "success",
      size: "large",
      slot: "end",
      visible: true,
      onClick: () => {
        alertConfirmation("Are you sure you want to exit?").then(ok => {
          if (ok) {
            return this.$router.push(`/patient/dashboard/${this.patientId}`)
          }
        })
      }
    })
  },
  async mounted() {
    if (this.patientId) {
      for(const item of this.patientCardInfo) {
        if (typeof item.init === 'function') {
          await item.init()
        }

        if (typeof item.condition === 'function') {
          item.visible = item.condition()
        } else {
          item.visible = true
        }

        if (typeof item.asyncValue === 'function') {
          item.asyncValue(item).then((value: any) => item.value = value || '')
        } else if (typeof item.staticValue === 'function') {
          item.value = item.staticValue()
        }
      }
    }
  },
  methods: {
    setPatientCards() {
      this.patientCardInfo = [
        { 
          label: "ARV Number", 
          value: '...',
          staticValue: () => this.patient.getArvNumber(),
          init: async () => {
            this.patient = await Store.get('ACTIVE_PATIENT', { patientID: this.patientId })
          },
          other: {
            editable: true,
            category: "arv_number"
          }
        },
        { 
          label: "National Patient ID", 
          value: '...',
          staticValue: () => this.patient.getNationalID() 
        },
        {
          label: "Given Name",
          value: '...',
          staticValue: () => this.patient.getGivenName(),
          other: {
            editable: true,
            attribute: "given_name",
            category: "demographics",
          }
        },
        {
          label: "Family Name",
          value: '...',
          staticValue: () => this.patient.getFamilyName(),
          other: {
            editable: true,
            attribute: "family_name",
            category: "demographics",
          },
        },
        {
          label: "Age",
          value: '...',
          staticValue: () => this.patient.getAge(),
          other: {
            editable: true,
            attribute: "year_birth_date",
            category: "demographics",
          }
        },
        {
          label: "Sex",
          value: '...',
          staticValue: () => this.patient.getGender(),
          other: {
            editable: true,
            attribute: "gender",
            category: "demographics",
          }
        },
        {
          label: "Location",
          value: '...',
          staticValue: () => this.patient.getCurrentVillage(),
          other: {
            editable: true,
            attribute: "home_region",
            category: "demographics",
          }
        },
        { 
          label: "Landmark",
          value: '...', 
          staticValue: () => this.patient.getAttribute(19) 
        },
        {
          label: "Guardian",
          value: '...',
          asyncValue: async (item: any) => {
            const relations = await RelationshipService.getGuardianDetails(this.patientId)
            if (isEmpty(relations)) {
              item.other.editable = true
              return 'add'
            }
            return relations.map((r: any) => ` ${r.name} (${r.relationshipType})`).join(" ")
          },
          other: {
            editable: false,
            attribute: "",
            category: "guardian",
          }
        },
        { 
          label: "Init W(KG)", 
          value: '...',
          asyncValue: () => this.patient.getInitialWeight() 
        },
        { 
          label: "Init H(CM)", 
          value: '...',
          asyncValue: () => this.patient.getInitialHeight() 
        },
        { 
          label: "Init BMI", 
          value: '...',
          asyncValue: () => this.patient.getInitialBMI() 
        },
        {
          label: 'init Preg',
          value: '...',
          condition: () => this.patient.isFemale(),
          asyncValue: () => this.patient.getInitialObs('Is patient pregnant', 'value_coded')
        },
        {
          label: 'init Breastfeeding',
          value: '...',
          condition: () => this.patient.isFemale(),
          asyncValue: () => this.patient.getInitialObs('Is patient breast feeding', 'value_coded')
        },
        {
          label: 'cur Preg',
          value: '...',
          condition: () => this.patient.isFemale(),
          asyncValue: async () => (await this.patient.isPregnant()) ? 'Yes' : 'No' 
        },
        {
          label: 'cur Breastfeeding',
          value: '...',
          condition: () => this.patient.isFemale(),
          asyncValue: async () => (await this.patient.isBreastfeeding()) ? 'Yes' : 'No'
        },
        { 
          label: "TI", 
          value:  '...',
          asyncValue: () => ObservationService.getFirstValueCoded(
            this.patientId, "Ever received ART"
          )
        },
        { 
          label: "Agrees to follow up", 
          value: '...',
          asyncValue: () => ObservationService.getFirstValueCoded(
            this.patientId, "Agrees to followup"
          ) 
        },
        { 
          label: "Reason for starting ART", 
          value: '...',
          asyncValue: () => ObservationService.getFirstValueCoded(
            this.patientId, "Reason for ART eligibility"
          )
        },
        { 
          label: "HIV test date", 
          value: '...',
          asyncValue: async () => {
            const date = await ObservationService.getFirstValueDatetime(
              this.patientId, 'Confirmatory HIV test date'
            )
            return date ? HisDate.toStandardHisDisplayFormat(date) : ''
          }
        },
        { 
          label: "HIV test place", 
          value: "...",
          asyncValue: () => ObservationService.getFirstValueText(
            this.patientId, "Confirmatory HIV test location"
          )
        },
        { 
          label: "Date of starting first line ART", 
          value: '...',
          asyncValue: async () => {
            const date = await ObservationService.getFirstValueDatetime(
              this.patientId, 'Date ART started'
            )
            return date ? HisDate.toStandardHisDisplayFormat(date) : ''
          }
        },
        {
          label: "Pulmonary TB within the last 2 years",
          value: '...',
          init: async () => {
            this.tbStats = (await ObservationService.getAllValueCoded(
              this.patientId, "Who stages criteria present"
            )) || []
          },
          staticValue: () => this.hasTbStat('Tuberculosis (PTB or EPTB) within the last 2 years')
        },
        {
          label: "Extra pulmonary TB (EPTB)",
          value:'...',
          staticValue: () => this.hasTbStat('Extrapulmonary tuberculosis (EPTB)')
        },
        {
          label: "Pulmonary TB (current)",
          value: "...",
          staticValue: () => this.hasTbStat('Pulmonary tuberculosis (current)')
        },
        {
          label: "Kaposis sarcoma",
          value: '...',
          staticValue: () => this.hasTbStat('Kaposis sarcoma')
        }
      ]
    },
    buildDetails(data: Record<string, any>) {
      const fmtTurple = (turple: Array<[string, number]>) => turple.map(([t, v]: any) => `${t} (${v})`).join('/')
      return [
        {
          label: 'Outcome',
          value: data.outcome
        },
        {
          label: 'Outcome Date',
          value: data.outcome_date
        },
        {
          label: 'Side effects',
          value: data.side_effects
        },
        {
          label: 'Viral load',
          value: data.viral_load
        },
        {
          label: 'Pills Brought',
          value: fmtTurple(data.pills_brought)
        },
        {
          label: 'Pills dispensed',
          value: fmtTurple(data.pills_dispensed)
        },
        {
          label: 'Visit by',
          value: data.visit_by
        },
        {
          label: "Regimen",
          value: data.regimen
        },
        {
          label: 'Adherence',
          value: fmtTurple(data.adherence)
        },
        {
          label: 'TB Status',
          value: data.tb_status
        },
        {
          label: 'Height (cm)',
          value: data.height
        },
        {
          label: 'Weight (Kg)',
          value: data.weight
        },
        {
          label: 'BMI',
          value: data.bmi
        },
        {
          label: "Is pregnant",
          value: data.isPregnant,
          visible: this.patient.isFemale()
        },
        {
          label: "Is breastfeeding",
          value: data.isBreastfeeding,
          visible: this.patient.isFemale()
        }
      ]
    },
    async onNewRow(row: any) {
      const r = [...row]
      if (r[1] && r[1].td !='...') {
        return r
      }
      const date = r[0].td
      const data = await ProgramService.getCurrentProgramInformation(this.patientId, date)
      const drugs = await ProgramService.getMastercardDrugInformation(this.patientId, date)
      const pillsDispensed = (drugs?.pills_given || []).map((d: any) =>  {
        return `${d['short_name'] || d['name']} <b>(${d.quantity || '?'})</b>`
      }).join('<br/>')
      let isPregnant = 'N/A'
      let isBreastfeeding = 'N/A'
      if (this.patient.isFemale()) {
        const pregObs = await ObservationService.getFirstObs(this.patientId, 'Is patient pregnant', date)
        if (pregObs && toDate(pregObs.obs_datetime) === date) {
          isPregnant = pregObs.value_coded
        }
        const bfeed = await ObservationService.getFirstObs(this.patientId, 'Is patient breast feeding', date)
        if (bfeed && toDate(bfeed.obs_datetime) === date) {
          isBreastfeeding = bfeed.value_coded
        }
      }
      r[1] = table.td(data.weight)
      r[2] = table.td(data.regimen)
      r[3] = table.td(data.viral_load)
      r[4] = table.td(data.tb_status)
      r[5] = table.td(data.outcome.match(/Unk/i) ? "Unknown" : data.outcome)
      r[6] = table.td(pillsDispensed)
      r[7] = table.tdBtn('More', async () => {
        (await modalController.create({
          component: MastercardDetails,
          backdropDismiss: false,
          cssClass: "large-modal",
          componentProps: {
            title: date,
            visitData: this.buildDetails({
              ...data,
              isPregnant,
              isBreastfeeding
            })
          }
        })
        ).present()
      })
      return r
    },
    hasTbStat(conceptName: string) {
      return this.tbStats.includes(conceptName) ? 'Yes' : 'No'
    },
    updateDemographics(attribute: string) {
      this.$router.push({
        path: "/patient/registration",
        query: {
          'edit_person': this.patientId,
          'person_attribute': attribute,
        },
      });
    },
    addGuardian() {
      this.$router.push({
        path: `/guardian/registration/${this.patientId}`,
        query: {
          source: this.$route.name?.toString(),
        },
      });
    },
    updateARVNumber() {
      this.$router.push({name: "Edit ARV Number"})
    }
  }
});
</script>
