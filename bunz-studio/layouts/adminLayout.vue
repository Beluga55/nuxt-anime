<script setup lang="ts">
import {
  User,
  ShoppingBag,
  Package,
  Users,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Bell,
  BarChart3,
  Home,
  Shield,
  CreditCard,
} from "lucide-vue-next";
import { useToast } from "@/components/ui/toast/use-toast";
import { useTokenStatus } from "@/composables/useTokenStatus";

const { toast } = useToast();
const { setTokenStatus } = useTokenStatus();
const router = useRouter();
const route = useRoute();

// Reactive state
const isMobileSidebarOpen = ref(false);
const userInfo = ref<any>(null);
const isAdmin = ref(false);
const isLoading = ref(true);
const adminStats = ref({
  totalUsers: 0,
  totalOrders: 0,
  totalRevenue: 0,
  pendingSupport: 0,
});

// Admin sidebar navigation items
const sidebarItems = computed(() => [
  {
    id: "overview",
    label: "Dashboard",
    icon: BarChart3,
    description: "Overview & Analytics",
    route: "/admin",
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingBag,
    description: "Order management",
    route: "/admin?section=orders",
  },
  {
    id: "products",
    label: "Products",
    icon: Package,
    description: "Manage inventory",
    route: "/admin?section=products",
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    description: "User management",
    route: "/admin?section=users",
  },
  {
    id: "support",
    label: "Support Tickets",
    icon: MessageSquare,
    description: "Support management",
    route: "/admin?section=support",
  },
]);

// Computed properties
const userName = computed(() => {
  return (
    userInfo.value?.name || userInfo.value?.email?.split("@")[0] || "Admin"
  );
});

const profilePicture = computed(() => {
  return userInfo.value?.image || userInfo.value?.picture || "";
});

const currentSectionInfo = computed(() => {
  const section = route.query.section || "overview";
  return (
    sidebarItems.value.find((item) => item.id === section) ||
    sidebarItems.value[0]
  );
});

// Methods
const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const response = await $fetch("http://localhost:8080/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      isAdmin.value = response.isAdmin || false;
      if (!isAdmin.value) {
        toast({
          variant: "destructive",
          description: "Access denied. Admin privileges required.",
        });
        router.push("/");
        return;
      }
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    toast({
      variant: "destructive",
      description: "Failed to verify admin access",
    });
    router.push("/login");
  }
};

