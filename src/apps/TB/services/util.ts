import { modalController } from "@ionic/core";
import { Field } from "../../../components/Forms/FieldInterface";
import { MultiStepPopupForm } from "../../../utils/PopupKeyboard";
import CONCEPT_IDS from "../meta/concepts"
import { DRUG_NAMES } from "../meta/drug"
import { FieldType } from "@/components/Forms/BaseFormElements";
import { Option } from "@/components/Forms/FieldInterface";
import Validation from "@/components/Forms/validations/StandardValidations";

export function getConceptID(name: string) {
    return CONCEPT_IDS[name]
}

export function getConceptNameById(concept: any) {    
    return Object.keys(CONCEPT_IDS).find(key => CONCEPT_IDS[key] === concept);
}

export function getDrugConceptID(name: string) {
    return DRUG_NAMES[name]
}

export function configureTbReport(params: Field[], callback: any) {
    return MultiStepPopupForm([
        {
            id: "year",
            helpText: "Year",
            type: FieldType.TT_NUMBER,
            validation: (val: Option) => Validation.required(val),
            computedValue: (v: Option) => v.value,
        },
        {
            id: "quarter",
            helpText: "Quarter",
            type: FieldType.TT_SELECT,
            requireNext: false,
            options: () => [
              { label: "First", value: 1 },
              { label: "Second", value: 2 },
              { label: "Third", value: 3 },
              { label: "Fourth", value: 4 },
            ],
            validation: (val: Option) => Validation.required(val),
            computedValue: (v: Option) => v.value
        },
        ...params
    ], (f: any) => {
        if (typeof callback === 'function') {
            callback(f)
            modalController.dismiss()
        }
    })
}