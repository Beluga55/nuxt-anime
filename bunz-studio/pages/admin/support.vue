<script setup lang="ts">
import {
  Search,
  Filter,
  X,
  Eye,
  Trash,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Calendar,
  MessageCircle,
  Send,
} from "lucide-vue-next";

// Middleware to protect admin routes
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
});

// Reactive state
const tickets = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedStatus = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const showTicketDetails = ref(false);
const selectedTicket = ref(null);
const showResponseModal = ref(false);
const responseText = ref('');

// Ticket statuses
const ticketStatuses = [
  { value: 'open', label: 'Open', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: X },
];

// Get status info
const getStatusInfo = (status: string) => {
  return ticketStatuses.find(s => s.value === status) || ticketStatuses[0];
};

// Fetch tickets
const fetchTickets = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: '10',
      ...(searchQuery.value && { search: searchQuery.value }),
      ...(selectedStatus.value && selectedStatus.value !== 'all' && { status: selectedStatus.value }),
    });

    const response = await $fetch(`http://localhost:8080/admin/support?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    tickets.value = response.data;
    totalPages.value = response.meta.totalPages;
  } catch (error) {
    console.error('Error fetching tickets:', error);
    useToast().toast({
      title: 'Error',
      description: 'Failed to fetch support tickets',
      variant: 'destructive'
    });
  } finally {
    loading.value = false;
  }
};

// View ticket details
const viewTicketDetails = async (ticketId: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await $fetch(`http://localhost:8080/admin/support/${ticketId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    selectedTicket.value = response;
    showTicketDetails.value = true;
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    useToast().toast({
      title: 'Error',
      description: 'Failed to fetch ticket details',
      variant: 'destructive'
    });
  }
};

// Update ticket status
const updateTicketStatus = async (ticketId: string, newStatus: string) => {
  try {
    const token = localStorage.getItem('token');
    await $fetch(`http://localhost:8080/admin/support/${ticketId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: { status: newStatus }
    });

    useToast().toast({
      title: 'Success',
      description: 'Ticket status updated successfully'
    });

    await fetchTickets();
    
    // Update selected ticket if details modal is open
    if (selectedTicket.value && selectedTicket.value._id === ticketId) {
      selectedTicket.value.status = newStatus;
    }
  } catch (error) {
    console.error('Error updating ticket status:', error);
    useToast().toast({
      title: 'Error',
      description: 'Failed to update ticket status',
      variant: 'destructive'
    });
  }
};

// Add response to ticket
const addTicketResponse = async () => {
  if (!responseText.value.trim()) {
    useToast().toast({
      title: 'Error',
      description: 'Response cannot be empty',
      variant: 'destructive'
    });
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    const response = await $fetch(`http://localhost:8080/admin/support/${selectedTicket.value._id}/response`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: { 
        response: responseText.value,
        adminName: userInfo.name || userInfo.email || 'Admin'
      }
    });

    selectedTicket.value = response;
    responseText.value = '';
    showResponseModal.value = false;

    useToast().toast({
      title: 'Success',
      description: 'Response added successfully'
    });

    await fetchTickets();
  } catch (error) {
    console.error('Error adding response:', error);
    useToast().toast({
      title: 'Error',
      description: 'Failed to add response',
      variant: 'destructive'
    });
  }
};

