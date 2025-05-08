<template>
  <his-standard-form
    cancelDestinationPath="/login"
    :fields="fields"
    :onFinishAction="onSubmit"
    skip-summary
  />
</template>

<script lang="ts" setup>
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import { Field, Option } from "@/components/Forms/FieldInterface";
import { FieldType } from "@/components/Forms/BaseFormElements";
import { AuthService } from "@/services/auth_service";
import { ref } from "vue";
import { UserService } from "@/services/user_service";
import { useRouter } from "vue-router";

const auth = new AuthService();
const isAuthorized = ref(false);
const router = useRouter();

const fields: Array<Field> = [
  {
    id: "code",
    helpText: "Verification Code (Contact HelpDesk if you don't have one)",
    type: FieldType.TT_BARCODE,
    validation: Validation.required,
    onValue: async (code: string) => {
      isAuthorized.value = await auth.validateResetPasswordToken(code.replace(/-/g, ""));
      return isAuthorized.value;
    },
    config: {
      hiddenFooterBtns: [
        "Next",
        "Clear"
      ]
    }
  },
  {
    id: "new_password",
    proxyID: "password",
    helpText: "New Password",
    type: FieldType.TT_PASSWORD,
    condition: () => isAuthorized.value,
    validation: (password: any) => Validation.required(password),
    computedValue: (password: Option) => `${password.value}`.toLowerCase(),
  },
  {
    id: "verify_password",
    proxyID: "password",
    helpText: "Confirm Password",
    type: FieldType.TT_PASSWORD,
    condition: () => isAuthorized.value,
    validation: (confirmPassword: any, form: any) => Validation.validateSeries([
      Validation.required,
      () => {
        if (confirmPassword !== form.password.value) {
          return ["Passwords do not match"];
        }
        return null;
      }
    ]),
    computedValue: (password: Option) => `${password.value}`.toLowerCase(),
  },
]

async function onSubmit(_: any, changes: any) {
  if(await UserService.updateUser(auth.userID, changes)) {
    await auth.resetUserPasswordChangeCheck();
    router.push("/login");
  }
}

</script>
