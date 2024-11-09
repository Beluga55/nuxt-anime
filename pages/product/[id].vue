<script setup>
import { useProductsStore } from "@/store/products/index.js";
import { useRouter, useRoute } from "vue-router";
import {
  ArrowLeftIcon,
  StarIcon as StarIconSolid,
} from "@heroicons/vue/24/solid";
import { StarIcon } from "@heroicons/vue/24/outline";

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
  <div class="mt-[9rem] grid gap-5" :class="props.paddingFix">
    <div class="">
      <div class="flex items-center gap-2">
        <ArrowLeftIcon class="text-black size-4 arrow-left" />
        <span class="text-xs font-medium text-black">Go Back</span>
      </div>
      <img
        :src="selectedProduct?.image"
        alt="product"
        class="w-full h-[325px] object-cover object-right mt-5 rounded-2xl"
      />
    </div>

    <div class="">
      <h1 class="product-name font-bold">{{ selectedProduct?.name }}</h1>
      <p class="text-sm my-1">{{ selectedProduct?.description }}</p>

      <div class="flex items-center mt-2.5">
        <div v-for="star in 5" :key="star">
          <StarIconSolid
            v-if="star <= selectedProduct?.rating"
            class="text-yellow-500 size-4"
          />
          <StarIcon v-else class="text-black size-4" />
        </div>
        <span class="ml-2 text-sm font-medium">({{ selectedProduct?.numReviews }} reviews)</span>
      </div>

      <p class="font-bold text-[1.5rem] my-2">RM {{ selectedProduct?.price }}</p>
    </div>
  </div>
</template>

<style scoped>
.product-name {
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: clamp(1.65rem, 3vw, 2rem);
}
</style>