// Delete ticket
const deleteTicket = async (ticketId: string) => {
  if (!confirm('Are you sure you want to delete this support ticket?')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    await $fetch(`http://localhost:8080/admin/support/${ticketId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    useToast().toast({
      title: 'Success',
      description: 'Support ticket deleted successfully'
    });

    await fetchTickets();
    
    // Close details modal if this ticket was selected
    if (selectedTicket.value && selectedTicket.value._id === ticketId) {
      showTicketDetails.value = false;
      selectedTicket.value = null;
    }
  } catch (error) {
    console.error('Error deleting ticket:', error);
    useToast().toast({
      title: 'Error',
      description: 'Failed to delete support ticket',
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

// Get priority based on how long ticket has been open
const getTicketPriority = (dateCreated: string, status: string) => {
  if (status === 'resolved' || status === 'closed') return 'normal';
  
  const created = new Date(dateCreated);
  const now = new Date();
  const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  
  if (hoursDiff > 48) return 'high';
  if (hoursDiff > 24) return 'medium';
  return 'normal';
};

// Watch for search/filter changes
watch([searchQuery, selectedStatus], () => {
  currentPage.value = 1;
  fetchTickets();
}, { debounce: 500 });

// Watch for page changes
watch(currentPage, () => {
  fetchTickets();
});

// Load tickets on mount
onMounted(() => {
  fetchTickets();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <p class="text-gray-600">Manage customer support requests and inquiries</p>
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
            placeholder="Search by name, email, subject, or message..."
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
              <SelectItem v-for="status in ticketStatuses" :key="status.value" :value="status.value">
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

    <!-- Tickets Table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-color mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading support tickets...</p>
      </div>

      <div v-else-if="tickets.length === 0" class="p-8 text-center">
        <MessageSquare class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600">No support tickets found</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ticket
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="ticket in tickets" :key="ticket._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  #{{ ticket._id.slice(-8) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ ticket.username }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ ticket.email }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 max-w-xs truncate">
                  {{ ticket.subject }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Select
                  :model-value="ticket.status"
                  @update:model-value="(value) => updateTicketStatus(ticket._id, value)"
                >
                  <SelectTrigger class="w-auto">
                    <SelectValue>
                      <span :class="['px-2 py-1 text-xs rounded-full', getStatusInfo(ticket.status).color]">
                        {{ getStatusInfo(ticket.status).label }}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="status in ticketStatuses" :key="status.value" :value="status.value">
                      <div class="flex items-center space-x-2">
                        <component :is="status.icon" class="w-4 h-4" />
                        <span>{{ status.label }}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    getTicketPriority(ticket.dateCreated, ticket.status) === 'high' ? 'bg-red-100 text-red-800' :
                    getTicketPriority(ticket.dateCreated, ticket.status) === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  ]"
                >
                  {{ getTicketPriority(ticket.dateCreated, ticket.status).charAt(0).toUpperCase() + getTicketPriority(ticket.dateCreated, ticket.status).slice(1) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(ticket.dateCreated) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <Button
                    @click="viewTicketDetails(ticket._id)"
                    variant="ghost"
                    size="sm"
                    class="text-blue-600 hover:text-blue-700"
                  >
                    <Eye class="w-4 h-4" />
                  </Button>
                  <Button
                    @click="deleteTicket(ticket._id)"
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

    <!-- Ticket Details Modal -->
    <div v-if="showTicketDetails && selectedTicket" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Support Ticket Details</h2>
            <Button @click="showTicketDetails = false; selectedTicket = null" variant="ghost" size="sm">
              <X class="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- Ticket Header -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <MessageSquare class="w-5 h-5 text-gray-600" />
                <h3 class="font-medium text-gray-900">Ticket Info</h3>
              </div>
              <p class="text-sm text-gray-600">Ticket ID: #{{ selectedTicket._id.slice(-8) }}</p>
              <div class="mt-2">
                <span :class="['px-2 py-1 text-xs rounded-full', getStatusInfo(selectedTicket.status).color]">
                  {{ getStatusInfo(selectedTicket.status).label }}
                </span>
              </div>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <User class="w-5 h-5 text-gray-600" />
                <h3 class="font-medium text-gray-900">Customer</h3>
              </div>
              <p class="text-sm text-gray-600">{{ selectedTicket.username }}</p>
              <p class="text-sm text-gray-600">{{ selectedTicket.email }}</p>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <Calendar class="w-5 h-5 text-gray-600" />
                <h3 class="font-medium text-gray-900">Created</h3>
              </div>
              <p class="text-sm text-gray-600">{{ formatDate(selectedTicket.dateCreated) }}</p>
              <div class="mt-2">
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    getTicketPriority(selectedTicket.dateCreated, selectedTicket.status) === 'high' ? 'bg-red-100 text-red-800' :
                    getTicketPriority(selectedTicket.dateCreated, selectedTicket.status) === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  ]"
                >
                  {{ getTicketPriority(selectedTicket.dateCreated, selectedTicket.status).charAt(0).toUpperCase() + getTicketPriority(selectedTicket.dateCreated, selectedTicket.status).slice(1) }} Priority
                </span>
              </div>
            </div>
          </div>

          <!-- Subject -->
          <div>
            <h3 class="font-medium text-gray-900 mb-2">Subject</h3>
            <p class="text-gray-700 bg-gray-50 rounded-lg p-3">{{ selectedTicket.subject }}</p>
          </div>

          <!-- Message -->
          <div>
            <h3 class="font-medium text-gray-900 mb-2">Message</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-gray-700 whitespace-pre-wrap">{{ selectedTicket.message }}</p>
            </div>
          </div>

          <!-- Admin Response -->
          <div v-if="selectedTicket.adminResponse">
            <h3 class="font-medium text-gray-900 mb-2">Admin Response</h3>
            <div class="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-blue-900">{{ selectedTicket.adminName || 'Admin' }}</span>
                <span class="text-sm text-blue-600">{{ formatDate(selectedTicket.responseDate) }}</span>
              </div>
              <p class="text-blue-800 whitespace-pre-wrap">{{ selectedTicket.adminResponse }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="border-t pt-4">
            <div class="flex items-center space-x-4">
              <!-- Add Response -->
              <Button
                @click="showResponseModal = true"
                class="flex items-center space-x-2"
              >
                <MessageCircle class="w-4 h-4" />
                <span>Add Response</span>
              </Button>

              <!-- Update Status -->
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-600">Status:</span>
                <Select
                  :model-value="selectedTicket.status"
                  @update:model-value="(value) => updateTicketStatus(selectedTicket._id, value)"
                >
                  <SelectTrigger class="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="status in ticketStatuses" :key="status.value" :value="status.value">
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

    <!-- Response Modal -->
    <div v-if="showResponseModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-2xl">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Add Response</h2>
            <Button @click="showResponseModal = false; responseText = ''" variant="ghost" size="sm">
              <X class="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div class="p-6">
          <div class="space-y-4">
            <div>
              <Label for="response">Response Message</Label>
              <textarea
                id="response"
                v-model="responseText"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="6"
                placeholder="Enter your response to the customer..."
                required
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-2">
              <Button @click="showResponseModal = false; responseText = ''" variant="outline">
                Cancel
              </Button>
              <Button @click="addTicketResponse" class="flex items-center space-x-2">
                <Send class="w-4 h-4" />
                <span>Send Response</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>