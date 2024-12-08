<script setup>
import { useProductsStore } from "@/store/products";
import { useRouter, useRoute } from "vue-router";
import {
  ArrowLeftIcon,
  StarIcon as StarIconSolid,
} from "@heroicons/vue/24/solid";
import { StarIcon } from "@heroicons/vue/24/outline";
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
import { onMounted } from "vue";
import DefaultUserIcon from "@/assets/images/default-user-icon.jpg";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/solid";
import { Button } from "@/components/ui/button";

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

const props = defineProps({
  paddingFix: {
    type: String,
    default: "px-5",
  },
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
});
</script>

<template>
  <Toaster />
  <div
    class="mt-[9rem] grid gap-5 max-w-[1024px] mx-auto justify-center sm:grid-cols-2 sm:items-center"
    :class="props.paddingFix"
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
      <h1 class="font-bold product-name">{{ selectedProduct?.name }}</h1>
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

      <p class="font-bold text-[1.5rem] my-2">
        RM {{ selectedProduct?.price }}
      </p>

      <hr class="border-[1px] border-[rgba(0,0,0,0.2)] rounded-[4px]" />

      <div class="grid grid-cols-2 gap-3 my-7">
        <div class="border-[gray] border-[1px] rounded-[4px] p-3">
          <p class="mb-2 text-sm font-bold">Width</p>
          <p class="text-xs leading-5">{{ selectedProduct?.width }}</p>
        </div>
        <div class="border-[gray] border-[1px] rounded-[4px] p-3">
          <p class="mb-2 text-sm font-bold">Height</p>
          <p class="text-xs leading-5">{{ selectedProduct?.height }}</p>
        </div>
        <div class="border-[gray] border-[1px] rounded-[4px] p-3">
          <p class="mb-2 text-sm font-bold">Material</p>
          <p class="text-xs leading-5">{{ selectedProduct?.material }}</p>
        </div>
        <div class="border-[gray] border-[1px] rounded-[4px] p-3">
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

  <div class="py-20 max-w-[1024px] mx-auto" :class="props.paddingFix">
    <!-- Product Reviews -->
    <div class="space-y-8">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-semibold">Customer Reviews</h2>
        <div v-if="reviewStore.hasReviews" class="flex items-center gap-2">
          <div class="flex items-center text-yellow-400">
            <span v-for="i in 5" :key="i" class="text-xl">
              {{ i <= reviewStore.averageRating ? "★" : "☆" }}
            </span>
          </div>
          <span class="text-gray-600">({{ reviewStore.averageRating }})</span>
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

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="review in reviewStore.productReviews"
          :key="review.id"
          class="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
        >
          <div class="flex items-center gap-4 mb-4">
            <img
              :src="review.userImage ? review.userImage : DefaultUserIcon"
              :alt="review.username"
              class="w-12 h-12 rounded-full object-cover"
            />

            <div class="flex-grow">
              <h3 class="font-medium text-gray-900">{{ review.username }}</h3>
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

          <p class="text-gray-700 leading-relaxed">{{ review.testimonial }}</p>
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
</template>

<style scoped>
.product-name {
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: clamp(1.65rem, 3vw, 2rem);
}
</style>
