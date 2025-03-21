<script setup lang="ts">
import {
  ShoppingBagIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/vue/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/vue/24/solid";
import { useProductsStore } from "@/store/products/index.js";
import { useRouter } from "vue-router";
import SwiperCore, { Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/vue";

// Import Swiper styles
import "swiper/swiper.scss";
import "swiper/components/navigation/navigation.scss";

SwiperCore.use([Navigation]);

definePageMeta({
  layout: "nav-layout",
});

const productsStore = useProductsStore();
const router = useRouter();
const isActive = ref<string | null>("banner-1");

const emitCategory = (category: string) => {
  navigateTo({
    path: "/products",
    query: { category },
  });
};

/* ========= COMPUTED PROPERTIES ========= */
const allProducts = computed(() => productsStore.products?.data);
const trendingProducts = computed(() =>
  productsStore.products?.data.sort((a, b) => b.rating - a.rating)
);
</script>

<template>
  <!-- Hero screen -->
  <div
    class="bg-[url('/assets/images/hero.jpg')] relative md:min-h-screen h-auto"
  >
    <div class="absolute inset-0 bg-black/75"></div>

    <div class="bg-center relative py-48 md:items-center md:min-h-screen h-auto">
      <!-- Your content goes here -->
      <div
        class="relative max-w-[1024px] mx-auto mb-[5rem] flex flex-col justify-center items-center text-center px-5 lg:px-0"
      >
        <h1 class="text-white heading-clamp">Discover Your Anime Haven</h1>
        <p class="mt-4 text-sm md:text-base text-white max-w-[600px] md:leading-relaxed leading-relaxed">
          Explore our exclusive collection of anime poster cards, high-quality
          prints are a must-have for any anime fan. Browse now and find the
          perfect pieces to showcase your anime passion!
        </p>
        <div class="mt-6">
          <Button
            @click="router.push('/products')"
            variant="outline"
            class="text-xs min-w-[200px]"
          >
            <ShoppingBagIcon class="mr-2 size-4" />
            Shop Now
          </Button>
        </div>
      </div>
      <div class="relative overflow-hidden">
        <div class="blur-overlay"></div>
        <NuxtMarquee :speed="100" :pauseOnHover="true">
          <div v-for="(product, index) in allProducts" :key="index">
            <div class="relative">
              <img
                @click="router.push(`/product/${product._id}`)"
                :src="product.imageUrl"
                alt="product"
                class="object-cover w-[325px] h-[300px] rounded-[1rem] border-2 object-top-center border-zinc-700 cursor-pointer"
              />
              <div
                class="absolute bottom-0 left-0 right-0 px-5 py-3 mx-[1px] backdrop-text"
              >
                <p class="text-sm font-semibold text-white">
                  {{ product.name }}
                </p>

                <div class="flex items-center gap-2 mt-2">
                  <p
                    class="text-xs text-white border-[1px] border-slate-300 rounded-[2rem] py-1 px-3"
                  >
                    {{ product.category || 'Anime' }}
                  </p>
                  <p
                    class="text-xs text-white border-[1px] border-slate-300 rounded-[2rem] py-1 px-3"
                  >
                    RM {{ product.price }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </NuxtMarquee>
        <div class="blur-overlay-end"></div>
      </div>
    </div>
  </div>

  <!-- Trending -->
  <div class="bg-white px-5 lg:px-0">
    <div class="py-20 max-w-[1024px] mx-auto">
      <div class="flex items-center gap-4 trending-header">
        <div class="border-l-4 border-accent-color h-[30px] rounded-sm"></div>
        <h1>Best Seller</h1>
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
          1024: {
            slidesPerView: 4,
          },
        }"
        :space-between="10"
        :navigation="{ nextEl: '.button-next', prevEl: '.button-prev' }"
        :pagination="{ clickable: true }"
        :scrollbar="{ draggable: true }"
        class="grid gap-4 py-8"
      >
        <swiper-slide v-for="(product, index) in trendingProducts" :key="index">
          <div
            class="trending-items border-[1px] border-solid border-zinc-400 px-4 py-4 rounded-[8px] grid hover:cursor-pointer"
            @click="router.push(`/product/${product._id}`)"
          >
            <img
              :src="product.imageUrl"
              alt="product"
              class="w-[120px] h-[120px] object-cover object-top justify-self-center rounded-[8px]"
            />

            <div class="mt-4 price">
              <p class="text-[14px] font-medium">{{ product.name }}</p>
              <p class="text-[14px] font-medium">RM {{ product.price }}</p>
            </div>

            <div class="flex items-center mt-1">
              <div class="flex">
                <template v-for="star in 5" :key="star">
                  <StarIconSolid
                    v-if="star <= product.rating"
                    class="text-yellow-500 size-4"
                  />
                  <StarIcon v-else class="text-black size-4" />
                </template>
              </div>
              <div class="ml-2">
                <p class="text-xs font-medium">
                  ({{ product.numReviews }} reviews)
                </p>
              </div>
            </div>
          </div>
        </swiper-slide>
      </swiper>
      <div class="flex items-center justify-center gap-2 mt-5">
        <Button
          variant="secondary"
          class="button-prev border-zinc-400 border-[1px] px-2 py-2 h-auto"
          ><ChevronLeftIcon class="size-4"
        /></Button>
        <Button
          variant="secondary"
          class="button-next border-zinc-400 border-[1px] px-2 py-2 h-auto"
          ><ChevronRightIcon class="size-4"
        /></Button>
      </div>
    </div>
  </div>

  <!-- Categories -->
  <div class="py-20 max-w-[1024px] mx-auto px-5 lg:px-0">
    <div class="flex items-center gap-4 trending-header">
      <div class="border-l-4 border-accent-color h-[30px] rounded-sm"></div>
      <h1>Categories</h1>
    </div>

    <div class="grid grid-cols-2 grid-rows-2 gap-6 mt-6">
      <div class="category category--1" @click="emitCategory('Keychains')">
        <p>Keychains</p>
      </div>
      <div class="category category--2" @click="emitCategory('Postcards')">
        <p>Postcards</p>
      </div>
      <div class="category category--3" @click="emitCategory('Badges')">
        <p>Badges</p>
      </div>
      <div class="category category--4" @click="emitCategory('Prints')">
        <p>Prints</p>
      </div>
    </div>
  </div>

  <!-- Banner -->
  <div class="py-20 max-w-[1024px] mx-auto px-5 lg:px-0">
    <div class="flex items-center gap-4 trending-header">
      <div class="border-l-4 border-accent-color h-[30px] rounded-sm"></div>
      <h1>Banner</h1>
    </div>

    <div class="flex gap-4 mt-4 flex-col sm:flex-row">
      <div
        class="banner-content banner-1"
        :class="{ active: isActive === 'banner-1' }"
        @click="isActive = isActive === 'banner-1' ? null : 'banner-1'"
      >
        <div class="banner-content-description">
          <h2 class="text-[14px] text-text-color-light font-medium font-jakarta">
            Promotions
          </h2>
          <div
            class="flex items-center justify-between invisible opacity-0 banner-content-wrapper"
          >
            <p class="mt-2 text-xs font-normal text-text-color-light">
              Checkout our latest promotion
            </p>
            <ChevronDoubleRightIcon class="mt-1 text-white size-4" />
          </div>
        </div>
      </div>

      <div
        class="banner-content banner-2"
        :class="{ active: isActive === 'banner-2' }"
        @click="isActive = isActive === 'banner-2' ? null : 'banner-2'"
      >
        <div class="banner-content-description">
          <h2 class="text-[14px] text-text-color-light font-medium font-jakarta">
            New Arrival
          </h2>
          <div
            class="flex items-center justify-between invisible opacity-0 banner-content-wrapper"
          >
            <p class="mt-2 text-xs font-normal text-text-color-light">
              Checkout our new arrival
            </p>
            <ChevronDoubleRightIcon class="mt-1 text-white size-4" />
          </div>
        </div>
      </div>

      <div
        class="banner-content banner-3"
        :class="{ active: isActive === 'banner-3' }"
        @click="isActive = isActive === 'banner-3' ? null : 'banner-3'"
      >
        <div class="banner-content-description">
          <h2 class="text-[14px] text-text-color-light font-medium font-jakarta">
            Pre Order
          </h2>
          <div
            class="flex items-center justify-between invisible opacity-0 banner-content-wrapper"
          >
            <p class="mt-2 text-xs font-normal text-text-color-light">
              Pre order available in our shop
            </p>
            <ChevronDoubleRightIcon class="mt-1 text-white size-4" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.heading-clamp {
  font-size: clamp(2.5rem, 8vw, 4rem);
  line-height: 1.25;
}

.backdrop-text {
  position: absolute;
  z-index: 1;
  bottom: 0;
  left: 0;
  right: 0;
  backdrop-filter: blur(15px);
  background-color: rgba(0, 0, 0, 0.3);
  border-bottom-right-radius: 1rem;
  border-bottom-left-radius: 1rem;
}

.trending-header h1 {
  font-size: clamp(2rem, 3vw, 2.5rem);
  font-weight: 600;
  color: #333;
}

.category {
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 0 2px 0 #fd7968;
  position: relative;
  transition: all 0.3s ease-in-out;
  background-size: cover;
  background-position: center;
}

.category:hover {
  transform: scale(1.05);
  cursor: pointer;
}

.category p {
  font-size: clamp(0.875rem, 3vw, 1rem);
  font-weight: 500;
  color: white;
  width: fit-content;
}

.category--1 {
  background-image: linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)),
    url("../assets/images/categories.jpg");
  grid-row: span 11;
}

