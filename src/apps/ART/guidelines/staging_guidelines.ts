import { ConceptService } from "@/services/concept_service"
import { alertConfirmation } from "@/utils/Alerts"
import { GuideLineInterface } from "@/utils/GuidelineEngine"

const CD4_COUNT_CUT_OFF_DATE = "2016-04-30";

export const ADULT_WHO_STAGE_CRITERIA: Record<string, GuideLineInterface> = {
    'Adults with stage 4 conditions': {
        concept: 'WHO STAGE IV ADULT',
        priority: 1,
        conditions: {
            stage: (stage: number) => stage === 4,
        }
    },
    'Classify as stage 4 when reason for ART is WHO STAGE 4': {
        concept: 'WHO STAGE IV ADULT',
        priority: 2,
        conditions: {
            reasonForArt: (reason: string) => reason === 'WHO STAGE IV ADULT'
        }
    },
    'Adults with stage 3 conditions': {
        concept: 'WHO STAGE III ADULT',
        priority: 3,
        conditions: {
            stage: (stage: number) => stage === 3
        }
    },
    'Adults with stage 2 conditions': {
        concept: 'WHO STAGE II ADULT',
        priority: 4,
        conditions: {
            stage: (stage: number) => stage === 2,
        }
    },
    'Adults with stage 1 conditions': {
        concept: 'WHO STAGE I ADULT',
        priority: 5,
        conditions: {
            stage: (stage: number) => stage === 1
        }
    }
}

export const CHILD_WHO_STAGE_CRITERIA: Record<string, GuideLineInterface> = {
    'Children with stage 4 conditions': {
        concept: 'WHO STAGE IV PEDS',
        priority: 1,
        conditions: {
            stage: (stage: number) => stage === 4,
        }
    },
    'Classify as stage 4 when reason for ART is WHO STAGE 4': {
        concept: 'WHO STAGE IV PEDS',
        priority: 2,
        conditions: {
            reasonForArt: (reason: string) => reason === 'WHO STAGE IV PEDS'
        }
    },
    'For children with stage 3 conditions': {
        concept: 'WHO STAGE III PEDS',
        priority: 3,
        conditions: {
            stage: (stage: number) => stage === 3
        }
    },
    'Children with stage 2 conditions': {
        concept: 'WHO STAGE II PEDS',
        priority: 4,
        conditions: {
            stage: (stage: number) => stage === 2
        }
    },
    'Children with stage 1 conditions': {
        concept: 'WHO STAGE I PEDS',
        priority: 5,
        conditions: {
            stage: (stage: number) => stage === 1
        }
    }
}

export const CONTRADICTING_STAGE_DEFINITIONS_ALERTS: Record<string, GuideLineInterface> = {
    "Warn if Severe weight loss is selected when actual patient BMI is acceptable": {
        priority: 1,
        actions: {
            alert: async (facts: any) => await alertConfirmation(`Patient's BMI of ${facts.bmi} greater than 18.5, do you wish to proceed?`, {
                confirmBtnLabel: 'Yes, keep severe weightloss',
                cancelBtnLabel: 'No, cancel'
            }),
        },
        conditions: {
            selectedCondition (condition: string) {
                return condition === 'Severe weight loss >10% and/or BMI <18.5kg/m^2, unexplained'
            },
            bmi:(bmi: number) => bmi > 18.5
        }
    },
    "Warn for contradicting stage defining conditions": {
        priority: 1,
        actions: {
            alert: async (facts: any) => {
                const keepAsymptomatic = await alertConfirmation('CONTRADICTING STAGE DEFINING CONDITIONS', {
                    confirmBtnLabel: "Keep Asymptomatic",
                    cancelBtnLabel: 'Keep other(s)'
                })
                if(keepAsymptomatic) {
                    facts.stage = 1
                    facts.selectedConditions = []
                    facts.stageThreeConditions = []
                    facts.stageFourConditions = []
                    facts.stageTwoConditions = []
                    return true
                }
                return false
            },
        },
        conditions: {
            selectedCondition(condition: string){
                return condition === 'Asymptomatic HIV infection'
            },
            stage: (stage: number) => stage >= 2
        }
    },
}

