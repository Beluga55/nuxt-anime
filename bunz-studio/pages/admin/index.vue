<script setup lang="ts">
import {
  BarChart3,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  Eye,
  X,
  MapPin,
  Calendar,
  User,
  Search,
  Edit,
  Filter,
} from "lucide-vue-next";
import { useOrderStore } from "@/store/order/index.js";
import { useProductsStore } from "@/store/products/index.js";
import { useToast } from "@/components/ui/toast/use-toast";
import { useAxios } from "@/composables/useAxios";
import { useAuth } from "@/composables/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { object, string, number } from "zod";
import { useField, useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

// Middleware to protect admin routes
definePageMeta({
  middleware: "admin",
  layout: "admin-layout",
});

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const productsStore = useProductsStore();
const { createAxiosClient } = useAxios();
const axiosClient = createAxiosClient();
const { user, getCurrentUser, checkAdminStatus } = useAuth();

// Get data from layout
const adminStats = inject("adminStats") as any || {};
const userInfo = inject("userInfo") as any || {};
const activeSection = computed(() => route.query.section || "overview");

// Recent orders state
const recentOrders = ref<any[]>([]);
const isLoadingOrders = ref(false);
const allOrders = ref<any[]>([]);

// Order details modal state
const showOrderDetails = ref(false);
const selectedOrderDetails = ref<any>(null);
const isLoadingOrderDetails = ref(false);

// Product search and filter state
const searchQuery = ref("");
const selectedCategory = ref("all");
const searchDebounceTimer = ref<NodeJS.Timeout | null>(null);

// Product modal state
const showViewDialog = ref(false);
const showEditDialog = ref(false);
const selectedProduct = ref<any>(null);
const isUpdatingProduct = ref(false);

// Form validation schema
const productSchema = toTypedSchema(
  object({
    name: string().min(1, "Product name is required"),
    description: string().min(1, "Description is required"),
    price: number().positive("Price must be greater than 0"),
    stock: number().int().min(0, "Stock must be 0 or greater"),
    category: string().min(1, "Category is required"),
    width: string().optional(),
    height: string().optional(),
    material: string().optional(),
  })
);

// Form setup
const { handleSubmit, resetForm, setValues } = useForm({
  validationSchema: productSchema,
});

// Form fields
const { value: name, errorMessage: nameError } = useField<string>("name");
const { value: description, errorMessage: descriptionError } = useField<string>("description");
const { value: price, errorMessage: priceError } = useField<number>("price");
const { value: stock, errorMessage: stockError } = useField<number>("stock");
const { value: category, errorMessage: categoryError } = useField<string>("category");
const { value: width, errorMessage: widthError } = useField<string>("width");
const { value: height, errorMessage: heightError } = useField<string>("height");
const { value: material, errorMessage: materialError } = useField<string>("material");

// Computed properties
const userName = computed(() => {
  return (
    user?.value?.name ||
    user?.value?.username ||
    userInfo?.value?.name ||
    userInfo?.value?.email?.split("@")[0] ||
    "Admin"
  );
});

// Fetch recent orders from all users
const fetchRecentOrders = async (limit = 5) => {
  try {
    isLoadingOrders.value = true;
    const token = localStorage.getItem("token");

    // Use axios client for admin orders endpoint
    const response = await orderStore.fetchOrders({
      limit: limit,
      page: 1,
    });

    if (response && response.data) {
      if (limit === 5) {
        recentOrders.value = response.data;
      } else {
        allOrders.value = response.data;
      }
    }
  } catch (error) {
    console.error("Error fetching recent orders:", error);
  } finally {
    isLoadingOrders.value = false;
  }
};

// Fetch detailed order information
const viewOrderDetails = async (orderId: string) => {
  try {
    isLoadingOrderDetails.value = true;

    // Use axios client for admin order details
    const response = await axiosClient.get(`/admin/orders/${orderId}`);
    selectedOrderDetails.value = response.data;
    showOrderDetails.value = true;
  } catch (error) {
    console.error("Error fetching order details:", error);

    // Try the order store as fallback
    try {
      const response = await orderStore.viewOrderDetails(orderId);
      selectedOrderDetails.value = response;
      showOrderDetails.value = true;
    } catch (fallbackError) {
      console.error("Fallback order details fetch failed:", fallbackError);
      useToast().toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      });
    }
  } finally {
    isLoadingOrderDetails.value = false;
  }
};

