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
  <!-- Product Section -->
  <div class="bg-gradient-to-br from-background-color via-secondary-color/5 to-background-color">
    <div class="container max-w-[1024px] mx-auto py-6 pt-[9rem] px-5 lg:px-0">
      <!-- Back Button -->
      <button 
        @click="router.back()" 
        class="inline-flex items-center gap-2 mb-6 group cursor-pointer transition-all duration-200 hover:gap-3 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-md hover:shadow-lg border border-secondary-color/30"
      >
        <ArrowLeftIcon class="text-text-color size-4 group-hover:text-primary-color transition-colors duration-200" />
        <span class="text-sm font-medium text-text-color group-hover:text-primary-color transition-colors duration-200">Back to Products</span>
      </button>

      <!-- Main Product Layout -->
      <div class="grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
        <!-- Product Image Section -->
        <div class="w-full">
          <div class="relative group">
            <div class="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-color/30 shadow-lg">
              <img
                :src="selectedProduct?.image"
                :alt="selectedProduct?.name"
                class="w-full h-[300px] md:h-[425px] object-cover rounded-xl shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>

        <!-- Product Info Section -->
        <div class="w-full space-y-5">
          <!-- Product Header -->
          <div class="space-y-3">
            <div class="inline-flex items-center gap-2 bg-secondary-color/25 rounded-full px-3 py-1">
              <div class="w-1.5 h-1.5 bg-primary-color rounded-full animate-pulse"></div>
              <span class="text-xs font-medium text-text-color/80">Premium Quality</span>
            </div>
            
            <h1 class="text-2xl md:text-3xl font-black font-jakarta text-text-color leading-tight">
              {{ selectedProduct?.name }}
            </h1>
            
            <p class="text-sm md:text-base text-text-color/70 leading-relaxed">
              {{ selectedProduct?.description }}
            </p>
          </div>

          <!-- Rating & Reviews -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-secondary-color/30">
            <div class="flex items-center gap-1">
              <div v-for="star in 5" :key="star">
                <StarIconSolid
                  v-if="star <= selectedProduct?.rating"
                  class="text-star-color size-5 drop-shadow-sm"
                />
                <StarIcon v-else class="text-text-color/30 size-5" />
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-lg font-bold text-text-color">{{ selectedProduct?.rating?.toFixed(1) }}</span>
              <span class="text-text-color/60">•</span>
              <span class="text-text-color/70 font-medium text-sm">{{ selectedProduct?.numReviews }} reviews</span>
            </div>
          </div>

          <!-- Price -->
          <div class="flex items-center gap-3 p-4 bg-gradient-to-r from-primary-color/10 to-accent-color/10 rounded-xl border border-primary-color/20">
            <div class="text-2xl md:text-3xl font-black text-primary-color font-jakarta">
              RM {{ selectedProduct?.price }}
            </div>
            <div class="text-xs text-text-color/60 font-medium">
              Free shipping
            </div>
          </div>

          <!-- Product Specifications -->
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-white/60 backdrop-blur-sm border border-secondary-color/30 rounded-xl p-4 group hover:bg-white/80 transition-all duration-200">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-2 h-2 bg-gradient-to-r from-primary-color to-accent-color rounded-full"></div>
                <span class="text-sm font-bold text-text-color">Width</span>
              </div>
              <p class="text-sm font-medium text-text-color/80">{{ selectedProduct?.width }}</p>
            </div>
            
            <div class="bg-white/60 backdrop-blur-sm border border-secondary-color/30 rounded-xl p-4 group hover:bg-white/80 transition-all duration-200">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-2 h-2 bg-gradient-to-r from-accent-color to-primary-color rounded-full"></div>
                <span class="text-sm font-bold text-text-color">Height</span>
              </div>
              <p class="text-sm font-medium text-text-color/80">{{ selectedProduct?.height }}</p>
            </div>
            
            <div class="bg-white/60 backdrop-blur-sm border border-secondary-color/30 rounded-xl p-4 group hover:bg-white/80 transition-all duration-200">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-2 h-2 bg-gradient-to-r from-primary-color to-accent-color rounded-full"></div>
                <span class="text-sm font-bold text-text-color">Material</span>
              </div>
              <p class="text-sm font-medium text-text-color/80">{{ selectedProduct?.material }}</p>
            </div>
            
            <div class="bg-white/60 backdrop-blur-sm border border-secondary-color/30 rounded-xl p-4 group hover:bg-white/80 transition-all duration-200">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-2 h-2 bg-gradient-to-r from-accent-color to-primary-color rounded-full"></div>
                <span class="text-sm font-bold text-text-color">Stock</span>
              </div>
              <p class="text-sm font-bold" :class="selectedProduct?.stock ? 'text-green-600' : 'text-red-500'">
                {{ selectedProduct?.stock ? `${selectedProduct.stock} available` : 'Out of Stock' }}
              </p>
            </div>
          </div>

          <!-- Add to Cart Section -->
          <div class="bg-gradient-to-r from-white/70 to-secondary-color/25 backdrop-blur-sm rounded-2xl p-5 border border-secondary-color/30 shadow-lg">
            <div class="space-y-4">
              <div class="flex items-end gap-4">
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-semibold text-text-color">Quantity</label>
                  <NumberField
                    v-model="quantity"
                    :min="1"
                    :max="selectedProduct?.stock"
                    :disabled="!selectedProduct?.stock"
                    class="w-28 border-2 border-secondary-color/50 rounded-lg focus-within:border-primary-color transition-colors duration-200"
                  >
                    <NumberFieldContent class="bg-white/80 rounded-lg">
                      <NumberFieldDecrement class="text-text-color hover:text-primary-color hover:bg-secondary-color/30 transition-colors duration-200" />
                      <NumberFieldInput class="text-center font-medium text-text-color" />
                      <NumberFieldIncrement class="text-text-color hover:text-primary-color hover:bg-secondary-color/30 transition-colors duration-200" />
                    </NumberFieldContent>
                  </NumberField>
                </div>

                <Button
                  variant="default"
                  class="flex-1 h-12 bg-gradient-to-r from-primary-color to-accent-color hover:from-accent-color hover:to-primary-color text-text-color-light font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100"
                  @click="addToCart"
                  :disabled="!selectedProduct?.stock"
                >
                  <span class="flex items-center gap-2 text-sm font-bold">
                    {{ selectedProduct?.stock ? "Add To Cart" : "Out of Stock" }}
                    <svg v-if="selectedProduct?.stock" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13l-1.1-5M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"></path>
                    </svg>
                  </span>
                </Button>
              </div>
              
              <div class="flex items-center gap-4 text-xs text-text-color/60">
                <div class="flex items-center gap-1.5">
                  <svg class="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span>Secure checkout</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <svg class="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                  </svg>
                  <span>Fast delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
