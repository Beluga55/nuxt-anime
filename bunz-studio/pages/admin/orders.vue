<script setup lang="ts">
import {
  Search,
  Filter,
  X,
  Eye,
  Trash,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Package,
  Calendar,
  User,
  MapPin,
} from "lucide-vue-next";

// Middleware to protect admin routes
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
});

// Reactive state
const orders = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedStatus = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const showOrderDetails = ref(false);
const selectedOrder = ref(null);

// Order statuses
const orderStatuses = [
  { value: 'Pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  { value: 'Processing', label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Package },
  { value: 'Shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: Truck },
  { value: 'Delivered', label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
];

// Get status info
const getStatusInfo = (status: string) => {
  return orderStatuses.find(s => s.value === status) || orderStatuses[0];
};

// Fetch orders
const fetchOrders = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: '10',
      ...(searchQuery.value && { search: searchQuery.value }),
      ...(selectedStatus.value && selectedStatus.value !== 'all' && { status: selectedStatus.value }),
    });

    const response = await $fetch(`http://localhost:8080/admin/orders?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    orders.value = response.data;
    totalPages.value = response.meta.totalPages;
  } catch (error) {
    console.error('Error fetching orders:', error);
    useToast().toast({
      title: 'Error',
      description: 'Failed to fetch orders',
      variant: 'destructive'
    });
  } finally {
    loading.value = false;
  }
};

// View order details
const viewOrderDetails = async (orderId: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await $fetch(`http://localhost:8080/admin/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    selectedOrder.value = response;
    showOrderDetails.value = true;
  } catch (error) {
    console.error('Error fetching order details:', error);
    useToast().toast({
      title: 'Error',
      description: 'Failed to fetch order details',
      variant: 'destructive'
    });
  }
};

