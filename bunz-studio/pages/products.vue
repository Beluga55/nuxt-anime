<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";
import { Filter } from "lucide-vue-next";
import type { DropdownMenuCheckboxItemProps } from "radix-vue";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-vue-next";
import { Star as StarSolid } from "lucide-vue-next";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProductsStore } from "~/store/products/index.js";
import { useRoute, useRouter } from "vue-router";
import { useThrottleFn } from "@vueuse/core";

interface Product {
  _id: string;
  name: string;
  price: number;
  rating: number;
  category: string;
  imageUrl: string;
  numReviews: number;
}

interface FilterState {
  categories: Record<string, boolean>;
  sort: {
    az: boolean;
    lowPrice: boolean;
    rating: boolean;
  };
}

definePageMeta({
  layout: "nav-layout",
});

// Create a composable for product filtering and sorting
const useProductFiltering = () => {
  const filterState = reactive<FilterState>({
    categories: {
      Keychains: false,
      "Post Cards": false,
      Badges: false,
      Prints: false,
    },
    sort: {
      az: false,
      lowPrice: false,
      rating: true,
    },
  });

  const productsStore = useProductsStore();

  const hasActiveCategories = computed(() =>
    Object.values(filterState.categories).some(Boolean)
  );

  const filteredProducts = computed(() => {
    const products = productsStore.products?.data || [];

    if (!hasActiveCategories.value) {
      return products;
    }

    return products.filter(
      (product) =>
        filterState.categories[
          product.category as keyof typeof filterState.categories
        ]
    );
  });

  const sortedProducts = computed(() => {
    if (!filteredProducts.value.length) return [];

    const products = [...filteredProducts.value];

    return products.sort((a, b) => {
      if (filterState.sort.az) {
        const nameCompare = a.name.localeCompare(b.name);
        if (nameCompare !== 0) return nameCompare;
      }

      if (filterState.sort.lowPrice) {
        const priceCompare = a.price - b.price;
        if (priceCompare !== 0) return priceCompare;
      }

      if (filterState.sort.rating) {
        return b.rating - a.rating;
      }

      return 0;
    });
  });

  return {
    filterState,
    sortedProducts,
    hasActiveCategories,
  };
};

const productsStore = useProductsStore();
const currentItems = ref(8);
const totalItems = ref(0);
const isLoading = ref(false);
const route = useRoute();
const router = useRouter();

const { filterState, sortedProducts, hasActiveCategories } =
  useProductFiltering();

// Computed properties for checkbox bindings
const showKeychains = computed({
  get: () => filterState.categories.Keychains,
  set: (value) => (filterState.categories.Keychains = value),
});

const showPostCards = computed({
  get: () => filterState.categories["Post Cards"],
  set: (value) => (filterState.categories["Post Cards"] = value),
});

const showBadges = computed({
  get: () => filterState.categories.Badges,
  set: (value) => (filterState.categories.Badges = value),
});

const showPrints = computed({
  get: () => filterState.categories.Prints,
  set: (value) => (filterState.categories.Prints = value),
});

const showAZ = computed({
  get: () => filterState.sort.az,
  set: (value) => (filterState.sort.az = value),
});

const showLowPrice = computed({
  get: () => filterState.sort.lowPrice,
  set: (value) => (filterState.sort.lowPrice = value),
});

const showRating = computed({
  get: () => filterState.sort.rating,
  set: (value) => (filterState.sort.rating = value),
});

const displayItems = computed(() => {
  totalItems.value = sortedProducts.value.length;
  return `Showing ${currentItems.value} out of ${totalItems.value} products`;
});

const changeCurrentValue = () => {
  currentItems.value = sortedProducts.value.length;
};

// Optimize loading logic
const loadMoreThreshold = 200; // pixels from bottom
const canLoadMore = computed(() => {
  const activeCategory = Object.entries(filterState.categories).find(
    ([_, isActive]) => isActive
  )?.[0];

  if (!activeCategory) {
    return currentItems.value < totalItems.value;
  }

  const categoryProducts = productsStore.products?.data.filter(
    (product) => product.category === activeCategory
  );

  return currentItems.value < (categoryProducts?.length || 0);
});

const handleScroll = useThrottleFn(() => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const documentHeight = document.body.offsetHeight;

  if (
    scrollPosition >= documentHeight - loadMoreThreshold &&
    !isLoading.value
  ) {
    if (currentItems.value < sortedProducts.value.length) {
      isLoading.value = true;
      setTimeout(() => {
        currentItems.value += 4;
        isLoading.value = false;
      }, 500);
    }
  }
}, 100);

