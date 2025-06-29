<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900 font-dashboard">Setup Two-Factor Authentication</h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Step 1: Setup Instructions -->
      <div v-if="currentStep === 1" class="text-center">
        <div class="mb-6">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2 font-dashboard">Secure Your Account</h3>
          <p class="text-gray-600 text-sm">
            Two-factor authentication adds an extra layer of security to your account by requiring a code from your phone in addition to your password.
          </p>
        </div>

        <div class="text-left bg-gray-50 rounded-lg p-4 mb-6">
          <h4 class="font-medium text-gray-900 mb-3 font-dashboard">You'll need an authenticator app:</h4>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Google Authenticator
            </li>
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Microsoft Authenticator
            </li>
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Authy
            </li>
          </ul>
        </div>

        <Button @click="setupTwoFactor" :disabled="isLoading" class="w-full">
          {{ isLoading ? 'Setting up...' : 'Continue' }}
        </Button>
      </div>

      <!-- Step 2: QR Code -->
      <div v-else-if="currentStep === 2" class="text-center">
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2 font-dashboard">Scan QR Code</h3>
          <p class="text-gray-600 text-sm mb-4">
            Scan this QR code with your authenticator app
          </p>
        </div>

        <!-- QR Code Container -->
        <div class="bg-white border-2 border-gray-200 rounded-lg p-4 mb-6 inline-block">
          <div v-if="qrCodeUrl" class="w-48 h-48 flex items-center justify-center">
            <img :src="qrCodeUrl" alt="QR Code" class="max-w-full max-h-full" />
          </div>
          <div v-else class="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-color"></div>
          </div>
        </div>

        <!-- Manual Entry Option -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <p class="text-xs text-gray-600 mb-2">Can't scan? Enter this code manually:</p>
          <div class="bg-white border rounded p-2 font-mono text-sm break-all">
            {{ manualEntryKey }}
          </div>
          <button
            @click="copyToClipboard"
            class="text-xs text-blue-600 hover:text-blue-800 mt-2"
          >
            Copy to clipboard
          </button>
        </div>

        <Button @click="currentStep = 3" class="w-full">
          I've Added the Account
        </Button>
      </div>

      <!-- Step 3: Verification -->
      <div v-else-if="currentStep === 3">
        <div class="mb-6 text-center">
          <h3 class="text-lg font-semibold text-gray-900 mb-2 font-dashboard">Verify Setup</h3>
          <p class="text-gray-600 text-sm">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <form @submit.prevent="verifyTwoFactor" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2 font-dashboard">Verification Code</label>
            <input
              v-model="verificationCode"
              type="text"
              maxlength="6"
              pattern="[0-9]{6}"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent"
              placeholder="000000"
              required
            />
          </div>

          <div class="flex space-x-3">
            <Button
              type="submit"
              :disabled="verificationCode.length !== 6 || isLoading"
              class="flex-1"
            >
              {{ isLoading ? 'Verifying...' : 'Verify & Enable' }}
            </Button>
            <Button
              type="button"
              variant="outline"
              @click="currentStep = 2"
              :disabled="isLoading"
            >
              Back
            </Button>
          </div>
        </form>
      </div>

      <!-- Step 4: Success -->
      <div v-else-if="currentStep === 4" class="text-center">
        <div class="mb-6">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2 font-dashboard">Success!</h3>
          <p class="text-gray-600 text-sm mb-6">
            Two-factor authentication has been enabled for your account. You'll now need to enter a code from your authenticator app when logging in.
          </p>
        </div>

        <!-- Backup Codes -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h4 class="font-medium text-yellow-800 mb-2 font-dashboard">⚠️ Save Your Backup Codes</h4>
          <p class="text-sm text-yellow-700 mb-3">
            Store these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
          </p>
          <div class="bg-white border rounded p-3 grid grid-cols-2 gap-2 font-mono text-sm">
            <div v-for="code in backupCodes" :key="code" class="text-center p-1 bg-gray-50 rounded">
              {{ code }}
            </div>
          </div>
          <button
            @click="downloadBackupCodes"
            class="text-sm text-yellow-700 hover:text-yellow-900 mt-2 underline"
          >
            Download backup codes
          </button>
        </div>

        <Button @click="finish" class="w-full">
          Done
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from "@/components/ui/toast/use-toast";

const { toast } = useToast();

// Props
const emit = defineEmits(['close', 'enabled']);

// State
const currentStep = ref(1);
const isLoading = ref(false);
const qrCodeUrl = ref('');
const manualEntryKey = ref('');
const verificationCode = ref('');
const backupCodes = ref([]);
const twoFactorSecret = ref('');

// Methods
const setupTwoFactor = async () => {
  isLoading.value = true;
  try {
    const response = await $fetch('http://localhost:8080/auth/setup-2fa', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    qrCodeUrl.value = response.qrCodeUrl;
    manualEntryKey.value = response.manualEntryKey;
    twoFactorSecret.value = response.secret;
    currentStep.value = 2;
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    toast({
      variant: "destructive",
      description: error.data?.message || "Failed to setup two-factor authentication",
    });
  } finally {
    isLoading.value = false;
  }
};

const verifyTwoFactor = async () => {
  isLoading.value = true;
  try {
    const response = await $fetch('http://localhost:8080/auth/verify-2fa', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: {
        token: verificationCode.value,
        secret: twoFactorSecret.value
      }
    });

    backupCodes.value = response.backupCodes;
    currentStep.value = 4;
    
    toast({
      description: "Two-factor authentication enabled successfully",
    });
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    toast({
      variant: "destructive",
      description: error.data?.message || "Invalid verification code",
    });
    verificationCode.value = '';
  } finally {
    isLoading.value = false;
  }
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(manualEntryKey.value);
    toast({
      description: "Copied to clipboard",
    });
  } catch (error) {
    console.error('Failed to copy:', error);
  }
};

const downloadBackupCodes = () => {
  const content = `Two-Factor Authentication Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\n${backupCodes.value.join('\n')}\n\nImportant: Store these codes in a safe place. Each code can only be used once.`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'backup-codes.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const finish = () => {
  emit('enabled');
  emit('close');
};
</script>

<style scoped>
.font-dashboard {
  font-family: 'Manrope', sans-serif !important;
}
</style>