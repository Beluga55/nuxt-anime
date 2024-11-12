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

const productsStore = useProductsStore();
const route = useRoute();
const router = useRouter();

const selectedProduct = ref(null);

definePageMeta({
  layout: "nav-layout",
});

const props = defineProps({
  paddingFix: {
    type: String,
    default: "px-5",
  },
});

onMounted(async () => {
  selectedProduct.value = await productsStore.showProduct(route.params.id);
});
</script>

<template>
  <div class="mt-[9rem] grid gap-5 max-w-[1024px] mx-auto justify-center" :class="props.paddingFix">
    <div>
      <div class="flex items-center gap-2">
        <ArrowLeftIcon class="text-black size-4 arrow-left" />
        <span class="text-xs font-medium text-black">Go Back</span>
      </div>
      <img
        :src="selectedProduct?.image"
        alt="product"
        class="w-full max-w-[350px] h-[325px] object-cover object-right mt-5 rounded-2xl"
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
        <NumberField :default-value="1" :min="0">
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>

        <Button variant="default" class="w-full h-[40px] py-0 text-xs">Add To Cart</Button>
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
