<script setup lang="ts">
import {
  UserCircleIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  PhoneIcon,
  GlobeAltIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  CreditCardIcon,
} from "@heroicons/vue/24/outline";
import { useAuthStore } from "~/store/auth";
import { useOrderStore } from "~/store/order";
import { useToast } from "@/components/ui/toast/use-toast";
import { useTokenStatus } from "@/composables/useTokenStatus";

const authStore = useAuthStore();
const orderStore = useOrderStore();
const { toast } = useToast();
const { setTokenStatus } = useTokenStatus();
const router = useRouter();
const route = useRoute();

// Reactive state
const activeSection = ref('overview');
const isMobileSidebarOpen = ref(false);
const userInfo = ref(null);

// Sidebar navigation items
const sidebarItems = [
  { 
    id: 'overview', 
    label: 'Overview', 
    icon: UserCircleIcon,
    description: 'Dashboard overview',
    route: '/profile'
  },
  { 
    id: 'account', 
    label: 'Account Details', 
    icon: UserCircleIcon,
    description: 'Personal information',
    route: '/profile?section=account'
  },
  { 
    id: 'orders', 
    label: 'Order History', 
    icon: ShoppingBagIcon,
    description: 'Your past orders',
    route: '/profile?section=orders'
  },
  { 
    id: 'settings', 
    label: 'Preferences', 
    icon: Cog6ToothIcon,
    description: 'Account settings',
    route: '/profile?section=settings'
  },
  { 
    id: 'security', 
    label: 'Security', 
    icon: ShieldCheckIcon,
    description: 'Password & security',
    route: '/profile?section=security'
  },
  { 
    id: 'support', 
    label: 'Help & Support', 
    icon: QuestionMarkCircleIcon,
    description: 'Get assistance',
    route: '/profile?section=support'
  }
];

// Computed properties
const userName = computed(() => {
  return userInfo.value?.name || userInfo.value?.email?.split('@')[0] || "User";
});

const profilePicture = computed(() => {
  return userInfo.value?.image || userInfo.value?.picture || "";
});

const currentSectionInfo = computed(() => {
  const section = route.query.section || 'overview';
  return sidebarItems.find(item => item.id === section) || sidebarItems[0];
});

// Methods
const handleLogout = () => {
  localStorage.removeItem("userInfo");
  localStorage.removeItem("token");
  localStorage.removeItem("tokenExpiration");
  setTokenStatus(false);
  toast({
    description: "Logged out successfully",
  });
  router.push("/");
};

const navigateToSection = (sectionId: string) => {
  if (sectionId === 'overview') {
    router.push('/profile');
  } else {
    router.push(`/profile?section=${sectionId}`);
  }
  isMobileSidebarOpen.value = false;
};

// Lifecycle
onMounted(() => {
  const loginData = localStorage.getItem("userInfo");
  if (loginData) {
    userInfo.value = JSON.parse(loginData);
  } else {
    router.push("/login");
  }
});

// Provide data to child components
provide('dashboardData', {
  activeSection: computed(() => route.query.section || 'overview'),
  userInfo,
  orderStore,
  navigateToSection
});
</script>

<template>
  <div class="h-screen bg-background-color flex flex-col">
    <!-- Top Header Navigation -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Left: Profile info and section title -->
          <div class="flex items-center space-x-4">
            <Button
              @click="isMobileSidebarOpen = !isMobileSidebarOpen"
              variant="ghost"
              size="sm"
              class="lg:hidden"
            >
              <Bars3Icon class="w-5 h-5" />
            </Button>
            
            <div class="flex items-center space-x-3">
              <img
                v-if="profilePicture"
                :src="profilePicture"
                :alt="userName"
                class="w-8 h-8 rounded-full object-cover border border-primary-color"
                referrerpolicy="no-referrer"
              />
              <UserCircleIcon v-else class="w-8 h-8 text-gray-400" />
              <div class="hidden sm:block">
                <h1 class="text-lg font-semibold text-text-color-dark">{{ userName }}</h1>
                <p class="text-xs text-gray-600">{{ currentSectionInfo?.label }}</p>
              </div>
            </div>
          </div>

          <!-- Right: Action buttons -->
          <div class="flex items-center space-x-3">
            <Button variant="ghost" size="sm" class="hidden sm:flex">
              <BellIcon class="w-5 h-5" />
            </Button>
            
            <Button
              @click="handleLogout"
              variant="ghost"
              size="sm"
              class="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <ArrowRightOnRectangleIcon class="w-5 h-5" />
              <span class="hidden sm:inline ml-2">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <div class="hidden lg:block w-64 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto p-6">
        <!-- Navigation -->
        <nav class="space-y-1">
          <button
            v-for="item in sidebarItems"
            :key="item.id"
            @click="navigateToSection(item.id)"
            :class="[
              'w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors text-sm',
              (route.query.section || 'overview') === item.id
                ? 'bg-primary-color text-white'
                : 'text-gray-700 hover:bg-gray-50'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
            <div class="min-w-0 flex-1">
              <p class="font-medium truncate">{{ item.label }}</p>
              <p :class="[
                'text-xs truncate',
                (route.query.section || 'overview') === item.id ? 'text-white/80' : 'text-gray-500'
              ]">{{ item.description }}</p>
            </div>
          </button>
        </nav>

        <!-- Quick Stats Card -->
        <div v-if="orderStore.ordersStats" class="bg-gray-50 rounded-lg p-4">
          <h3 class="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <ShoppingBagIcon class="w-4 h-4 text-gray-400" />
                <span class="text-sm text-gray-600">Total Orders</span>
              </div>
              <span class="text-sm font-semibold text-primary-color">{{ orderStore.ordersStats.totalOrders }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <CreditCardIcon class="w-4 h-4 text-gray-400" />
                <span class="text-sm text-gray-600">Total Spent</span>
              </div>
              <span class="text-sm font-semibold text-primary-color">RM {{ orderStore.ordersStats.totalSpent?.toFixed(2) || '0.00' }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto bg-gray-50 p-6">
        <slot />
      </div>
    </div>
    
    <!-- Mobile Sidebar -->
    <div
      v-if="isMobileSidebarOpen"
      class="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
      @click="isMobileSidebarOpen = false"
    >
      <div class="fixed left-0 top-0 h-full w-80 bg-white shadow-xl" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold">Navigation</h2>
            <Button
              @click="isMobileSidebarOpen = false"
              variant="ghost"
              size="sm"
            >
              <XMarkIcon class="w-5 h-5" />
            </Button>
          </div>
          
          <nav class="space-y-1">
            <button
              v-for="item in sidebarItems"
              :key="item.id"
              @click="navigateToSection(item.id)"
              :class="[
                'w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors text-sm',
                (route.query.section || 'overview') === item.id
                  ? 'bg-primary-color text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
              <div class="min-w-0 flex-1">
                <p class="font-medium truncate">{{ item.label }}</p>
                <p :class="[
                  'text-xs truncate',
                  (route.query.section || 'overview') === item.id ? 'text-white/80' : 'text-gray-500'
                ]">{{ item.description }}</p>
              </div>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@import url("../assets/css/default.css");
</style>