// Fetch admin products
const fetchAdminProducts = async (params = {}) => {
  try {
    const searchParams = {
      ...params,
      ...(searchQuery.value && { search: searchQuery.value }),
      ...(selectedCategory.value && selectedCategory.value !== "all" && { category: selectedCategory.value }),
    };
    await productsStore.fetchAdminProducts(searchParams);
  } catch (error) {
    console.error("Error fetching admin products:", error);
    useToast().toast({
      title: "Error",
      description: "Failed to fetch products",
      variant: "destructive",
    });
  }
};

// Debounced search function
const performSearch = () => {
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value);
  }
  
  searchDebounceTimer.value = setTimeout(() => {
    fetchAdminProducts();
  }, 300);
};

// Clear filters
const clearFilters = () => {
  searchQuery.value = "";
  selectedCategory.value = "all";
  fetchAdminProducts();
};

// Product modal functions
const viewProduct = (product: any) => {
  selectedProduct.value = product;
  showViewDialog.value = true;
};

const editProduct = (product: any) => {
  selectedProduct.value = { ...product }; // Create a copy for editing
  
  // Populate form with current product data
  setValues({
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    category: product.category,
    width: product.width || "",
    height: product.height || "",
    material: product.material || "",
  });
  
  showViewDialog.value = false; // Close view dialog if open
  showEditDialog.value = true;
};

// Submit form
const onSubmit = handleSubmit(async (values) => {
  if (!selectedProduct.value) return;
  
  try {
    isUpdatingProduct.value = true;
    
    // Update the product via API (we'll implement this next)
    await updateProduct(selectedProduct.value._id, values);
    
    useToast().toast({
      title: "Success",
      description: "Product updated successfully",
    });
    
    showEditDialog.value = false;
    resetForm();
    fetchAdminProducts(); // Refresh the list
  } catch (error) {
    console.error("Error updating product:", error);
    useToast().toast({
      title: "Error",
      description: "Failed to update product",
      variant: "destructive",
    });
  } finally {
    isUpdatingProduct.value = false;
  }
});

// Cancel edit
const cancelEdit = () => {
  showEditDialog.value = false;
  resetForm();
};

// Update product API call
const updateProduct = async (productId: string, productData: any) => {
  const [result, error] = await useNuxtApp().$api.products.updateProduct(productId, productData);
  if (error) {
    throw new Error(error);
  }
  return result;
};

// Watch for active section changes
watch(activeSection, (newSection) => {
  if (newSection === "orders") {
    fetchRecentOrders(50); // Fetch more orders for the orders section
  } else if (newSection === "products") {
    fetchAdminProducts(); // Fetch products when switching to products section
  }
});

// Watch for search changes
watch(searchQuery, () => {
  performSearch();
});

// Watch for category filter changes
watch(selectedCategory, () => {
  fetchAdminProducts();
});

// Lifecycle
onMounted(() => {
  fetchRecentOrders();

  // If user refreshes on orders section, fetch all orders
  if (activeSection.value === "orders") {
    fetchRecentOrders(50);
  }
  
  // If user refreshes on products section, fetch products
  if (activeSection.value === "products") {
    fetchAdminProducts();
  }
});


// Product status computation
const getProductStatus = (stock: number) => {
  if (stock === 0) return "Out of Stock";
  if (stock <= 10) return "Low Stock";
  return "Active";
};

const mockUsers = ref([
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Customer",
    joinDate: "2024-01-10",
    orders: 5,
    totalSpent: 499.95,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Customer",
    joinDate: "2024-01-08",
    orders: 3,
    totalSpent: 299.97,
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@example.com",
    role: "Admin",
    joinDate: "2023-12-01",
    orders: 0,
    totalSpent: 0,
  },
]);

