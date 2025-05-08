<template>
  <div id="consistency_check">
    <div v-for="(text, index) in this.reportConsistency" :key="index">
      {{text}}
    </div>
  </div>
</template>
<script lang="ts">
import { isEmpty } from 'lodash'
import { defineComponent } from "vue";

export default defineComponent({
  data: () => ({
    reportConsistency: [] as string[]
  }),
  props: {
      indicators: {
        type: Object,
        default: () => ({})
      }
  },
  watch: {
    indicators: {
        handler(indicators: Record<string, number>) {
            if (!isEmpty(indicators)) this.runValidations(indicators)
        },
        deep: true,
        immediate: true
    }
  },
  methods: {
    runValidations(indicators: any) {
        this.reportConsistency = this.getRuleChecks().filter((r: any) => {
            if (r.sum) {
                // Convert indicator strings to their equivalent cohort values for SUM calculation
                const sum = r.sum.map((i: string) => indicators[i])
                    .reduce((sum: number, value: number) => sum + value, 0)
                // run comparator to detect errors on the report
                return r.comparator(indicators, sum)
            }
            return false
            })
            .map((r: any) => r.error())
    },
    getRuleChecks() {
        return [
            {
                /*############Section one: 26 -- 32 Has to equal to Total registered */
                sum: [
                    'initial_non_pregnant_females_all_ages', 
                    'males_initiated_on_art_first_time',
                    'initial_pregnant_females_all_ages',
                    'unknown_gender',
                    're_initiated_on_art',
                    'transfer_in'
                ],
                comparator: (i: any, s: number) => i['total_registered'] != s,
                error: () => `
                    Section 26 - 32: Total registered (Quartely) is not equal to
                    CHECK: Total FT + Re Patients re-initiated on ART + TI Patients transferred in on ART
                `
            },
            {
                sum: [
                    'cum_initial_non_pregnant_females_all_ages',
                    'cum_males_initiated_on_art_first_time',
                    'cum_initial_pregnant_females_all_ages',
                    'cum_unknown_gender',
                    'cum_re_initiated_on_art',
                    'cum_transfer_in'
                ],
                comparator: (i: any, s: number) => i['cum_total_registered'] != s,
                error: () => `
                    Section 26 - 32: Total registered (Cummulative) is not equal to
                    CHECK: Total FT + Re Patients re-initiated on ART + TI Patients transferred in on ART
                `
            },
            /*############Section two: 33 -- 35 Has to equal to Total registered */
            {
                sum: [
                    'quarterly_all_males',
                    'non_pregnant_females',
                    'pregnant_females_all_ages'
                ],
                comparator: (i: any, s: number) => i['total_registered'] != s,
                error: () => `
                    Section 33 - 35: Total registered (Quartely) is not equal to
                    M Males (all ages) + FNP Non-pregnant Females (all ages)  + FP Pregnant Females (all ages)  
                `
            },
            {
                sum: [
                    'cum_all_males',
                    'cum_non_pregnant_females',
                    'cum_pregnant_females_all_ages'
                ],
                comparator: (i: any, s: number) => i['cum_total_registered'] != s,
                error: () => `
                    Section 33 - 35: Total registered (Cummulative) is not equal to
                    M Males (all ages) + FNP Non-pregnant Females (all ages)  + FP Pregnant Females (all ages) 
                `
            },
            /*############Section two: 36 -- 38 Has to equal to Total registered */
            {
                sum: [
                    'children_below_24_months_at_art_initiation',
                    'children_24_months_14_years_at_art_initiation',
                    'adults_at_art_initiation'
                ],
                comparator: (i: any, sum: number) => i['total_registered'] != sum,
                error: () => `
                    Section 36 - 38: Total registered (Quartely) is not equal to
                    A Children below 24 m at ART initiation + B Children 24 m - 14 yrs at ART initiation + C Adults 15 years+ at ART initiation 
                `
            },
            {
                sum: [
                    'cum_children_below_24_months_at_art_initiation',
                    'cum_children_24_months_14_years_at_art_initiation',
                    'cum_adults_at_art_initiation'
                ],
                comparator: (i: any, sum: number) => i['cum_total_registered'] != sum,
                error: () => `
                    Section 36 - 38: Total registered (Cummulative) is not equal to
                    A Children below 24 m at ART initiation + B Children 24 m - 14 yrs at ART initiation + C Adults 15 years+ at ART initiation 
                `
            },
            /*Reason for starting ART #################################*/
            {
                sum: [
                    'presumed_severe_hiv_disease_in_infants',
                    'confirmed_hiv_infection_in_infants_pcr',
                    'quarterly_children_12_59_months',
                    'pregnant_women',
                    'breastfeeding_mothers',
                    'who_stage_two',
                    'asymptomatic',
                    'who_stage_three',
                    'who_stage_four',
                    'unknown_other_reason_outside_guidelines',
                ],
                comparator: (i: any, s: number) => i['total_registered'] != s,
                error: () => `
                    Section 39 - 48: Total registered (Quartely) is not equal to
                    Pres. Sev. HIV disease age <12 m + PCR Infants <12 mths PCR + U5 Children 12-59mths
                    Preg Pregnant women + BF Breastfeeding mothers + CD4 CD4 below threshold
                    Asy Asymptomatic / mild + WHO stage 3 + WHO stage 4
                    Unknown / reason outside guidelines
                `
            },
            {
                sum: [
                    'cum_presumed_severe_hiv_disease_in_infants',
                    'cum_confirmed_hiv_infection_in_infants_pcr',
                    'cum_children_12_59_months',
                    'cum_pregnant_women',
                    'cum_breastfeeding_mothers',
                    'cum_who_stage_two',
                    'cum_asymptomatic',
                    'cum_who_stage_three',
                    'cum_who_stage_four',
                    'cum_unknown_other_reason_outside_guidelines',
                ],
                comparator: (i: any, s: number) => i['cum_total_registered'] != s,
                error: () => `
                    Section 39 - 48: Total registered (Cummulative) is not equal to
                    Pres. Sev. HIV disease age <12 m + PCR Infants <12 mths PCR + U5 Children 12-59mths
                     + Preg Pregnant women + BF Breastfeeding mothers + CD4 CD4 below threshold
                     + Asy Asymptomatic / mild + WHO stage 3 + WHO stage 4
                     + Unknown / reason outside guidelines
                `
            },
            /*#####################################*/
            /*Stage defining conditions at ART initiation #############
            Total registered should be equal to 49  - 51
            */
            {
                sum: [
                    'no_tb',
                    'tb_within_the_last_two_years',
                    'current_episode_of_tb',
                ],
                comparator: (i: any, s: number) => i['total_registered'] != s,
                error: () => `
                    Section 49 - 51: Total registered (Quartely) is not equal to
                    Nev/>2yrs	Never TB / TB over 2 years ago + Last 2yrs	TB within the last 2 years + Curr Current episode of TB
                `
            },
            {
                sum: [
                    'cum_no_tb',
                    'cum_tb_within_the_last_two_years',
                    'cum_current_episode_of_tb',
                ],
                comparator: (i: any, s: number) => i['cum_total_registered'] != s,
                error: () => `
                    Section 49 - 51: Total registered (Cummulative) is not equal to
                    Nev/>2yrs	Never TB / TB over 2 years ago + Last 2yrs	TB within the last 2 years + Curr Current episode of TB 
                `
            },
            /* #############
            Total registered should be equal to (53 + 58 + 59 + 60 + 61)
            */
            {
                sum: [
                    'total_alive_and_on_art',
                    'died_total',
                    'defaulted',
                    'stopped_art',
                    'transfered_out',
                ],
                comparator: (i: any, s: number) => i['cum_total_registered'] != s,
                error: () => `
                    Section 53 - 61: Total registered (Cummulative) is not equal to
                    Total alive and on ART + Died total + Defaulted (more than 2 months overdue after expected to have run out of ARVs 
                     + Stopped taking ARVs (clinician or patient own decision, last known alive
                     + Transferred Out";
                `
            },
            /* ############Section 64  - 80: Total Alive and On ART should be equal to (64 - 80)
            */
            {
                sum: [
                    'zero_p', 'zero_a', 'two_p', 'two_a', 'four_pp', 'four_pa', 'four_a',
                    'five_a', 'six_a', 'seven_a', 'eight_a', 'nine_pp', 'nine_pa', 
                    'nine_a',   'ten_a', 'eleven_pp', 'eleven_pa', 'eleven_a', 
                    'twelve_pp', 'twelve_pa', 'twelve_a', 'unknown_regimen', 
                    'thirteen_a', 'fourteen_a', 'sixteen_a', 'seventeen_a', 
                    'fourteen_pp', 'fourteen_pa', 'fifteen_pp', 'fifteen_pa', 
                    'fifteen_a', 'sixteen_p', 'seventeen_pa', 'seventeen_pp'
                ],
                comparator: (i: any, s: number) => i['total_alive_and_on_art'] != s,
                error: () => `Section 64 - 80: Total alive and on ART is not equal to Regimens sections`
            },
            /*#####################################*/
            /*Section Section: 81 - 83 #####################*/ 
            {
                sum: [
                    'total_pregnant_women',
                    'total_breastfeeding_women',
                    'total_other_patients'
                ],
                comparator: (i: any, s: number) => i['total_alive_and_on_art'] != s,
                error: () => `
                    Section 81 - 83: Total alive and on ART is not equal to
                    Pregnant + Breastfeeding + All others (not circled)
                `
            },
            /*#####################################*/
            /*Section Section: 84 - 88 #####################*/  
            {
                sum: [
                    'tb_not_suspected',
                    'tb_suspected',
                    'tb_confirmed_currently_not_yet_on_tb_treatment',
                    'tb_confirmed_on_tb_treatment',
                    'unknown_tb_status',
                ],
                comparator: (i: any, s: number) => i['total_alive_and_on_art'] != s,
                error: () => `
                    Section 84 - 88: Total alive and on ART is not equal to
                    TB not suspected + TB suspected + TB conf., not on Rx + TB conf., on TB Rx + Unknown (not circled)
                `
            },
            /*#####################################*/
            /*Section Section: 89 - 91 #####################*/  
            {
                sum: [
                    'total_patients_without_side_effects',
                    'total_patients_with_side_effects',
                    'unknown_side_effects',
                ],
                comparator: (i: any, s: number) => i['total_alive_and_on_art'] != s,
                error: () => `
                    Section 88 - 91: Total alive and on ART is not equal to
                    None + Any side effects + Unknown (not circled)
                `
            },
            /*#####################################*/
            /*Section Section: 92 - 94 #####################*/
            {
                sum: [
                    'patients_with_0_6_doses_missed_at_their_last_visit',
                    'patients_with_7_plus_doses_missed_at_their_last_visit',
                    'patients_with_unknown_adhrence',
                ],
                comparator: (i: any, s: number) => i['total_alive_and_on_art'] != s,
                error: () => `
                    Section 92 - 94: Total alive and on ART is not equal to
                    0 – 3 doses missed + 4+ doses missed + Unknown (not circled)
                `
            }
        ]
    }
  }
})
</script>

<style scoped>
div {
    width: 100%;
    text-align: left;
    padding-left: 5px;
}
#consistency_check div {
    color: red;
    padding-bottom: 10px;
}
</style>