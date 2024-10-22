<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";
import { HeartIcon } from "@heroicons/vue/24/outline";
import type { Container } from "@tsparticles/engine";
import Toaster from '@/components/ui/toast/Toaster.vue'

const { width } = useWindowSize();

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
  <div
    :class="[width >= 900 && 'grid grid-cols-[500px_1fr] items-center']"
    class="overflow-hidden"
  >
    <div
      v-if="width >= 900"
      class="fixed z-20 flex items-center gap-2 left-4 top-5"
    >
      <HeartIcon class="size-6 text-primary-color" />
      <p
        :class="width >= 900 ? 'text-black' : 'text-white'"
        class="text-[14px] font-medium"
      >
        BunzStudio
      </p>
    </div>
    <slot v-if="width >= 900" />
    <div
      class="bg-[url('/assets/images/sumeru.jpg')] h-screen overflow-auto bg-cover bg-center relative z-0"
    >
      <div
        :class="width >= 900 ? 'absolute' : 'fixed'"
        class="inset-0 z-0 h-screen bg-black/45"
      ></div>
      <NuxtParticles
        class="absolute inset-0"
        id="tsparticles"
        :options="options"
        @load="onLoad"
      >
      </NuxtParticles>
      <slot v-if="width <= 900" />
    </div>
  </div>
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
