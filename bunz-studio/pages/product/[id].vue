<script setup>
import {
  ArrowLeftIcon,
  StarIcon as StarIconSolid,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/solid";
import { StarIcon, FunnelIcon } from "@heroicons/vue/24/outline";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field";
import { useCartStore } from "@/store/cart";
import { useToast } from "@/components/ui/toast/use-toast";
import { useReviewStore } from "@/store/reviews";
import { onMounted, onUnmounted, watchEffect } from "vue";
import DefaultUserIcon from "@/assets/images/default-user-icon.jpg";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useThrottleFn } from "@vueuse/core";
import { useProductsStore } from "~/store/products";

const productsStore = useProductsStore();
const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const { toast, dismiss } = useToast();
const reviewStore = useReviewStore();

const selectedProduct = ref(null);
const quantity = ref(1);

definePageMeta({
  layout: "nav-layout",
});

const addToCart = () => {
  try {
    cartStore.addToCart(selectedProduct.value, quantity.value);
    toast({
      title: "Added to cart",
      description: `${quantity.value} x ${selectedProduct.value.name} added to cart`,
    });
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Cannot add to cart",
      description: error.message,
    });
  }
};

onMounted(async () => {
  selectedProduct.value = await productsStore.showProduct(route.params.id);
  reviewStore.getProductReviews({ productId: route.params.id });
  
  // Initial load of products
  const products = await productsStore.getProducts();
  
  // Add scroll event listener
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

const currentItems = ref(8);
const totalItems = ref(0);
const isLoading = ref(false);
const progress = ref(15);

// Create a composable for product filtering and sorting
const useProductFiltering = () => {
  const filterState = reactive({
    categories: {
      Keychains: false,
      'Post Cards': false,
      Badges: false,
      Prints: false
    },
    sort: {
      az: false,
      lowPrice: false,
      rating: true
    }
  });

  const hasActiveCategories = computed(() => 
    Object.values(filterState.categories).some(Boolean)
  );

  const filteredProducts = computed(() => {
    const products = productsStore.products?.data || [];
    
    if (!hasActiveCategories.value) {
      return products.filter(p => p._id !== route.params.id); // Exclude current product
    }

    return products.filter(product => 
      filterState.categories[product.category] && product._id !== route.params.id
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
    hasActiveCategories
  };
};

const { filterState, sortedProducts, hasActiveCategories } = useProductFiltering();

watchEffect((fn) => {
  const timer = setTimeout(() => (progress.value = 70), 500);

  if (!hasActiveCategories.value) {
    return clearTimeout(timer);
  }

  changeCurrentValue();
  fn(() => clearTimeout(timer));
});

// Computed properties for checkbox bindings
const showKeychains = computed({
  get: () => filterState.categories.Keychains,
  set: (value) => filterState.categories.Keychains = value
});

const showPostCards = computed({
  get: () => filterState.categories['Post Cards'],
  set: (value) => filterState.categories['Post Cards'] = value
});

const showBadges = computed({
  get: () => filterState.categories.Badges,
  set: (value) => filterState.categories.Badges = value
});

const showPrints = computed({
  get: () => filterState.categories.Prints,
  set: (value) => filterState.categories.Prints = value
});

const showAZ = computed({
  get: () => filterState.sort.az,
  set: (value) => filterState.sort.az = value
});

const showLowPrice = computed({
  get: () => filterState.sort.lowPrice,
  set: (value) => filterState.sort.lowPrice = value
});

const showRating = computed({
  get: () => filterState.sort.rating,
  set: (value) => filterState.sort.rating = value
});

const displayItems = computed(() => {
  totalItems.value = sortedProducts.value.length;
  return `Showing ${currentItems.value} out of ${totalItems.value} products`;
});

const changeCurrentValue = () => {
  currentItems.value = 8;
};

// Optimize loading logic
const loadMoreThreshold = 200;
const canLoadMore = computed(() => {
  const activeCategory = Object.entries(filterState.categories)
    .filter(([_, isActive]) => isActive)
    .map(([category]) => category);

  if (activeCategory.length === 0) {
    return sortedProducts.value.length > currentItems.value;
  }

  const filteredByCategory = sortedProducts.value.filter(
    (product) => activeCategory.includes(product.category)
  );

  return filteredByCategory.length > currentItems.value;
});

const handleScroll = useThrottleFn(() => {
  if (!canLoadMore.value || isLoading.value) return;

  const scrollPosition = window.scrollY + window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  
  if (documentHeight - scrollPosition < loadMoreThreshold) {
    loadMore();
  }
}, 200);

const loadMore = async () => {
  if (!canLoadMore.value || isLoading.value) return;
  
  isLoading.value = true;
  
  // Simulate loading delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  currentItems.value += 4;
  isLoading.value = false;
};
</script>

<template>
  <Toaster />
  <div
    class="mt-[9rem] grid gap-5 max-w-[1024px] mx-auto justify-center sm:grid-cols-2 sm:items-center px-5 lg:px-0"
  >
    <div>
      <div class="flex items-center gap-2">
        <ArrowLeftIcon class="text-black size-4 arrow-left" />
        <span class="text-xs font-medium text-black">Go Back</span>
      </div>
      <img
        :src="selectedProduct?.image"
        alt="product"
        class="w-full max-w-[350px] h-[325px] object-cover object-right mt-5 rounded-2xl md:max-w-[450px] md:h-[400px]"
      />
    </div>

    <div>
      <h1 class="font-black font-jakarta product-name">
        {{ selectedProduct?.name }}
      </h1>
      <p class="my-1 text-sm">{{ selectedProduct?.description }}</p>

      <div class="flex items-center mt-2.5">
        <div v-for="star in 5" :key="star">
          <StarIconSolid
            v-if="star <= selectedProduct?.rating"
            class="text-yellow-500 size-4"
          />
          <StarIcon v-else class="text-black size-4" />
        </div>
        <span class="ml-2 text-xs font-semibold"
          >({{ selectedProduct?.numReviews }} reviews)</span
        >
      </div>

      <p class="font-black text-[1.5rem] my-2">
        RM {{ selectedProduct?.price }}
      </p>

      <hr class="border-[1px] border-[rgba(0,0,0,0.2)] rounded-[4px]" />

      <div class="grid grid-cols-2 gap-3 my-7">
        <div class="border-[gray] border-[1px] rounded-[4px] p-3 bg-white/50">
          <p class="mb-2 text-sm font-bold">Width</p>
          <p class="text-xs leading-5">{{ selectedProduct?.width }}</p>
        </div>
        <div class="border-[gray] border-[1px] rounded-[4px] p-3 bg-white/50">
          <p class="mb-2 text-sm font-bold">Height</p>
          <p class="text-xs leading-5">{{ selectedProduct?.height }}</p>
        </div>
        <div class="border-[gray] border-[1px] rounded-[4px] p-3 bg-white/50">
          <p class="mb-2 text-sm font-bold">Material</p>
          <p class="text-xs leading-5">{{ selectedProduct?.material }}</p>
        </div>
        <div class="border-[gray] border-[1px] rounded-[4px] p-3 bg-white/50">
          <p class="mb-2 text-sm font-bold">Stock</p>
          <p class="text-xs leading-5">{{ selectedProduct?.stock }}</p>
        </div>
      </div>

      <hr class="border-[1px] border-[rgba(0,0,0,0.2)] rounded-[4px]" />

      <div class="flex items-center gap-2 mt-7">
        <NumberField
          v-model="quantity"
          :min="1"
          :max="selectedProduct?.stock"
          :disabled="!selectedProduct?.stock"
        >
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>

        <Button
          variant="default"
          class="w-full h-[40px] py-0 text-xs"
          @click="addToCart"
          :disabled="!selectedProduct?.stock"
        >
          {{ selectedProduct?.stock ? "Add To Cart" : "Out of Stock" }}
        </Button>
      </div>
    </div>
  </div>

  <div class="py-20 max-w-[1024px] mx-auto px-5 lg:px-0">
    <!-- Product Reviews -->
    <div class="space-y-8">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-black font-jakarta">Customer Reviews</h2>
        <div v-if="reviewStore.hasReviews" class="flex items-center gap-2">
          <div class="flex items-center text-yellow-400">
            <span v-for="i in 5" :key="i" class="text-xl">
              {{ i <= reviewStore.averageRating ? "★" : "☆" }}
            </span>
          </div>
          <span class="text-gray-600 font-semibold text-sm"
            >({{ reviewStore.averageRating }})</span
          >
        </div>
      </div>

      <div v-if="reviewStore.loading" class="text-center py-4">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"
        ></div>
      </div>

      <div v-else-if="reviewStore.error" class="text-red-500 text-center py-4">
        {{ reviewStore.error }}
      </div>

      <div
        v-else-if="!reviewStore.hasReviews"
        class="text-center py-4 text-gray-500 text-sm"
      >
        No reviews yet for this product
      </div>

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[200px]"
      >
        <div
          v-for="review in reviewStore.productReviews"
          :key="review.id"
          class="bg-white/50 p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center"
        >
          <div class="flex items-center gap-4 mb-4">
            <img
              :src="review.userImage ? review.userImage : DefaultUserIcon"
              :alt="review.username"
              class="w-12 h-12 rounded-full object-cover"
            />

            <div class="flex-grow">
              <h3 class="font-medium text-gray-900 text-sm font-jakarta">
                {{ review.username }}
              </h3>
              <div class="flex items-center gap-2">
                <div class="flex text-yellow-400">
                  <span v-for="i in 5" :key="i">
                    {{ i <= review.rating ? "★" : "☆" }}
                  </span>
                </div>
                <span class="text-sm text-gray-500">
                  {{ new Date(review.dateCreated).toLocaleDateString() }}
                </span>
              </div>
            </div>
          </div>

          <p class="text-gray-700 text-sm mt-2 leading-relaxed">
            {{ review.testimonial }}
          </p>
        </div>
      </div>
      <!-- Pagination Controls -->
      <div
        v-if="reviewStore.pagination.totalPages > 1"
        class="flex items-center justify-center gap-4 mt-5"
      >
        <Button
          variant="secondary"
          class="border-zinc-400 border-[1px] px-2 py-2 h-auto"
          @click="
            reviewStore.getProductReviews({
              productId: route.params.id,
              page: reviewStore.pagination.currentPage - 1,
            })
          "
          :disabled="!reviewStore.pagination.hasPrevPage"
        >
          <ChevronLeftIcon class="size-4" />
        </Button>

        <span class="text-sm text-gray-600">
          Page {{ reviewStore.pagination.currentPage }} of
          {{ reviewStore.pagination.totalPages }}
        </span>

        <Button
          variant="secondary"
          class="border-zinc-400 border-[1px] px-2 py-2 h-auto"
          @click="
            reviewStore.getProductReviews({
              productId: route.params.id,
              page: reviewStore.pagination.currentPage + 1,
            })
          "
          :disabled="!reviewStore.pagination.hasNextPage"
        >
          <ChevronRightIcon class="size-4" />
        </Button>
      </div>
    </div>
  </div>

  <!-- More Products -->
  <div class="py-8 max-w-[1024px] mx-auto px-5 lg:px-0">
    <div class="mt-10 max-w-[1024px] mx-auto px-5 lg:px-0 flex flex-col md:flex-row md:justify-between">
      <div class="grid gap-2 mb-5">
        <h2 class="text-2xl font-black font-jakarta">More Products</h2>
        <p class="text-[13px]">
          Note: Combining sorting methods will prioritize alphabetical order.
        </p>
      </div>
      <DropdownMenu :modal="false">
        <DropdownMenuTrigger as-child>
          <Button
            class="w-full md:w-auto flex items-center gap-1 text-xs"
            variant="outline"
          >
            Sort By
            <FunnelIcon class="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-40 md:mr-5 lg:mr-0"
        >
          <DropdownMenuLabel>Sorting</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <!-- Sub Menu -->
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span class="text-xs">Categories</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent class="mx-5 md:mr-0">
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
      <div
        v-if="isLoading"
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"
      ></div>
    </div>
  </div>

</template>

<style scoped>
.product-name {
  font-size: clamp(1.65rem, 3vw, 2rem);
}
</style>
