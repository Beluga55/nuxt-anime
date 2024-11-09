<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";
import { FunnelIcon } from "@heroicons/vue/24/outline";
import type { DropdownMenuCheckboxItemProps } from "radix-vue";
import { Button } from "@/components/ui/button";
import { StarIcon } from "@heroicons/vue/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/vue/24/solid";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProductsStore } from "~/store/products/index.js";
import { Progress } from "@/components/ui/progress";
import { useRoute, useRouter } from "vue-router";

type Checked = DropdownMenuCheckboxItemProps["checked"];

const showAZ = ref<Checked>(false);
const showLowPrice = ref<Checked>(false);
const showKeychains = ref<Checked>(false);
const showPostCards = ref<Checked>(false);
const showBadges = ref<Checked>(false);
const showPrints = ref<Checked>(false);
const showRating = ref<Checked>(true);

definePageMeta({
  layout: "nav-layout",
});

const props = defineProps({
  paddingFix: {
    type: String,
    default: "px-5",
  },
});

const { width } = useWindowSize();
const productsStore = useProductsStore();
const currentItems = ref(8);
const totalItems = ref(0);
const isLoading = ref(false);
const progress = ref(15);
const route = useRoute();
const router = useRouter();

const displayItems = computed(() => {
  totalItems.value = productsStore.products?.data.length;
  return `Showing ${currentItems?.value} out of ${totalItems?.value} products`;
});

const sortedProducts = computed(() =>
  productsStore.products?.data
    .filter(
      (product) =>
        (!showKeychains.value &&
          !showPostCards.value &&
          !showBadges.value &&
          !showPrints.value) ||
        (showKeychains.value && product.category === "Keychains") ||
        (showPostCards.value && product.category === "Post Cards") ||
        (showBadges.value && product.category === "Badges") ||
        (showPrints.value && product.category === "Prints")
    )
    .sort((a, b) => {
      // Merge sorting conditions
      const nameSort = showAZ.value ? a.name.localeCompare(b.name) : 0;
      const priceSort = showLowPrice.value ? a.price - b.price : 0;
      const ratingSort = showRating.value ? b.rating - a.rating : 0;
      return nameSort || priceSort || ratingSort;
    })
);

const changeCurrentValue = () => {
  currentItems.value = sortedProducts?.value?.length;
};

const handleScroll = async () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    if (currentItems.value >= totalItems.value || hasReachedCategoryLimit()) {
      return;
    }
    isLoading.value = true;
    currentItems.value += 4;
    isLoading.value = false;
  }
};

const hasReachedCategoryLimit = () => {
  if (showKeychains.value) {
    return (
      currentItems.value >=
      productsStore.products?.data.filter(
        (product) => product.category === "Keychains"
      ).length
    );
  }
  if (showPostCards.value) {
    return (
      currentItems.value >=
      productsStore.products?.data.filter(
        (product) => product.category === "Post Cards"
      ).length
    );
  }
  if (showBadges.value) {
    return (
      currentItems.value >=
      productsStore.products?.data.filter(
        (product) => product.category === "Badges"
      ).length
    );
  }
  if (showPrints.value) {
    return (
      currentItems.value >=
      productsStore.products?.data.filter(
        (product) => product.category === "Prints"
      ).length
    );
  }
  return false;
};

watchEffect((fn) => {
  const timer = setTimeout(() => (progress.value = 70), 500);

  // If no category is selected, dont execute the changeCurrentValue function
  if (
    showKeychains.value === false &&
    showPostCards.value === false &&
    showBadges.value === false &&
    showPrints.value === false
  ) {
    return clearTimeout(timer);
  }

  changeCurrentValue();
  fn(() => clearTimeout(timer));
});

onMounted(() => {
  const category = route.query.category as string;

  if (category) {
    showKeychains.value = category === "Keychains";
    showPostCards.value = category === "Postcards";
    showBadges.value = category === "Badges";
    showPrints.value = category === "Prints";
  }

  window.addEventListener("scroll", handleScroll);
});
</script>

<template>
  <div
    class="bg-[url('/assets/images/hero.jpg')] h-[45vh] min-w-full bg-cover relative mt-[4.5rem] flex items-center max-w-[1024px] mx-auto"
    :class="props.paddingFix"
  >
    <div class="absolute inset-0 bg-black/70"></div>

    <div :class="width > 1024 && 'w-[1024px] mx-auto'" class="relative">
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
    :class="[
      props.paddingFix,
      'mt-10 max-w-[1024px] mx-auto',
      width >= 450 ? 'flex justify-between' : '',
    ]"
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
          :class="width >= 450 ? 'w-auto' : 'w-full'"
          class="flex items-center gap-1 text-xs"
          variant="outline"
        >
          Sort By
          <FunnelIcon class="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        class="w-40"
        :class="width >= 450 && width <= 1024 && 'mr-5'"
      >
        <DropdownMenuLabel>Sorting</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <!-- Sub Menu -->
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span class="text-xs">Categories</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent :class="width >= 450 ? 'mr-0' : 'mx-5'">
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
  <div class="py-8 max-w-[1024px] mx-auto" :class="props.paddingFix">
    <div
      :class="[
        width >= 420 && 'grid-cols-2',
        width >= 650 && 'grid-cols-3',
        width >= 900 && 'grid-cols-4',
      ]"
      class="grid items-stretch gap-4"
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
              <StarIconSolid
                v-if="star <= product.rating"
                class="text-yellow-500 size-4"
              />
              <StarIcon v-else class="text-black size-4" />
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
      <!-- Progress bar -->
      <Progress
        v-if="isLoading === true"
        v-model="progress"
        class="w-[100px] h-[5px]"
      />
    </div>
  </div>
</template>

<style scoped>
.header-title {
  font-size: clamp(2.5rem, 8vw, 4rem);
}
</style>
