<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900 font-dashboard">Change Password</h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="changePassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2 font-dashboard">Current Password</label>
          <div class="relative">
            <input
              v-model="form.currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent"
              placeholder="Enter current password"
              required
            />
            <button
              type="button"
              @click="showCurrentPassword = !showCurrentPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg v-if="!showCurrentPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2 font-dashboard">New Password</label>
          <div class="relative">
            <input
              v-model="form.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent"
              placeholder="Enter new password"
              required
              @input="checkPasswordStrength"
            />
            <button
              type="button"
              @click="showNewPassword = !showNewPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg v-if="!showNewPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            </button>
          </div>
          
          <!-- Password Strength Meter -->
          <div v-if="form.newPassword" class="mt-2">
            <div class="flex justify-between text-xs mb-1">
              <span class="text-gray-600">Password Strength</span>
              <span :class="passwordStrengthColor">{{ passwordStrengthText }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                :class="passwordStrengthBgColor" 
                class="h-2 rounded-full transition-all duration-300"
                :style="`width: ${passwordStrengthPercent}%`"
              ></div>
            </div>
            <ul class="mt-2 text-xs text-gray-600 space-y-1">
              <li :class="{ 'text-green-600': passwordChecks.value.length }" class="flex items-center">
                <svg class="w-3 h-3 mr-1" :class="passwordChecks.value.length ? 'text-green-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                At least 8 characters
              </li>
              <li :class="{ 'text-green-600': passwordChecks.value.uppercase }" class="flex items-center">
                <svg class="w-3 h-3 mr-1" :class="passwordChecks.value.uppercase ? 'text-green-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                One uppercase letter
              </li>
              <li :class="{ 'text-green-600': passwordChecks.value.lowercase }" class="flex items-center">
                <svg class="w-3 h-3 mr-1" :class="passwordChecks.value.lowercase ? 'text-green-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                One lowercase letter
              </li>
              <li :class="{ 'text-green-600': passwordChecks.value.number }" class="flex items-center">
                <svg class="w-3 h-3 mr-1" :class="passwordChecks.value.number ? 'text-green-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                One number
              </li>
              <li :class="{ 'text-green-600': passwordChecks.value.special }" class="flex items-center">
                <svg class="w-3 h-3 mr-1" :class="passwordChecks.value.special ? 'text-green-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                One special character
              </li>
            </ul>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2 font-dashboard">Confirm New Password</label>
          <div class="relative">
            <input
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent"
              placeholder="Confirm new password"
              required
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg v-if="!showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            </button>
          </div>
          <p v-if="form.confirmPassword && form.newPassword !== form.confirmPassword" class="text-sm text-red-600 mt-1">
            Passwords do not match
          </p>
        </div>

        <div class="flex space-x-3 pt-4">
          <Button
            type="submit"
            :disabled="!isFormValid || isLoading"
            class="flex-1"
          >
            {{ isLoading ? 'Changing...' : 'Change Password' }}
          </Button>
          <Button
            type="button"
            variant="outline"
            @click="$emit('close')"
            :disabled="isLoading"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToast } from "@/components/ui/toast/use-toast";

const { toast } = useToast();

// Form data
const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// UI state
const isLoading = ref(false);
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Password strength
const passwordChecks = ref({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  special: false
});

const checkPasswordStrength = () => {
  const password = form.value.newPassword;
  passwordChecks.value = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
};

const passwordStrengthScore = computed(() => {
  const checks = passwordChecks.value;
  return Object.values(checks).filter(Boolean).length;
});

const passwordStrengthPercent = computed(() => {
  return (passwordStrengthScore.value / 5) * 100;
});

const passwordStrengthText = computed(() => {
  const score = passwordStrengthScore.value;
  if (score === 0) return 'Very Weak';
  if (score === 1) return 'Weak';
  if (score === 2) return 'Fair';
  if (score === 3) return 'Good';
  if (score === 4) return 'Strong';
  return 'Very Strong';
});

const passwordStrengthColor = computed(() => {
  const score = passwordStrengthScore.value;
  if (score <= 1) return 'text-red-500';
  if (score === 2) return 'text-orange-500';
  if (score === 3) return 'text-yellow-500';
  if (score === 4) return 'text-blue-500';
  return 'text-green-500';
});

const passwordStrengthBgColor = computed(() => {
  const score = passwordStrengthScore.value;
  if (score <= 1) return 'bg-red-500';
  if (score === 2) return 'bg-orange-500';
  if (score === 3) return 'bg-yellow-500';
  if (score === 4) return 'bg-blue-500';
  return 'bg-green-500';
});

const isFormValid = computed(() => {
  return form.value.currentPassword &&
         form.value.newPassword &&
         form.value.confirmPassword &&
         form.value.newPassword === form.value.confirmPassword &&
         passwordStrengthScore.value >= 3;
});

// Emit events
const emit = defineEmits(['close']);

const changePassword = async () => {
  if (!isFormValid.value) return;

  isLoading.value = true;
  try {
    const response = await $fetch('http://localhost:8080/auth/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: {
        currentPassword: form.value.currentPassword,
        newPassword: form.value.newPassword
      }
    });

    toast({
      description: "Password changed successfully",
    });

    emit('close');
  } catch (error) {
    console.error('Error changing password:', error);
    toast({
      variant: "destructive",
      description: error.data?.message || "Failed to change password",
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.font-dashboard {
  font-family: 'Manrope', sans-serif !important;
}
</style>