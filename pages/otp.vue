<script setup lang="ts">
definePageMeta({
  layout: "auth-layout",
});

import nahida from "@/assets/images/nahida.png";
import { useWindowSize } from "@vueuse/core";
import { ref } from "vue";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  PinInput,
  PinInputGroup,
  PinInputInput,
} from "@/components/ui/pin-input";
import { toast } from "@/components/ui/toast";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { h } from "vue";
import * as z from "zod";
import { useAuthStore } from "~/store/auth";

const formSchema = toTypedSchema(
  z.object({
    pin: z.array(z.coerce.string()).length(6, { message: "Invalid input" }),
  })
);

const { handleSubmit, setFieldValue } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(({ pin }) => {
  toast({
    title: "You submitted the following values:",
    description: h(
      "pre",
      { class: "mt-2 w-[340px] rounded-md bg-slate-950 p-4" },
      h("code", { class: "text-white" }, JSON.stringify(pin.join(""), null, 2))
    ),
  });
});

const handleComplete = async (e: string[]) => {
  await authStore.verifyOtp({
    otp: e.join(""),
  });
};

// Get the window size
const { width } = useWindowSize();
const authStore = useAuthStore();
const timer = ref(0);
let timerInterval = null;
const isResendDisabled = computed(() => timer.value > 0);

const formattedTime = computed(() => {
  const minutes = Math.floor(timer.value / 60);
  const seconds = timer.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
});

const clearTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

const startTimer = () => {
  clearTimer();
  console.log("Starting timer...");
  timer.value = 300; // 5 minutes
  console.log("Timer value set to:", timer.value);

  timerInterval = setInterval(() => {
    console.log("Timer tick:", timer.value);
    timer.value--;
    if (timer.value <= 0) {
      console.log("Timer finished");
      clearTimer();
    }
  }, 1000);
};

const sendOtp = async () => {
  try {
    if (!isResendDisabled.value) {
      const result = await authStore.otp();
      if (result?.success) {
        startTimer();
        toast({
          variant: "default",
          description: "OTP sent successfully",
        });
      } else {
        throw new Error(result?.message || "Failed to send OTP");
      }
    }
  } catch (error) {
    toast({
      variant: "destructive",
      description: error.message || "Failed to send OTP",
    });
  }
};

onMounted(() => {
  sendOtp();
});

onUnmounted(() => {
  clearTimer();
});
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
        <form
          class="w-full flex flex-col items-center justify-center space-y-6"
          @submit="onSubmit"
        >
          <FormField v-slot="{ componentField, value }" name="pin">
            <FormItem>
              <FormLabel class="font-jakarta font-bold text-2xl"
                >Mobile Phone Verification</FormLabel
              >
              <FormDescription
                class="text-sm !mb-3"
                :class="[
                  width >= 900 ? 'text-black text-center' : 'text-white',
                ]"
                >Enter the 6-digit code sent to your phone
                number</FormDescription
              >
              <FormControl>
                <PinInput
                  id="pin-input"
                  :model-value="value"
                  placeholder="○"
                  class="flex gap-2 items-center"
                  otp
                  type="number"
                  :name="componentField.name"
                  @complete="handleComplete"
                  @update:model-value="
                    (arrStr) => {
                      setFieldValue('pin', arrStr.filter(Boolean));
                    }
                  "
                >
                  <PinInputGroup>
                    <PinInputInput
                      v-for="(id, index) in 6"
                      :key="id"
                      :index="index"
                    />
                  </PinInputGroup>
                </PinInput>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </form>

        <p
          class="mt-5 text-sm flex items-center gap-2 justify-center"
          :class="[width >= 900 ? 'text-black text-center' : 'text-white']"
        >
          Didn't receive a code?
          <span
            @click="sendOtp"
            :class="[
              'font-semibold underline underline-offset-2',
              isResendDisabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer',
            ]"
          >
            Resend {{ isResendDisabled ? `(${formattedTime})` : "" }}
          </span>
        </p>
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
