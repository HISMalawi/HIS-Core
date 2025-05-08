<template>
  <div class="main" ref="main">
    <div class="cells ion-padding-bottom">
      <h3>
        <b style="color: #8b4513">Facility: </b>
        <b style="color: #cd853f">{{ facilityName }} ({{ district }})</b>
      </h3>
    </div>
    <div class="rows">
      <div class="cells">
        <input
          type="text"
          name="usename"
          autocomplete="off"
          placeholder="Username"
          id="username"
          ref="username"
          v-model="userInput.username"
          v-on:click="renderKeyBoard($event)"
          class="input-boxes ion-padding"
          :readonly="useVirtualInput"
        />
      </div>
    </div>
    <div class="rows input-rows">
      <div class="cells">
        <ion-input
          style="margin: 0px auto;margin-top: 15px;text-align: left;"
          v-model="userInput.password"
          :type="showPassword ? 'text' : 'password'"
          name="password"
          ref="password"
          id="password"
          v-on:click="renderKeyBoard($event)"
          class="input-boxes ion-padding"
          placeholder="Password"
          :readonly="useVirtualInput"
        > 
          <ion-button v-if="!showPassword && showPasswordButton" @click="onShowPassword" color="light" size="large" slot="end">
            <ion-icon size="large" :icon="eye"></ion-icon>
          </ion-button>
          <ion-button v-if="showPassword && showPasswordButton" @click="showPassword = false" color="light" size="large" slot="end">
            <ion-icon size="large" :icon="eyeOff"></ion-icon>
          </ion-button>
        </ion-input>
      </div>
    </div>
  </div>
  <div id="keyboard" :style="btnStyles"  class="keyboard">
    <span v-bind:key="i" v-for="(k, i) in keyboard">
      <div class="rows">
        <div class="cells" v-bind:key="r" v-for="r in k">
          <button
            v-if="r === 'Next' || r === 'Login'"
            :id="btnCaption"
            class="keyboard-btn login-btn"
            v-on:click="keyPress($event)"
          >
            {{ btnCaption }}
          </button>

          <button
            v-if="r != 'Login' && r != 'Next'"
            :id="Caps.on ? r.toUpperCase() : r.toLowerCase()"
            class="keyboard-btn"
            v-on:click="keyPress($event)"
          >
            {{
              r === "Del." || r === "Caps"
                ? r
                : Caps.on
                ? r.toUpperCase()
                : r.toLowerCase()
            }}
          </button>
        </div>
      </div>
    </span>
  </div>
</template>

