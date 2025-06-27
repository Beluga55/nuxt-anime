<!-- Create a success page here with responsive design -->
<script setup>
import { useRouter, useRoute } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { CheckCircle } from "lucide-vue-next";
import { useOrderStore } from "@/store/order/index.js";
import { useCartStore } from "@/store/cart";

const cartStore = useCartStore();
const orderStore = useOrderStore();
const router = useRouter();
const route = useRoute();
const showConfetti = ref(true);
const confettiCount = 50; // Number of confetti pieces
const confettiColors = [
  "#fd7968", // primary-color
  "#FADCD9", // secondary-color
  "#F79489", // accent-color
  "#EFC94C", // star-color
  "#F9F1F0", // background-color
];

// Order data
const orderId = ref("");
const orderItems = ref([]);
const sessionId = ref("");
const isLoading = ref(true);
const error = ref(null);
const order = ref(null);

// Generate confetti data once instead of in the template
const confettiItems = ref([]);

// Compute total amount
const totalAmount = computed(() => {
  if (order.value && order.value.orderItems) {
    return order.value.orderItems
      .reduce((total, item) => {
        return total + (item.product.price * item.qty);
      }, 0)
      .toFixed(2);
  }
  return "0.00";
});

// Fetch order details by session ID
const fetchOrderBySessionId = async (sessionId) => {
  try {
    isLoading.value = true;
    const response = await orderStore.fetchOrderBySessionId(sessionId);

    if (response && response.order) {
      // Set the order object
      order.value = response.order;
      
      // Set order ID from metadata
      if (order.value.metadata && order.value.metadata.order_id) {
        orderId.value = order.value.metadata.order_id;
      }
    }

    isLoading.value = false;
  } catch (err) {
    console.error("Error fetching order details:", err);

    // Check if the order is still processing
    if (err.response && err.response.data && err.response.data.processing) {
      error.value =
        "Your order is still processing. Please check back in a moment.";
    } else {
      error.value = "Failed to load order details. Please contact support.";
    }

    isLoading.value = false;
  }
};

onMounted(() => {
  // Clear the cart
  cartStore.clearCart();

  // Generate confetti data
  for (let i = 0; i < confettiCount; i++) {
    confettiItems.value.push({
      id: i,
      fallDelay: `${Math.random() * 5}s`,
      fallDistance: `${50 + Math.random() * 30}vh`,
      leftPos: `${Math.random() * 100}%`,
      bgColor:
        confettiColors[Math.floor(Math.random() * confettiColors.length)],
      type: i % 3, // 0: circle, 1: triangle, 2: diamond
    });
  }

  if (route.query.session_id) {
    sessionId.value = route.query.session_id;
    fetchOrderBySessionId(sessionId.value);
  }
});

// Navigate to home page
const goToHome = () => {
  router.push("/");
};

// Navigate to products page
const viewProducts = () => {
  router.push("/products");
};
</script>

