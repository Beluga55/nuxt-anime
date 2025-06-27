<script setup lang="ts">
import {
  HeartIcon,
  UserCircleIcon,
  Bars3BottomRightIcon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import Input from "@/components/ui/input/Input.vue";
import { useProductsStore } from "@/store/products/index.js";
import { useRoute, useRouter } from "vue-router";
import { useCartStore } from "@/store/cart";
import { loadStripe } from "@stripe/stripe-js";
import { usePaymentStore } from "~/store/payment";
import { useTokenStatus } from "@/composables/useTokenStatus";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "../ui/toast";

const paymentStore = usePaymentStore();

const navItems = [
  { to: "/", text: "Home" },
  { to: "/about", text: "About" },
  { to: "/products", text: "Products" },
  { to: "/faqs", text: "FAQs" },
];

const productsStore = useProductsStore();
const cartStore = useCartStore();
const route = useRoute();
const router = useRouter();
const searchInput = ref("");
const sidebarValue = ref(false);
const scrollHeader = ref("");
const scrollY = ref(0);
const isPopoverOpen = ref(false);
const isSearchOpen = ref(false);
const isCartOpen = ref(false);
const profilePicture = ref("");
const { tokenStatus, setTokenStatus } = useTokenStatus();

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
  localStorage.removeItem("userInfo");
  localStorage.removeItem("token");
  localStorage.removeItem("tokenExpiration");
  profilePicture.value = "";
  setTokenStatus(false);
};

const handleCheckout = async () => {
  try {
    // Transform cart items to Stripe format
    const items = cartStore.cartItems.map((item) => ({
      name: item.name,
      amount: Math.round(item.price * 100), // Convert to cents
      quantity: item.quantity || 1,
      image: item.imageUrl || item.image, // Add fallback to item.image
      description: item.description, // Optional: include description if available
    }));

    const userData = localStorage.getItem("userInfo");
    
    if (!userData) {
      console.error("User data not found in localStorage");
      toast({
        variant: "destructive",
        description: "Please login and try again",
      });
      
      // Store checkout intent and current URL parameters in localStorage
      localStorage.setItem('pendingCheckout', 'true');
      if (route.query) {
        localStorage.setItem('checkoutParams', JSON.stringify(route.query));
      }
      
      // Redirect to login
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);

    if (!user) {
      console.error("User data not found in localStorage");
      return;
    }

    // Get the email from the user data
    const email = user.email;

    // Validate items have images
    const missingImages = items.filter((item) => !item.image);
    if (missingImages.length > 0) {
      console.warn(
        "Some items are missing images:",
        missingImages.map((item) => item.name)
      );
    }

    const response = await paymentStore.createCheckoutSession({
      items,
      email,
    });

    if (response && response.session) {
      const config = useRuntimeConfig();
      const stripe = await loadStripe(config.public.stripePublishableKey);
      await stripe.redirectToCheckout({
        sessionId: response.session.id,
      });
    }
  } catch (err) {
    console.error("Error:", err);
  }
};

onMounted(() => {
  const handleScroll = () => {
    scrollY.value = window.scrollY;
    scrollHeader.value = scrollY.value > 30 ? "bg-white" : "bg-transparent";
  };
  window.addEventListener("scroll", handleScroll);

  // Get the profile picture string from localStorage
  const loginData = localStorage.getItem("userInfo");

  if (loginData) {
    const parsedData = JSON.parse(loginData);
    profilePicture.value = parsedData.image || parsedData.picture || "";
  }

  cartStore.loadCart();
});

watchEffect(() => {
  const token = localStorage.getItem("token");
  const tokenExpiration = localStorage.getItem("tokenExpiration");

  if (!token) {
    setTokenStatus(false);
    return;
  }

  if (tokenExpiration) {
    const expirationDate = new Date(tokenExpiration);
    const currentDate = new Date();

    if (currentDate > expirationDate) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiration");
      setTokenStatus(false);
    } else {
      setTokenStatus(true);
    }
  } else {
    // If token exists but no expiration, consider it valid
    setTokenStatus(true);
  }
});
</script>

