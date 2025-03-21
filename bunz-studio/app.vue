<script setup>
import Toaster from '@/components/ui/toast/Toaster.vue'
import { tsParticles } from "@tsparticles/engine";
import { loadStarsPreset } from "@tsparticles/preset-stars";

if (import.meta.client) {
  await loadStarsPreset(tsParticles);
}
</script>

<template>
  <Toaster />
  <NuxtLoadingIndicator :throttle="0" :height="3" :duration="1000" color="#F79489" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