watchEffect((fn) => {
  const timer = setTimeout(() => {}, 500);

  if (!hasActiveCategories.value) {
    return clearTimeout(timer);
  }

  changeCurrentValue();
  fn(() => clearTimeout(timer));
});

onMounted(() => {
  const category = route.query.category as string;

  if (category) {
    const categoryMap: Record<string, keyof typeof filterState.categories> = {
      Keychains: "Keychains",
      Postcards: "Post Cards",
      Badges: "Badges",
      Prints: "Prints",
    };

    const mappedCategory = categoryMap[category];
    if (mappedCategory) {
      filterState.categories[mappedCategory] = true;
    }
  }

  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <div
    class="bg-[url('/assets/images/hero.jpg')] h-[45vh] min-w-full bg-cover relative mt-[4.5rem] flex items-center max-w-[1024px] mx-auto px-5 lg:px-0"
  >
    <div class="absolute inset-0 bg-black/70"></div>

    <div class="relative lg:w-[1024px] lg:mx-auto">
      <h1 class="font-medium header-title text-text-color-light">
        All Products
      </h1>
      <p class="text-sm leading-7 text-text-color-light max-w-[400px]">
        A wide variety of products are waiting for you to become yours. Use the
        filter to find your perfect match.
      </p>
    </div>
  </div>

  <div
    class="mt-10 max-w-[1024px] mx-auto px-5 lg:px-0 block sm:flex sm:justify-between"
  >
    <div class="grid gap-2 mb-5">
      <p class="text-base font-medium header-font">
        {{ displayItems }}
      </p>
      <!-- Temp will fix ltr -->
      <p class="text-[13px]">
        Note: Combining sorting methods will prioritize alphabetical order.
      </p>
    </div>
    <DropdownMenu :modal="false">
      <DropdownMenuTrigger as-child>
        <Button
          class="w-full sm:w-auto flex items-center gap-1 text-xs"
          variant="outline"
        >
          Sort By
          <FunnelIcon class="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        class="w-40"
      >
        <DropdownMenuLabel>Sorting</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <!-- Sub Menu -->
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span class="text-xs">Categories</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent class="mx-5 sm:mr-0">
              <DropdownMenuCheckboxItem
                @click="changeCurrentValue"
                v-model:checked="showKeychains"
              >
                <span class="text-xs">Keychains</span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                @click="changeCurrentValue"
                v-model:checked="showPostCards"
              >
                <span class="text-xs">Post Cards</span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                @click="changeCurrentValue"
                v-model:checked="showBadges"
              >
                <span class="text-xs">Badges</span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                @click="changeCurrentValue"
                v-model:checked="showPrints"
              >
                <span class="text-xs">Prints</span>
              </DropdownMenuCheckboxItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuCheckboxItem @click="" v-model:checked="showAZ">
          <span class="text-xs">A-Z</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem v-model:checked="showLowPrice">
          <span class="text-xs">Low Price</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem v-model:checked="showRating">
          <span class="text-xs">High Rating</span>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

  <!-- Fetch 8 items first -> scroll loading more items (8) -> update the quantity of the h2 -> if finish product then display a empty state (no more products)-->
  <div class="py-8 max-w-[1024px] mx-auto px-5 md:px-0">
    <div
      class="grid items-stretch gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      <div
        class="grid border-[1px] rounded-[8px] border-border-color px-4 py-4 cursor-pointer"
        v-for="(product, index) in sortedProducts?.slice(0, currentItems)"
        :key="index"
        @click="router.push(`/product/${product._id}`)"
      >
        <img
          :src="product.imageUrl"
          alt="product"
          class="w-[120px] h-[120px] object-cover object-top justify-self-center rounded-[8px]"
        />
        <div class="grid gap-1.5 mt-4">
          <h2 class="text-[15px] font-medium header-font">
            {{ product.name }}
          </h2>
          <p class="text-sm font-medium">RM {{ product.price }}</p>

          <div class="flex items-center mt-1">
            <div v-for="star in 5" :key="star">
              <StarSolid
                v-if="star <= product.rating"
                class="text-yellow-500 size-4"
              />
              <Star v-else class="text-black size-4" />
            </div>
            <div class="ml-2">
              <p class="text-xs font-medium">
                ({{ product.numReviews }} reviews)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-center mt-6">
      <div
        v-if="isLoading"
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.header-title {
  font-size: clamp(2.5rem, 8vw, 4rem);
}
</style>
