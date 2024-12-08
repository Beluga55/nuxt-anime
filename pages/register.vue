<script setup lang="ts">
definePageMeta({
  layout: "auth-layout",
});

import { object, string } from "zod";
import { useField, useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import hutao from "@/assets/images/hutao.png";
import { useWindowSize } from "@vueuse/core";
import { useAuthStore } from "~/store/auth";
import { useToast } from "@/components/ui/toast/use-toast";

// Get the window size
const { width } = useWindowSize();
const authStore = useAuthStore();
const { toast, dismiss } = useToast();

const validationSchema = toTypedSchema(
  object({
    // Username, email, password, confirm password
    username: string().min(1, { message: "Username is required" }),
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

const { handleSubmit, errors, resetForm } = useForm({
  validationSchema,
});

const { value: username } = useField("username");
const { value: email } = useField("email");
const { value: password } = useField("password");
const { value: confirmPassword } = useField("confirmPassword");

const submitForm = handleSubmit(async () => {
  const body = {
    username: username.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
  };

  try {
    await authStore.signup(body);
  } catch (error) {
    toast({
      variant: "destructive",
      description: error.message,
    });

    setTimeout(() => {
      dismiss();
    }, 5000);
  }

  resetForm();
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen py-8">
    <div
      class="justify-self-center"
      :class="width >= 900 ? 'w-[400px] px-0 py-0' : 'relative w-[calc(100%-2.5rem)] backdrop-filter max-w-[450px] mx-auto px-5 py-5 rounded-lg'"
    >
      <img
        :src="hutao"
        alt="hutao-image"
        class="mx-auto rounded-full bottom-[-25px] w-[200px] h-[200px] object-cover"
      />
      <form class="">
        <div :class="[width >= 900 ? 'text-black text-center' : 'text-white']">
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
              <label
                for="confirmPassword"
                class="text-sm font-medium text-left"
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
                <Checkbox id="remember" />
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
</style>