.category--2 {
  background-image: linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)),
    url("../assets/images/categories-1.jpg");
  grid-row: span 15;
}

.category--3 {
  background-image: linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)),
    url("../assets/images/categories-2.jpg");
  grid-row: span 15;
}

.category--4::before {
  content: "";
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  background-image: linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)),
    url("../assets/images/categories-3.jpg");
  background-size: cover;
  background-position: center;
  z-index: -1;
}

.category--4 {
  grid-row: span 11;
  overflow: hidden;
}

.banner-content {
  position: relative;
  height: 60px;
  transition: height 0.5s ease-in-out;
  box-shadow: 0 0 2px 0 #f79489;
  border-radius: 0.5rem;
  background-size: cover;
  background-position: top;
}

.banner-content.active {
  height: 250px;
}

.banner-content.active .banner-content-description {
  position: absolute;
  bottom: 15px;
  left: 15px;
  width: calc(100% - 30px);
}

.banner-content:not(.active) h2 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.banner-content.active .banner-content-wrapper {
  opacity: 1;
  visibility: visible;
  transition: all 0.3s ease-in-out;
}

.banner-1 {
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    url("../assets/images/banner-1.png");
}

.banner-2 {
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    url("../assets/images/banner-2.jpg");
}

.banner-3 {
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    url("../assets/images/banner-3.jpg");
}

.blur-overlay,
.blur-overlay-end {
  position: absolute;
  width: 100px;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}

.blur-overlay {
  top: 0;
  left: -30px;
  background: linear-gradient(
    to right,
    #191919 0%,
    rgba(25, 25, 25, 0.8) 40%,
    transparent 100%
  );
}

.blur-overlay-end {
  top: 0;
  right: -30px;
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(25, 25, 25, 0.8) 60%,
    #191919 100%
  );
}

@media (min-width: 640px) {
  .banner-content {
    width: clamp(45px, 20vw, 50px);
    flex-grow: 1;
    transition: flex-grow 0.5s ease-in-out;
  }

  .banner-1,
  .banner-2,
  .banner-3 {
    height: 350px;
  }

  .banner-content.active {
    height: initial;
    flex-grow: 10;
  }

  .banner-content:not(.active) h2 {
    top: initial;
    bottom: clamp(3rem, 8vw, 4.5rem);
    left: 50%;
    transform: translateX(-50%) rotate(-90deg);
    width: 100%;
  }
}
</style>

<style>
.vfm-parent {
  gap: 1rem;
}

.vfm-parent > div:last-child {
  padding-right: 1rem;
}
</style>

<!-- topnav (z-10) -->