export const RECOMMENDED_CHILD_STAGING_CONDITIONS: Record<string, GuideLineInterface> = {
    'Enable TB staging condition if client is TB positive': {
        priority: 1,
        actions: {
            isChecked: true
        },
        description: {
            color: 'danger',
            show: "always",
            info: () => 'Client registered as a TB Patient in the TB Module'
        },
        conditions: {
            tbPositive: (positive: boolean) => positive,
            selectedCondition: (condition: string) => /\bTuberculosis \(PTB or EPTB\)|\bPulmonary tuberculosis/i.test(condition)
        }
    },
    'Enable TB staging condition if client is EPTB positive': {
        priority: 1,
        actions: {
            isChecked: true
        },
        description: {
            color: 'danger',
            show: "always",
            info: () => 'Client registered with EPTB in TB Module'
        },
        conditions: {
            eptbPositive: (positive: boolean) => positive,
            selectedCondition: (condition: string) => /Extrapulmonary tuberculosis/i.test(condition)
        }
    },
    'For children whose current weight percentile is less than 70' : {
        priority: 1,
        actions: {
            isChecked: true
        },
        description: {
            color: 'danger',
            show: 'always',
            info: (facts: any) => `Child has a low weight percentile of ${facts.weightPercentile}`
        },
        conditions: {
            selectedCondition(condition: string) {
                return condition === 'Severe unexplained wasting or malnutrition not responding to treatment (weight-for-height/ -age <70% or MUAC less than 11cm or oedema)'
            },
            weightPercentile(weightPercentile: number){
                return weightPercentile < 70
            }
        }
    },
    'Enable Moderate unexplained malnutrition for children whose weight for height is 70-79%': {
        priority: 1,
        actions: {
            isChecked: true
        },
        description: {
            color: 'danger',
            show: 'always',
            info: (facts: any) => `Child has weight percentile of ${facts.weightPercentile}`
        },
        conditions: {
            selectedCondition(condition: string) {
                return condition === 'Moderate unexplained wasting/malnutrition not responding to treatment (weight-for-height/ -age 70-79% or muac 11-12 cm)'
            },
            weightPercentile(weightPercentile: number){
                return weightPercentile >= 70 && weightPercentile <= 79
            }
        }
    },
    'Disable moderate weight loss when Severe unexplained weight loss is chosen': {
        priority: 2,
        actions: {
            isChecked: false,
            disabled: true
        },
        description: {
            color: 'secondary',
            show: 'always',
            info: () => 'Severe weight loss/manutrition was already selected',
        },
        conditions: {
            selectedCondition(condition: string) {
                return condition === 'Moderate unexplained wasting/malnutrition not responding to treatment (weight-for-height/ -age 70-79% or muac 11-12 cm)'
            },
            selectedConditions(conditions: Array<string>) {
                return conditions.includes('Severe unexplained wasting or malnutrition not responding to treatment (weight-for-height/ -age <70% or MUAC less than 11cm or oedema)')
            }
        }
    }
}

export const RECOMMENDED_ADULT_STAGING_CONDITIONS: Record<string, GuideLineInterface> = {
    'Enable TB staging condition if client is TB positive': {
        priority: 1,
        actions: {
            isChecked: true
        },
        description: {
            color: 'danger',
            show: "always",
            info: () => 'Client registered Positive in TB Module'
        },
        conditions: {
            tbPositive: (positive: boolean) => positive,
            selectedCondition: (condition: string) => /\bTuberculosis \(PTB or EPTB\)|\bPulmonary tuberculosis/i.test(condition)
        }
    },
    'Enable TB staging condition if client is EPTB positive': {
        priority: 1,
        actions: {
            isChecked: true
        },
        description: {
            color: 'danger',
            show: "always",
            info: () => 'Client registered with EPTB in TB Module'
        },
        conditions: {
            eptbPositive: (positive: boolean) => positive,
            selectedCondition: (condition: string) => /Extrapulmonary tuberculosis/i.test(condition)
        }
    },
    'Adults with a BMI less than 16': {
        priority: 1,
        actions: {
            isChecked: true
        },
        description: {
            color: 'danger',
            show: 'always',
            info: (facts: any) => `Adult has a low BMI of ${facts.bmi}`
        },
        conditions: {
            selectedCondition(condition: string) {
                return condition === 'Severe weight loss >10% and/or BMI <18.5kg/m^2, unexplained'
            },
            bmi: (bmi: number) => bmi < 16
        }
    },
    'Adults whose BMI is between 16 and 18': {
        priority: 3,
        actions: {
            isChecked: true
        },
        description: {
            color: 'warning',
            show: 'onChecked',
            info: (facts: any) => `BMI of ${facts.bmi} is between 16 and 18`,
        },
        conditions: {
            selectedCondition: (condition: string) => condition === 'Moderate weight loss less than or equal to 10 percent, unexplained',
            bmi: (bmi: number) => bmi >= 16.0 && bmi <= 18.5
        }
    },
    "Disable Moderate weight loss if severe weightloss is selected": {
        priority: 2,
        actions: {
            isChecked: false,
            disabled: true
        },
        description: {
            color: 'secondary',
            show: 'always',
            info: () => 'Severe weight loss was already selected',
        },
        conditions: {
            selectedCondition(condition: string) {
                return condition === 'Moderate weight loss less than or equal to 10 percent, unexplained'
            },
            selectedConditions(conditions: Array<string>) {
                return conditions.includes('Severe weight loss >10% and/or BMI <18.5kg/m^2, unexplained')
            }
        }
    }
}