<template>
  <div
    class="min-h-screen flex justify-center items-center p-4 sm:p-8 bg-gradient-to-br from-background-color to-secondary-color relative overflow-hidden"
  >
    <!-- Confetti animation -->
    <div
      v-if="showConfetti"
      class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
    >
      <div
        v-for="item in confettiItems"
        :key="item.id"
        :class="[
          'confetti',
          item.type === 0 ? 'confetti-circle' : '',
          item.type === 1 ? 'confetti-triangle' : '',
          item.type === 2 ? 'confetti-diamond' : '',
        ]"
        :style="{
          '--fall-delay': item.fallDelay,
          '--fall-distance': item.fallDistance,
          '--left-pos': item.leftPos,
          '--bg-color': item.bgColor,
        }"
      ></div>
    </div>

    <div
      class="max-w-lg w-full relative z-10"
    >
      <!-- Main Success Card -->
      <div class="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-3xl rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
        <!-- Header Section with Success Icon -->
        <div class="bg-gradient-to-r from-primary-color/10 to-accent-color/10 p-6 text-center relative">
          <!-- Decorative circles -->
          <div class="absolute top-3 right-3 w-16 h-16 bg-primary-color/5 rounded-full"></div>
          <div class="absolute bottom-2 left-3 w-10 h-10 bg-accent-color/5 rounded-full"></div>
          
          <!-- Success icon with enhanced styling -->
          <div class="relative">
            <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-color/20 to-accent-color/20 rounded-full flex items-center justify-center shadow-lg border border-primary-color/30">
              <div class="w-16 h-16 bg-gradient-to-br from-primary-color/30 to-accent-color/30 rounded-full flex items-center justify-center">
                <CheckCircle class="w-10 h-10 text-primary-color check-icon drop-shadow-sm" />
              </div>
            </div>
          </div>

          <!-- Success message -->
          <h1 class="text-2xl font-black text-text-color mb-2 font-jakarta">Payment Successful!</h1>
          <p class="text-sm text-text-color/70 leading-relaxed">
            Thank you for your purchase! A confirmation has been sent to your email.
          </p>
        </div>

        <!-- Order Summary Card -->
        <div class="p-6">
          <div class="bg-gradient-to-br from-white/60 to-secondary-color/20 backdrop-blur-sm border border-secondary-color/30 rounded-xl p-4 mb-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-2 h-2 bg-gradient-to-r from-primary-color to-accent-color rounded-full"></div>
              <h2 class="text-lg font-bold text-text-color font-jakarta">Order Summary</h2>
            </div>

            <!-- Order Info Grid -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="bg-white/60 backdrop-blur-sm border border-secondary-color/30 rounded-lg p-3">
                <div class="text-center">
                  <span class="text-xs font-semibold text-text-color/70 block mb-1">Order ID</span>
                  <span class="font-mono text-sm font-bold text-primary-color">#{{ orderId }}</span>
                </div>
              </div>
              <div class="bg-white/60 backdrop-blur-sm border border-secondary-color/30 rounded-lg p-3">
                <div class="text-center">
                  <span class="text-xs font-semibold text-text-color/70 block mb-1">Date</span>
                  <span class="text-sm font-bold text-text-color">{{
                    order
                      ? new Date(order.datePlaced).toLocaleDateString()
                      : new Date().toLocaleDateString()
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Loading state -->
            <div v-if="isLoading" class="py-6 text-center">
              <div class="animate-spin rounded-full h-6 w-6 border-2 border-primary-color border-t-transparent mx-auto mb-3"></div>
              <p class="text-text-color/70 font-medium text-sm">Loading order details...</p>
            </div>

            <!-- Error state -->
            <div v-else-if="error" class="py-6 text-center">
              <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <p class="text-red-500 font-medium text-sm">{{ error }}</p>
            </div>

            <!-- Order items -->
            <div v-else-if="order && order.orderItems && order.orderItems.length > 0">
              <div class="border-t border-secondary-color/30 my-4"></div>
              <h3 class="text-md font-bold text-text-color mb-3 font-jakarta">Items Ordered</h3>
              <div class="space-y-2">
                <div
                  v-for="(item, index) in order.orderItems"
                  :key="index"
                  class="bg-white/80 backdrop-blur-sm border border-secondary-color/30 rounded-lg p-3 flex justify-between items-center hover:bg-white/90 transition-all duration-200"
                >
                  <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 bg-primary-color rounded-full"></div>
                    <span class="font-medium text-text-color text-sm">{{ item.product.name }}</span>
                    <span class="bg-secondary-color/30 text-text-color/70 px-2 py-0.5 rounded-full text-xs font-bold">x{{ item.qty }}</span>
                  </div>
                  <span class="font-bold text-primary-color text-sm">RM {{ (item.product.price * item.qty).toFixed(2) }}</span>
                </div>
              </div>
              
              <!-- Total Section -->
              <div class="border-t border-secondary-color/30 my-4"></div>
              <div class="bg-gradient-to-r from-primary-color/10 to-accent-color/10 rounded-lg p-3">
                <div class="flex justify-between items-center">
                  <span class="text-md font-bold text-text-color font-jakarta">Total Amount</span>
                  <span class="text-xl font-black text-primary-color font-jakarta">RM {{ totalAmount }}</span>
                </div>
              </div>
            </div>

            <!-- No items state -->
            <div v-else class="py-6 text-center">
              <div class="w-10 h-10 bg-secondary-color/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-5 h-5 text-text-color/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
              </div>
              <p class="text-text-color/70 font-medium text-sm">No items found in this order.</p>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              @click="viewProducts"
              class="bg-gradient-to-r from-primary-color to-accent-color hover:from-accent-color hover:to-primary-color text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-primary-color/30"
            >
              <span class="flex items-center justify-center gap-2">
                Continue Shopping
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </span>
            </button>
            <button
              @click="goToHome"
              class="bg-white/80 backdrop-blur-sm border-2 border-secondary-color/50 hover:border-primary-color/50 text-text-color font-bold py-3 px-6 rounded-xl hover:bg-white/90 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-secondary-color/30"
            >
              <span class="flex items-center justify-center gap-2">
                Back to Home
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@import url("../assets/css/default.css");
</style>

<style scoped>
/* Confetti animation - keeping this part as custom CSS since it's animation-heavy */
.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: var(--bg-color);
  top: -20px;
  left: var(--left-pos);
  opacity: 0.8;
  transform: rotate(0deg);
  animation: fall 5s linear infinite;
  animation-delay: var(--fall-delay);
}

.confetti-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.confetti-triangle {
  width: 8px;
  height: 8px;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.confetti-diamond {
  width: 15px;
  height: 15px;
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}

.check-icon {
  stroke-dasharray: 80;
  stroke-dashoffset: 80;
  animation: draw 1s forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fall {
  0% {
    top: -20px;
    transform: rotate(0deg);
  }
  100% {
    top: var(--fall-distance);
    transform: rotate(360deg);
  }
}
</style>