const fetchAdminStats = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Fetch stats from all admin endpoints in parallel
    const [userStats, orderStats, supportStats] = await Promise.all([
      $fetch("http://localhost:8080/admin/users/stats", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      $fetch("http://localhost:8080/admin/orders/stats", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      $fetch("http://localhost:8080/admin/support/stats", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    // Update admin stats with real data
    adminStats.value = {
      totalUsers: userStats.general.totalUsers || 0,
      totalOrders: orderStats.general.totalOrders || 0,
      totalRevenue: orderStats.general.totalRevenue || 0,
      pendingSupport: supportStats.general.openTickets || 0,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    // Fallback to zero values if API fails
    adminStats.value = {
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      pendingSupport: 0,
    };
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
    router.push("/admin");
  } else {
    router.push(`/admin?section=${sectionId}`);
  }
  isMobileSidebarOpen.value = false;
};

const goToMainSite = () => {
  router.push("/");
};

// Lifecycle
onMounted(async () => {
  const loginData = localStorage.getItem("userInfo");
  if (loginData) {
    userInfo.value = JSON.parse(loginData);
    await fetchUserProfile();
    await fetchAdminStats();
  } else {
    router.push("/login");
  }
  isLoading.value = false;
});

// Provide data to child components
provide("adminStats", adminStats);
provide("userInfo", userInfo);
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
            <Button
              @click="goToMainSite"
              variant="ghost"
              size="sm"
              class="hidden sm:flex text-gray-600 hover:text-gray-700"
            >
              <Home class="w-5 h-5" />
              <span class="ml-2">Main Site</span>
            </Button>

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

        <!-- Admin Stats Card -->
        <div v-if="!isLoading" class="mt-6 bg-primary-color/10 rounded-lg p-4">
          <div class="flex items-center space-x-2 mb-3">
            <BarChart3 class="w-4 h-4 text-primary-color" />
            <h3 class="text-sm font-medium text-primary-color font-dashboard">
              Quick Stats
            </h3>
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <Users class="w-3 h-3 text-gray-400" />
                <span class="text-xs text-gray-600">Total Users</span>
              </div>
              <span class="text-xs font-semibold text-primary-color">{{
                adminStats.totalUsers
              }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <ShoppingBag class="w-3 h-3 text-gray-400" />
                <span class="text-xs text-gray-600">Total Orders</span>
              </div>
              <span class="text-xs font-semibold text-primary-color">{{
                adminStats.totalOrders
              }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <CreditCard class="w-3 h-3 text-gray-400" />
                <span class="text-xs text-gray-600">Revenue</span>
              </div>
              <span class="text-xs font-semibold text-primary-color"
                >RM {{ adminStats.totalRevenue.toFixed(2) }}</span
              >
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <MessageSquare class="w-3 h-3 text-gray-400" />
                <span class="text-xs text-gray-600">Support</span>
              </div>
              <span class="text-xs font-semibold text-orange-600"
                >{{ adminStats.pendingSupport }} pending</span
              >
            </div>
          </div>
        </div>

        <!-- Admin Info Card -->
        <div class="mt-4 bg-gray-50 rounded-lg p-4">
          <div class="flex items-center space-x-2 mb-2">
            <Shield class="w-4 h-4 text-primary-color" />
            <h3 class="text-sm font-medium text-primary-color font-dashboard">
              Admin Access
            </h3>
          </div>
          <p class="text-xs text-gray-600">
            You have administrative privileges to manage this application.
          </p>
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
            <div class="flex items-center space-x-3">
              <img
                v-if="profilePicture"
                :src="profilePicture"
                :alt="userName"
                class="w-10 h-10 rounded-full object-cover border-2 border-primary-color"
                referrerpolicy="no-referrer"
              />
              <User v-else class="w-10 h-10 text-gray-400" />
              <div>
                <div class="flex items-center space-x-2">
                  <Shield class="w-5 h-5 text-primary-color" />
                  <h2
                    class="text-lg font-bold font-dashboard text-primary-color"
                  >
                    Admin Panel
                  </h2>
                </div>
                <p class="text-sm text-gray-600">
                  {{ userName }} - Administrator
                </p>
              </div>
            </div>
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

          <!-- Mobile Admin Stats -->
          <div
            v-if="!isLoading"
            class="mt-6 bg-primary-color/10 rounded-lg p-4"
          >
            <div class="flex items-center space-x-2 mb-3">
              <BarChart3 class="w-4 h-4 text-primary-color" />
              <h3 class="text-sm font-medium text-primary-color font-dashboard">
                Quick Stats
              </h3>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="text-center">
                <p class="text-lg font-bold text-primary-color">
                  {{ adminStats.totalUsers }}
                </p>
                <p class="text-xs text-gray-600">Users</p>
              </div>
              <div class="text-center">
                <p class="text-lg font-bold text-primary-color">
                  {{ adminStats.totalOrders }}
                </p>
                <p class="text-xs text-gray-600">Orders</p>
              </div>
              <div class="text-center">
                <p class="text-lg font-bold text-primary-color">
                  RM {{ adminStats.totalRevenue.toFixed(0) }}
                </p>
                <p class="text-xs text-gray-600">Revenue</p>
              </div>
              <div class="text-center">
                <p class="text-lg font-bold text-orange-600">
                  {{ adminStats.pendingSupport }}
                </p>
                <p class="text-xs text-gray-600">Support</p>
              </div>
            </div>
          </div>
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
