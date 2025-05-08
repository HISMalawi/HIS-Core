# About 
Contains utility functions and templates for rendering and printing

# Creating a label component
```javascript
<template>
    <print-label :onStartPrinting="printingFunction">
        <div>
            <h1>Hello World!!!</h1>
        </div>
    </print-label>
</template>
```

```javascript
import PrintLabel from "@/components/LBL/PrintLabel.vue"
/**
 * All label components must define an onFinish prop that should be
 * Executed when printing process is complete
 */
const props = defineProps({
    onFinish: {
        type: Object as PropType<() => void>,
        required: true
    }
})

/***
 * This function needs to be passed to the PrintLabel component to trigger 
 * Printing process. It's required to return either a true or force
 */
function printingFunction() {
    // Put your data generation logic here
    props.onFinish()
    return true
}
```

# Calling printing functions
```javascript
import { printLabel } from "@/components/LBL/labelUtils"
import PatientRegistration from "@/views/labels/PatientRegistrationLbl.vue"

printLabel(PatientRegistration, { patientID: 1 })
```