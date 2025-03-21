<script setup lang="ts">
definePageMeta({
  layout: "auth-layout",
});

import { object, string } from "zod";
import { useField, useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import hutao from "@/assets/images/hutao.png";
import { useAuthStore } from "~/store/auth";
import { useToast } from "@/components/ui/toast/use-toast";
import { ref, computed } from "vue";

const authStore = useAuthStore();
const { toast, dismiss } = useToast();
const isSubmitted = ref(false);
const rememberMe = ref(false);
const selectedCountry = ref("");

const validationSchema = toTypedSchema(
  object({
    // Username, email, password, confirm password
    username: string().min(1, { message: "Username is required" }),
    phone: string()
      .min(1, { message: "Phone number is required" })
      .refine((val) => val.startsWith("+") && val.length >= 10, {
        message: "Invalid phone number format",
      }),
    email: string().min(1, { message: "Email is required" }).email({
      message: "Invalid email format",
    }),
    // Password i need at least 8 characters, one uppercase, one lowercase, one number
    password: string().min(8, { message: "Password must be 8 characters" }),
    confirmPassword: string()
      .min(1, { message: "Confirm password is required" })
      .refine((val) => val === password.value, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }),
  })
);

const toggleRememberMe = () => {
  rememberMe.value = !rememberMe.value;

  console.log(rememberMe.value);

  if (rememberMe.value) {
    toast({
      variant: "default",
      description: "Remember me is enabled. Need to login every 30 days",
    });
  }
};

const {
  handleSubmit,
  meta: formMeta,
  errors,
  resetForm,
} = useForm({
  validationSchema,
});

const { value: username } = useField("username");
const { value: phone, errors: phoneErrors } = useField("phone");
const { value: email } = useField("email");
const { value: password } = useField("password");
const { value: confirmPassword } = useField("confirmPassword");

// Add this method to handle phone input
const onPhoneInput = (formattedNumber, phoneObject) => {
  if (phoneObject && phoneObject.number) {
    phone.value = phoneObject.number.international;
  }
};

const onCountryChanged = (country) => {
  const { name } = country;
  selectedCountry.value = name;
};

const phoneErrorMessage = computed(() => {
  if (!phoneErrors.value) return "";
  return Array.isArray(phoneErrors.value)
    ? phoneErrors.value[0]
    : phoneErrors.value;
});

