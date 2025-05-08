<template>
  <his-standard-form
    :key="formKey"
    :fields="fields" 
    :skipSummary="true"
    :activeField="fieldComponent"
    @onIndex="fieldComponent=''" 
    :onFinishAction="onFinish"/>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field, Option } from "@/components/Forms/FieldInterface"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations"
import { UserService } from "@/services/user_service"
import { PersonService } from "@/services/person_service"
import HisDate from "@/utils/Date"
import { toastWarning, toastSuccess, toastDanger } from "@/utils/Alerts"
import { RecordConflictError } from "@/services/service";
import { isEmpty } from "lodash";
import { find } from "lodash";
import Store from "@/composables/ApiStore"
import { AuthService } from "@/services/auth_service"

export default defineComponent({
  components: { HisStandardForm },
  data: () => ({
    formKey: 0 as number,
    fields: [] as Array<Field>,
    activity: '' as 'edit' | 'add',
    presets: {} as any,
    programs: {} as any,
    userData: {} as any,
    fieldComponent: '' as string,
    isSessionPasswordChange: false as boolean,
    activeField: '' as string,
    form: {} as Record<string, Option> | Record<string, null>
  }),
  watch: {
    '$route': {
        async handler(route: any) {
            if (!route) {
                return
            }
            const { query } = route
            if (['edit', 'add'].includes(query.activity)) {
                this.activity = query.activity
            } else {
                this.activity = 'add'
            }
            /**
             * Jump straight to update the current user's password
             */
            if (query.update_password) {
                this.userData = this.toUserData(
                    (await UserService.getCurrentUser())
                )
                this.isSessionPasswordChange = true
                this.activeField = 'new_password'
                this.fieldComponent = this.activeField
            }
            /**
             * Added this method to remove Apps we don't want to be visible during user creation
             */
            this.programs = this.removeObjectsByApplicationNames(UserService.getAvailableApps(), ["CRVS"])

            this.fields = this.getFields()
        },
        immediate: true,
        deep: true
    }
  },
  methods: {
    async onFinish(_: any, computeValues: any) {
        try {
            switch(this.activity) {
                case 'add':
                    await this.create(computeValues)
                    this.activity = 'edit'
                    break;
                case 'edit':
                    await this.update(computeValues)
                    if (this.isSessionPasswordChange) {
                        const auth = new AuthService()
                        auth.sessionDate = await UserService.getApiDate()
                        await auth.resetUserPasswordChangeCheck()
                        this.$router.push('/')
                    }
                    break;
            }
            Store.invalidate('PROVIDERS')
            this.activeField = 'user_info'
            this.$nextTick(() => this.fieldComponent = this.activeField)
            this.formKey += 1
        } catch (e) {
            if (e instanceof RecordConflictError && !isEmpty(e.errors)) {
                toastWarning(e.errors)
            } else {
                toastDanger(`${e}`)
            }
        }
    },
    removeObjectsByApplicationNames(array: any[], targetApplicationNames: string[]) {
        const newArray = array.filter((obj: { applicationName: string }) => !targetApplicationNames.includes(obj.applicationName));
        return newArray;
    },
    async create(data: any) {
        const { user } = await UserService.createUser(data)
        if (user) {
            return this.userData = this.toUserData(user)
        }
        throw 'Unable to create new user, Possibly the user already exists or incorrect info was entered'
    },
    async update(data: any) {
        const person = await UserService.updateUser(this.userData.id, data)
        if (person) {
            return this.userData = this.toUserData(person)
        }
        throw 'Unable to update user, possibly server error or incorrect information entered'
    },
    getProgramName(id: number) {
        const app = find(this.programs, { programID: id })
        return app ? app.applicationName : ''
    },
    mapToOption(listOptions: Array<string>): Array<Option> {
        return listOptions.map((item: any) => ({ label: item, value: item })) 
    },
    async getRoles() {
        return (await UserService.getAllRoles()).filter((r: any) => {
            try {
                return !this.userData.role.split(',').includes(r.role)
            } catch(e) {
                return true
            }
        }).map((r: any) => ({
            label: r.role,
            value: r.role,
            other: r
        }))
    },
    toUserData(userObj: any) {
        const names = userObj.person.names[0]
        return {
            'id': userObj.user_id,
            'given_name': names.given_name,
            'family_name': names.family_name,
            'username': userObj.username,
            'role': userObj.roles.map((r: any) => r.role),
            'created': HisDate.toStandardHisDisplayFormat(userObj.date_created),
            'status': userObj.deactivated_on ? 'Inactive' : 'Active',
            'programs': userObj.programs.map((p: any) => p['program_id'])
        }
    },
    editConditionCheck(attributes=[] as Array<string>): boolean {
        if (this.activity === 'edit') {
            return attributes.includes(this.activeField)
        }
        return true
    },
    toLcase(val: Option): string {
        return val.value.toString().toLowerCase()
    },
    getFields: function(): Array<Field> {
        return [
            {
                id: 'select_user',
                helpText: "Select Username",
                type: FieldType.TT_SELECT,
                condition: () => this.activity === 'edit' 
                    && UserService.isAdmin(),
                validation: (val: any) => Validation.required(val),
                unload: ({other}: Option) => this.userData = this.toUserData(other),
                options: async () => {
                    const users: any = await UserService.getAllUsers()
                    return users.map((u: any) => ({
                        label: u.username,
                        value: u.user_id,
                        other: u
                    }))
                },
                config: {
                    showKeyboard: true
                }
            },
            {
                id: 'user_info',
                helpText: 'User information',
                type: FieldType.TT_TABLE_VIEWER,
                dynamicHelpText: () => `User: ${this.userData.username} | Added On: ${this.userData.created}`,
                condition: () => this.activity === 'edit' && UserService.isAdmin(),
                options: async (f: any, c: any, table: any) => {
                    const statusRowIndex = 3
                    const columns = ['Attributes', 'Values', 'Actions']
                    const deactivateButton = (status: string) => ({
                        name: status === 'Active' ? 'Deactivate' : 'Activate' ,
                        type: 'button',
                        style: { width: '65%', fontWeight: 'bold' },
                        color: status === 'Active' ? 'danger' : 'success',
                        action: async () => {
                            try {
                                if (status === 'Active') {
                                    await UserService.deactivateUser(this.userData.id)
                                    this.userData.status = 'Inactive'
                                    table.rows[statusRowIndex] = ['Status', 'Inactive', deactivateButton('Inactive')],
                                    toastSuccess('User has been deactivated', 400)
                                }
                                if (status === 'Inactive') {
                                    await UserService.activateUser(this.userData.id)
                                    this.userData.status = 'Active'
                                    table.rows[statusRowIndex] = ['Status', 'Active', deactivateButton('Active')],
                                    toastSuccess('User has been activated', 400)
                                }
                            } catch(e) {
                                toastWarning(`${e}`)
                            }
                        }
                    })
                    const navButton = (name: string, targetField: string) => ({ 
                        name, 
                        type: 'button',
                        color: 'light',
                        style: {
                            fontWeight: 'bold',
                            width: '65%'
                        },
                        action: () => {
                            this.activeField = targetField
                            this.fieldComponent = this.activeField
                        }
                    })
                    const rowBtns = [navButton('Add/Append Role', 'roles')]
                    if (this.userData.role.length > 1) {
                        rowBtns.push(navButton('Remove Role', 'remove_roles'))
                    }
                    const rows = [
                        ['<b>Name</b>', `${this.userData.given_name} ${this.userData.family_name}`, navButton('Edit Name', 'given_name'), ''],
                        ['<b>Password</b>', '*******', navButton('Change password', 'new_password'), ''],
                        ['<b>Role</b>', this.userData.role.join('<br/>'), ...rowBtns],
                        ['<b>Status</b>', this.userData.status,  deactivateButton(this.userData.status), ''],
                        ['<b>Programs</b>', this.userData.programs.map((p: number) => this.getProgramName(p)).join('<br/>'),  
                            navButton('Edit Program', 'programs'), ''],
                    ]
                    return [{
                        label: '',
                        value: '',
                        other: { columns, rows }
                    }]
                },
                config: {
                    hiddenFooterBtns: [
                        'Clear',
                    ],
                    overrideDefaultFooterBtns: {
                        nextBtn: {
                            name: 'Finish',
                            onClick: () => this.$router.back()
                        }
                    }
                }
            },
            {
                id: 'given_name',
                helpText: 'First name',
                type: FieldType.TT_TEXT,
                computedValue: (val: Option) => val.value,
                defaultValue: () => this.userData.given_name,
                condition: () => this.editConditionCheck(['given_name']) && UserService.isAdmin(),
                validation: (val: any) => Validation.isName(val),
                options: async (form: any) => {
                    if (!form.given_name || form.given_name.value === null) return []

                    const names = await PersonService.searchGivenName(form.given_name.value)
                    return this.mapToOption(names)
                }
            },
            {
                id: 'family_name',
                helpText: "Last name",
                type: FieldType.TT_TEXT,
                computedValue: (val: Option) => val.value,
                defaultValue: () => this.userData.family_name,
                validation: (val: any) => Validation.isName(val),
                condition: () => this.editConditionCheck(['given_name']) && UserService.isAdmin(),
                options: async (form: any) => {
                    if (!form.family_name || form.family_name.value === null) return []

                    const names = await PersonService.searchFamilyName(form.family_name.value)
                    return this.mapToOption(names)
                }
            },
            {
                id: 'roles',
                helpText: "Role",
                type: FieldType.TT_SELECT,
                computedValue: (val: Option) => [val.value],
                condition: () => this.editConditionCheck(['roles']) && UserService.isAdmin(),
                validation: (val: any) => Validation.required(val),
                options: () => this.getRoles(),
                config: {
                    showKeyboard: true
                }
            },
            {
                id: 'remove_roles',
                helpText: "Remove Roles",
                proxyID: 'roles',
                type: FieldType.TT_SELECT,
                validation: (v: Option) => Validation.required(v),
                condition: () => this.editConditionCheck(['remove_roles']) && UserService.isAdmin() && this.activity === 'edit',
                computedValue: (v: Option) => this.userData.role.filter((i: string) => i != v.label),
                options: () => this.mapToOption(this.userData.role),
                config: {
                    showKeyboard: true
                }
            },
            {
                id: 'must_append_roles',
                helpText: "Would you like to append role?",
                type: FieldType.TT_SELECT,
                computedValue: (val: Option) => val.label === 'Yes' ? true : false,
                condition: () => this.activity === 'edit' 
                    && this.editConditionCheck(['roles']) 
                    && UserService.isAdmin(),
                defaultComputedOutput: () => false,
                validation: (val: any) => Validation.required(val),
                    options: () => [
                    {
                        label: 'Yes', value: 'true'
                    },
                    {
                        label: 'No', value: 'false'
                    }
                ]
            },
            {
                id: 'programs',
                helpText: "Select Apps",
                type: FieldType.TT_MULTIPLE_SELECT,
                condition: () => UserService.isAdmin() && this.editConditionCheck(['programs']),
                validation: (val: Option[]) => Validation.required(val),
                computedValue: (val: Option[]) => val.map((i: Option) => i.value),
                options: () => {
                    return this.programs.map((program: any) => {
                        let isChecked = false
                        if (this.activity === 'edit') {
                            isChecked = this.userData.programs.includes(program.programID)
                        }
                        return {
                            label: program.applicationName,
                            value: program.programID,
                            isChecked: isChecked
                        }
                    })
                },
            },
            {
                id: 'username',
                helpText: "Username",
                type: FieldType.TT_TEXT,
                condition: () => this.editConditionCheck(['nothing to see here']) 
                    && UserService.isAdmin(),
                computedValue: (val: Option) => this.toLcase(val),
                validation: (val: any) => Validation.validateSeries([
                    () => Validation.required(val),
                    () => Validation.hasLengthRangeOf(val, 4, 15)
                ]),
                config: {
                    casing: 'lowercase'
                },
            },
            {
                id: 'new_password',
                proxyID: "password",
                helpText: "New Password",
                type: FieldType.TT_PASSWORD,
                computedValue: (val: Option) => this.toLcase(val),
                condition: () => this.editConditionCheck(['new_password']),
                validation: (val: any) => Validation.validateSeries([
                    () => Validation.required(val)
                ]),
                config: {
                    inputType: 'password'
                }
            },
            {
                id: 'verify_password',
                proxyID: "password",
                helpText: "Confirm Password",
                type: FieldType.TT_PASSWORD,
                computedValue: (val: Option) => this.toLcase(val),
                condition: () => this.editConditionCheck(['new_password']),
                validation: (val: any, f: any) => Validation.validateSeries([
                    () => Validation.required(val),
                    () => {
                        if (this.toLcase(f.verify_password) != this.toLcase(f.new_password))
                            return ['New password does not match current password']
                    }
                ]),
                config: {
                    inputType: 'password'
                }
            }
        ]
    }
  }
})
</script>
