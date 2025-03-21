<script setup lang="ts">
import {
  ChevronDoubleDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/vue/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/vue/24/solid";
import KeqingBanner from "@/assets/images/keqing.jpg";
import DefaultUserIcon from "@/assets/images/default-user-icon.jpg";
import { useTestimonialsStore } from "~/store/testimonials";
import SwiperCore, { Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/vue";
import { useWindowSize } from "@vueuse/core";

// Import swiper styles
import "swiper/swiper.scss";
import "swiper/components/navigation/navigation.scss";

SwiperCore.use([Navigation]);

definePageMeta({
  layout: "nav-layout",
});

const { width } = useWindowSize();
const testimonialsStore = useTestimonialsStore();
const testimonials = computed(() => testimonialsStore.testimonials);

const fetchTestimonials = async () => {
  try {
    await testimonialsStore.getTestimonials();
  } catch (error) {
    console.error("Error fetching testimonials:", error);
  }
};

onMounted(() => {
  fetchTestimonials();
});
</script>

<template>
  <div
    class="h-screen bg-[url('/assets/images/about-banner.png')] bg-cover bg-center relative px-5 lg:px-0"
  >
    <div class="absolute inset-0 bg-black/70"></div>

    <div
      class="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 w-[calc(100%-2.5rem)] text-center grid place-content-center"
    >
      <h1 class="font-normal header-clamp text-text-color-light">About Us</h1>
      <p class="text-sm text-text-color-light max-w-[500px] mt-2 leading-7">
        Our e-commerce platform is a haven for anime enthusiasts, offering
        amazing merchandise that celebrates the captivating art, compelling
        stories, and boundless spirit of anime culture.
      </p>
    </div>

    <ChevronDoubleDownIcon
      class="absolute text-white size-9 bottom-[7rem] left-1/2 -translate-x-1/2 cursor-pointer arrow-down"
      @click="$refs.goals.scrollIntoView({ behavior: 'smooth' })"
    />
  </div>

  <!-- Goals -->
  <div
    ref="goals"
    class="py-20 max-w-[1024px] mx-auto px-5 lg:px-0"
  >
    <div class="grid">
      <h1 class="section-title text-[#333] font-semibold text-center">
        Defining Success
      </h1>
      <p
        class="mt-1 text-sm text-[#333] text-center leading-7 max-w-[400px] justify-self-center"
      >
        The Story Behind Our Success: Mission, Values, and Story
      </p>
    </div>

    <div
      class="grid items-stretch gap-6 mt-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
    >
      <div class="border-2 border-border-color rounded-[8px] px-5 py-5">
        <div class="flex items-center gap-4">
          <div
            class="border-l-4 border-solid border-accent-color h-[25px] rounded-sm"
          ></div>
          <h3 class="header-font text-[#333] text-base font-bold">
            Our Mission
          </h3>
        </div>
        <p class="mt-4 text-sm leading-7">
          We are passionate about anime and strive to offer a wide variety of
          high-quality products to meet the needs of all anime fans.
        </p>
      </div>

      <div class="border-2 border-border-color rounded-[8px] px-5 py-5">
        <div class="flex items-center gap-4">
          <div
            class="border-l-4 border-solid border-accent-color h-[25px] rounded-sm"
          ></div>
          <h3 class="header-font text-[#333] text-base font-bold">Our Story</h3>
        </div>
        <p class="mt-4 text-sm leading-7">
          Founded by a team of avid anime fans, our journey began with a shared
          desire to bring the vibrant world of anime closer to our audience.
        </p>
      </div>

      <div class="border-2 border-border-color rounded-[8px] px-5 py-5">
        <div class="flex items-center gap-4">
          <div
            class="border-l-4 border-solid border-accent-color h-[25px] rounded-sm"
          ></div>
          <h3 class="header-font text-[#333] text-base font-bold">
            Our Values
          </h3>
        </div>
        <p class="mt-4 text-sm leading-7">
          Anime store for fans, by fans, with genuine products and passion for
          innovation, dedicated to providing the best anime experience for all.
        </p>
      </div>
    </div>
  </div>

  <!-- Why Choose Us -->
  <div class="py-20 max-w-[1024px] mx-auto px-5 lg:px-0">
    <div class="grid items-center gap-6 grid-cols-1 lg:grid-cols-2">
      <img
        :src="KeqingBanner"
        alt="Keqing"
        class="w-full h-[250px] object-cover object-center rounded-2xl lg:h-[450px]"
      />

      <div>
        <div class="flex items-center gap-4">
          <div
            class="border-l-4 border-solid border-accent-color h-[30px] rounded-sm"
          ></div>
          <h3 class="section-title text-[#333] text-base font-bold">
            Why Choose Us?
          </h3>
        </div>

        <div class="grid gap-4 mt-8">
          <div class="px-4 py-4 border-2 rounded-sm border-border-color">
            <h3 class="text-base header-font text-[#333] font-bold">
              Good Quality
            </h3>
            <p class="mt-4 text-[13px]">
              Each piece is made from high-quality materials such as durable
              acrylic, and its colourful, beautiful designs.
            </p>
          </div>
          <div class="px-4 py-4 border-2 rounded-sm border-border-color">
            <h3 class="text-base header-font text-[#333] font-bold">
              Fast Shipping & Free Delivery
            </h3>
            <p class="mt-4 text-[13px]">
              Orders are shipped within 1-2 business days, and free delivery is
              available for all orders.
            </p>
          </div>
          <div class="px-4 py-4 border-2 rounded-sm border-border-color">
            <h3 class="text-base header-font text-[#333] font-bold">
              Excellent Customer Service
            </h3>
            <p class="mt-4 text-[13px]">
              Our customer service team is always ready to help you with any
              questions or concerns you may have.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Testimonials -->
  <div class="py-20 max-w-[1024px] mx-auto px-5 lg:px-0">
    <div class="grid">
      <h1 class="section-title text-[#333] font-semibold text-center">
        Testimonials
      </h1>
      <p
        class="mt-1 text-sm text-[#333] text-center leading-7 justify-self-center"
      >
        Values Feedback From Our Customer
      </p>
    </div>

    <swiper
      :slides-per-view="1"
      :loop="true"
      :breakpoints="{
        640: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 3,
        },
      }"
      :space-between="10"
      :navigation="{ nextEl: '.button-next', prevEl: '.button-prev' }"
      :pagination="{ clickable: true }"
      :scrollbar="{ draggable: true }"
      class="grid"
    >
      <swiper-slide
        class="flex items-stretch"
        v-for="(testimonial, index) in testimonials"
      >
        <div
          class="flex flex-col justify-between w-full px-6 py-6 mt-8 border-2 border-solid rounded-[8px] border-border-color"
          :key="index"
        >
          <div>
            <!-- Icon -->
            <ChatBubbleLeftRightIcon class="size-7" />
            <p
              class="w-fit relative text-[15px] mt-2 mb-4 font-medium p-underline"
            >
              {{ testimonial.productName }}
            </p>
            <p class="text-[13px] leading-6">{{ testimonial.testimonial }}</p>
          </div>

          <div class="flex items-center gap-4 mt-4">
            <img
              class="w-[50px] h-[50px] rounded-full object-cover"
              :src="
                testimonial.imageUrl ? testimonial.imageUrl : DefaultUserIcon
              "
              alt="Testimonial"
            />
            <div>
              <p class="text-xs font-semibold">{{ testimonial.username }}</p>
              <div class="flex items-center mt-1">
                <div v-for="star in 5" :key="star">
                  <StarIconSolid
                    v-if="star <= testimonial.rating"
                    class="text-yellow-500 size-4"
                  />
                  <StarIcon v-else class="text-black size-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </swiper-slide>
    </swiper>
    <div class="flex items-center justify-center gap-2 mt-5">
      <button
        type="button"
        class="button-prev border-zinc-400 border-[1px] px-2 py-2 h-auto rounded"
      >
        <ChevronLeftIcon class="size-4" />
      </button>
      <button
        type="button"
        class="button-next border-zinc-400 border-[1px] px-2 py-2 h-auto rounded"
      >
        <ChevronRightIcon class="size-4" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.header-clamp {
  font-size: clamp(2.5rem, 4vw, 4rem);
}

.section-title {
  font-size: clamp(2rem, 3vw, 2.5rem);
}

.arrow-down {
  animation: bounce 2s infinite;
}

.p-underline::after {
  content: "";
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 20%;
  height: 2px;
  background-color: #fd7968;
  border-radius: 0.5rem;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-20px);
  }
  60% {
    transform: translateX(-50%) translateY(-10px);
  }
}
</style>
