<script setup>
import { useProductsStore } from "@/store/products/index.js";
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

const productsStore = useProductsStore();
const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const { toast, dismiss } = useToast();

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
});
</script>

<template>
  <Toaster />
  <div class="mt-[9rem] grid gap-5 max-w-[1024px] mx-auto justify-center sm:grid-cols-2 sm:items-center" :class="props.paddingFix">
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
        <span class="ml-2 text-xs font-semibold">({{ selectedProduct?.numReviews }} reviews)</span>
      </div>

      <p class="font-bold text-[1.5rem] my-2">RM {{ selectedProduct?.price }}</p>

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
          {{ selectedProduct?.stock ? 'Add To Cart' : 'Out of Stock' }}
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
