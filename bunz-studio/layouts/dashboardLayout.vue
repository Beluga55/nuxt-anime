<script setup lang="ts">
import {
  User,
  ShoppingBag,
  Settings,
  Shield,
  HelpCircle,
  LogOut,
  Phone,
  Globe,
  Menu,
  X,
  Bell,
  CreditCard,
  BarChart3,
  IdCard,
} from "lucide-vue-next";
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
const activeSection = ref("overview");
const isMobileSidebarOpen = ref(false);
const userInfo = ref(null);
const isGoogleUser = ref(false);

// Sidebar navigation items
const sidebarItems = computed(() => {
  const allItems = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
      description: "Dashboard overview",
      route: "/profile",
    },
    {
      id: "account",
      label: "Account Details",
      icon: IdCard,
      description: "Personal information",
      route: "/profile?section=account",
    },
    {
      id: "orders",
      label: "Order History",
      icon: ShoppingBag,
      description: "Your past orders",
      route: "/profile?section=orders",
    },
    {
      id: "settings",
      label: "Preferences",
      icon: Settings,
      description: "Account settings",
      route: "/profile?section=settings",
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      description: "Password & security",
      route: "/profile?section=security",
    },
    {
      id: "support",
      label: "Help & Support",
      icon: HelpCircle,
      description: "Get assistance",
      route: "/profile?section=support",
    },
  ];

  // Filter out security section for Google users
  if (isGoogleUser.value) {
    return allItems.filter(item => item.id !== 'security');
  }
  
  return allItems;
});

// Computed properties
const userName = computed(() => {
  return userInfo.value?.name || userInfo.value?.email?.split("@")[0] || "User";
});

const profilePicture = computed(() => {
  return userInfo.value?.image || userInfo.value?.picture || "";
});

const currentSectionInfo = computed(() => {
  const section = route.query.section || "overview";
  return sidebarItems.value.find((item) => item.id === section) || sidebarItems.value[0];
});

// Methods
const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const response = await $fetch('http://localhost:8080/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      isGoogleUser.value = response.isGoogle || false;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    isGoogleUser.value = false;
  }
};

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
  if (sectionId === "overview") {
    router.push("/profile");
  } else {
    router.push(`/profile?section=${sectionId}`);
  }
  isMobileSidebarOpen.value = false;
};

// Watch for Google users accessing security section directly
watch([() => route.query.section, isGoogleUser], ([newSection, isGoogle]) => {
  if (isGoogle && newSection === 'security') {
    // Redirect Google users away from security section
    router.push('/profile');
    toast({
      description: "Security settings are managed by your Google account",
      variant: "default"
    });
  }
});

// Lifecycle
onMounted(async () => {
  const loginData = localStorage.getItem("userInfo");
  if (loginData) {
    userInfo.value = JSON.parse(loginData);
    // Fetch user profile to get isGoogle status
    await fetchUserProfile();
    // Fetch user orders to populate stats for quick stats display
    if (userInfo.value?.email) {
      await orderStore.fetchUserOrders(userInfo.value.email);
    }
  } else {
    router.push("/login");
  }
});

// Provide data to child components
provide("dashboardData", {
  activeSection: computed(() => route.query.section || "overview"),
  userInfo,
  orderStore,
  navigateToSection,
});
</script>

<template>
  <div class="h-screen bg-background-color flex flex-col">
    <!-- Top Header Navigation -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="w-full px-4 px-6">
        <div class="flex items-center justify-between h-16">
          <!-- Left: Profile info and section title -->
          <div class="flex items-center">
            <Button
              @click="isMobileSidebarOpen = !isMobileSidebarOpen"
              variant="ghost"
              size="sm"
              class="lg:hidden"
            >
              <Menu class="w-5 h-5" />
            </Button>

            <div class="flex items-center space-x-3">
              <img
                v-if="profilePicture"
                :src="profilePicture"
                :alt="userName"
                class="w-8 h-8 rounded-full object-cover border border-primary-color"
                referrerpolicy="no-referrer"
              />
              <User v-else class="w-8 h-8 text-gray-400" />
              <div class="hidden sm:block">
                <h1
                  class="text-lg font-bold text-text-color-dark font-dashboard"
                >
                  {{ userName }}
                </h1>
                <p class="text-xs text-gray-600 font-dashboard">
                  {{ currentSectionInfo?.label }}
                </p>
              </div>
            </div>
          </div>

          <!-- Right: Action buttons -->
          <div class="flex items-center space-x-3">
            <Button variant="ghost" size="sm" class="hidden sm:flex">
              <Bell class="w-5 h-5" />
            </Button>

            <Button
              @click="handleLogout"
              variant="ghost"
              size="sm"
              class="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut class="w-5 h-5" />
              <span class="hidden sm:inline ml-2">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <div
        class="hidden lg:block w-64 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto p-6"
      >
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
                : 'text-gray-700 hover:bg-gray-50',
            ]"
          >
            <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
            <div class="min-w-0 flex-1">
              <p class="font-medium truncate font-dashboard">
                {{ item.label }}
              </p>
              <p
                :class="[
                  'text-xs truncate',
                  (route.query.section || 'overview') === item.id
                    ? 'text-white/80'
                    : 'text-gray-500',
                ]"
              >
                {{ item.description }}
              </p>
            </div>
          </button>
        </nav>

        <!-- Quick Stats Card -->
        <div v-if="orderStore.ordersStats" class="bg-gray-50 rounded-lg p-4">
          <h3 class="text-sm font-medium text-gray-900 mb-3 font-dashboard">
            Quick Stats
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <ShoppingBag class="w-4 h-4 text-gray-400" />
                <span class="text-sm text-gray-600">Total Orders</span>
              </div>
              <span class="text-sm font-semibold text-primary-color">{{
                orderStore.ordersStats.totalOrders
              }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <CreditCard class="w-4 h-4 text-gray-400" />
                <span class="text-sm text-gray-600">Total Spent</span>
              </div>
              <span class="text-sm font-semibold text-primary-color"
                >RM
                {{
                  orderStore.ordersStats.totalSpent?.toFixed(2) || "0.00"
                }}</span
              >
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
      <div
        class="fixed left-0 top-0 h-full w-80 bg-white shadow-xl"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold font-dashboard">Navigation</h2>
            <Button
              @click="isMobileSidebarOpen = false"
              variant="ghost"
              size="sm"
            >
              <X class="w-5 h-5" />
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
                  : 'text-gray-700 hover:bg-gray-50',
              ]"
            >
              <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
              <div class="min-w-0 flex-1">
                <p class="font-medium truncate font-dashboard">
                  {{ item.label }}
                </p>
                <p
                  :class="[
                    'text-xs truncate',
                    (route.query.section || 'overview') === item.id
                      ? 'text-white/80'
                      : 'text-gray-500',
                  ]"
                >
                  {{ item.description }}
                </p>
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

<style scoped>
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: "Manrope", sans-serif !important;
}
</style>
