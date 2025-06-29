<script setup lang="ts">
import {
  BarChart3,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
} from "lucide-vue-next";

// Middleware to protect admin routes
definePageMeta({
  middleware: 'admin',
  layout: 'admin-layout'
});

const route = useRoute();
const router = useRouter();

// Get data from layout
const adminData = inject('adminData');
const activeSection = computed(() => route.query.section || 'overview');
const userInfo = adminData?.userInfo;
const adminStats = adminData?.adminStats;

// Computed properties
const userName = computed(() => {
  return userInfo?.value?.name || userInfo?.value?.email?.split('@')[0] || "Admin";
});

// Mock data for demonstration
const mockOrders = ref([
  {
    id: 1,
    orderId: "ORD-2024-001",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    totalAmount: 299.99,
    status: "Processing",
    date: "2024-01-15",
    items: 3
  },
  {
    id: 2,
    orderId: "ORD-2024-002",
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    totalAmount: 156.50,
    status: "Shipped",
    date: "2024-01-14",
    items: 2
  },
  {
    id: 3,
    orderId: "ORD-2024-003",
    customerName: "Bob Wilson",
    customerEmail: "bob@example.com",
    totalAmount: 89.99,
    status: "Delivered",
    date: "2024-01-13",
    items: 1
  }
]);

const mockProducts = ref([
  {
    id: 1,
    name: "Attack on Titan Figure",
    category: "Figures",
    price: 89.99,
    stock: 25,
    status: "Active",
    image: "/placeholder-product.jpg"
  },
  {
    id: 2,
    name: "Naruto Manga Set",
    category: "Manga",
    price: 199.99,
    stock: 12,
    status: "Active",
    image: "/placeholder-product.jpg"
  },
  {
    id: 3,
    name: "Dragon Ball Poster",
    category: "Posters",
    price: 24.99,
    stock: 0,
    status: "Out of Stock",
    image: "/placeholder-product.jpg"
  }
]);

const mockUsers = ref([
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Customer",
    joinDate: "2024-01-10",
    orders: 5,
    totalSpent: 499.95
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Customer",
    joinDate: "2024-01-08",
    orders: 3,
    totalSpent: 299.97
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@example.com",
    role: "Admin",
    joinDate: "2023-12-01",
    orders: 0,
    totalSpent: 0
  }
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
    lastReply: "2024-01-15"
  },
  {
    id: 2,
    subject: "Product return request",
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    status: "In Progress",
    priority: "Medium",
    createdDate: "2024-01-14",
    lastReply: "2024-01-14"
  },
  {
    id: 3,
    subject: "Account login problem",
    customerName: "Bob Wilson",
    customerEmail: "bob@example.com",
    status: "Resolved",
    priority: "Low",
    createdDate: "2024-01-13",
    lastReply: "2024-01-13"
  }
]);

