<script setup>
import { useProductsStore } from "@/store/products/index.js";

const productsStore = useProductsStore();

definePageMeta({
  layout: "nav-layout",
});

onMounted(async () => {
  if (useRoute().params.id) {
    await productsStore.showProduct(useRoute().params.id);
  }
});
</script>

<template>
  <div class="py-10"></div>
</template>