<script lang="ts">
import { toastWarning, toastDanger } from "@/utils/Alerts";
import { defineComponent } from 'vue';
import { AuthService, InvalidCredentialsError } from "@/services/auth_service"
import { LOGIN_KEYBOARD, SPECIAL_CHARACTERS_LO } from "@/components/Keyboard/KbLayouts"
import Screentimeout from "@/composables/Screentimeout"
import { MultiStepPopupForm } from "@/utils/PopupKeyboard";
import { FieldType } from "@/components/Forms/BaseFormElements";
import Validation from "@/components/Forms/validations/StandardValidations"
import { Option } from "@/components/Forms/FieldInterface"
import { UserService } from "@/services/user_service";
import useFacility from "@/composables/useFacility";
import passwordValidator from "zxcvbn"
import { IonInput, IonButton, IonIcon }  from "@ionic/vue"
import { eye, eyeOff } from "ionicons/icons"
export default defineComponent({
  components: {
    IonInput, IonButton, IonIcon
  },
  props: {
    useVirtualInput: {
      type: Boolean
    }
  },
  data: function () {
    return {
      eye,
      eyeOff,
      passwordTimeout: null as any,
      showPasswordButtonTimeout: null as any,
      showPassword: false,
      showPasswordButton: false,
      keyboard: LOGIN_KEYBOARD,
      auth: {} as any,
      userInput: {
        type: String,
        username: "",
        password: "",
      },
      focusInput: {
        type: Object,
        value: "",
        id: "",
      },
      display: "none",
      keyboardTop: "",
      btnCaption: "",
      Caps: {
        type: Boolean,
        on: false,
      },
    };
  }, 
  created() {
    this.auth = new AuthService()
    Screentimeout.clearScreenTimeout()
  },
  setup(){
    const { facilityName, district } = useFacility();

    return {
      facilityName,
      district,
    }
  },
  methods: {
    onShowPassword() {
      this.showPassword = true
      this.showPasswordButton = true
      if (this.passwordTimeout) clearTimeout(this.passwordTimeout)
      this.passwordTimeout = setTimeout(() => this.showPassword = false, 10000)
    },
    renderKeyBoard(e: any) {
      this.focusInput = e.currentTarget;
      this.focusInput.id == "password"
        ? (this.btnCaption = "Login")
        : (this.btnCaption = "Next");

      let inputPos = e.currentTarget.getBoundingClientRect().top;
      inputPos = parseInt(inputPos);

      this.keyboardTop = inputPos + 20 + "px;";
      this.display = "table";
      window.scrollTo(0,9999);
    },
    keyPress(e: any) {
      const key = e.currentTarget.id;
      let elem: any;

      try {
        if (key.match(/@#/i)) {
          this.keyboard = SPECIAL_CHARACTERS_LO
        } else if (key.match(/qwerty/i)) {
          this.keyboard = LOGIN_KEYBOARD
        } else if (key.match(/Del/i)) {
          this.focusInput.value = this.focusInput.value.substring(
            0,
            this.focusInput.value.length - 1
          );
        } else if (key.match(/Next/i)) {
          this.display = "none";
          elem = this.$refs.password;
          elem.$el.click();
        } else if (key.match(/Login/i)) {
          this.display = "none";
          this.doLogin();
        } else if (key.match(/Caps/i)) {
          this.Caps.on = this.Caps.on ? false : true;
          this.display = "none";
          if (this.focusInput.id === "username") {
            elem = this.$refs.username;
          } else {
            elem = this.$refs.password;
          }
          elem.click();
        } else if (key.match(/Hide/i)) {
          this.display = "none";
        } else {
          this.focusInput.value += key;
        }

        this.focusInput.id == "username"
          ? (this.userInput.username = this.focusInput.value)
          : (this.userInput.password = this.focusInput.value);
      } catch (x) {
        console.warn('input error')
      }
    },
    doLogin: async function () {
      if (this.showPasswordButtonTimeout) clearTimeout(this.showPasswordButtonTimeout)
      this.showPasswordButton = false
      this.showPassword = false
      if (this.userInput.username && this.userInput.password) {
        this.auth.setUsername(this.userInput.username)
        try {
          if (this.auth.versionLockingIsEnabled()) {
            await this.auth.validateIfCorrectAPIVersion()
          }
          if (!(await this.auth.checkTimeIntegrity())) {
            throw "Local date does not match API date. Please Update your device's date"
          }
          await this.auth.login(this.userInput.password)
          this.auth.startSession()
          const passwordChangeQualifications = await Promise.all([
            this.auth.passwordPolicyEnabled(), 
            this.auth.passwordExpired()
          ])
          const hasWeakPassword= (() => {
              let passwordScore = 0
              const validated = passwordValidator(this.userInput.password);
              passwordScore += validated.score
              if (/^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/i.test(this.userInput.password)) {
                passwordScore += 2
              }
              return passwordScore < 3
            })()
          if (hasWeakPassword || passwordChangeQualifications.every(Boolean)) {
            const toLcase = (val: Option) => `${val.value}`.toLowerCase()
            return MultiStepPopupForm([
              {
                id: 'new_password',
                proxyID: "password",
                helpText: "Change your password",
                type: FieldType.TT_PASSWORD,
                init: () => {
                  setTimeout(() => {
                    if (hasWeakPassword) {
                      toastWarning("Your password is weak, please change it below")
                    } else {
                      toastWarning("Your password has expired, please change it below", 6000)
                    }
                  }, 500);
                  return true
                },
                computedValue: (val: Option) => toLcase(val),
                validation: (val: any) => Validation.validateSeries([
                  () => Validation.required(val),
                  () => Validation.hasLengthRangeOf(val, 4, 15),
                  () => {
                    if (`${this.userInput.password}`.toLowerCase() === toLcase(val)) {
                      return ['New password should not match old password']
                    }
                  }
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
                computedValue: (val: Option) => toLcase(val),
                validation: (val: any, f: any) => Validation.validateSeries([
                  () => Validation.required(val),
                  () => {
                    if (toLcase(f.verify_password) != toLcase(f.new_password))
                      return ['New password does not match current password']
                  }
                ]),
                config: {
                  inputType: 'password'
                }
              }
            ],
            async (_: any, changes: any) => {
              if ((await UserService.updateUser(this.auth.userID, changes))) {
                await this.auth.resetUserPasswordChangeCheck()
                this.$router.push("/select_hc_location");
              } else {
                toastWarning("Unable to update user")
              }
            })
          }
          this.$router.push("/select_hc_location");
        } catch (e) {
          if (e instanceof InvalidCredentialsError) {
            toastWarning("Invalid username or password");
            this.showPasswordButton = true
            this.showPasswordButtonTimeout = setTimeout(() => this.showPasswordButton = false, 30000)
          } else {
            toastDanger(`${e}`, 50000)
          }
        }
      } else {
        toastWarning("Complete form to log in");
      }
    }
  },
  computed: {
    btnStyles(): string {
      return `display: ${this.display}; top: ${this.keyboardTop};`;
    },
  },
});
</script>


<style scoped>
.input-boxes {
  height: 70px;
  /*width: 50%;*/

  border: 1px solid #ccc;
  border-radius: 5px;
  width: 50%;
  font-family: Nimbus Sans L, Arial Narrow, sans-serif;
  font-size: 2.2em;
  background-color: #dcdcdc;
  color: #000;
  padding: 8px;
}

.main {
  width: 100%;
  text-align: center;
  margin-top: 5%;
  display: table;
}

.keyboard {
  z-index: 100;
  text-align: center;
  position: absolute;
  background-color: white;
  width: 100%;
  border: 1px solid rgb(204, 204, 204);
  word-wrap: normal !important;
  margin: 0 auto;
  max-width: 300px;
  left: 0; 
  right: 0;
}

.rows {
  display: table-row;
  line-height: 1px;
}

.cells {
  display: table-cell;
}

.keyboard-btn {
  border: 1px solid #7eb9d0;
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  border-radius: 5px !important;
  font-size: 1.6vw !important;
  font-family: arial, helvetica, sans-serif;
  /* padding: 10px 10px 10px 10px; */
  text-decoration: none;
  display: inline-block;
  text-shadow: -1px -1px 0 rgba(0, 0, 0, 0.3);
  font-weight: 700;
  color: #fff;
  background-color: #a7cfdf;
  background-image: -webkit-gradient(
    linear,
    left top,
    left bottom,
    from(#a7cfdf),
    to(#23538a)
  );
  background-image: -webkit-linear-gradient(top, #a7cfdf, #23538a);
  background-image: -moz-linear-gradient(top, #a7cfdf, #23538a);
  background-image: -ms-linear-gradient(top, #a7cfdf, #23538a);
  background-image: -o-linear-gradient(top, #a7cfdf, #23538a);
  background-image: linear-gradient(to bottom, #a7cfdf, #23538a);
  filter: progid:DXImageTransform.Microsoft.gradient(GradientType=0, startColorstr=#a7cfdf, endColorstr=#23538a);
  max-width: 85px;
  max-height: 85px;
  cursor: pointer;
  /*width: 84px;
  height: 35px; */
  text-align: center;
  margin: 3px;
  width: 8vw;
  height: 8vh;
  /* text-overflow: ellipsis; */
  overflow: hidden;
  white-space: nowrap;

}
@media screen and (max-width: 600px){
    .keyboard-btn {
        font-size: 10px !important;
    }
}
@media screen and (min-width: 1020px){
    .keyboard-btn {
        font-size: 25px !important;
    }
}
.login-btn {
  background-image: -webkit-gradient(
    linear,
    left top,
    left bottom,
    from(green),
    to green
  );
  background-image: -webkit-linear-gradient(top, green, green);
  background-image: -moz-linear-gradient(top, green, green);
  background-image: -ms-linear-gradient(top, green, green);
  background-image: -o-linear-gradient(top, green, green);
  background-image: linear-gradient(to bottom, green, green);
  filter: progid:DXImageTransform.Microsoft.gradient(GradientType=0, startColorstr=green, endColorstr=green);
}

.input-rows {
  line-height: 140px;
}
</style>