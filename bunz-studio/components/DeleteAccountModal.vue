<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-red-600 font-dashboard">Delete Account</h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="mb-6">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h3 class="text-lg font-semibold text-gray-900 text-center mb-4 font-dashboard">Are you sure?</h3>
        
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p class="text-sm text-red-800 mb-3">
            <strong>This action cannot be undone.</strong> Deleting your account will:
          </p>
          <ul class="text-sm text-red-700 space-y-1">
            <li class="flex items-start">
              <span class="text-red-500 mr-2">•</span>
              Permanently delete your profile and personal information
            </li>
            <li class="flex items-start">
              <span class="text-red-500 mr-2">•</span>
              Remove access to your order history
            </li>
            <li class="flex items-start">
              <span class="text-red-500 mr-2">•</span>
              Cancel any active subscriptions or services
            </li>
            <li class="flex items-start">
              <span class="text-red-500 mr-2">•</span>
              Delete all saved preferences and settings
            </li>
          </ul>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p class="text-sm text-blue-800">
            <strong>Note:</strong> Some data may be retained for legal and compliance purposes as outlined in our Privacy Policy.
          </p>
        </div>
      </div>

      <form @submit.prevent="deleteAccount" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2 font-dashboard">
            Enter your password to confirm
          </label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex items-center">
          <input
            v-model="confirmDeletion"
            type="checkbox"
            id="confirm-delete"
            class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            required
          />
          <label for="confirm-delete" class="ml-2 block text-sm text-gray-900 font-dashboard">
            I understand that this action is permanent and cannot be undone
          </label>
        </div>

        <div class="flex space-x-3 pt-4">
          <Button
            type="submit"
            variant="destructive"
            :disabled="!password || !confirmDeletion || isLoading"
            class="flex-1"
          >
            {{ isLoading ? 'Deleting...' : 'Delete My Account' }}
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from "@/components/ui/toast/use-toast";

const router = useRouter();
const { toast } = useToast();

// Form data
const password = ref('');
const confirmDeletion = ref(false);
const showPassword = ref(false);
const isLoading = ref(false);

// Emit events
const emit = defineEmits(['close']);

const deleteAccount = async () => {
  if (!password.value || !confirmDeletion.value) return;

  isLoading.value = true;
  try {
    await $fetch('http://localhost:8080/auth/delete-account', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: {
        password: password.value
      }
    });

    // Clear all local storage and redirect
    localStorage.clear();
    sessionStorage.clear();
    
    toast({
      description: "Your account has been deleted successfully",
    });

    // Redirect to home page after a brief delay
    setTimeout(() => {
      router.push('/');
    }, 2000);

  } catch (error) {
    console.error('Error deleting account:', error);
    toast({
      variant: "destructive",
      description: error.data?.message || "Failed to delete account. Please try again.",
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