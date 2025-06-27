<script setup lang="ts">
import {
  UserCircleIcon,
  ShoppingBagIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/outline";
import { VueTelInput } from 'vue-tel-input';
import { useOrderStore } from "~/store/order";
import { useToast } from "@/components/ui/toast/use-toast";

definePageMeta({
  layout: "dashboard-layout",
});

const orderStore = useOrderStore();
const { toast } = useToast();
const route = useRoute();
const router = useRouter();

// Get data from layout
const dashboardData = inject('dashboardData');
const activeSection = computed(() => route.query.section || 'overview');
const userInfo = dashboardData?.userInfo;

// Reactive state
const isEditing = ref(false);
const isLoading = ref(false);
const orderFilters = ref({
  status: 'all',
  search: '',
  page: 1,
  limit: 5
});

const editForm = ref({
  email: "",
  phone: "",
  phoneNumber: "",
  country: "",
});

// Phone input specific reactive data
const selectedCountry = ref("");

const statusOptions = [
  { value: 'all', label: 'All Orders' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Shipped', label: 'Shipped' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Cancelled', label: 'Cancelled' }
];

// Computed properties
const userName = computed(() => {
  return userInfo?.value?.name || userInfo?.value?.email?.split('@')[0] || "User";
});

const profilePicture = computed(() => {
  return userInfo?.value?.image || userInfo?.value?.picture || "";
});

const filteredOrders = computed(() => {
  if (!orderStore.userOrders) return [];
  
  let filtered = [...orderStore.userOrders];
  
  if (orderFilters.value.search) {
    const search = orderFilters.value.search.toLowerCase();
    filtered = filtered.filter(order =>
      order.orderId.toLowerCase().includes(search) ||
      order.items.some(item => item.name.toLowerCase().includes(search))
    );
  }
  
  return filtered;
});

// Methods
const startEditing = () => {
  isEditing.value = true;
  
  editForm.value = {
    email: userInfo?.value?.email || "",
    phone: userInfo?.value?.phone || "",
    phoneNumber: "",
    country: userInfo?.value?.country || "",
  };
  selectedCountry.value = userInfo?.value?.country || "";
};

// Phone input handlers
const selectedCountryCode = ref('+60'); // Add this to track country code

const onCountryChanged = (country: any) => {
  if (country && country.name) {
    editForm.value.country = country.name;
    selectedCountry.value = country.name;
    selectedCountryCode.value = country.dialCode;
  }
};

const cancelEditing = () => {
  isEditing.value = false;
  editForm.value = {
    email: "",
    phone: "",
    country: "",
  };
};

const saveProfile = async () => {
  isLoading.value = true;
  try {
    // Mock update - update localStorage
    const updatedUser = { ...userInfo?.value, ...editForm.value };
    localStorage.setItem("userInfo", JSON.stringify(updatedUser));
    if (userInfo?.value) {
      userInfo.value = updatedUser;
    }
    
    isEditing.value = false;
    toast({
      description: "Profile updated successfully",
    });
  } catch (error) {
    toast({
      variant: "destructive",
      description: "Failed to update profile",
    });
  } finally {
    isLoading.value = false;
  }
};

const fetchUserOrders = async (params = {}) => {
  if (!userInfo?.value?.email) return;
  
  const queryParams = {
    ...orderFilters.value,
    ...params
  };
  
  try {
    // Clear failed images when fetching new orders
    failedImages.value.clear();
    await orderStore.fetchUserOrders(userInfo.value.email, queryParams);
  } catch (error) {
    console.error('Error fetching orders:', error);
    toast({
      variant: "destructive",
      description: "Failed to load orders",
    });
  }
};

const handleStatusFilter = (status) => {
  orderFilters.value.status = status;
  orderFilters.value.page = 1;
  fetchUserOrders();
};

const handlePageChange = (page) => {
  orderFilters.value.page = page;
  fetchUserOrders();
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'text-green-600 bg-green-100 border-green-200';
    case 'processing':
      return 'text-blue-600 bg-blue-100 border-blue-200';
    case 'shipped':
      return 'text-purple-600 bg-purple-100 border-purple-200';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'cancelled':
      return 'text-red-600 bg-red-100 border-red-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Track failed images
const failedImages = ref(new Set());

const handleImageError = (itemName) => {
  // Add this image to failed images set
  failedImages.value.add(itemName);
};

// Watch for section changes
watch(activeSection, (newSection) => {
  if (newSection === 'orders' && userInfo?.value?.email) {
    fetchUserOrders();
  } else if (newSection === 'overview' && userInfo?.value?.email) {
    // Fetch recent orders for overview section
    fetchUserOrders({ limit: 5 });
  }
});

// Watch for userInfo changes (when it loads from localStorage)
watch(() => userInfo?.value, (newUserInfo) => {
  if (newUserInfo?.email && activeSection.value === 'orders') {
    fetchUserOrders();
  } else if (newUserInfo?.email && activeSection.value === 'overview') {
    fetchUserOrders({ limit: 5 });
  }
}, { immediate: true });

// Lifecycle
onMounted(() => {
  if (activeSection.value === 'orders' && userInfo?.value?.email) {
    fetchUserOrders();
  } else if (activeSection.value === 'overview' && userInfo?.value?.email) {
    fetchUserOrders({ limit: 3 });
  }
});
</script>

<template>
  <div>
    <!-- Overview Section -->
    <div v-if="activeSection === 'overview'" class="space-y-6">
      <!-- Welcome Card -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center space-x-4">
          <img
            v-if="profilePicture"
            :src="profilePicture"
            :alt="userName"
            class="w-16 h-16 rounded-full object-cover border-2 border-primary-color"
            referrerpolicy="no-referrer"
          />
          <UserCircleIcon v-else class="w-16 h-16 text-gray-400" />
          <div>
            <h2 class="text-2xl font-bold text-text-color-dark font-dashboard">Welcome back, {{ userName }}!</h2>
            <p class="text-gray-600">{{ userInfo?.email }}</p>
            <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span v-if="userInfo?.phone" class="flex items-center">
                <PhoneIcon class="w-4 h-4 mr-1" />
                {{ userInfo.phone }}
              </span>
              <span v-if="userInfo?.country" class="flex items-center">
                <GlobeAltIcon class="w-4 h-4 mr-1" />
                {{ userInfo.country }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NuxtLink to="/profile?section=orders" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center space-x-3">
            <ShoppingBagIcon class="w-8 h-8 text-primary-color" />
            <div>
              <h3 class="font-semibold text-gray-900 font-dashboard">View Orders</h3>
              <p class="text-sm text-gray-600">Check your order history</p>
            </div>
          </div>
        </NuxtLink>
        
        <NuxtLink to="/profile?section=account" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center space-x-3">
            <UserCircleIcon class="w-8 h-8 text-primary-color" />
            <div>
              <h3 class="font-semibold text-gray-900 font-dashboard">Edit Profile</h3>
              <p class="text-sm text-gray-600">Update your information</p>
            </div>
          </div>
        </NuxtLink>
        
        <NuxtLink to="/profile?section=support" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center space-x-3">
            <QuestionMarkCircleIcon class="w-8 h-8 text-primary-color" />
            <div>
              <h3 class="font-semibold text-gray-900 font-dashboard">Get Help</h3>
              <p class="text-sm text-gray-600">Contact support</p>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Recent Orders -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 font-dashboard">Recent Orders</h3>
          <NuxtLink 
            to="/profile?section=orders" 
            class="text-sm text-primary-color hover:text-primary-color/80 font-medium"
          >
            View All →
          </NuxtLink>
        </div>
        
        <!-- Loading State -->
        <div v-if="orderStore.loading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-color"></div>
        </div>
        
        <!-- Recent Orders List -->
        <div v-else-if="orderStore.userOrders && orderStore.userOrders.length > 0" class="space-y-3">
          <div 
            v-for="order in orderStore.userOrders.slice(0, 3)" 
            :key="order.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <ShoppingBagIcon class="w-5 h-5 text-gray-400" />
              <div>
                <p class="text-sm font-medium text-gray-900">{{ order.orderId }}</p>
                <p class="text-xs text-gray-600">{{ formatDate(order.date) }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">RM {{ order.totalAmount.toFixed(2) }}</p>
              <span
                :class="getStatusColor(order.status)"
                class="inline-block px-2 py-1 rounded-full text-xs font-medium border"
              >
                {{ order.status }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- No Orders State -->
        <div v-else class="text-center py-8">
          <ShoppingBagIcon class="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p class="text-sm text-gray-600 mb-3">No orders yet</p>
          <NuxtLink 
            to="/products" 
            class="inline-block px-4 py-2 bg-primary-color text-white text-sm rounded-lg hover:bg-primary-color/90 transition-colors"
          >
            Start Shopping
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Account Information Section -->
    <div v-else-if="activeSection === 'account'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-text-color-dark font-dashboard">Account Information</h1>
          <p class="text-gray-600 mt-1">Manage your personal details and contact information</p>
        </div>
        <Button
          v-if="!isEditing"
          @click="startEditing"
          variant="outline"
          size="sm"
        >
          Edit Profile
        </Button>
        <div v-else class="flex space-x-2">
          <Button
            @click="saveProfile"
            :disabled="isLoading"
            variant="default"
            size="sm"
          >
            {{ isLoading ? 'Saving...' : 'Save' }}
          </Button>
          <Button
            @click="cancelEditing"
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <EnvelopeIcon class="w-4 h-4 inline mr-2" />
            Email Address
          </label>
          <Input
            v-if="isEditing"
            v-model="editForm.email"
            type="email"
            class="w-full"
          />
          <div v-else class="p-3 bg-gray-50 rounded-md border">
            {{ userInfo?.email || 'Not provided' }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <PhoneIcon class="w-4 h-4 inline mr-2" />
            Phone Number
          </label>
          <div v-if="isEditing" class="w-full">
            <VueTelInput
              v-model="editForm.phone"
              :defaultCountry="'MY'"
              :preferredCountries="['MY', 'SG', 'US', 'GB', 'AL']"
              :validCharactersOnly="true"
              :autoDefaultCountry="false"
              :dropdownOptions="{ 
                showDialCodeInSelection: false, 
                showSearchBox: false,
                showFlags: true,
                showDialCodeInList: true
              }"
              :inputOptions="{
                placeholder: 'Enter phone number',
                maxlength: 25
              }"
              class="vue-tel-input-custom"
              @country-changed="onCountryChanged"
              mode="international"
            />
          </div>
          <div v-else class="p-3 bg-gray-50 rounded-md border">
            {{ userInfo?.phone || 'Not provided' }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <GlobeAltIcon class="w-4 h-4 inline mr-2" />
            Country
          </label>
          <div v-if="isEditing" class="p-3 bg-gray-100 rounded-md border">
            <span class="text-gray-600">Selected automatically from phone number:</span>
            <span class="font-medium ml-2">{{ editForm.country || selectedCountry || 'Not selected' }}</span>
          </div>
          <div v-else class="p-3 bg-gray-50 rounded-md border">
            {{ userInfo?.country || 'Not provided' }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Member Since
          </label>
          <div class="p-3 bg-gray-50 rounded-md border">
            January 2024
          </div>
        </div>
      </div>
    </div>

    <!-- Order History Section -->
    <div v-else-if="activeSection === 'orders'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-text-color-dark font-dashboard">Order History</h1>
          <p class="text-gray-600 mt-1">View and track all your orders</p>
        </div>
        
        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              v-model="orderFilters.search"
              placeholder="Search orders..."
              class="pl-10 w-full sm:w-64"
            />
          </div>
          
          <select
            v-model="orderFilters.status"
            @change="handleStatusFilter(orderFilters.status)"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent"
          >
            <option v-for="status in statusOptions" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="orderStore.loading" class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-color mb-4"></div>
        <p class="text-gray-600 font-dashboard">Loading your orders...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="orderStore.error" class="text-center py-12">
        <p class="text-red-600 mb-4">{{ orderStore.error }}</p>
        <Button @click="fetchUserOrders()" variant="outline">
          Try Again
        </Button>
      </div>

      <!-- No Orders -->
      <div v-else-if="!orderStore.userOrders || orderStore.userOrders.length === 0" class="text-center py-12">
        <ShoppingBagIcon class="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2 font-dashboard">No orders found</h3>
        <p class="text-gray-600 mb-6">You haven't placed any orders yet.</p>
        <Button @click="router.push('/products')" variant="default">
          Start Shopping
        </Button>
      </div>

      <!-- Orders List -->
      <div v-else class="space-y-4">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
            <div>
              <h3 class="font-semibold text-lg text-gray-900 font-dashboard">{{ order.orderId }}</h3>
              <p class="text-gray-600">{{ formatDate(order.date) }}</p>
            </div>
            <div class="flex flex-col sm:items-end mt-2 sm:mt-0">
              <span
                :class="getStatusColor(order.status)"
                class="px-3 py-1 rounded-full text-sm font-medium border w-fit"
              >
                {{ order.status }}
              </span>
              <p class="text-xl font-bold text-gray-900 mt-2">
                RM {{ order.totalAmount.toFixed(2) }}
              </p>
            </div>
          </div>
          
          <div class="space-y-3">
            <div
              v-for="item in order.items"
              :key="item.name"
              class="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
            >
              <div class="w-12 h-12 flex-shrink-0">
                <img
                  v-if="item.image && !failedImages.has(item.name)"
                  :src="item.image"
                  :alt="item.name"
                  @error="handleImageError(item.name)"
                  class="w-12 h-12 object-cover rounded-md border border-gray-200 transition-opacity"
                  loading="lazy"
                />
                <div 
                  v-else
                  class="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center"
                  :title="item.name"
                >
                  <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-900">{{ item.name }}</p>
                <p class="text-sm text-gray-600">Quantity: {{ item.quantity }}</p>
                <p class="text-sm font-medium text-gray-900">RM {{ item.price.toFixed(2) }} each</p>
              </div>
            </div>
          </div>
          
          <div v-if="order.shippingAddress" class="mt-4 pt-4 border-t border-gray-200">
            <p class="text-sm font-medium text-gray-700 mb-1">Shipping Address:</p>
            <p class="text-sm text-gray-600">
              {{ order.shippingAddress.address }}, {{ order.shippingAddress.city }}, 
              {{ order.shippingAddress.postalCode }}, {{ order.shippingAddress.country }}
            </p>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="orderStore.ordersPagination && orderStore.ordersPagination.totalPages > 1" 
             class="flex items-center justify-between mt-8">
          <div class="text-sm text-gray-600">
            Page {{ orderStore.ordersPagination.currentPage }} of {{ orderStore.ordersPagination.totalPages }}
          </div>
          
          <div class="flex space-x-2">
            <Button
              @click="handlePageChange(orderStore.ordersPagination.currentPage - 1)"
              :disabled="!orderStore.ordersPagination.hasPrevPage"
              variant="outline"
              size="sm"
            >
              <ChevronLeftIcon class="w-4 h-4" />
            </Button>
            <Button
              @click="handlePageChange(orderStore.ordersPagination.currentPage + 1)"
              :disabled="!orderStore.ordersPagination.hasNextPage"
              variant="outline"
              size="sm"
            >
              <ChevronRightIcon class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Section -->
    <div v-else-if="activeSection === 'settings'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-text-color-dark font-dashboard">Preferences</h1>
        <p class="text-gray-600 mt-1">Customize your account settings and preferences</p>
      </div>
      
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-3 font-dashboard">Notifications</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Email Notifications</p>
                <p class="text-sm text-gray-600">Receive order updates via email</p>
              </div>
              <input type="checkbox" class="h-4 w-4 text-primary-color focus:ring-primary-color border-gray-300 rounded" checked />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Marketing Emails</p>
                <p class="text-sm text-gray-600">Receive promotional emails and offers</p>
              </div>
              <input type="checkbox" class="h-4 w-4 text-primary-color focus:ring-primary-color border-gray-300 rounded" />
            </div>
          </div>
        </div>
        
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-3 font-dashboard">Language & Region</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color">
                <option>English</option>
                <option>Bahasa Malaysia</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color">
                <option>MYR (RM)</option>
                <option>USD ($)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Security Section -->
    <div v-else-if="activeSection === 'security'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-text-color-dark font-dashboard">Security & Privacy</h1>
        <p class="text-gray-600 mt-1">Manage your account security and privacy settings</p>
      </div>
      
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-3 font-dashboard">Password</h3>
          <p class="text-gray-600 mb-4">Keep your account secure with a strong password</p>
          <Button variant="outline">Change Password</Button>
        </div>
        
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-3 font-dashboard">Two-Factor Authentication</h3>
          <p class="text-gray-600 mb-4">Add an extra layer of security to your account</p>
          <Button variant="outline">Enable 2FA</Button>
        </div>
        
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-3 font-dashboard">Data & Privacy</h3>
          <div class="space-y-3">
            <Button variant="outline" class="w-full sm:w-auto">Download My Data</Button>
            <Button variant="destructive" class="w-full sm:w-auto">Delete Account</Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Support Section -->
    <div v-else-if="activeSection === 'support'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-text-color-dark font-dashboard">Help & Support</h1>
        <p class="text-gray-600 mt-1">Get help and contact our support team</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900 font-dashboard">Quick Help</h3>
          <div class="space-y-2">
            <a href="/faqs" class="block p-4 border border-gray-200 rounded-lg hover:border-primary-color transition-colors">
              <p class="font-medium">Frequently Asked Questions</p>
              <p class="text-sm text-gray-600">Find answers to common questions</p>
            </a>
            <a href="#" class="block p-4 border border-gray-200 rounded-lg hover:border-primary-color transition-colors">
              <p class="font-medium">Shipping Information</p>
              <p class="text-sm text-gray-600">Learn about our shipping policies</p>
            </a>
            <a href="#" class="block p-4 border border-gray-200 rounded-lg hover:border-primary-color transition-colors">
              <p class="font-medium">Return Policy</p>
              <p class="text-sm text-gray-600">Understand our return process</p>
            </a>
          </div>
        </div>
        
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4 font-dashboard">Contact Support</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <Input placeholder="How can we help you?" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color"
                rows="4"
                placeholder="Describe your issue or question..."
              ></textarea>
            </div>
            <Button class="w-full">Send Message</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toggle {
  @apply relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-color focus:ring-offset-2;
}

.toggle:checked {
  @apply bg-primary-color;
}

.toggle::before {
  content: '';
  @apply inline-block h-4 w-4 transform rounded-full bg-white transition-transform;
  transform: translateX(0.125rem);
}

.toggle:checked::before {
  transform: translateX(1.375rem);
}

/* Vue Tel Input custom styling */
:deep(.vue-tel-input-custom) {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  width: 100%;
  max-width: 100%;
}

:deep(.vue-tel-input-custom:focus-within) {
  border-color: #fd7968;
  box-shadow: 0 0 0 2px rgba(253, 121, 104, 0.2);
}

:deep(.vue-tel-input-custom .vti__dropdown) {
  background-color: white;
  border: none;
  border-right: 1px solid #d1d5db;
  border-radius: 0.375rem 0 0 0.375rem;
  width: auto;
  position: relative;
}

:deep(.vue-tel-input-custom .vti__selection) {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
  gap: 0.5rem;
}

/* Add country code after the selection */
:deep(.vue-tel-input-custom .vti__selection::after) {
  content: attr(data-country-dial-code);
  font-weight: 600;
  color: #fd7968;
  margin-left: 0.25rem;
}

/* Force flag to show even with showDialCodeInSelection: true */
:deep(.vue-tel-input-custom .vti__flag) {
  display: inline-block !important;
  
  flex-shrink: 0;
  margin-right: 0.5rem;
  border: none;
  box-shadow: none;
  vertical-align: middle;
}

/* Remove any gray background that might appear on the flag container */
:deep(.vue-tel-input-custom .vti__flag-container) {
  background: none !important;
}

:deep(.vue-tel-input-custom .vti__country-code) {
  font-weight: 600;
  color: #fd7968;
  white-space: nowrap;
}

:deep(.vue-tel-input-custom .vti__input) {
  background-color: white;
  border: none;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  height: 2.5rem;
  border-radius: 0 0.375rem 0.375rem 0;
  width: 100%;
  flex: 1;
  outline: none;
}

:deep(.vue-tel-input-custom .vti__dropdown-list) {
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 50;
  max-height: 200px;
  overflow-y: auto;
  width: 300px;
}

:deep(.vue-tel-input-custom .vti__dropdown-item) {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

:deep(.vue-tel-input-custom .vti__dropdown-item:hover) {
  background-color: #f3f4f6;
}

:deep(.vue-tel-input-custom .vti__dropdown-item.highlighted) {
  background-color: #fd7968;
  color: white;
}

/* Hide the default dropdown arrow and create our own */
:deep(.vue-tel-input-custom .vti__dropdown-arrow) {
  display: none;
}

/* Add custom dropdown arrow */
:deep(.vue-tel-input-custom .vti__dropdown::after) {
  content: '';
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid #6b7280;
  pointer-events: none;
}
</style>