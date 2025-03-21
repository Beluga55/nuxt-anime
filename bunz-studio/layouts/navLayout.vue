<script setup lang="ts">
import TopNav from "@/components/layout/topNav.vue";
import Footer from "@/components/layout/footer.vue";
import { useProductsStore } from "@/store/products/index.js";

const productsStore = useProductsStore();

onMounted(async () => {
  if (!productsStore.products) {
    await productsStore.getProducts();
  }
});
</script>

<template>
  <TopNav />
  <NuxtPage />
  <Footer />
</template>

<style>
@import url("../assets/css/default.css");
</style>
