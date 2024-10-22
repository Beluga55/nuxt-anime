<script setup lang="ts">
import {
  HeartIcon,
  UserCircleIcon,
  Bars3BottomRightIcon,
  ShoppingBagIcon,
} from "@heroicons/vue/24/outline";
import Input from "@/components/ui/input/Input.vue";
import { useProductsStore } from "@/store/products/index.js";
import { useRoute, useRouter } from "vue-router";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const props = defineProps({
  isDesktop: Boolean,
  paddingFix: { type: String, default: "px-5" },
});

const navItems = [
  { to: "/", text: "Home" },
  { to: "/about", text: "About" },
  { to: "/products", text: "Products" },
  { to: "/faqs", text: "FAQs" },
];

const productsStore = useProductsStore();
const route = useRoute();
const router = useRouter();
const searchInput = ref("");
const sidebarValue = ref(false);
const scrollHeader = ref("");
const scrollY = ref(0);
const isPopoverOpen = ref(false);
const profilePicture = ref("");

const toggleSidebar = () => (sidebarValue.value = !sidebarValue.value);
const closeSidebar = () => (sidebarValue.value = false);

const filteredProducts = computed(() =>
  productsStore.products?.data?.filter((product) =>
    product.name.toLowerCase().includes(searchInput.value.toLowerCase())
  )
);

const navTextColor = computed(() => {
  if (sidebarValue.value || scrollY.value > 30) {
    return "text-text-color-dark";
  } else if (route.path === "/" || route.path === "/about") {
    return "text-white";
  } else {
    return "text-text-color-dark";
  }
});

const handleLogout = () => {
  isPopoverOpen.value = false;
  localStorage.removeItem("loginData");
  localStorage.removeItem("token");
  router.push("/");
}

onMounted(() => {
  const handleScroll = () => {
    scrollY.value = window.scrollY;
    scrollHeader.value = scrollY.value > 30 ? "bg-white" : "bg-transparent";
  };
  window.addEventListener("scroll", handleScroll);

  // Get the profile picture string from localStorage
  const loginData = localStorage.getItem("loginData");

  if (loginData) {
    const parsedData = JSON.parse(loginData);
    profilePicture.value = parsedData.user.image;
  }
});
</script>

<template>
  <header
    :class="[sidebarValue ? 'bg-white' : 'bg-transparent', scrollHeader]"
    class="fixed top-0 z-10 w-full transition-all duration-300 shadow"
  >
    <nav
      :class="[
        navTextColor,
        props.paddingFix,
        'flex items-center justify-between py-6 max-w-[1024px] mx-auto',
      ]"
    >
      <div class="flex items-center gap-2">
        <HeartIcon class="size-6 text-primary-color" />
        <p class="text-[14px] font-medium">BunzStudio</p>
      </div>

      <!-- If width is greater than 768px -->
      <nav v-if="props.isDesktop">
        <ul class="flex items-center gap-7">
          <li v-for="(item, index) in navItems" :key="index">
            <NuxtLink :to="item.to" class="text-[14px] font-medium">{{
              item.text
            }}</NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="flex items-center gap-2">
        <ShoppingBagIcon
          @click="router.push('/products')"
          class="cursor-pointer size-5"
        />

        <Popover :open="isPopoverOpen" class="relative z-10">
          <PopoverTrigger
            @click="isPopoverOpen = !isPopoverOpen"
            class="list-none"
          >
            <UserCircleIcon
              v-if="profilePicture === ''"
              class="cursor-pointer size-5"
            />
            <img
              v-else
              :src="profilePicture"
              alt="profile picture"
              class="w-6 h-6 rounded-full"
            />
          </PopoverTrigger>
          <PopoverContent
            v-if="profilePicture === ''"
            class="bg-white border-[1px] border-border-color py-3 px-4 rounded-[8px] flex items-center flex-col w-max gap-2 mt-2 text-text-color-dark"
          >
            <NuxtLink
              class="text-[12.5px] font-regular"
              to="/login"
              @click="isPopoverOpen = false"
              >Login</NuxtLink
            >
            <NuxtLink
              class="text-[12.5px] font-regular"
              to="/register"
              @click="isPopoverOpen = false"
              >Register</NuxtLink
            >
          </PopoverContent>
          <PopoverContent
            v-else
            class="bg-white border-[1px] border-border-color py-3 px-4 rounded-[8px] flex items-center flex-col w-max gap-2 mt-2 text-text-color-dark"
          >
            <NuxtLink
              class="text-[12.5px] font-regular"
              to="/profile"
              @click="isPopoverOpen = false"
              >Profile</NuxtLink
            >
            <p
              class="text-[12.5px] font-regular cursor-pointer"
              @click="handleLogout"
            >
              Logout
            </p>
          </PopoverContent>
        </Popover>
        <Bars3BottomRightIcon
          v-if="!props.isDesktop"
          @click="toggleSidebar"
          class="cursor-pointer size-5"
        />
      </div>
    </nav>
    <nav
      :class="
        sidebarValue
          ? 'opacity-100 relative translate-x-0'
          : 'opacity-0 invisible absolute translate-x-[200%]'
      "
      class="px-5 py-4 transition-all duration-300"
    >
      <ul class="flex flex-col gap-5">
        <li
          v-for="(item, index) in navItems"
          :key="index"
          class="flex items-center gap-2"
        >
          <NuxtLink
            @click="closeSidebar"
            :to="item.to"
            class="text-[14px] font-medium"
            >{{ item.text }}</NuxtLink
          >
        </li>
      </ul>

      <div class="relative mt-5 mb-2">
        <Input
          v-model="searchInput"
          :class="searchInput ? 'border-2 border-border-color' : ''"
          class="text-xs duration-300 border-2 outline-none transition-border"
          placeholder="Search for products..."
        />

        <div
          v-if="searchInput !== ''"
          class="absolute w-full top-full left-0 border-2 border-border-color rounded-[8px] mt-2 px-3 py-3 shadow bg-background-color"
        >
          <p class="text-[14px] font-medium">Search Results</p>
          <hr />
          <div class="mt-4 flex flex-col gap-3 max-h-[155px] overflow-y-auto">
            <div v-for="product in filteredProducts" :key="product.id">
              <p class="text-xs">{{ product.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped></style>

<!-- env -> api_wrapper -> api -> plugins -> actions.js -> backend -> states.js PINIA -->