export const CHILD_ART_ELIGIBILITY: Record<string, GuideLineInterface> = {
    'Children under twelve months who tested positive on Rapid test and have presumed severe HIV': {
        concept: 'PRESUMED SEVERE HIV',
        priority: 1,
        conditions: {
            ageInMonths(age: number) {
                return age < 12 
            },
            selectedConditions: (conditions: Array<string>) => {
                return ConceptService.getConceptsByCategory('pshd_condition').some(
                    (c: any) => conditions.includes(c.name)
                )
            },
            testType(testType: string){
                return testType === 'HIV rapid test'
            }
        }
    },
    'Has stage 4 conditions': {
        concept: 'WHO STAGE IV PEDS',
        priority: 2,
        conditions: {
            stage: (stage: number) => stage === 4
        }
    },
    'Has stage 3 conditions': {
        concept: 'WHO STAGE III PEDS',
        priority: 3,
        conditions: {
            stage: (stage: number) => stage === 3,
        }
    },
    "Children under twelve who tested positive via HIV DNA Polymerase Chain Reaction test": {
        concept: 'HIV DNA polymerase chain reaction',
        priority: 4,
        conditions: {
            ageInMonths: (age: number) => age < 12,
            testType: (testType: string) => testType === "HIV DNA polymerase chain reaction",
        }
    },
    "Children who are less than 24 months": {
        concept: 'HIV infected',
        priority: 5,
        conditions: {
            ageInMonths: (age: number) => age < 24
        }
    },
    "Children between 24 and 56 months who have stage 2 or 1 conditions": {
        concept: 'CD4 COUNT LESS THAN OR EQUAL TO 750',
        priority: 6,
        conditions: {
            ageInMonths(age: number) {
                return age >= 24 && age <= 56
            },
            cd4Date: (date: string) => {
                return new Date(date) <= new Date(CD4_COUNT_CUT_OFF_DATE)
            },
            cd4(cd4: number) {
                return cd4 <= 750
            },
            cd4Modifier(modifier: string) {
                return modifier === '<' || modifier === '='
            },
            stage(stage: number) {
                return stage <= 2
            }
        }
    },
    "Children with CD4 count less than 500 and have stage 1 and stage 2 conditions": {
        concept: 'CD4 COUNT LESS THAN OR EQUAL TO 500',
        priority: 7,
        conditions: {
            cd4(cd4: number){
                return cd4 <= 500
            },
            cd4Date: (date: string) => {
                return new Date(date) <= new Date(CD4_COUNT_CUT_OFF_DATE)
            },
            cd4Modifier(modifier: string){
                return modifier === '<' || modifier === '='
            },
            stage(stage: number) {
                return stage <= 2
            }
        }
    },
    "Children who are more than five years old and have cd4 count less than 500": {
        concept: 'CD4 COUNT LESS THAN OR EQUAL TO 500',
        priority: 9,
        conditions: {
            cd4Date: (date: string) => {
                return new Date(date) <= new Date(CD4_COUNT_CUT_OFF_DATE)
            },
            age(age: number) {
                return age > 5
            },
            cd4(cd4: number) {
                return cd4 <= 500
            },
            cd4Modifier(modifier: string) {
                return modifier === '<' || modifier === '='
            }
        }
    },
    "Children over date 2014-04-01 and less than Five years old": {
        concept: 'HIV infected',
        priority: 10,
        conditions: {
            date(date: string) {
                return date >= '2014-04-01'
            },
            age(age: number) {
                return age <= 5
            }
        }
    },
    'Women who are breast feeding': {
        concept: 'BREASTFEEDING',
        priority: 11,
        conditions: {
            gender(gender: string){
                return gender === 'F'
            },
            breastFeeding(answer: string){
                return  answer === 'Yes'
            },
            stage: (stage: number) => stage <= 2
        }
    },
    'Women who are pregnant': {
        concept: 'PATIENT PREGNANT',
        priority: 12,
        conditions: {
            gender(gender: string) {
                return gender === 'F'
            },
            pregnant(answer: string){
                return answer === 'Yes'
            },
            stage(stage: number) {
                return stage <= 2
            },
        }
    },
    "Asymptomatic patient with either stage one or stage two conditions": {
        concept: 'Asymptomatic',
        priority: 13,
        conditions: {
            stage: (stage: number) => stage <= 2
        }
    }
}