// Methods
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
    case 'resolved':
    case 'active':
      return 'text-green-600 bg-green-100 border-green-200';
    case 'processing':
    case 'in progress':
      return 'text-blue-600 bg-blue-100 border-blue-200';
    case 'shipped':
      return 'text-purple-600 bg-purple-100 border-purple-200';
    case 'pending':
    case 'open':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'cancelled':
      return 'text-red-600 bg-red-100 border-red-200';
    case 'out of stock':
      return 'text-red-600 bg-red-100 border-red-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'text-red-600 bg-red-100 border-red-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'low':
      return 'text-green-600 bg-green-100 border-green-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatCurrency = (amount: number) => {
  return `RM ${amount.toFixed(2)}`;
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
            <h2 class="text-2xl font-bold text-text-color-dark font-dashboard">Welcome back, {{ userName }}!</h2>
            <p class="text-gray-600 mt-1">Here's what's happening with your store today.</p>
          </div>
          <div class="flex items-center space-x-2">
            <BarChart3 class="w-8 h-8 text-primary-color" />
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-center">
            <div class="flex-1 text-center">
              <p class="text-sm font-medium text-gray-600">Total Users</p>
              <p class="text-2xl font-bold text-gray-900">{{ adminStats?.totalUsers || 0 }}</p>
            </div>
            <Users class="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-center">
            <div class="flex-1 text-center">
              <p class="text-sm font-medium text-gray-600">Total Orders</p>
              <p class="text-2xl font-bold text-gray-900">{{ adminStats?.totalOrders || 0 }}</p>
            </div>
            <ShoppingBag class="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-center">
            <div class="flex-1 text-center">
              <p class="text-sm font-medium text-gray-600">Revenue</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(adminStats?.totalRevenue || 0) }}</p>
            </div>
            <BarChart3 class="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-center">
            <div class="flex-1 text-center">
              <p class="text-sm font-medium text-gray-600">Support Tickets</p>
              <p class="text-2xl font-bold text-gray-900">{{ adminStats?.pendingSupport || 0 }}</p>
              <p class="text-xs text-orange-600 flex items-center justify-center">
                <AlertTriangle class="w-3 h-3 mr-1" />
                Pending review
              </p>
            </div>
            <MessageSquare class="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 font-dashboard">Recent Orders</h3>
        
        <div class="space-y-3">
          <div 
            v-for="order in mockOrders.slice(0, 3)" 
            :key="order.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <ShoppingBag class="w-5 h-5 text-gray-400" />
              <div>
                <p class="text-sm font-medium text-gray-900">{{ order.orderId }}</p>
                <p class="text-xs text-gray-600">{{ order.customerName }} • {{ formatDate(order.date) }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">{{ formatCurrency(order.totalAmount) }}</p>
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
            View All Orders →
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Orders Section -->
    <div v-else-if="activeSection === 'orders'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-text-color-dark font-dashboard">Order Management</h1>
          <p class="text-gray-600 mt-1">View and manage all customer orders</p>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="order in mockOrders" :key="order.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ order.orderId }}</div>
                  <div class="text-sm text-gray-500">{{ order.items }} items</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ order.customerName }}</div>
                  <div class="text-sm text-gray-500">{{ order.customerEmail }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(order.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusColor(order.status)" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border">
                  {{ order.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ formatCurrency(order.totalAmount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Button variant="outline" size="sm">View</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Products Section -->
    <div v-else-if="activeSection === 'products'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-text-color-dark font-dashboard">Product Management</h1>
          <p class="text-gray-600 mt-1">Manage your inventory and product catalog</p>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="product in mockProducts" :key="product.id" class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div class="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
            <Package class="w-12 h-12 text-gray-400" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-1">{{ product.name }}</h3>
            <p class="text-sm text-gray-600 mb-2">{{ product.category }}</p>
            <div class="flex items-center justify-between mb-2">
              <span class="text-lg font-bold text-gray-900">{{ formatCurrency(product.price) }}</span>
              <span :class="getStatusColor(product.status)" class="px-2 py-1 text-xs font-medium rounded-full border">
                {{ product.status }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-3">Stock: {{ product.stock }}</p>
            <div class="flex gap-2">
              <Button variant="outline" size="sm" class="flex-1">Edit</Button>
              <Button variant="outline" size="sm" class="flex-1">View</Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Section -->
    <div v-else-if="activeSection === 'users'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-text-color-dark font-dashboard">User Management</h1>
          <p class="text-gray-600 mt-1">Manage customer accounts and permissions</p>
        </div>
      </div>

      <!-- Users Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in mockUsers" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <Users class="w-5 h-5 text-gray-600" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="user.role === 'Admin' ? 'text-purple-600 bg-purple-100 border-purple-200' : 'text-blue-600 bg-blue-100 border-blue-200'" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(user.joinDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.orders }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
    <div v-else-if="activeSection === 'support'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-text-color-dark font-dashboard">Support Tickets</h1>
          <p class="text-gray-600 mt-1">Manage customer support requests and inquiries</p>
        </div>
      </div>

      <!-- Support Tickets Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="ticket in mockSupportTickets" :key="ticket.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">#{{ ticket.id.toString().padStart(3, '0') }}</div>
                  <div class="text-sm text-gray-500">{{ ticket.subject }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ ticket.customerName }}</div>
                  <div class="text-sm text-gray-500">{{ ticket.customerEmail }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusColor(ticket.status)" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border">
                  {{ ticket.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getPriorityColor(ticket.priority)" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border">
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