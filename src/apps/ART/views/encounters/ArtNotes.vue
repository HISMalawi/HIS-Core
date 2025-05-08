<template>
    <his-standard-form 
        :fields="fields" 
        :onFinishAction="onFinish"
        :cancelDestinationPath="cancelDestination">
    </his-standard-form>
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import EncounterMixinVue from "../../../../views/EncounterMixin.vue";
import { Field } from "@/components/Forms/FieldInterface"
import { NotesService } from "@/services/notes_service"
import { Option } from "@/components/Forms/FieldInterface";

export default defineComponent({
    mixins: [EncounterMixinVue],
    components: { HisStandardForm },
    data: () => ({
        service: {} as any,
    }),
    watch: {
        ready: {
            async handler(ready: boolean) {
                if (ready) {
                    this.service = new NotesService(this.patientID, this.providerID);
                    this.fields = [
                        this.notesField()
                    ]
                }
            },
            immediate: true
        },
    },
    methods: {
        async onFinish(_: any, computedData: any) {
            await this.service.createEncounter();
            await this.service.saveObservationList(
                (await this.resolveObs(computedData))
            )
            this.nextTask()
        },
        notesField(): Field {
            return {
                id: 'noted',
                helpText: 'Clinical Notes',
                type: FieldType.TT_NOTE,
                validation: (v: Option) => Validation.required(v),
                computedValue: (v: Option) => {
                    return {
                        obs: this.service.buildValueText('Notes', v.value)
                    }
                }
            }
        }
    }
});
</script>
  