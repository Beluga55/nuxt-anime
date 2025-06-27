<script setup lang="ts">
definePageMeta({
  layout: "auth-layout",
});

import { object, string } from "zod";
import { useField, useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { Checkbox } from "@/components/ui/checkbox";
import googleSvg from "@/assets/images/google_logo.svg";
import {
  useTokenClient,
  type AuthCodeFlowSuccessResponse,
  type AuthCodeFlowErrorResponse,
} from "vue3-google-signin";
import nahida from "@/assets/images/nahida.png";
import { useAuthStore } from "~/store/auth";
import { useToast } from "@/components/ui/toast/use-toast";
import { useTokenStatus } from "@/composables/useTokenStatus";
import { useRouter, useRoute } from "vue-router";
import { useCartStore } from "@/store/cart";
import { usePaymentStore } from "~/store/payment";
import { loadStripe } from "@stripe/stripe-js";

// Get the window size
const rememberMe = ref(false);
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const cartStore = useCartStore();
const paymentStore = usePaymentStore();
const { toast, dismiss } = useToast();
const { setTokenStatus, tokenStatus } = useTokenStatus(); // Initialize the setTokenStatus function

// Check if user was redirected here for checkout
onMounted(() => {
  const pendingCheckout = localStorage.getItem('pendingCheckout');
  if (pendingCheckout === 'true') {
    toast({
      variant: "default",
      title: "Login Required",
      description: "Please login to proceed with checkout",
    });
  }
});

// Validation Schema for the form (email, password)
const validationSchema = toTypedSchema(
  object({
    email: string().min(1, { message: "Email is required" }).email({
      message: "Invalid email format",
    }),
    password: string().min(8, {
      message: "Password must be at least 8 characters",
    }),
  })
);

const { handleSubmit, errors, resetForm } = useForm({
  validationSchema,
});

const { value: email } = useField("email");
const { value: password } = useField("password");

const toggleRememberMe = () => {
  rememberMe.value = !rememberMe.value;

  console.log(rememberMe.value);

  if (rememberMe.value) {
    toast({
      variant: "default",
      description: "Remember me is enabled. Need to login every 30 days",
    });
  }
};

const handleLogin = handleSubmit(async () => {
  const body = {
    email: email.value,
    password: password.value,
    remember: rememberMe.value,
  };

  console.log(body.remember);

  try {
    await authStore.login(body);
    setTokenStatus(true); // Set token status to true after successful login

    // Check for pending checkout
    const pendingCheckout = localStorage.getItem('pendingCheckout');
    
    if (pendingCheckout === 'true') {
      // Clear the pending checkout flags
      localStorage.removeItem('pendingCheckout');
      localStorage.removeItem('checkoutParams');
      
      // Trigger checkout process directly
      await handlePostLoginCheckout();
    } else {
      router.push("/products");
    }
  } catch (error) {
    toast({
      variant: "destructive",
      description: (error as Error).message,
    });

    setTimeout(() => {
      dismiss();
    }, 5000);
  }

  // Reset the form
  resetForm();
});

const handleOnSuccess = async (response: AuthCodeFlowSuccessResponse) => {
  const userInfo = await authStore.authGoogle(response.access_token);

  // Store the user info into the local storage
  localStorage.setItem("userInfo", JSON.stringify(userInfo));

  // Structure the data to be sent to the backend
  const data = {
    given_name: userInfo.given_name,
    email: userInfo.email,
  };

  // Can store the user info into the database
  try {
    await authStore.loginGoogle(data);
    setTokenStatus(true);
    
    // Check for pending checkout after Google login
    const pendingCheckout = localStorage.getItem('pendingCheckout');
    
    if (pendingCheckout === 'true') {
      // Clear the pending checkout flags
      localStorage.removeItem('pendingCheckout');
      localStorage.removeItem('checkoutParams');
      
      // Trigger checkout process directly
      await handlePostLoginCheckout();
    }
  } catch (error) {
    toast({
      variant: "destructive",
      description: (error as Error).message,
    });

    setTimeout(() => {
      dismiss();
    }, 5000);
  }
};

const handleOnError = (errorResponse: AuthCodeFlowErrorResponse) => {
  console.log("Error: ", errorResponse);
};

const { isReady, login } = useTokenClient({
  onSuccess: handleOnSuccess,
  onError: handleOnError,
});

// Handle checkout process after successful login
const handlePostLoginCheckout = async () => {
  try {
    // Transform cart items to Stripe format
    const items = cartStore.cartItems.map((item) => ({
      name: item.name,
      amount: Math.round(item.price * 100), // Convert to cents
      quantity: item.quantity || 1,
      image: item.imageUrl || item.image,
      description: item.description,
    }));

    const userData = localStorage.getItem("userInfo");
    if (!userData) {
      throw new Error("User data not found");
    }
    const user = JSON.parse(userData);
    const email = user.email;

    const response = await paymentStore.createCheckoutSession({
      items,
      email,
    });

    if (response && response.session) {
      const config = useRuntimeConfig();
      const stripe = await loadStripe(config.public.stripePublishableKey);
      await stripe.redirectToCheckout({
        sessionId: response.session.id,
      });
    }
  } catch (err) {
    console.error("Error during post-login checkout:", err);
    toast({
      variant: "destructive",
      description: "Unable to proceed to checkout. Please try again.",
    });
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen py-8">
    <div
      class="justify-self-center relative max-w-[450px] mx-auto lg:w-[400px] lg:px-0 lg:py-0"
      :class="{'w-[calc(100%-2.5rem)] backdrop-filter px-5 py-5 rounded-lg': true, 'lg:backdrop-filter-none lg:bg-transparent lg:border-0': true}"
    >
      <img
        :src="nahida"
        alt="Nahida"
        class="mx-auto rounded-full bottom-[-25px] w-[200px] h-[200px] object-cover"
      />
      <form class="">
        <div class="text-white lg:text-black lg:text-center">
          <h2 class="font-extrabold header-font">Welcome back !</h2>
          <p class="mt-1 text-sm">There's lots of promotions awaits you.</p>

          <div class="mt-5">
            <!-- Name, Email, Subject, Message -->
            <div class="flex flex-col gap-2">
              <label for="email" class="text-sm font-medium text-left"
                >Email</label
              >
              <input
                id="email"
                type="text"
                :placeholder="errors.email ? errors.email : 'Email'"
                class="w-full text-black placeholder-gray-500 py-[0.65rem] px-4 text-[13px] border-[1px] border-border-color outline-none rounded-sm mb-3"
                :class="{
                  'placeholder-red-700': errors.email,
                  'placeholder-gray-500': !errors.email,
                }"
                v-model="email"
              />
            </div>
            <div class="flex flex-col gap-2">
              <label for="password" class="text-sm font-medium text-left"
                >Password</label
              >
              <input
                id="password"
                type="password"
                :placeholder="errors.password ? errors.password : 'Password'"
                class="w-full mb-3 placeholder-gray-500 py-[0.65rem] px-4 text-[13px] text-black border-[1px] border-border-color outline-none rounded-sm"
                :class="{
                  'placeholder-red-700': errors.password,
                  'placeholder-gray-500': !errors.password,
                }"
                v-model="password"
              />
            </div>

            <!-- Remember me and forgot password -->
            <div class="flex items-center justify-between mt-5 mb-3">
              <div class="flex items-center gap-2">
                <Checkbox @click="toggleRememberMe" id="remember" />
                <label
                  for="remember"
                  class="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
              <NuxtLink
                to="/forgot-password"
                class="text-xs font-medium leading-none"
                >Forgot password?</NuxtLink
              >
            </div>

            <Button
              @click="handleLogin"
              variant="default"
              class="w-full mt-2 text-xs"
              >Login</Button
            >

            <Button
              variant="secondary"
              class="w-full mt-2 text-xs border-[1px] border-border-color"
              :disabled="!isReady"
              @click.prevent="() => login()"
            >
              <img
                :src="googleSvg"
                alt="Google Logo"
                class="inline-block w-4 h-4 mr-2"
              />
              Login with Google
            </Button>

            <div class="flex items-center justify-center gap-2 mt-6">
              <span class="text-xs">Don't have an account?</span>
              <NuxtLink to="/register" class="text-xs font-medium"
                >Register</NuxtLink
              >
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.header-font {
  font-size: clamp(1.75rem, 5vw, 2.5rem);
}

.backdrop-filter {
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  background-color: rgba(17, 25, 40, 0.75);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.125);
}

@media (min-width: 1024px) {
  .lg\:backdrop-filter-none {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background-color: transparent !important;
    border: none !important;
  }
}
</style>