const mockSupportTickets = ref([
  {
    id: 1,
    subject: "Order delivery issue",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    status: "Open",
    priority: "High",
    createdDate: "2024-01-15",
    lastReply: "2024-01-15",
  },
  {
    id: 2,
    subject: "Product return request",
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    status: "In Progress",
    priority: "Medium",
    createdDate: "2024-01-14",
    lastReply: "2024-01-14",
  },
  {
    id: 3,
    subject: "Account login problem",
    customerName: "Bob Wilson",
    customerEmail: "bob@example.com",
    status: "Resolved",
    priority: "Low",
    createdDate: "2024-01-13",
    lastReply: "2024-01-13",
  },
]);

// Methods
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
    case "resolved":
    case "active":
      return "text-green-600 bg-green-100 border-green-200";
    case "processing":
    case "in progress":
      return "text-blue-600 bg-blue-100 border-blue-200";
    case "shipped":
      return "text-purple-600 bg-purple-100 border-purple-200";
    case "pending":
    case "open":
      return "text-yellow-600 bg-yellow-100 border-yellow-200";
    case "cancelled":
      return "text-red-600 bg-red-100 border-red-200";
    case "out of stock":
      return "text-red-600 bg-red-100 border-red-200";
    case "low stock":
      return "text-orange-600 bg-orange-100 border-orange-200";
    default:
      return "text-gray-600 bg-gray-100 border-gray-200";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
      return "text-red-600 bg-red-100 border-red-200";
    case "medium":
      return "text-yellow-600 bg-yellow-100 border-yellow-200";
    case "low":
      return "text-green-600 bg-green-100 border-green-200";
    default:
      return "text-gray-600 bg-gray-100 border-gray-200";
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount: number) => {
  return `RM ${amount.toFixed(2)}`;
};

// Helper function to get proper image URL
const getImageUrl = (imageUrl: string): string | undefined => {
  if (!imageUrl) return undefined;

  // The backend now returns full Google Cloud Storage signed URLs
  // so we can return the URL as-is
  return imageUrl;
};
</script>

