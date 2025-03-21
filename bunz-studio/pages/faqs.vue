<script setup lang="ts">
import { ArrowLeftIcon } from "@heroicons/vue/24/solid";
import { Instagram, Twitter } from "lucide-vue-next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import faqData from "@/json/faqData.json";
import { useWindowSize } from "@vueuse/core";
import liyue from "@/assets/images/liyue.jpg";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm, useField } from "vee-validate";
import { object, string } from "zod";
import { useToast } from "@/components/ui/toast/use-toast.js";
import { useSupportStore } from "~/store/support";

// Validation schema for the form (name, email, subject, message)
const validationSchema = toTypedSchema(
  object({
    name: string().min(1, { message: "Name is required" }),
    email: string().min(1, { message: "Email is required" }).email({
      message: "Invalid email format",
    }),
    subject: string().min(1, { message: "Subject is required" }),
    message: string().min(1, { message: "Message is required" }),
  })
);

const { handleSubmit, errors, resetForm } = useForm({
  validationSchema,
});

const { value: name } = useField("name");
const { value: email } = useField("email");
const { value: subject } = useField("subject");
const { value: message } = useField<string>("message");

definePageMeta({
  layout: "nav-layout",
});

const defaultAccordion = "item-1";
const { width } = useWindowSize();
const { toast, dismiss } = useToast();
const supportStore = useSupportStore();

const accordionItems = faqData;

const submitForm = handleSubmit(async () => {
  const body = {
    name: name.value,
    email: email.value,
    subject: subject.value,
    message: message.value,
  };

  // Send data to backend
  await supportStore.sendSupportMessage(body);

  toast({
    title: "Form submitted successfully",
    description: "We'll get back to you within 24 hours",
  });

  setTimeout(() => {
    dismiss();
  }, 3000);

  // Reset form fields
  resetForm();
});
</script>

<template>
  <div
    class="bg-[url('/assets/images/faq.jpg')] min-h-[35vh] flex items-center py-10 px-5 bg-cover bg-center max-w-[1024px] mx-auto mt-[4.5rem] lg:mt-[6.5rem] lg:rounded-3xl"
  >
    <div class="w-full lg:px-10">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <ArrowLeftIcon class="text-white size-4 arrow-left" />
          <span class="text-xs font-medium text-white">Go Back</span>
        </div>
        <div class="flex items-center gap-2">
          <Instagram class="text-white size-5" />
          <Twitter class="text-white size-5" />
        </div>
      </div>

      <h1 class="mt-5 font-bold text-white header-font faq-title">
        Looking for help? <br />
        Your questions Answered
      </h1>
      <p class="mt-4 text-sm leading-6 text-white">
        Here are some of our FAQs. If you have any other questions you'd like
        answered please feel free to email us.
      </p>
    </div>
  </div>

  <!-- Accordion Section -->
  <Accordion
    type="single"
    class="w-full max-w-[1024px] mx-auto pt-[5rem] px-5 lg:px-0"
    collapsible
    :default-value="defaultAccordion"
  >
    <AccordionItem
      v-for="item in accordionItems"
      :key="item.value"
      :value="item.value"
    >
      <AccordionTrigger class="text-[15px] outline-none header-font">{{
        item.title
      }}</AccordionTrigger>
      <AccordionContent class="text-[13px] leading-7">{{
        item.content
      }}</AccordionContent>
    </AccordionItem>
  </Accordion>

  <!-- Contact Form Action -->
  <div class="max-w-[1024px] mx-auto mt-20 px-5 lg:px-0">
    <div
      class="border-[1px] rounded-lg backdrop-filter-light border-border-color md:grid md:grid-cols-2 md:items-center"
    >
      <img
        :src="liyue"
        alt="liyue"
        class="w-full min-h-[300px] object-cover rounded-tl-lg rounded-tr-lg md:rounded-tr-none md:rounded-bl-lg md:h-full"
      />
      <form class="px-5 py-5 md:px-7 md:py-7">
        <div>
          <div>
            <h2 class="font-extrabold header-font text-[#333] contact-title">
              We'd love to help
            </h2>
            <p class="mt-2 text-[13px] leading-6">
              Reach out and we'll get in touch within 24 hours
            </p>
          </div>
          <div class="mt-5">
            <!-- Name, Email, Subject, Message -->
            <div>
              <input
                type="text"
                placeholder="Name"
                class="w-full placeholder-gray-500 py-[0.65rem] px-4 text-[13px] border-[1px] border-border-color outline-none rounded-sm"
                v-model="name"
              />
              <p v-if="errors.name" class="mt-2 text-xs font-medium text-red-400">{{ errors.name }}</p>
            </div>
            <div>
              <input
                type="email"
                placeholder="Email"
                class="w-full mt-3 placeholder-gray-500 py-[0.65rem] px-4 text-[13px] border-[1px] border-border-color outline-none rounded-sm"
                v-model="email"
              />
              <p v-if="errors.email" class="mt-2 text-xs font-medium text-red-400">{{ errors.email }}</p>
            </div>
            <div>
              <input
                type="text"
                placeholder="Subject"
                class="w-full mt-3 placeholder-gray-500 py-[0.65rem] px-4 text-[13px] border-[1px] border-border-color outline-none rounded-sm"
                v-model="subject"
              />
              <p v-if="errors.subject" class="mt-2 text-xs font-medium text-red-400">{{ errors.subject }}</p>
            </div>
            <div>
              <textarea
                rows="7"
                cols="1"
                placeholder="Message"
                class="resize-none w-full mt-3 placeholder-gray-500 py-[0.65rem] px-4 text-[13px] border-[1px] border-border-color outline-none rounded-sm"
                v-model="message"
              ></textarea>
              <p v-if="errors.message" class="text-xs font-medium text-red-400">{{ errors.message }}</p>
            </div>
            <Button
              @click="submitForm"
              variant="default"
              class="w-full mt-2 text-xs"
              >Submit</Button
            >
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.arrow-left {
  animation: animate 2s infinite;
}

@keyframes animate {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(5px);
  }
  100% {
    transform: translateX(0);
  }
}

.faq-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  line-height: clamp(2.5rem, 4vw, 3.25rem);
}

.contact-title {
  font-size: clamp(1.75rem, 4vw, 2rem);
  line-height: clamp(2.5rem, 4vw, 3.25rem);
}
</style>
