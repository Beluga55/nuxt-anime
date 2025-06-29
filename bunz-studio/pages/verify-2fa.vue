<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-6">
      <!-- Header Section -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-color/10 shadow-lg">
          <svg class="w-8 h-8 text-primary-color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="mt-6 text-3xl font-bold text-gray-900 font-dashboard">
          Two-Factor Authentication
        </h2>
        <p class="mt-3 text-sm text-gray-600 leading-relaxed">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <!-- Main Form -->
      <form @submit.prevent="verify2FA" class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="space-y-6">
            <!-- 2FA Code Input -->
            <div v-if="!showBackupCode">
              <label class="block text-sm font-semibold text-gray-700 mb-2 font-dashboard">
                Authentication Code
              </label>
              <input
                v-model="twoFactorCode"
                type="text"
                maxlength="6"
                pattern="[0-9]{6}"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent transition-all"
                placeholder="000000"
                required
                :disabled="isLoading"
              />
              <p class="text-xs text-gray-500 mt-2 text-center">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <!-- Backup Code Option -->
            <div class="text-center py-1">
              <button
                type="button"
                @click="showBackupCode = !showBackupCode"
                class="text-sm text-primary-color hover:text-primary-color/80 font-medium transition-colors underline-offset-4 hover:underline"
                :disabled="isLoading"
              >
                {{ showBackupCode ? 'Use authenticator app instead' : 'Use backup code instead' }}
              </button>
            </div>

            <!-- Backup Code Input (Hidden by default) -->
            <div v-if="showBackupCode">
              <label class="block text-sm font-semibold text-gray-700 mb-2 font-dashboard">
                Backup Code
              </label>
              <input
                v-model="backupCode"
                type="text"
                maxlength="8"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg tracking-widest uppercase font-mono focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent transition-all"
                placeholder="XXXXXXXX"
                :disabled="isLoading"
              />
              <p class="text-xs text-gray-500 mt-2 text-center">
                Enter one of your backup codes
              </p>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-3">
              <p class="text-sm text-red-600 text-center font-medium">{{ errorMessage }}</p>
            </div>

            <!-- Submit Button -->
            <Button
              type="submit"
              :disabled="(!twoFactorCode && !backupCode) || isLoading"
              class="w-full flex justify-center py-3 px-4 text-sm font-medium"
            >
              <div v-if="isLoading" class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
              <span v-else>Verify and Continue</span>
            </Button>

            <!-- Back to Login -->
            <div class="text-center pt-4 border-t border-gray-200">
              <button
                type="button"
                @click="backToLogin"
                class="text-sm text-gray-600 hover:text-gray-800 transition-colors font-medium"
                :disabled="isLoading"
              >
                <span class="mr-2">←</span>Back to login
              </button>
            </div>
          </div>
        </div>
      </form>

      <!-- Help Section -->
      <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <h3 class="text-sm font-semibold text-gray-900 mb-3 font-dashboard">Need help?</h3>
        <ul class="text-xs text-gray-600 space-y-2">
          <li class="flex items-start">
            <span class="text-primary-color mr-2">•</span>
            Make sure your device's time is correct
          </li>
          <li class="flex items-start">
            <span class="text-primary-color mr-2">•</span>
            Try refreshing your authenticator app
          </li>
          <li class="flex items-start">
            <span class="text-primary-color mr-2">•</span>
            Use a backup code if your device is unavailable
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from "@/components/ui/toast/use-toast";
import { useAuthStore } from "~/store/auth";

definePageMeta({
  layout: "auth-layout",
});

const router = useRouter();
const route = useRoute();
const { toast } = useToast();
const authStore = useAuthStore();

// Form data
const twoFactorCode = ref('');
const backupCode = ref('');
const showBackupCode = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

// Get temp token from route query or localStorage
const tempToken = ref('');

onMounted(() => {
  // Check for temp token in route query or localStorage
  tempToken.value = route.query.token || localStorage.getItem('temp2FAToken');
  
  if (!tempToken.value) {
    toast({
      variant: "destructive",
      description: "No authentication session found. Please login again.",
    });
    router.push('/login');
  }
});

const verify2FA = async () => {
  if (!tempToken.value) {
    errorMessage.value = "No authentication session found";
    return;
  }

  if (!twoFactorCode.value && !backupCode.value) {
    errorMessage.value = "Please enter a code";
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await $fetch('http://localhost:8080/auth/verify-login-2fa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        tempToken: tempToken.value,
        twoFactorCode: twoFactorCode.value || undefined,
        backupCode: backupCode.value || undefined
      }
    });

    // Store login data
    localStorage.setItem('userInfo', JSON.stringify(response));
    localStorage.setItem('token', response.token);
    
    if (response.remember) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);
      localStorage.setItem('tokenExpiration', expirationDate.toISOString());
    } else {
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 1);
      localStorage.setItem('tokenExpiration', expirationDate.toISOString());
    }

    // Clear temp token
    localStorage.removeItem('temp2FAToken');

    // Show success message
    toast({
      description: "Login successful!",
    });

    // Show backup code warning if used
    if (backupCode.value && response.backupCodesRemaining !== undefined) {
      toast({
        description: `Backup code used. ${response.backupCodesRemaining} codes remaining.`,
        variant: response.backupCodesRemaining <= 2 ? "destructive" : "default"
      });
    }

    // Redirect to dashboard
    router.push('/products');

  } catch (error) {
    console.error('2FA verification error:', error);
    
    if (error.status === 401) {
      errorMessage.value = "Session expired. Please login again.";
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else if (error.data?.message) {
      errorMessage.value = error.data.message;
    } else {
      errorMessage.value = "Invalid code. Please try again.";
    }

    // Clear the input
    if (showBackupCode.value) {
      backupCode.value = '';
    } else {
      twoFactorCode.value = '';
    }
  } finally {
    isLoading.value = false;
  }
};

const backToLogin = () => {
  // Clear temp token
  localStorage.removeItem('temp2FAToken');
  router.push('/login');
};

// Auto-focus input when component mounts
onMounted(() => {
  // Focus the appropriate input field
  setTimeout(() => {
    const input = showBackupCode.value 
      ? document.querySelector('input[type="text"][maxlength="8"]')
      : document.querySelector('input[type="text"][maxlength="6"]');
    if (input) {
      input.focus();
    }
  }, 100);
});

// Watch for changes in showBackupCode to auto-focus
watch(showBackupCode, (newValue) => {
  setTimeout(() => {
    const input = newValue 
      ? document.querySelector('input[type="text"][maxlength="8"]')
      : document.querySelector('input[type="text"][maxlength="6"]');
    if (input) {
      input.focus();
    }
  }, 100);
  
  // Clear the other field when switching
  if (newValue) {
    twoFactorCode.value = '';
  } else {
    backupCode.value = '';
  }
});
</script>

<style scoped>
.font-dashboard {
  font-family: 'Manrope', sans-serif !important;
}

/* Auto-capitalize backup codes */
input[maxlength="8"] {
  text-transform: uppercase;
}
</style>