export const ADULT_ART_ELIGIBILITY: Record<string, GuideLineInterface> = {
    'Has stage 4 conditions': {
        concept: 'WHO STAGE IV ADULT',
        priority: 1,
        conditions: {
            stage: (stage: number) => stage === 4
        }
    },
    'Has HIV wasting syndrome identified in stage 3': {
        concept: 'WHO STAGE IV ADULT',
        priority: 2,
        conditions: {
            selectedConditions: (conditions: Array<string>) => {
                const severeSymp = ConceptService.getConceptsByCategory('severe_hiv_wasting_syndrome')
                const found = severeSymp.reduce((total, symp) => conditions.includes(symp.name) ? total + 1 : 0, 0)
                return found >= 2
            }
        }
    },
    'Has stage 3 conditions': {
        concept: 'WHO STAGE III ADULT',
        priority: 3,
        conditions: {
            stage: (stage: number) => stage === 3,
        }
    },
    'CD4 less than 350 for adults before 2014': {
        concept: 'cd4 less than or equal to 350',
        priority: 4,
        conditions: {
            cd4Date: (date: string) => {
                return new Date(date) <= new Date(CD4_COUNT_CUT_OFF_DATE)
            },
            cd4(cd4: number) {
                return cd4 <= 350
            },
            cd4Modifier(modifier: string) {
                return modifier === '<' || modifier === '='
            }
        }
    },
    'CD4 less than 250 for adults after 2014': {
        concept: 'cd4 less than or equal to 250',
        priority: 4,
        conditions: {
            cd4Date: (date: string) => {
                return new Date(date) <= new Date(CD4_COUNT_CUT_OFF_DATE)
            },
            cd4(cd4: number) {
                return cd4 <= 250
            },
            cd4Modifier(modifier: string) {
                return modifier === '<' || modifier === '='
            }
        }
    },
    'CD4 less than 350 for adults after 2014': {
        concept: 'cd4 less than or equal to 350',
        priority: 5,
        conditions: {
            cd4Date: (date: string) => {
                return new Date(date) <= new Date(CD4_COUNT_CUT_OFF_DATE)
            },
            cd4(cd4: number) {
                return cd4 <= 350
            },
            cd4Modifier(modifier: string) {
                return modifier === '<' || modifier === '='
            }
        }
    },
    'CD4 less than 500 for adults after 2014': {
        concept: 'cd4 less than or equal to 500',
        priority: 6,
        conditions: {
            cd4Date: (date: string) => {
                return new Date(date) <= new Date(CD4_COUNT_CUT_OFF_DATE)
            },
            cd4(cd4: number){
                return cd4 <= 500
            },
            cd4Modifier(modifier: string) {
                return modifier === '<' || modifier === '='
            }
        }
    },
    'Women who are breast feeding': {
        concept: 'BREASTFEEDING',
        priority: 8,
        conditions: {
            gender(gender: string){
                return gender === 'F'
            },
            breastFeeding(answer: string){
                return  answer === 'Yes'
            },
            stage: (stage: number) => stage <= 2
        }
    },
    'Women who are pregnant': {
        concept: 'PATIENT PREGNANT',
        priority: 7,
        conditions: {
            gender(gender: string) {
                return gender === 'F'
            },
            pregnant(answer: string){
                return answer === 'Yes'
            },
            stage(stage: number) {
                return stage <= 2
            },
        }
    },
    "Asymptomatic patient with either stage one or stage two conditions": {
        concept: 'Asymptomatic',
        priority: 9,
        conditions: {
            stage: (stage: number) => stage <= 2,
        }
    }
}
