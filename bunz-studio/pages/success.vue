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
    class="min-h-screen flex justify-center items-center p-8 bg-background-color relative overflow-hidden"
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
      class="backdrop-filter-light max-w-[550px] w-full p-6 md:p-10 rounded-2xl text-center relative z-10 shadow-lg"
    >
      <!-- Success icon -->
      <div
        class="w-20 h-20 mx-auto mb-6 bg-accent-color rounded-full flex items-center justify-center animate-pulse"
      >
        <CheckCircle class="w-10 h-10 text-text-color-light check-icon" />
      </div>

      <!-- Success message -->
      <h1 class="text-4xl md:text-5xl text-primary-color mb-4">Success!</h1>
      <p class="text-xl text-text-color mb-2 font-semibold">
        Your order has been successfully processed.
      </p>
      <p class="text-text-color opacity-80 mb-8">
        Thank you for shopping with us. You will receive a confirmation email
        shortly.
      </p>

      <!-- Order details summary -->
      <div
        class="bg-background-color bg-opacity-70 p-6 rounded-xl mb-8 text-left"
      >
        <h2
          class="text-lg mb-5 text-text-color mb-4 text-left font-jakarta font-bold"
        >
          Order Summary
        </h2>
        <div
          class="flex justify-between mb-3 pb-3 border-b border-secondary-color"
        >
          <span>Order ID:</span>
          <span>#{{ orderId }}</span>
        </div>
        <div
          class="flex justify-between mb-3 pb-3 border-b border-secondary-color"
        >
          <span>Date:</span>
          <span>{{
            order
              ? new Date(order.datePlaced).toLocaleDateString()
              : new Date().toLocaleDateString()
          }}</span>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="py-4 text-center">
          <p class="text-text-color opacity-70">Loading order details...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="py-4 text-center">
          <p class="text-red-500">{{ error }}</p>
        </div>

        <!-- Display order items if available -->
        <div
          v-else-if="order && order.orderItems && order.orderItems.length > 0"
          class="mt-4 mb-4"
        >
          <h3 class="text-md font-bold mb-3 font-jakarta">Items:</h3>
          <div
            v-for="(item, index) in order.orderItems"
            :key="index"
            class="flex justify-between mb-2 text-sm"
          >
            <span>{{ item.product.name }} x{{ item.qty }}</span>
            <span>RM {{ (item.product.price * item.qty).toFixed(2) }}</span>
          </div>
          <div
            class="flex justify-between mt-4 pt-3 border-t border-secondary-color font-bold"
          >
            <span>Total:</span>
            <span>RM {{ totalAmount }}</span>
          </div>
        </div>

        <!-- No items state -->
        <div v-else class="py-4 text-center">
          <p class="text-text-color opacity-70">No items in this order.</p>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex gap-4 mb-6 justify-center flex-col md:flex-row">
        <button
          @click="viewProducts"
          class="px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:translate-y-[-2px] bg-transparent text-primary-color border border-primary-color hover:bg-secondary-color"
        >
          Continue Shopping
        </button>
        <button
          @click="goToHome"
          class="px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:translate-y-[-2px] bg-primary-color text-text-color-light border-none hover:bg-accent-color"
        >
          Back to Home
        </button>
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
