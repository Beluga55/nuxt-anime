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
  country: "",
});

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
    country: userInfo?.value?.country || "",
  };
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

// Watch for section changes
watch(activeSection, (newSection) => {
  if (newSection === 'orders' && userInfo?.value?.email) {
    fetchUserOrders();
  }
});

// Lifecycle
onMounted(() => {
  if (activeSection.value === 'orders' && userInfo?.value?.email) {
    fetchUserOrders();
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
            <h2 class="text-2xl font-bold text-text-color-dark">Welcome back, {{ userName }}!</h2>
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
              <h3 class="font-semibold text-gray-900">View Orders</h3>
              <p class="text-sm text-gray-600">Check your order history</p>
            </div>
          </div>
        </NuxtLink>
        
        <NuxtLink to="/profile?section=account" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center space-x-3">
            <UserCircleIcon class="w-8 h-8 text-primary-color" />
            <div>
              <h3 class="font-semibold text-gray-900">Edit Profile</h3>
              <p class="text-sm text-gray-600">Update your information</p>
            </div>
          </div>
        </NuxtLink>
        
        <NuxtLink to="/profile?section=support" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center space-x-3">
            <QuestionMarkCircleIcon class="w-8 h-8 text-primary-color" />
            <div>
              <h3 class="font-semibold text-gray-900">Get Help</h3>
              <p class="text-sm text-gray-600">Contact support</p>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div class="space-y-3">
          <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <ShoppingBagIcon class="w-5 h-5 text-gray-400" />
            <div>
              <p class="text-sm font-medium text-gray-900">Order placed</p>
              <p class="text-xs text-gray-600">2 days ago</p>
            </div>
          </div>
          <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <UserCircleIcon class="w-5 h-5 text-gray-400" />
            <div>
              <p class="text-sm font-medium text-gray-900">Profile updated</p>
              <p class="text-xs text-gray-600">1 week ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Account Information Section -->
    <div v-else-if="activeSection === 'account'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-text-color-dark">Account Information</h1>
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
          <Input
            v-if="isEditing"
            v-model="editForm.phone"
            type="tel"
            class="w-full"
          />
          <div v-else class="p-3 bg-gray-50 rounded-md border">
            {{ userInfo?.phone || 'Not provided' }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <GlobeAltIcon class="w-4 h-4 inline mr-2" />
            Country
          </label>
          <Input
            v-if="isEditing"
            v-model="editForm.country"
            type="text"
            class="w-full"
          />
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
          <h1 class="text-2xl font-semibold text-text-color-dark">Order History</h1>
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
      <div v-if="orderStore.loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-color"></div>
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
        <h3 class="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
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
              <h3 class="font-semibold text-lg text-gray-900">{{ order.orderId }}</h3>
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
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.name"
                class="w-12 h-12 object-cover rounded-md"
              />
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
        <h1 class="text-2xl font-semibold text-text-color-dark">Preferences</h1>
        <p class="text-gray-600 mt-1">Customize your account settings and preferences</p>
      </div>
      
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-3">Notifications</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Email Notifications</p>
                <p class="text-sm text-gray-600">Receive order updates via email</p>
              </div>
              <input type="checkbox" class="toggle" checked />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Marketing Emails</p>
                <p class="text-sm text-gray-600">Receive promotional emails and offers</p>
              </div>
              <input type="checkbox" class="toggle" />
            </div>
          </div>
        </div>
        
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-3">Language & Region</h3>
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
        <h1 class="text-2xl font-semibold text-text-color-dark">Security & Privacy</h1>
        <p class="text-gray-600 mt-1">Manage your account security and privacy settings</p>
      </div>
      
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-3">Password</h3>
          <p class="text-gray-600 mb-4">Keep your account secure with a strong password</p>
          <Button variant="outline">Change Password</Button>
        </div>
        
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-3">Two-Factor Authentication</h3>
          <p class="text-gray-600 mb-4">Add an extra layer of security to your account</p>
          <Button variant="outline">Enable 2FA</Button>
        </div>
        
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-3">Data & Privacy</h3>
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
        <h1 class="text-2xl font-semibold text-text-color-dark">Help & Support</h1>
        <p class="text-gray-600 mt-1">Get help and contact our support team</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Quick Help</h3>
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
          <h3 class="text-lg font-medium text-gray-900 mb-4">Contact Support</h3>
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
</style>