// Update order status
const updateOrderStatus = async (orderId: string, newStatus: string) => {
  try {
    const token = localStorage.getItem('token');
    await $fetch(`http://localhost:8080/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: { status: newStatus }
    });

    useToast().toast({
      title: 'Success',
      description: 'Order status updated successfully'
    });

    await fetchOrders();
    
    // Update selected order if details modal is open
    if (selectedOrder.value && selectedOrder.value._id === orderId) {
      selectedOrder.value.status = newStatus;
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    useToast().toast({
      title: 'Error',
      description: 'Failed to update order status',
      variant: 'destructive'
    });
  }
};

// Delete order
const deleteOrder = async (orderId: string) => {
  if (!confirm('Are you sure you want to delete this order?')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    await $fetch(`http://localhost:8080/admin/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    useToast().toast({
      title: 'Success',
      description: 'Order deleted successfully'
    });

    await fetchOrders();
    
    // Close details modal if this order was selected
    if (selectedOrder.value && selectedOrder.value._id === orderId) {
      showOrderDetails.value = false;
      selectedOrder.value = null;
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    useToast().toast({
      title: 'Error',
      description: 'Failed to delete order',
      variant: 'destructive'
    });
  }
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Watch for search/filter changes
watch([searchQuery, selectedStatus], () => {
  currentPage.value = 1;
  fetchOrders();
}, { debounce: 500 });

// Watch for page changes
watch(currentPage, () => {
  fetchOrders();
});

// Load orders on mount
onMounted(() => {
  fetchOrders();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Order Management</h1>
        <p class="text-gray-600">Manage customer orders and track delivery status</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1 relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            v-model="searchQuery"
            placeholder="Search by customer name, email, or order ID..."
            class="pl-10"
          />
        </div>

        <!-- Status Filter -->
        <div class="sm:w-48">
          <Select v-model="selectedStatus">
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem v-for="status in orderStatuses" :key="status.value" :value="status.value">
                {{ status.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Clear Filters -->
        <Button
          v-if="searchQuery || (selectedStatus && selectedStatus !== 'all')"
          @click="searchQuery = ''; selectedStatus = 'all'"
          variant="outline"
        >
          <X class="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-color mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading orders...</p>
      </div>

      <div v-else-if="orders.length === 0" class="p-8 text-center">
        <ShoppingBag class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600">No orders found</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="order in orders" :key="order._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ order.metadata?.order_id || order._id.slice(-8) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ order.userName }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ order.userEmail }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ order.totalItems }} items
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                RM{{ order.totalAmount?.toFixed(2) || '0.00' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Select
                  :model-value="order.status"
                  @update:model-value="(value) => updateOrderStatus(order._id, value)"
                >
                  <SelectTrigger class="w-auto">
                    <SelectValue>
                      <span :class="['px-2 py-1 text-xs rounded-full', getStatusInfo(order.status).color]">
                        {{ order.status }}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="status in orderStatuses" :key="status.value" :value="status.value">
                      <div class="flex items-center space-x-2">
                        <component :is="status.icon" class="w-4 h-4" />
                        <span>{{ status.label }}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(order.datePlaced) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <Button
                    @click="viewOrderDetails(order._id)"
                    variant="ghost"
                    size="sm"
                    class="text-blue-600 hover:text-blue-700"
                  >
                    <Eye class="w-4 h-4" />
                  </Button>
                  <Button
                    @click="deleteOrder(order._id)"
                    variant="ghost"
                    size="sm"
                    class="text-red-600 hover:text-red-700"
                  >
                    <Trash class="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <Button
            @click="currentPage--"
            :disabled="currentPage === 1"
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <span class="text-sm text-gray-700">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <Button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div v-if="showOrderDetails && selectedOrder" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Order Details</h2>
            <Button @click="showOrderDetails = false; selectedOrder = null" variant="ghost" size="sm">
              <X class="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- Order Header -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <ShoppingBag class="w-5 h-5 text-gray-600" />
                <h3 class="font-medium text-gray-900">Order Info</h3>
              </div>
              <p class="text-sm text-gray-600">Order ID: {{ selectedOrder.metadata?.order_id || selectedOrder._id.slice(-8) }}</p>
              <p class="text-sm text-gray-600">Payment: {{ selectedOrder.paymentMethod }}</p>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <User class="w-5 h-5 text-gray-600" />
                <h3 class="font-medium text-gray-900">Customer</h3>
              </div>
              <p class="text-sm text-gray-600">{{ selectedOrder.user?.username }}</p>
              <p class="text-sm text-gray-600">{{ selectedOrder.user?.email }}</p>
              <p class="text-sm text-gray-600">{{ selectedOrder.user?.phone }}</p>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <Calendar class="w-5 h-5 text-gray-600" />
                <h3 class="font-medium text-gray-900">Order Date</h3>
              </div>
              <p class="text-sm text-gray-600">{{ formatDate(selectedOrder.datePlaced) }}</p>
              <div class="mt-2">
                <span :class="['px-2 py-1 text-xs rounded-full', getStatusInfo(selectedOrder.status).color]">
                  {{ selectedOrder.status }}
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
              <p>{{ selectedOrder.shippingAddress?.address }}</p>
              <p>{{ selectedOrder.shippingAddress?.city }}, {{ selectedOrder.shippingAddress?.postalCode }}</p>
              <p>{{ selectedOrder.shippingAddress?.country }}</p>
            </div>
          </div>

          <!-- Order Items -->
          <div>
            <h3 class="font-medium text-gray-900 mb-4">Order Items</h3>
            <div class="space-y-4">
              <div
                v-for="item in selectedOrder.orderItems"
                :key="item.product._id"
                class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                <div class="flex-shrink-0 h-16 w-16">
                  <img
                    class="h-16 w-16 rounded-lg object-cover"
                    :src="item.product.image"
                    :alt="item.product.name"
                  />
                </div>
                <div class="flex-1">
                  <div class="flex justify-between">
                    <div>
                      <h4 class="font-medium text-gray-900">{{ item.product.name }}</h4>
                      <p class="text-sm text-gray-600">{{ item.product.category }}</p>
                      <p class="text-sm text-gray-600">Quantity: {{ item.qty }}</p>
                    </div>
                    <div class="text-right">
                      <p class="font-medium text-gray-900">RM{{ item.product.price.toFixed(2) }}</p>
                      <p class="text-sm text-gray-600">Total: RM{{ (item.product.price * item.qty).toFixed(2) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Total -->
          <div class="border-t pt-4">
            <div class="flex justify-between items-center">
              <span class="text-lg font-medium text-gray-900">Order Total:</span>
              <span class="text-lg font-bold text-primary-color">
                RM{{ selectedOrder.orderItems.reduce((total, item) => total + (item.product.price * item.qty), 0).toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Status Update -->
          <div class="border-t pt-4">
            <h3 class="font-medium text-gray-900 mb-3">Update Status</h3>
            <div class="flex items-center space-x-4">
              <Select
                :model-value="selectedOrder.status"
                @update:model-value="(value) => updateOrderStatus(selectedOrder._id, value)"
              >
                <SelectTrigger class="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="status in orderStatuses" :key="status.value" :value="status.value">
                    <div class="flex items-center space-x-2">
                      <component :is="status.icon" class="w-4 h-4" />
                      <span>{{ status.label }}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>