const submitForm = handleSubmit(async () => {
  isSubmitted.value = true;

  const body = {
    username: username.value,
    phone: phone.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
    country: selectedCountry.value,
  };

  try {
    await authStore.signup(body);
  } catch (error) {
    toast({
      variant: "destructive",
      description: (error as Error).message,
    });

    setTimeout(() => {
      dismiss();
    }, 5000);
  }

  resetForm();
  isSubmitted.value = false;
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen py-8">
    <div
      class="justify-self-center relative max-w-[450px] mx-auto lg:w-[400px] lg:px-0 lg:py-0"
      :class="{'w-[calc(100%-2.5rem)] backdrop-filter px-5 py-5 rounded-lg': true, 'lg:backdrop-filter-none lg:bg-transparent lg:border-0': true}"
    >
      <img
        :src="hutao"
        alt="hutao-image"
        class="mx-auto rounded-full bottom-[-25px] w-[200px] h-[200px] object-cover"
      />
      <form class="">
        <div class="text-white lg:text-black lg:text-center">
          <h2 class="font-extrabold header-font">Welcome here !</h2>
          <p class="mt-1 text-sm">There's lots of promotions awaits you.</p>

          <div class="mt-5">
            <!-- Username, Email, Password, Confirm Password -->
            <div class="flex gap-2 flex-col">
              <label for="username" class="text-left text-sm font-medium"
                >Username</label
              >
              <input
                id="username"
                type="text"
                :placeholder="errors.username ? errors.username : 'Username'"
                class="w-full text-black placeholder-gray-500 py-[0.65rem] px-4 text-[13px] border-[1px] border-border-color outline-none rounded-sm mb-3"
                :class="{
                  'placeholder-red-700': errors.username,
                  'placeholder-gray-500': !errors.username,
                }"
                v-model="username"
              />
            </div>

            <div class="flex gap-2 flex-col">
              <label for="phone" class="text-left text-sm font-medium"
                >Phone Number</label
              >
              <!-- Phone Number -->
              <vue-tel-input
                v-model="phone"
                @input="onPhoneInput"
                @country-changed="onCountryChanged"
                :inputOptions="{
                  required: true,
                  placeholder:
                    (phone || formMeta.touched) && phoneErrorMessage
                      ? phoneErrorMessage
                      : 'Phone number is required',
                }"
                :validCharactersOnly="true"
                mode="international"
                class="w-full text-black bg-white py-[0.65rem] text-[13px] border-[1px] border-border-color outline-none rounded-sm mb-3"
                :class="{
                  'border-red-500':
                    (phone || formMeta.touched) && phoneErrorMessage,
                }"
              ></vue-tel-input>

              <p
                v-if="(phone || formMeta.touched) && phoneErrorMessage"
                class="text-red-500 text-xs font-medium -mt-2 mb-4"
              >
                {{ phoneErrorMessage }}
              </p>
            </div>

            <div class="flex gap-2 flex-col">
              <label for="email" class="text-sm font-medium text-left"
                >Email</label
              >
              <input
                id="email"
                type="text"
                :placeholder="errors.email ? errors.email : 'Email'"
                class="w-full text-black placeholder-gray-500 py-[0.65rem] px-4 text-[13px] border-[1px] border-border-color outline-none rounded-sm mb-3"
                :class="{
                  'placeholder-red-700': errors.email,
                  'placeholder-gray-500': !errors.email,
                }"
                v-model="email"
              />
            </div>
            <div class="flex gap-2 flex-col">
              <label for="password" class="text-sm font-medium text-left"
                >Password</label
              >
              <input
                id="password"
                type="password"
                :placeholder="errors.password ? errors.password : 'Password'"
                class="w-full placeholder-gray-500 py-[0.65rem] px-4 text-[13px] text-black border-[1px] border-border-color outline-none rounded-sm mb-3"
                :class="{
                  'placeholder-red-700': errors.password,
                  'placeholder-gray-500': !errors.password,
                }"
                v-model="password"
              />
            </div>
            <div class="flex gap-2 flex-col">
              <label for="confirmPassword" class="text-sm font-medium text-left"
                >Confirm Password</label
              >
              <input
                id="confirmPassword"
                type="password"
                :placeholder="
                  errors.confirmPassword
                    ? errors.confirmPassword
                    : 'Confirm Password'
                "
                class="w-full placeholder-gray-500 py-[0.65rem] px-4 text-[13px] text-black border-[1px] border-border-color outline-none rounded-sm mb-3"
                :class="{
                  'placeholder-red-700': errors.confirmPassword,
                  'placeholder-gray-500': !errors.confirmPassword,
                }"
                v-model="confirmPassword"
              />
            </div>

            <!-- Remember me and forgot password -->
            <div class="flex items-center justify-between mt-5 mb-3">
              <div class="flex items-center gap-2">
                <Checkbox @click="toggleRememberMe" id="remember" />
                <label
                  for="remember"
                  class="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
              <NuxtLink
                to="/forgot-password"
                class="text-xs font-medium leading-none"
                >Forgot password?</NuxtLink
              >
            </div>

            <Button
              @click="submitForm"
              variant="default"
              class="w-full mt-2 text-xs"
              >Signup</Button
            >

            <div class="flex items-center justify-center gap-2 mt-6">
              <span class="text-xs">Already have an account?</span>
              <NuxtLink to="/login" class="text-xs font-medium">Login</NuxtLink>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.header-font {
  font-size: clamp(1.75rem, 5vw, 2.5rem);
}

.backdrop-filter {
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  background-color: rgba(17, 25, 40, 0.75);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.125);
}

@media (min-width: 1024px) {
  .lg\:backdrop-filter-none {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background-color: transparent !important;
    border: none !important;
  }
}

:global(.vti__input::placeholder) {
}
</style>
