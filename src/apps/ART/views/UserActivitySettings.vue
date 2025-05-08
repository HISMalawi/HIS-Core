<template>
    <ion-page> 
        <his-standard-form
            :fields="fields"
            :onFinishAction="onFinish"
            :skipSummary="true"/>
    </ion-page>
</template>
<script lang="ts">
import HisApp from "@/apps/app_lib"
import { defineComponent } from 'vue'
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations"
import { Option } from '@/components/Forms/FieldInterface';
import { IonPage } from "@ionic/vue"
import { UserService } from "@/services/user_service"
import { toastDanger } from "@/utils/Alerts";
import Store from "@/composables/ApiStore"

export default defineComponent({
	components: { HisStandardForm, IonPage },
	data: () => ({
		fields: [] as any
	}),
	created() {
		this.fields = [
            this.selectUser(),
            this.selectUserActivity(),
            this.limitUserSelection()
		]
	},
	methods: {
		onFinish(_: any, data: Record<string, any>) {
            Store.invalidate('CAN_EDIT_ACTIVITIES')
            Store.invalidate('ART_USER_SELECTED_ACTIVITIES')
            const req = Object.values(data).map(
                (prop) => UserService.postJson('user_properties', prop)
            )
            Promise.all(req)
                .then(() => this.$router.back())
                .catch(() => toastDanger("Unable to update user activities"))
		},
        selectUser() {
            let users: any = []
            return {
                id: 'user_id',
                helpText: "Select Username",
                type: FieldType.TT_SELECT,
                validation: (val: any) => Validation.required(val),
                init: async () => {
                    users = await UserService.getAllUsers()
                    return true
                },
                options: () => {
                    return users.map((u: any) => ({
                        label: u.username,
                        value: u.user_id,
                        other: u
                    }))
                },
                config: {
                    showKeyboard: true
                }
            }
        },
        selectUserActivity() {
            const activities: any = {}
            const programActivities = HisApp?.getActiveApp()?.primaryPatientActivites||[]
            return {
                id: "activities",
                helpText: "Preset user activities",
                type: FieldType.TT_MULTIPLE_SELECT,
                computedValue: (v: Option[], f: any) => {
                    return {
                        user_id: f.user_id.value,
                        property: 'activities',
                        property_value: v.map((option) => option.value).join(',')
                    }
                },
                validation: (v: Option[]) => Validation.required(v),
                options: async (f: any) => {
                    if (!activities[f.user_id.value]) {
                        try {
                            activities[f.user_id.value] = (await UserService.getJson('user_properties', { 
                                user_id: f.user_id.value,
                                property: 'activities' 
                            })).property_value
                        } catch (e) {
                            console.warn(e)
                        }
                    }
                    return programActivities.map((activity) => {
                        const value = activity.workflowID || activity.name
                        return {
                            value,
                            label: `${activity.name}`.toUpperCase(),
                            isChecked: `${activities[f.user_id.value]}`
                                .split(',')
                                .some((i) => i.toLowerCase() === value.toLowerCase()),
                            disabled: typeof activity.availableOnActivitySelection === 'boolean' 
                                ? !activity.availableOnActivitySelection 
                                : false
                        }
                    })
                }
            }
        },
        limitUserSelection() {
            return {
                id: "lock_user_to_art_activities",
                helpText: "Can user modify activities?",
                type: FieldType.TT_SELECT,
                computedValue: (v: Option, f: any) => {
                    return {
                        user_id: f.user_id.value,
                        property: 'lock_user_to_art_activities',
                        property_value: v.value
                    }
                },
                defaultValue: async (f: any) => {
                    try {
                        return (await UserService.getJson('user_properties', {
                            user_id: f.user_id.value,
                            property: 'lock_user_to_art_activities'
                        })).property_value
                    } catch (e) {
                        console.log(e)
                    }
                },
                validation: (v: Option) => Validation.required(v),
                options: () => {
                    return [
                        { label: "Yes", value: "Yes" },
                        { label: "No", value: "No" }
                    ]
                }
            }
        }
	}
})
</script>
