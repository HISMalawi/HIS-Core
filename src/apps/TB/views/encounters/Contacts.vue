<template>
    <ion-page>
      <his-standard-form 
        :cancelDestinationPath="patientDashboardUrl" 
        :onFinishAction="onFinish"
        :fields="fields"
        :skipSummary="true" />
    </ion-page>
  </template>
  
<script lang="ts" setup>
import { PatientRegistrationService } from '@/services/patient_registration_service';
import { IonPage } from '@ionic/vue';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import useEncounter from "@/composables/useEncounter";
import PersonFieldHelper from '@/utils/HisFormHelpers/PersonFieldHelper';
import { generateDateFields } from '@/utils/HisFormHelpers/MultiFieldDateHelper';
import Validation from '@/components/Forms/validations/StandardValidations';
import router from '@/router';
import { RelationsService } from '@/services/relations_service';
import { TbRelations } from '../../meta/constants';
import { Patientservice } from '@/services/patient_service';
import { nextTask } from '@/utils/WorkflowTaskHelper';
import { ref } from 'vue'
import popVoidReason from '@/utils/ActionSheetHelpers/VoidReason';
import dayjs from 'dayjs';

const fields = ref<Field[]>([]);
const patientData = ref<Patientservice>()

function calculateAge(date: string) {
    const now = dayjs();
    const birthDate = dayjs(date)
    const years = now.diff(birthDate, 'year');
    const months = now.diff(birthDate.add(years, 'year'), 'month');
    const days = now.diff(birthDate.add(years, 'year').add(months, 'month'), 'day');
    
    if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''} old`;
    } else if (months > 0) {
        return `${months} month${months > 1 ? 's' : ''} old`;
    } else {
        return `${days} day${days > 1 ? 's' : ''} old`;
    }
}

const { patientDashboardUrl, patientId } = useEncounter((providerId, patientId, patient) => {
    patientData.value = patient
    const relationshipsField = () => {
        let context: any = {}
        let contacts: any = []
        return {
            id: "contacts",
            helpText: "Contacts",
            type: FieldType.TT_TABLE_VIEWER,
            onload: (c: any) => context = c,
            init: async () => {
                contacts = await patient.getGuardian()
                return true
            },
            options: () => {
                const rows = contacts.map((r: any) => {
                    return [
                        `${r.relation.names[0].given_name} ${r.relation.names[0].family_name}`,
                        r.relation.gender === 'M' ? 'Male' : 'Female',
                        calculateAge(r.relation.birthdate),
                        {
                            name: "Screen",
                            type: "button",
                            action: () => nextTask(r.relation.person_id, router)
                        },
                        {
                            id: r.relationship_id,
                            name: "Void",
                            type: "button",
                            color: "danger",
                            action: () =>  popVoidReason(async (reason: string) => {
                                await RelationsService.voidRelation(patientId, r.relationship_id, reason)
                                context.rows = context.rows.filter((row: any) => row[row.length-1].id != r.relationship_id)
                            })
                        }
                    ]
                })
                return [{
                    label: "", 
                    value: "", 
                    other: {
                        columns: ["Name", "Gender", "Age", "Screen", "Void"],
                        rows
                    }
                }]
            },
            config: {
                overrideDefaultFooterBtns: {
                    nextBtn: {
                        name: "Add contact"
                    }
                }
            }
        }
    }
    fields.value = [
        relationshipsField(),
        PersonFieldHelper.getGivenNameField(),
        PersonFieldHelper.getFamilyNameField(),
        PersonFieldHelper.getGenderField(),
        ...generateDateFields(PersonFieldHelper.getDobConfig()),
        PersonFieldHelper.getCellNumberField(),
        {
            id: "action",
            helpText: "Next step:",
            type: FieldType.TT_SELECT,
            requireNext: false,
            validation: (v: Option) => Validation.required(v),
            options: () => [
                { 
                    label: "Add another contact", 
                    value: 1,
                    other: {
                        action: () => location.reload()
                    }
                },
                { 
                    label: "Proceed to diagnosis", 
                    value: 2,
                    other: {
                        action: (personID: number) => nextTask(personID, router)
                    }
                },
                { 
                    label: "Go to dashboard", 
                    value: 3,
                    other: {
                        action: () => router.push(patientDashboardUrl.value)
                    }
                }
            ]
        }
    ]
});

function getContactAddress() {
    const currentSuspect = patientData.value!.patient
    return {
        'home_district': currentSuspect.person.addresses[0].address2,
        'current_district': currentSuspect.person.addresses[0].state_province,
        'current_village': currentSuspect.person.addresses[0].city_village,
        'current_traditional_authority': currentSuspect.person.addresses[0].township_division,
        'home_village': currentSuspect.person.addresses[0].neighborhood_cell,
        'home_traditional_authority': currentSuspect.person.addresses[0].county_district
    }
}

async function onFinish(f: any, cdata: any) {
    const person = new PatientRegistrationService()
    const data = {...getContactAddress(), ...PersonFieldHelper.resolvePerson(cdata)}
    await person.createPerson(data)
    await person.createPatient()
    await RelationsService.createRelation(patientId.value, person.personId, TbRelations.TB_CONTACT)
    if (typeof f.action?.other?.action === 'function') f.action.other.action(person.personId)
}
</script>
  