<template>
  <div>
    <!-- Overview Section -->
    <div v-if="activeSection === 'overview'" class="space-y-6">
      <!-- Welcome Card -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-text-color-dark font-dashboard">
              Welcome back, {{ userName }}!
            </h2>
            <p class="text-gray-600 mt-1">
              Here's what's happening with your store today.
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <BarChart3 class="w-8 h-8 text-primary-color" />
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 text-left">
              <p class="text-sm font-medium text-gray-600">Total Users</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ adminStats?.totalUsers || 0 }}
              </p>
            </div>
            <Users class="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 text-left">
              <p class="text-sm font-medium text-gray-600">Total Orders</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ adminStats?.totalOrders || 0 }}
              </p>
            </div>
            <ShoppingBag class="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 text-left">
              <p class="text-sm font-medium text-gray-600">Revenue</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ formatCurrency(adminStats?.totalRevenue || 0) }}
              </p>
            </div>
            <BarChart3 class="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 text-left">
              <p class="text-sm font-medium text-gray-600">Support Tickets</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ adminStats?.pendingSupport || 0 }}
              </p>
            </div>
            <MessageSquare class="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 font-dashboard">
          Recent Orders
        </h3>

        <div v-if="isLoadingOrders" class="text-center py-4">
          <p class="text-gray-600">Loading recent orders...</p>
        </div>

        <div v-else-if="recentOrders.length === 0" class="text-center py-4">
          <p class="text-gray-600">No recent orders found.</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="order in recentOrders.slice(0, 3)"
            :key="order._id || order.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <ShoppingBag class="w-5 h-5 text-gray-400" />
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{
                    order.metadata?.order_id ||
                    order.orderId ||
                    `#${order._id?.slice(-8)}`
                  }}
                </p>
                <p class="text-xs text-gray-600">
                  {{ order.userName || order.customerName || "Customer" }} •
                  {{ formatDate(order.datePlaced || order.date) }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">
                {{ formatCurrency(order.totalAmount || order.totalPrice || 0) }}
              </p>
              <span
                :class="getStatusColor(order.status)"
                class="inline-block px-2 py-1 rounded-full text-xs font-medium border"
              >
                {{ order.status }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-4 text-center">
          <NuxtLink
            to="/admin?section=orders"
            class="text-sm text-primary-color hover:text-primary-color/80 font-medium"
          >
            View All Orders <span class="ml-1">→</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Orders Section -->
    <div
      v-else-if="activeSection === 'orders'"
      class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6"
      >
        <div>
          <h1 class="text-2xl font-bold text-text-color-dark font-dashboard">
            Order Management
          </h1>
          <p class="text-gray-600 mt-1">View and manage all customer orders</p>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Order
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Customer
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="isLoadingOrders">
              <td colspan="6" class="px-6 py-4 text-center text-gray-600">
                Loading orders...
              </td>
            </tr>
            <tr v-else-if="allOrders.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-gray-600">
                No orders found.
              </td>
            </tr>
            <tr
              v-else
              v-for="order in allOrders"
              :key="order._id || order.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{
                      order.metadata?.order_id ||
                      order.orderId ||
                      `#${order._id?.slice(-8)}`
                    }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{
                      order.items?.length ||
                      order.items ||
                      order.orderItems?.length ||
                      1
                    }}
                    items
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ order.userName || order.customerName || "Customer" }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ order.userEmail || order.customerEmail || "N/A" }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{
                  formatDate(order.datePlaced || order.date || order.createdAt)
                }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusColor(order.status)"
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border"
                >
                  {{ order.status }}
                </span>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
              >
                {{ formatCurrency(order.totalAmount || order.totalPrice || 0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Button
                  variant="outline"
                  size="sm"
                  @click="viewOrderDetails(order._id || order.id)"
                  :disabled="isLoadingOrderDetails"
                >
                  <Eye class="w-4 h-4 mr-1" />
                  View
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Products Section -->
    <div
      v-else-if="activeSection === 'products'"
      class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6"
      >
        <div>
          <h1 class="text-2xl font-bold text-text-color-dark font-dashboard">
            Product Management
          </h1>
          <p class="text-gray-600 mt-1">
            Manage your inventory and product catalog
          </p>
        </div>
      </div>

      <!-- Search and Filter Bar -->
      <div class="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        <!-- Search Input -->
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            v-model="searchQuery"
            placeholder="Search products by name or description..."
            class="pl-10"
          />
        </div>

        <!-- Category Filter -->
        <div class="w-full sm:w-48">
          <Select v-model="selectedCategory">
            <SelectTrigger>
              <Filter class="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Keychains">Keychains</SelectItem>
              <SelectItem value="Post Cards">Post Cards</SelectItem>
              <SelectItem value="Badges">Badges</SelectItem>
              <SelectItem value="Prints">Prints</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Clear Filters Button -->
        <Button
          variant="outline"
          @click="clearFilters"
          :disabled="!searchQuery && (!selectedCategory || selectedCategory === 'all')"
          class="w-full sm:w-auto"
        >
          <X class="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>

      <!-- Loading State -->
      <div v-if="productsStore.adminProductsLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-color mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading products...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="productsStore.adminProductsError" class="text-center py-8">
        <div class="text-red-600 mb-4">
          <AlertTriangle class="w-8 h-8 mx-auto mb-2" />
          <p>Failed to load products</p>
          <p class="text-sm text-gray-600">{{ productsStore.adminProductsError }}</p>
        </div>
        <Button @click="fetchAdminProducts" variant="outline">
          Try Again
        </Button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!productsStore.adminProducts || productsStore.adminProducts.length === 0" class="text-center py-8">
        <Package class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600">No products found</p>
      </div>

      <!-- Products Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="product in productsStore.adminProducts"
          :key="product._id"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <!-- Product Image -->
          <div class="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden h-48 max-h-48">
            <img
              v-if="product.imageUrl"
              :src="product.imageUrl"
              :alt="product.name"
              class="w-full h-full object-cover rounded-lg"
              @error="(e: Event) => { 
                const target = e.target as HTMLImageElement;
                if (target) {
                  target.style.display = 'none';
                  const sibling = target.nextElementSibling as HTMLElement;
                  if (sibling) sibling.style.display = 'flex';
                }
              }"
            />
            <div class="w-full h-full flex items-center justify-center" style="display: none;">
              <Package class="w-12 h-12 text-gray-400" />
            </div>
            <Package v-if="!product.imageUrl" class="w-12 h-12 text-gray-400" />
          </div>
          
          <!-- Product Details -->
          <div>
            <h3 class="font-semibold text-gray-900 mb-1 truncate" :title="product.name">
              {{ product.name }}
            </h3>
            <p class="text-sm text-gray-600 mb-2">{{ product.category }}</p>
            <div class="flex items-center justify-between mb-2">
              <span class="text-lg font-bold text-gray-900">
                {{ formatCurrency(product.price) }}
              </span>
              <span
                :class="getStatusColor(getProductStatus(product.stock))"
                class="px-2 py-1 text-xs font-medium rounded-full border"
              >
                {{ getProductStatus(product.stock) }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-3">Stock: {{ product.stock }}</p>
            <div class="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                class="flex-1"
                @click="editProduct(product)"
              >
                <Edit class="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                class="flex-1"
                @click="viewProduct(product)"
              >
                <Eye class="w-3 h-3 mr-1" />
                View
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Section -->
    <div
      v-else-if="activeSection === 'users'"
      class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6"
      >
        <div>
          <h1 class="text-2xl font-bold text-text-color-dark font-dashboard">
            User Management
          </h1>
          <p class="text-gray-600 mt-1">
            Manage customer accounts and permissions
          </p>
        </div>
      </div>

      <!-- Users Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                User
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Join Date
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Orders
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Spent
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="user in mockUsers"
              :key="user.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center"
                  >
                    <Users class="w-5 h-5 text-gray-600" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.name }}
                    </div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="
                    user.role === 'Admin'
                      ? 'text-purple-600 bg-purple-100 border-purple-200'
                      : 'text-blue-600 bg-blue-100 border-blue-200'
                  "
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(user.joinDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.orders }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
              >
                {{ formatCurrency(user.totalSpent) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Button variant="outline" size="sm">View</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Support Section -->
    <div
      v-else-if="activeSection === 'support'"
      class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6"
      >
        <div>
          <h1 class="text-2xl font-bold text-text-color-dark font-dashboard">
            Support Tickets
          </h1>
          <p class="text-gray-600 mt-1">
            Manage customer support requests and inquiries
          </p>
        </div>
      </div>

      <!-- Support Tickets Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ticket
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Customer
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Priority
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Created
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="ticket in mockSupportTickets"
              :key="ticket.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    #{{ ticket.id.toString().padStart(3, "0") }}
                  </div>
                  <div class="text-sm text-gray-500">{{ ticket.subject }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ ticket.customerName }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ ticket.customerEmail }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusColor(ticket.status)"
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border"
                >
                  {{ ticket.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getPriorityColor(ticket.priority)"
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border"
                >
                  {{ ticket.priority }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(ticket.createdDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Button variant="outline" size="sm">View</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Order Details Modal -->
    <Dialog v-model:open="showOrderDetails">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold">Order Details</DialogTitle>
        </DialogHeader>

        <div v-if="isLoadingOrderDetails" class="p-8 text-center">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-color mx-auto"
          ></div>
          <p class="mt-2 text-gray-600">Loading order details...</p>
        </div>

        <div v-else-if="selectedOrderDetails" class="space-y-6">
          <!-- Order Header -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <ShoppingBag class="w-5 h-5 text-gray-600" />
                <h3 class="font-medium text-gray-900">Order Info</h3>
              </div>
              <p class="text-sm text-gray-600">
                Order ID:
                {{
                  selectedOrderDetails.metadata?.order_id ||
                  selectedOrderDetails._id.slice(-8)
                }}
              </p>
              <p class="text-sm text-gray-600">
                Payment: {{ selectedOrderDetails.paymentMethod }}
              </p>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <User class="w-5 h-5 text-gray-600" />
                <h3 class="font-medium text-gray-900">Customer</h3>
              </div>
              <p class="text-sm text-gray-600">
                {{ selectedOrderDetails.user?.username }}
              </p>
              <p class="text-sm text-gray-600">
                {{ selectedOrderDetails.user?.email }}
              </p>
              <p class="text-sm text-gray-600">
                {{ selectedOrderDetails.user?.phone }}
              </p>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <Calendar class="w-5 h-5 text-gray-600" />
                <h3 class="font-medium text-gray-900">Order Date</h3>
              </div>
              <p class="text-sm text-gray-600">
                {{ formatDate(selectedOrderDetails.datePlaced) }}
              </p>
              <div class="mt-2">
                <span
                  :class="getStatusColor(selectedOrderDetails.status)"
                  class="px-2 py-1 text-xs rounded-full"
                >
                  {{ selectedOrderDetails.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Shipping Address -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center space-x-2 mb-3">
              <MapPin class="w-5 h-5 text-gray-600" />
              <h3 class="font-medium text-gray-900">Shipping Address</h3>
            </div>
            <div class="text-sm text-gray-600">
              <p>{{ selectedOrderDetails.shippingAddress?.address }}</p>
              <p>
                {{ selectedOrderDetails.shippingAddress?.city }},
                {{ selectedOrderDetails.shippingAddress?.postalCode }}
              </p>
              <p>{{ selectedOrderDetails.shippingAddress?.country }}</p>
            </div>
          </div>

          <!-- Order Items -->
          <div>
            <h3 class="font-medium text-gray-900 mb-4">Order Items</h3>
            <div class="space-y-4">
              <div
                v-for="item in selectedOrderDetails.orderItems"
                :key="item.product._id"
                class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="flex-shrink-0 h-20 w-20 relative">
                  <img
                    v-if="getImageUrl(item.product.image)"
                    class="h-20 w-20 rounded-lg object-cover shadow-sm border border-gray-200"
                    :src="getImageUrl(item.product.image)"
                    :alt="item.product.name"
                    @error="
                      (e: Event) => {
                        const target = e.target as HTMLImageElement;
                        if (target) {
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }
                      }
                    "
                    loading="lazy"
                  />
                  <div
                    class="h-20 w-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center hidden"
                  >
                    <Package class="w-8 h-8 text-gray-400" />
                  </div>
                  <div
                    v-if="!getImageUrl(item.product.image)"
                    class="h-20 w-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center"
                  >
                    <Package class="w-8 h-8 text-gray-400" />
                    <span class="sr-only">No image available</span>
                  </div>
                </div>
                <div class="flex-1">
                  <div class="flex justify-between">
                    <div>
                      <h4 class="font-medium text-gray-900">
                        {{ item.product.name }}
                      </h4>
                      <p class="text-sm text-gray-600">
                        {{ item.product.category }}
                      </p>
                      <p class="text-sm text-gray-600">
                        Quantity: {{ item.qty }}
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="font-medium text-gray-900">
                        RM{{ item.price.toFixed(2) }}
                      </p>
                      <p class="text-sm text-gray-600">
                        Total: RM{{
                          (item.price * item.qty).toFixed(2)
                        }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Total -->
          <div class="border-t pt-4">
            <div class="flex justify-between items-center">
              <span class="text-lg font-medium text-gray-900"
                >Order Total:</span
              >
              <span class="text-lg font-bold text-primary-color">
                RM{{
                  selectedOrderDetails.orderItems
                    .reduce(
                      (total: number, item: any) =>
                        total + item.price * item.qty,
                      0
                    )
                    .toFixed(2)
                }}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- View Product Modal -->
    <Dialog v-model:open="showViewDialog">
      <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold">Product Details</DialogTitle>
        </DialogHeader>

        <div v-if="selectedProduct" class="space-y-6">
          <!-- Product Header -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Product Image -->
            <div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                v-if="selectedProduct.imageUrl"
                :src="selectedProduct.imageUrl"
                :alt="selectedProduct.name"
                class="w-full h-full object-cover rounded-lg"
              />
              <Package v-else class="w-16 h-16 text-gray-400" />
            </div>

            <!-- Basic Info -->
            <div class="space-y-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  {{ selectedProduct.name }}
                </h3>
                <p class="text-sm text-gray-600">{{ selectedProduct.category }}</p>
              </div>

              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm font-medium text-gray-600">Price:</span>
                  <span class="text-lg font-bold text-gray-900">
                    {{ formatCurrency(selectedProduct.price) }}
                  </span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-sm font-medium text-gray-600">Stock:</span>
                  <span class="text-sm text-gray-900">{{ selectedProduct.stock }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="text-sm font-medium text-gray-600">Status:</span>
                  <span
                    :class="getStatusColor(getProductStatus(selectedProduct.stock))"
                    class="px-2 py-1 text-xs font-medium rounded-full border"
                  >
                    {{ getProductStatus(selectedProduct.stock) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Product Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">Product Specifications</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Width:</span>
                  <span class="text-gray-900">{{ selectedProduct.width || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Height:</span>
                  <span class="text-gray-900">{{ selectedProduct.height || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Material:</span>
                  <span class="text-gray-900">{{ selectedProduct.material || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">Performance</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Rating:</span>
                  <span class="text-gray-900">{{ (selectedProduct.rating || 0).toFixed(1) }}/5</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Reviews:</span>
                  <span class="text-gray-900">{{ selectedProduct.numReviews || 0 }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-3">Description</h4>
            <p class="text-sm text-gray-700">
              {{ selectedProduct.description || 'No description available.' }}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showViewDialog = false">
            Close
          </Button>
          <Button @click="editProduct(selectedProduct)">
            <Edit class="w-4 h-4 mr-2" />
            Edit Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Edit Product Modal -->
    <Dialog v-model:open="showEditDialog">
      <DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold">Edit Product</DialogTitle>
        </DialogHeader>

        <form @submit="onSubmit" class="space-y-6">
          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Product Name *</FormLabel>
              <FormControl>
                <Input v-model="name" placeholder="Enter product name" />
              </FormControl>
              <FormMessage>{{ nameError }}</FormMessage>
            </FormItem>

            <FormItem>
              <FormLabel>Category *</FormLabel>
              <FormControl>
                <Select v-model="category">
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Keychains">Keychains</SelectItem>
                    <SelectItem value="Post Cards">Post Cards</SelectItem>
                    <SelectItem value="Badges">Badges</SelectItem>
                    <SelectItem value="Prints">Prints</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage>{{ categoryError }}</FormMessage>
            </FormItem>
          </div>

          <!-- Price and Stock -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Price (RM) *</FormLabel>
              <FormControl>
                <Input 
                  v-model.number="price" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="0.00" 
                />
              </FormControl>
              <FormMessage>{{ priceError }}</FormMessage>
            </FormItem>

            <FormItem>
              <FormLabel>Stock Quantity *</FormLabel>
              <FormControl>
                <Input 
                  v-model.number="stock" 
                  type="number" 
                  min="0" 
                  placeholder="0" 
                />
              </FormControl>
              <FormMessage>{{ stockError }}</FormMessage>
            </FormItem>
          </div>

          <!-- Description -->
          <FormItem>
            <FormLabel>Description *</FormLabel>
            <FormControl>
              <textarea
                v-model="description"
                class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter product description"
                rows="3"
              />
            </FormControl>
            <FormMessage>{{ descriptionError }}</FormMessage>
          </FormItem>

          <!-- Specifications -->
          <div class="border-t pt-4">
            <h4 class="font-medium text-gray-900 mb-4">Specifications (Optional)</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormItem>
                <FormLabel>Width</FormLabel>
                <FormControl>
                  <Input v-model="width" placeholder="e.g., 15cm" />
                </FormControl>
                <FormMessage>{{ widthError }}</FormMessage>
              </FormItem>

              <FormItem>
                <FormLabel>Height</FormLabel>
                <FormControl>
                  <Input v-model="height" placeholder="e.g., 20cm" />
                </FormControl>
                <FormMessage>{{ heightError }}</FormMessage>
              </FormItem>

              <FormItem>
                <FormLabel>Material</FormLabel>
                <FormControl>
                  <Input v-model="material" placeholder="e.g., PVC, ABS" />
                </FormControl>
                <FormMessage>{{ materialError }}</FormMessage>
              </FormItem>
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" @click="cancelEdit" :disabled="isUpdatingProduct">
            Cancel
          </Button>
          <Button @click="onSubmit" :disabled="isUpdatingProduct">
            <div v-if="isUpdatingProduct" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {{ isUpdatingProduct ? 'Updating...' : 'Update Product' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

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
