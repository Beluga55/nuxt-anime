<script setup lang="ts">
import TopNav from "@/components/layout/topNav.vue";
import Footer from "@/components/layout/footer.vue";
import { useProductsStore } from "@/store/products/index.js";
import { useWindowSize } from "@vueuse/core";

const productsStore = useProductsStore();
const { width } = useWindowSize();

const isDesktop = computed(() => width.value >= 768);
const paddingFix = computed(() => (width.value >= 1024 ? "px-0" : "px-5"));

onMounted(async () => {
  if (!productsStore.products) {
    await productsStore.getProducts();
  }
});
</script>

<template>
  <TopNav :isDesktop="isDesktop" :paddingFix="paddingFix" />
  <NuxtPage :paddingFix="paddingFix" />
  <Footer :paddingFix="paddingFix" />
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Jersey+25&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap");

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: "Jersey 25", sans-serif;
}

body {
  background-color: #f9f1f0;
  font-family: "Plus Jakarta Sans", sans-serif;
  -webkit-font-smoothing: antialiased;
}

p {
  line-height: 1.75;
}

.header-font {
  font-family: "Plus Jakarta Sans", sans-serif;
}

.backdrop-filter-light {
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  background-color: rgba(255, 255, 255, 0.75);
  border-radius: 12px;
  border: 1px solid rgba(209, 213, 219, 0.3);
}
</style>