<template>
  <header
    :class="[sidebarValue ? 'bg-white' : 'bg-transparent', scrollHeader]"
    class="fixed top-0 z-[20] w-full transition-all duration-300 shadow"
  >
    <nav
      :class="[
        navTextColor,
        'flex items-center justify-between py-6 max-w-[1024px] mx-auto px-5 lg:px-0',
      ]"
    >
      <div class="flex items-center gap-2">
        <HeartIcon class="size-6 text-primary-color" />
        <p class="text-[14px] font-medium">BunzStudio</p>
      </div>

      <!-- Desktop Navigation - visible on md screens and above -->
      <nav class="hidden md:block">
        <ul class="flex items-center gap-7">
          <li v-for="(item, index) in navItems" :key="index">
            <NuxtLink :to="item.to" class="text-[14px] font-medium">{{
              item.text
            }}</NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="flex items-center gap-2">
        <!-- Search - visible on md screens and above -->
        <Popover :open="isSearchOpen" class="hidden md:block">
          <PopoverTrigger @click="isSearchOpen = !isSearchOpen">
            <MagnifyingGlassIcon class="size-5 cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent
            class="mt-2 bg-transparent outline-none px-0 py-0 border-none grid shadow-none"
          >
            <Input
              v-model="searchInput"
              class="text-[13px] duration-300 w-[250px] border-2 outline-none transition-border justify-self-center"
              placeholder="Search for products..."
            />

            <div
              v-if="searchInput !== ''"
              class="bg-background-color mt-4 px-4 py-4 rounded-[8px] border-2 justify-self-center w-[250px]"
            >
              <p class="text-sm mb-2 font-medium">Search Results</p>

              <hr />

              <div
                class="mt-4 flex flex-col gap-2 max-h-[155px] overflow-y-auto"
              >
                <div v-for="product in filteredProducts" :key="product.id">
                  <p
                    @click="
                      () => {
                        isSearchOpen = false;
                        router.push(`/product/${product._id}`);
                      }
                    "
                    class="text-[13px] cursor-pointer"
                  >
                    {{ product.name }}
                  </p>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover :open="isCartOpen">
          <PopoverTrigger @click="isCartOpen = !isCartOpen" asChild>
            <div
              class="relative flex items-center justify-center py-1 rounded-full"
            >
              <ShoppingBagIcon class="cursor-pointer size-5" />
              <div
                class="absolute -top-2 -right-2 text-xs font-medium rounded-full bg-primary-color text-white w-4 h-4 flex items-center justify-center"
              >
                {{ cartStore.totalItems }}
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent
            class="w-full min-w-[200px] mt-2 bg-background-color p-4 rounded-[8px] border-2"
            side="bottom"
            align="center"
          >
            <p class="text-sm font-medium mb-2">
              Cart Items ({{ cartStore.totalItems }})
            </p>
            <hr class="my-2" />
            <div class="flex flex-col gap-2">
              <!-- Empty State -->
              <div
                v-if="cartStore.totalItems === 0"
                class="flex flex-col items-center gap-4 my-3"
              >
                <p class="text-sm font-medium">Cart is empty</p>
                <Button
                  variant="default"
                  class="w-full text-sm outline-none border-none"
                  @click="
                    () => {
                      router.push('/products');
                      isCartOpen = false;
                    }
                  "
                >
                  Browse Products
                </Button>
              </div>
              <!-- Cart Items -->
              <div class="cart-items-list max-h-[300px] overflow-y-auto pr-2">
                <div
                  v-for="item in cartStore.cartItems"
                  :key="item.id"
                  class="flex items-start gap-5 py-2"
                >
                  <img
                    :src="item.image"
                    :alt="item.name"
                    class="w-16 h-16 object-cover rounded"
                  />
                  <div class="flex-1 gap-0.5 flex flex-col">
                    <p class="text-sm font-medium">{{ item.name }}</p>
                    <p class="text-xs text-gray-500">
                      Qty: {{ item.quantity }}
                    </p>
                    <p class="text-sm font-medium">
                      RM {{ (item.price * item.quantity).toFixed(2) }}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    class="p-0 h-5 bg-transparent hover:bg-transparent hover:text-destructive"
                    @click="cartStore.removeFromCart(item.id)"
                  >
                    <!-- Cancel Icon -->
                    <XMarkIcon class="size-4" />
                  </Button>
                </div>
                <hr v-if="cartStore.cartItems.length > 0" class="my-2" />
                <div
                  v-if="cartStore.cartItems.length > 0"
                  class="flex justify-between items-center mt-2"
                >
                  <p class="text-sm font-medium">Total:</p>
                  <p class="text-sm font-bold">
                    RM {{ cartStore.totalAmount.toFixed(2) }}
                  </p>
                </div>
                <Button
                  v-if="cartStore.cartItems.length > 0"
                  variant="default"
                  class="w-full mt-4"
                  @click="handleCheckout"
                >
                  Checkout
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover :open="isPopoverOpen" class="relative z-10">
          <PopoverTrigger
            @click="isPopoverOpen = !isPopoverOpen"
            class="list-none"
          >
            <UserCircleIcon v-if="!tokenStatus" class="cursor-pointer size-5" />
            <img
              v-else
              :src="profilePicture"
              alt="profile picture"
              class="w-6 h-6 rounded-full"
              referrerpolicy="no-referrer"
            />
          </PopoverTrigger>
          <PopoverContent
            v-if="!tokenStatus"
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
        
        <!-- Mobile menu button - only visible on smaller screens -->
        <Bars3BottomRightIcon
          @click="toggleSidebar"
          class="cursor-pointer size-5 md:hidden"
        />
      </div>
    </nav>
    
    <!-- Mobile sidebar navigation -->
    <nav
      :class="
        sidebarValue
          ? 'opacity-100 relative translate-x-0'
          : 'opacity-0 invisible absolute translate-x-[200%]'
      "
      class="px-5 py-4 transition-all duration-300 md:hidden"
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
              <p
                @click="
                  closeSidebar();
                  router.push(`/product/${product._id}`);
                "
                class="text-xs cursor-pointer"
              >
                {{ product.name }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
:global(div[data-radix-popper-content-wrapper]) {
  left: -1rem !important;
}

@media screen and (min-width: 1024px) {
  :global(div[data-radix-popper-content-wrapper]) {
    left: 0 !important;
  }
}

.cart-items-list::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.cart-items-list::-webkit-scrollbar-track {
  background-color: transparent;
}

.cart-items-list::-webkit-scrollbar-thumb {
  background-color: grey;
  border-radius: 8px;
}
</style>
