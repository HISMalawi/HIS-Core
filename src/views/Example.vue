<template>
  <his-standard-form 
    :fields="fields" 
    :activeField="activeField" 
    @onFinish="onFinish"> 
  </his-standard-form>
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { Field, Option } from "@/components/Forms/FieldInterface"
import { FieldType } from "@/components/Forms/BaseFormElements"
import HisStandardForm from "@/components/Forms/TouchScreenForm.vue";
import MonthOptions from "@/components/FormElements/Presets/MonthOptions"
import { findIndex } from "lodash"

export default defineComponent({
  components: { HisStandardForm },
  data: () => ({
    activeField: '',
    fields: [] as Array<Field>
  }),
  created() {
    this.fields = this.getFields()
  },
  methods: {
    onFinish(formData: any) {
      console.log(formData)
    },
    getFields(): Array<Field> {
      return [
        {
          id: 'dispense',
          helpText: 'Dispensation',
          type: FieldType.TT_DISPENSATION_INPUT,
          config: {
            toolbarInfo: [
              { label: 'Name', value: 'Test patient' },
              { label: 'Gender', value: 'Female' },
              { label: 'Date Of Birth', value: '12/May/1994' }
            ]
          },
          options: () => [
            {
              label: 'TDF300/3TC300/DTG50',
              value: 0,
              other: {
                'amounted_needed': 30
              }
            },
            {
              label: 'Cotrimoxazole (960mg)',
              value: 0,
              other: {
                'amounted_needed': 30
              }
            },
            {
              label: 'Rifapentine (150mg)',
              value: 0,
              other: {
                'amounted_needed': 30
              }
            },
            {
              label: 'INH or H (Isoniazid 100mg tablet)',
              value: 0,
              other: {
                'amounted_needed': 30
              }
            }
          ]
        },
        {
          id: 'hello_world',
          helpText: 'BeforeNext',
          type: FieldType.TT_TEXT,
          beforeNext: () => {
            const confirmation = confirm('Do you want to continue')
            return confirmation
          }
        },
        {
          id: "onvalue_hooks_multiple_select",
          helpText: "Dynamically toggling values",
          type: FieldType.TT_MULTIPLE_SELECT,
          config: {
            showKeyboard: false
          },
          onValueUpdate: (listData: Array<Option>, value: Option) => {
            if (value.isChecked && value.label === 'None') {
              return listData.map(i => {
                if (i.label != 'None') 
                  i.isChecked = false
                return i
              })
            } else if (value.label != 'None' && value.isChecked) {
              const noneIndex = findIndex(listData, {label: 'None'})
              listData[noneIndex].isChecked = false
            }

            if (value.isChecked && value.label === 'Disable') {
              const disableIndex = findIndex(listData, {label: 'Disable'})
              listData[disableIndex].disabled = true
            }
            if (value.isChecked && value.label === 'Enable') {
              const disableIndex = findIndex(listData, {label: 'Disable'})
              listData[disableIndex].disabled = false
            }
            return listData
          },
          validation(value: any): null | Array<string> {
            return !value ? ["Value is required"] : null;
          },
          options:()=> ([
            {
              label: "Foo",
              value: "Foo",
              description: {
                color: 'danger',
                text: 'Optional description'
              }
            },
            {
              label: "This is prechecked by default",
              value: "pre_checked",
            },
            {
              label: "Bar",
              value: "Bar",
              description: {
                color: 'warning',
                text: 'This has discription of different color'
              }
            },
            {
              label: "Enable",
              value: "enabled",
              description: {
                color: 'secondary',
                text: 'I only appear when checked',
                show: 'onChecked'
              }
            },
            {
              label: "Disable",
              value: "disable",
            },
            {
              label: "None",
              value: "None",
            }
          ]),
        },
        {
          id: "name_field",
          helpText: "What is your name",
          type: FieldType.TT_TEXT,
          validation(value: any): null | Array<string> {
            return !value ? ["Value is required"] : null;
          }
        },
        {
          id: "custom_btn",
          helpText: "Show custom button",
          type: FieldType.TT_TEXT,
          config: {
            footerBtns: [
              {
                name: 'Void',
                color: 'danger',
                size: 'large',
                visible: false,
                slot: '',
                visibleOnStateChange: (state: any) => {
                  return state.index === 1
                },
                onClick: () => {
                  alert('Record has been voided!')
                }
              },
              {
                name: 'Custom Something',
                color: 'primary',
                size: 'large',
                visible: false,
                slot: 'end',
                visibleOnStateChange: (state: any) => {
                  return state.index === 1
                },
                onClick: () => {
                  alert('YaY! Custom Button Clicked')
                }
              },
            ]
          }
        },
        {
          id: "patient_chart",
          helpText: "Patient Chart",
          type: FieldType.TT_WEIGHT_CHART,
          options: () => ([{
            label: 'Patient weight',
            value: 54,
            other: {
              labels: ['10 Jan', '11 June', '8 Aug'],
              values: [65, 38, 89, 57]
            }
          }])
        },
        {
          id: 'hide_default_btns',
          helpText: 'Default buttons have been hidden',
          type: FieldType.TT_TEXT,
          config: {
            hiddenFooterBtns: [
              'Clear',
              'Cancel'
            ]
          }
        },
        {
          id: 'skip_next_field',
          helpText: 'Skip Next Field with custom button',
          type: FieldType.TT_TEXT,
          config: {
            footerBtns: [
              {
                name: 'Skip Dates',
                color: 'light',
                size: 'large',
                visible: false,
                slot: 'end',
                visibleOnStateChange: (state: any) => {
                  return state.index === 3
                },
                onClick: () => {
                  this.activeField = 'multiple_select'
                }
              }
            ]
          }
        },
        {
          id: "year",
          helpText: "Year of birth",
          type: FieldType.TT_NUMBER
        },
        {
          id: "month",
          helpText: "Month of birth",
          type: FieldType.TT_SELECT,
          requireNext: false,
          options: () => MonthOptions,
          config: {
            showKeyboard: false
          }
        },
        {
          id: "day",
          helpText: "Day of birth",
          type: FieldType.TT_MONTHLY_DAYS
        },
        {
          id: "multiple_select",
          helpText: "Select Multiple values",
          type: FieldType.TT_MULTIPLE_SELECT,
          config: {
            showKeyboard: false
          },
          validation(value: any): null | Array<string> {
            return !value ? ["Value is required"] : null;
          },
          options:()=> ([
            {
              label: "Foo",
              value: "Foo",
              description: {
                color: 'danger',
                text: 'Optional description'
              }
            },
            {
              label: "This is prechecked by default",
              value: "pre_checked",
              isChecked: true
            },
            {
              label: "Bar",
              value: "Bar",
              description: {
                color: 'warning',
                text: 'This has discription of different color'
              }
            },
            {
              label: "Baz",
              value: "Baz",
              description: {
                color: 'secondary',
                text: 'I only appear when checked',
                show: 'onChecked'
              }
            },
            {
              label: "Bar",
              value: "Bar",
            }
          ]),
        },
        {
          id: "conditional_data",
          helpText: "Conditionally display next question",
          type: FieldType.TT_SELECT,
          requireNext: false,
          validation(value: any): null | Array<string>{
            return !value ? ["Value is required"] : null;
          },
          options: ()=> ([
            {
              label: "Show Games",
              value: "Show Games",
            },
            {
              label: "Show Music",
              value: "Show Music",
            },
          ]),
        },
        {
          id: "music_presentation",
          helpText: "Showing Music",
          type: FieldType.TT_SELECT,
          validation(value: any): null | Array<string> {
            return !value ? ["Value is required"] : null;
          },
          condition(formData: any) {
            return formData.conditional_data.value === "Show Music";
          },
          options: ()=> ([
            {
              label: "No Music",
              value: "No Music",
            },
          ]),
        },
        {
          id: "games_presentation",
          helpText: "Showing Games",
          type: FieldType.TT_SELECT,
          validation(value: any): null | Array<string> {
            return !value ? ["Value is required"] : null;
          },
          condition(formData: any) {
            return formData.conditional_data.value === "Show Games";
          },
          options: ()=>([
            {
              label: "No Games",
              value: "No Games",
            },
          ]),
        },
        {
          id: "does_not_require_next",
          helpText: "Click on value to proceed",
          type: FieldType.TT_SELECT,
          requireNext: false,
          validation(value: any): null | Array<string> {
            return !value ? ["Value is required"] : null;
          },
          options: ()=>([
            {
              label: "Duke",
              value: "Duke",
            },
            {
              label: "Dork",
              value: "Dork",
            },
          ]),
        },
        {
          id: "option_params",
          helpText: "Console.log Prop sent via options",
          type: FieldType.TT_SELECT, 
          options: (fdata: any) => {
            console.log(fdata)
            return []
          }
        },
        {
          id: "validated",
          helpText: "Value is Required before next",
          type: FieldType.TT_SELECT,
          validation(value: any): null | Array<string> {
            return !value ? ["Value is required"] : null;
          },
          options: ()=>([
            {
              label: "Fur",
              value: "Fur",
            },
            {
              label: "Fume",
              value: "Fame",
            },
          ]),
        },
      ]
    }
  }
});
</script>
