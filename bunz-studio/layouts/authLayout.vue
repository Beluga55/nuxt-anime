<script setup lang="ts">
import { HeartIcon } from "@heroicons/vue/24/outline";
import type { Container } from "@tsparticles/engine";
import Toaster from "@/components/ui/toast/Toaster.vue";

const onLoad = (container: Container) => {
  // Do something with the container
  container.pause();
  setTimeout(() => container.play(), 2000);
};

const options = {
  fullScreen: {
    enable: false,
    zIndex: 0,
  },
  background: {
    color: {
      value: "transparent",
    },
  },
  fpsLimit: 60, // Limit FPS to 60
  particles: {
    color: {
      value: "#fff",
    },
    move: {
      enable: true,
      speed: 0.5,
    },
    number: {
      value: 100,
    },
    size: {
      value: 2,
    },
  },
  preset: "stars",
};
</script>

<template>
  <Toaster />
  <div class="overflow-hidden lg:grid lg:grid-cols-[500px_1fr] lg:items-center">
    <div
      class="fixed z-20 hidden lg:flex lg:items-center lg:gap-2 left-4 top-5"
    >
      <HeartIcon class="size-6 text-primary-color" />
      <p class="text-[14px] font-medium lg:text-black text-white">BunzStudio</p>
    </div>
    <div class="hidden lg:block">
      <slot />
    </div>
    <div
      class="bg-[url('/assets/images/sumeru.jpg')] h-screen overflow-auto bg-cover bg-center relative z-0"
    >
      <div class="inset-0 z-0 h-screen bg-black/45 lg:absolute fixed"></div>
      <NuxtParticles
        class="absolute inset-0"
        id="tsparticles"
        :options="options"
        @load="onLoad"
      >
      </NuxtParticles>
      <div class="lg:hidden block">
        <slot />
      </div>
    </div>
  </div>
</template>

<style>
@import url("../assets/css/default.css");
</style>
