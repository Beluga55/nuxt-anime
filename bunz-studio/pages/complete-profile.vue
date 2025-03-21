<script setup lang="ts">
definePageMeta({
  layout: "auth-layout",
});

import nahida from "@/assets/images/nahida.png";
import { useWindowSize } from "@vueuse/core";
import { ref } from "vue";
import { object, string } from "zod";
import { useField, useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useToast } from "@/components/ui/toast/use-toast";
import { useAuthStore } from "~/store/auth";

// Get the window size
const { width } = useWindowSize();
const authStore = useAuthStore();
const selectedCountry = ref("");
const { toast, dismiss } = useToast();

const validationSchema = toTypedSchema(
  object({
    phone: string()
      .min(1, { message: "Phone number is required" })
      .refine((val) => val.startsWith("+") && val.length >= 10, {
        message: "Invalid phone number format",
      }),
  })
);

const { handleSubmit, meta: formMeta, errors, resetForm } = useForm({
  validationSchema,
});

const { value: phone, errors: phoneErrors } = useField("phone");

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
  // Get the localStorage userInfo
  const loginData = localStorage.getItem("userInfo");

  if (!loginData) {
    return;
  }

  const parsedData = JSON.parse(loginData);

  // Get the email from the userInfo
  const email = parsedData.email;

  console.log(email);

  const body = {
    email: email,
    phone: phone.value,
    country: selectedCountry.value,
  };
  try {
    await authStore.completeProfile(body);
  } catch (error) {
    toast({
      variant: "destructive",
      description: (error as Error).message,
    })

    setTimeout(() => {
      dismiss();
    }, 5000);

    resetForm();
    console.error(error);
  }
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen py-8">
    <div
      class="justify-self-center"
      :class="
        width >= 900
          ? 'w-[400px] px-0 py-0'
          : 'relative w-[calc(100%-2.5rem)] backdrop-filter max-w-[450px] mx-auto px-5 py-5 rounded-lg'
      "
    >
      <img
        :src="nahida"
        alt="Nahida"
        class="mx-auto rounded-full bottom-[-25px] w-[200px] h-[200px] object-cover"
      />

      <div :class="[width >= 900 ? 'text-black text-center' : 'text-white']">
        <div class="flex flex-col items-center gap-1">
          <h2 class="font-black text-2xl font-jakarta">
            Complete your profile
          </h2>
          <p class="mt-1 text-sm">There's lots of promotions awaits you.</p>

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
            class="w-full text-black mt-5 bg-white py-[0.65rem] text-[13px] border-[1px] border-border-color outline-none rounded-sm mb-3"
            :class="{
              'border-red-500':
                (phone || formMeta.touched) && phoneErrorMessage,
            }"
          ></vue-tel-input>

          <Button
            variant="default"
            @click="submitForm"
            class="w-full mt-2 text-xs"
            >Complete Profile</Button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backdrop-filter {
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  background-color: rgba(17, 25, 40, 0.75);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.125);
}
</style>
