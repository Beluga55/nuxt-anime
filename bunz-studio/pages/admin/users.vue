<script setup lang="ts">
import {
  Search,
  Filter,
  X,
  Eye,
  Edit,
  Trash,
  Users,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  Globe,
  Lock,
} from "lucide-vue-next";

// Middleware to protect admin routes
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
});

// Reactive state
const users = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedStatus = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const showUserDetails = ref(false);
const showEditModal = ref(false);
const selectedUser = ref(null);
const userToEdit = ref(null);

// User form for editing
const userForm = ref({
  username: '',
  email: '',
  phone: '',
  country: '',
  isAdmin: false,
  isActive: true,
  emailVerified: false,
});

// Status options
const statusOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

// Reset form
const resetForm = () => {
  userForm.value = {
    username: '',
    email: '',
    phone: '',
    country: '',
    isAdmin: false,
    isActive: true,
    emailVerified: false,
  };
};

// Fetch users
const fetchUsers = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: '10',
      ...(searchQuery.value && { search: searchQuery.value }),
      ...(selectedStatus.value && selectedStatus.value !== 'all' && { isActive: selectedStatus.value }),
    });

    const response = await $fetch(`http://localhost:8080/admin/users?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    users.value = response.data;
    totalPages.value = response.meta.totalPages;
  } catch (error) {
    console.error('Error fetching users:', error);
    useToast().toast({
      title: 'Error',
      description: 'Failed to fetch users',
      variant: 'destructive'
    });
  } finally {
    loading.value = false;
  }
};

// View user details
const viewUserDetails = async (userId: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await $fetch(`http://localhost:8080/admin/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    selectedUser.value = response;
    showUserDetails.value = true;
  } catch (error) {
    console.error('Error fetching user details:', error);
    useToast().toast({
      title: 'Error',
      description: 'Failed to fetch user details',
      variant: 'destructive'
    });
  }
};

// Edit user
const editUser = (user: any) => {
  userToEdit.value = user;
  userForm.value = {
    username: user.username,
    email: user.email,
    phone: user.phone || '',
    country: user.country || '',
    isAdmin: user.isAdmin,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
  };
  showEditModal.value = true;
};

// Update user
const updateUser = async () => {
  try {
    const token = localStorage.getItem('token');
    await $fetch(`http://localhost:8080/admin/users/${userToEdit.value._id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: userForm.value
    });

    useToast().toast({
      title: 'Success',
      description: 'User updated successfully'
    });

    showEditModal.value = false;
    resetForm();
    userToEdit.value = null;
    await fetchUsers();
  } catch (error) {
    console.error('Error updating user:', error);
    useToast().toast({
      title: 'Error',
      description: 'Failed to update user',
      variant: 'destructive'
    });
  }
};

// Toggle user status
const toggleUserStatus = async (userId: string, isActive: boolean) => {
  try {
    const token = localStorage.getItem('token');
    await $fetch(`http://localhost:8080/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: { isActive }
    });

    useToast().toast({
      title: 'Success',
      description: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });

    await fetchUsers();
  } catch (error) {
    console.error('Error updating user status:', error);
    useToast().toast({
      title: 'Error',
      description: 'Failed to update user status',
      variant: 'destructive'
    });
  }
};

