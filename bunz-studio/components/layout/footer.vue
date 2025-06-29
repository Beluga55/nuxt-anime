<script setup>
import Visa from "@/assets/images/visa.svg";
import Mastercard from "@/assets/images/mastercard.svg";
import Paypal from "@/assets/images/paypal.svg";
import Amex from "@/assets/images/amex.svg";
import Jcb from "@/assets/images/jcb.svg";

import { Heart } from "lucide-vue-next";
</script>

<template>
  <footer
    class="flex gap-4 pt-20 py-12 max-w-[1024px] mx-auto px-5 lg:px-0 flex-col md:flex-row"
  >
    <div class="flex-1">
      <div class="flex items-center gap-2">
        <Heart class="size-6 text-primary-color" />
        <p class="text-[14px] font-medium">BunzStudio</p>
      </div>

      <p class="text-[14px] mt-4 max-w-[300px]">
        Dive into the World of Anime with Exclusive Merch, Apparel, and
        Collectibles. Celebrate Your Passion!
      </p>
    </div>
    <div class="flex flex-1 gap-4 flex-col sm:flex-row">
      <div class="flex-1 md:justify-end md:grid">
        <span class="font-semibold text-[14px] relative w-fit footer-title"
          >Quick Links</span
        >
        <ul class="grid gap-2 mt-4 list-none">
          <li><NuxtLink class="text-[14px]" to="/">Home</NuxtLink></li>
          <li><NuxtLink class="text-[14px]" to="/about">About</NuxtLink></li>
          <li>
            <NuxtLink class="text-[14px]" to="/products">Products</NuxtLink>
          </li>
        </ul>
      </div>

      <div class="flex-1 md:justify-end md:grid">
        <span class="font-semibold text-[14px] relative w-fit footer-title"
          >Support</span
        >
        <ul class="grid gap-2 mt-4 list-none">
          <li><NuxtLink class="text-[14px]" to="/faqs">FAQs</NuxtLink></li>
          <li>
            <NuxtLink class="text-[14px]" to="/feedback">Feedback</NuxtLink>
          </li>
          <li>
            <NuxtLink class="text-[14px]" to="/contact">Contact Us</NuxtLink>
          </li>
        </ul>
      </div>

      <div class="flex-1 md:justify-end md:grid">
        <span class="font-semibold text-[14px] relative w-fit footer-title"
          >Social</span
        >
        <ul class="grid gap-2 mt-4 list-none">
          <li>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-[14px]"
              >Instagram</a
            >
          </li>
          <li>
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-[14px]"
              >Facebook</a
            >
          </li>
          <li>
            <a
              href="https://www.twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-[14px]"
              >Twitter</a
            >
          </li>
        </ul>
      </div>
    </div>
  </footer>
  <footer class="pb-20 max-w-[1024px] mx-auto px-5 lg:px-0 sm:flex sm:items-center sm:justify-between sm:flex-wrap sm:gap-4">
    <p class="text-xs font-medium text-center">
      &copy; 2024 BunzStudio. All Rights Reserved.
    </p>
    <div class="flex items-center justify-center gap-3 mt-4 sm:mt-0">
      <img :src="Visa" alt="Visa" class="w-11 h-7" />
      <img :src="Mastercard" alt="Mastercard" class="w-11 h-7" />
      <img :src="Paypal" alt="Paypal" class="w-11 h-7" />
      <img :src="Amex" alt="Amex" class="w-11 h-7" />
      <img :src="Jcb" alt="JCB" class="w-11 h-7" />
    </div>
  </footer>
</template>

<style scoped>
.footer-title::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 2px;
  background: #f79489;
  bottom: -2px;
  left: 0;
  border-radius: 8px;
}
</style>