// Delete user
const deleteUser = async (userId: string) => {
  if (!confirm('Are you sure you want to deactivate this user?')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    await $fetch(`http://localhost:8080/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    useToast().toast({
      title: 'Success',
      description: 'User deactivated successfully'
    });

    await fetchUsers();
  } catch (error) {
    console.error('Error deleting user:', error);
    useToast().toast({
      title: 'Error',
      description: 'Failed to deactivate user',
      variant: 'destructive'
    });
  }
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Watch for search/filter changes
watch([searchQuery, selectedStatus], () => {
  currentPage.value = 1;
  fetchUsers();
}, { debounce: 500 });

// Watch for page changes
watch(currentPage, () => {
  fetchUsers();
});

// Load users on mount
onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
        <p class="text-gray-600">Manage user accounts and monitor activity</p>
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
            placeholder="Search by name, email, or phone..."
            class="pl-10"
          />
        </div>

        <!-- Status Filter -->
        <div class="sm:w-48">
          <Select v-model="selectedStatus">
            <SelectTrigger>
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem v-for="status in statusOptions" :key="status.value" :value="status.value">
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

    <!-- Users Table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-color mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading users...</p>
      </div>

      <div v-else-if="users.length === 0" class="p-8 text-center">
        <Users class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600">No users found</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spent
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img
                      v-if="user.image"
                      class="h-10 w-10 rounded-full object-cover"
                      :src="user.image"
                      :alt="user.username"
                    />
                    <div v-else class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User class="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="flex items-center space-x-2">
                      <div class="text-sm font-medium text-gray-900">
                        {{ user.username }}
                      </div>
                      <Shield v-if="user.isAdmin" class="w-4 h-4 text-red-500" title="Admin" />
                      <Globe v-if="user.isGoogle" class="w-4 h-4 text-blue-500" title="Google Account" />
                      <Lock v-if="user.twoFactorEnabled" class="w-4 h-4 text-green-500" title="2FA Enabled" />
                    </div>
                    <div class="text-sm text-gray-500">
                      ID: {{ user._id.slice(-8) }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ user.email }}</div>
                <div class="text-sm text-gray-500">{{ user.phone || 'No phone' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-1">
                  <span
                    :class="[
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                  <div class="flex items-center space-x-1">
                    <CheckCircle v-if="user.emailVerified" class="w-3 h-3 text-green-500" />
                    <XCircle v-else class="w-3 h-3 text-red-500" />
                    <span class="text-xs text-gray-500">
                      {{ user.emailVerified ? 'Verified' : 'Unverified' }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.totalOrders || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                RM{{ (user.totalSpent || 0).toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <Button
                    @click="viewUserDetails(user._id)"
                    variant="ghost"
                    size="sm"
                    class="text-blue-600 hover:text-blue-700"
                  >
                    <Eye class="w-4 h-4" />
                  </Button>
                  <Button
                    @click="editUser(user)"
                    variant="ghost"
                    size="sm"
                    class="text-green-600 hover:text-green-700"
                  >
                    <Edit class="w-4 h-4" />
                  </Button>
                  <Button
                    @click="toggleUserStatus(user._id, !user.isActive)"
                    variant="ghost"
                    size="sm"
                    :class="user.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'"
                  >
                    {{ user.isActive ? 'Deactivate' : 'Activate' }}
                  </Button>
                  <Button
                    @click="deleteUser(user._id)"
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

    <!-- User Details Modal -->
    <div v-if="showUserDetails && selectedUser" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">User Details</h2>
            <Button @click="showUserDetails = false; selectedUser = null" variant="ghost" size="sm">
              <X class="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- User Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-3 mb-4">
                <div class="flex-shrink-0 h-12 w-12">
                  <img
                    v-if="selectedUser.user.image"
                    class="h-12 w-12 rounded-full object-cover"
                    :src="selectedUser.user.image"
                    :alt="selectedUser.user.username"
                  />
                  <div v-else class="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User class="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">{{ selectedUser.user.username }}</h3>
                  <div class="flex items-center space-x-2 mt-1">
                    <Shield v-if="selectedUser.user.isAdmin" class="w-4 h-4 text-red-500" />
                    <Globe v-if="selectedUser.user.isGoogle" class="w-4 h-4 text-blue-500" />
                    <Lock v-if="selectedUser.user.twoFactorEnabled" class="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </div>
              
              <div class="space-y-2 text-sm">
                <div class="flex items-center space-x-2">
                  <Mail class="w-4 h-4 text-gray-400" />
                  <span>{{ selectedUser.user.email }}</span>
                  <CheckCircle v-if="selectedUser.user.emailVerified" class="w-4 h-4 text-green-500" />
                </div>
                <div v-if="selectedUser.user.phone" class="flex items-center space-x-2">
                  <Phone class="w-4 h-4 text-gray-400" />
                  <span>{{ selectedUser.user.phone }}</span>
                </div>
                <div v-if="selectedUser.user.country" class="flex items-center space-x-2">
                  <MapPin class="w-4 h-4 text-gray-400" />
                  <span>{{ selectedUser.user.country }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <Calendar class="w-4 h-4 text-gray-400" />
                  <span>Joined {{ formatDate(selectedUser.user.createdAt) }}</span>
                </div>
              </div>
            </div>

            <!-- User Stats -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-medium text-gray-900 mb-4">Statistics</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center">
                  <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mx-auto mb-2">
                    <ShoppingBag class="w-5 h-5 text-blue-600" />
                  </div>
                  <div class="text-2xl font-bold text-gray-900">{{ selectedUser.stats.totalOrders }}</div>
                  <div class="text-sm text-gray-600">Total Orders</div>
                </div>
                <div class="text-center">
                  <div class="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mx-auto mb-2">
                    <DollarSign class="w-5 h-5 text-green-600" />
                  </div>
                  <div class="text-2xl font-bold text-gray-900">RM{{ selectedUser.stats.totalSpent.toFixed(2) }}</div>
                  <div class="text-sm text-gray-600">Total Spent</div>
                </div>
              </div>
              <div class="mt-4 pt-4 border-t border-gray-200">
                <div class="text-center">
                  <div class="text-lg font-semibold text-gray-900">
                    RM{{ selectedUser.stats.averageOrderValue.toFixed(2) }}
                  </div>
                  <div class="text-sm text-gray-600">Average Order Value</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Orders -->
          <div>
            <h3 class="font-medium text-gray-900 mb-4">Recent Orders</h3>
            <div v-if="selectedUser.orders.length === 0" class="text-center py-8">
              <ShoppingBag class="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p class="text-gray-600">No orders found</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="order in selectedUser.orders"
                :key="order._id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div class="font-medium text-gray-900">
                    Order #{{ order.metadata?.order_id || order._id.slice(-8) }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ order.orderItems.length }} items • {{ formatDate(order.datePlaced) }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-medium text-gray-900">
                    RM{{ order.orderItems.reduce((total, item) => total + (item.product.price * item.qty), 0).toFixed(2) }}
                  </div>
                  <span
                    :class="[
                      'px-2 py-1 text-xs rounded-full',
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ order.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Edit User</h2>
            <Button @click="showEditModal = false; resetForm(); userToEdit = null" variant="ghost" size="sm">
              <X class="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <form @submit.prevent="updateUser" class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label for="username">Username</Label>
              <Input id="username" v-model="userForm.username" required />
            </div>
            <div>
              <Label for="email">Email</Label>
              <Input id="email" v-model="userForm.email" type="email" required />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label for="phone">Phone</Label>
              <Input id="phone" v-model="userForm.phone" />
            </div>
            <div>
              <Label for="country">Country</Label>
              <Input id="country" v-model="userForm.country" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex items-center space-x-2">
              <Checkbox id="isAdmin" v-model:checked="userForm.isAdmin" />
              <Label for="isAdmin" class="text-sm">Admin privileges</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox id="isActive" v-model:checked="userForm.isActive" />
              <Label for="isActive" class="text-sm">Active account</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox id="emailVerified" v-model:checked="userForm.emailVerified" />
              <Label for="emailVerified" class="text-sm">Email verified</Label>
            </div>
          </div>

          <div class="flex justify-end space-x-2 pt-4">
            <Button type="button" @click="showEditModal = false; resetForm(); userToEdit = null" variant="outline">
              Cancel
            </Button>
            <Button type="submit">
              Update User
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>