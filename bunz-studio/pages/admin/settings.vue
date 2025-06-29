<script setup lang="ts">
import {
  Settings,
  Database,
  Shield,
  Mail,
  CreditCard,
  Bell,
  Globe,
  Save,
} from "lucide-vue-next";

// Middleware to protect admin routes
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
});

// Reactive state for settings
const settings = ref({
  siteName: 'Anime Store',
  siteDescription: 'Your premier destination for anime merchandise',
  adminEmail: 'admin@animestore.com',
  allowRegistrations: true,
  emailNotifications: true,
  maintenanceMode: false,
  autoBackup: true,
  stripeTestMode: true,
  maxOrderItems: 10,
  sessionTimeout: 30,
});

const saveSettings = () => {
  useToast().toast({
    title: 'Settings Saved',
    description: 'Your settings have been updated successfully'
  });
};
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">System Settings</h1>
        <p class="text-gray-600">Configure system-wide settings and preferences</p>
      </div>
      <Button @click="saveSettings" class="flex items-center space-x-2">
        <Save class="w-4 h-4" />
        <span>Save All Settings</span>
      </Button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- General Settings -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center space-x-2">
            <Settings class="w-5 h-5 text-gray-600" />
            <h2 class="text-lg font-semibold text-gray-900">General Settings</h2>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <Label for="siteName">Site Name</Label>
            <Input id="siteName" v-model="settings.siteName" />
          </div>
          <div>
            <Label for="siteDescription">Site Description</Label>
            <textarea
              id="siteDescription"
              v-model="settings.siteDescription"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
            ></textarea>
          </div>
          <div>
            <Label for="adminEmail">Admin Email</Label>
            <Input id="adminEmail" v-model="settings.adminEmail" type="email" />
          </div>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center space-x-2">
            <Shield class="w-5 h-5 text-gray-600" />
            <h2 class="text-lg font-semibold text-gray-900">Security Settings</h2>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex items-center space-x-2">
            <Checkbox id="allowRegistrations" v-model:checked="settings.allowRegistrations" />
            <Label for="allowRegistrations">Allow new user registrations</Label>
          </div>
          <div class="flex items-center space-x-2">
            <Checkbox id="maintenanceMode" v-model:checked="settings.maintenanceMode" />
            <Label for="maintenanceMode">Maintenance mode</Label>
          </div>
          <div>
            <Label for="sessionTimeout">Session Timeout (minutes)</Label>
            <Input id="sessionTimeout" v-model="settings.sessionTimeout" type="number" min="5" max="1440" />
          </div>
        </div>
      </div>

      <!-- Email Settings -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center space-x-2">
            <Mail class="w-5 h-5 text-gray-600" />
            <h2 class="text-lg font-semibold text-gray-900">Email Settings</h2>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex items-center space-x-2">
            <Checkbox id="emailNotifications" v-model:checked="settings.emailNotifications" />
            <Label for="emailNotifications">Enable email notifications</Label>
          </div>
          <div class="space-y-2">
            <h3 class="text-sm font-medium text-gray-900">Email Templates</h3>
            <div class="space-y-2">
              <Button variant="outline" size="sm" class="w-full justify-start">
                Order Confirmation Template
              </Button>
              <Button variant="outline" size="sm" class="w-full justify-start">
                Support Response Template
              </Button>
              <Button variant="outline" size="sm" class="w-full justify-start">
                Password Reset Template
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Settings -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center space-x-2">
            <CreditCard class="w-5 h-5 text-gray-600" />
            <h2 class="text-lg font-semibold text-gray-900">Payment Settings</h2>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex items-center space-x-2">
            <Checkbox id="stripeTestMode" v-model:checked="settings.stripeTestMode" />
            <Label for="stripeTestMode">Stripe test mode</Label>
          </div>
          <div class="space-y-2">
            <h3 class="text-sm font-medium text-gray-900">Payment Methods</h3>
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox id="enableStripe" checked disabled />
                <Label for="enableStripe">Stripe (Credit Cards)</Label>
              </div>
              <div class="flex items-center space-x-2">
                <Checkbox id="enablePaypal" />
                <Label for="enablePaypal">PayPal</Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Settings -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center space-x-2">
            <Database class="w-5 h-5 text-gray-600" />
            <h2 class="text-lg font-semibold text-gray-900">System Settings</h2>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex items-center space-x-2">
            <Checkbox id="autoBackup" v-model:checked="settings.autoBackup" />
            <Label for="autoBackup">Enable automatic backups</Label>
          </div>
          <div>
            <Label for="maxOrderItems">Max items per order</Label>
            <Input id="maxOrderItems" v-model="settings.maxOrderItems" type="number" min="1" max="100" />
          </div>
          <div class="space-y-2">
            <h3 class="text-sm font-medium text-gray-900">System Actions</h3>
            <div class="space-y-2">
              <Button variant="outline" size="sm" class="w-full justify-start">
                <Database class="w-4 h-4 mr-2" />
                Backup Database
              </Button>
              <Button variant="outline" size="sm" class="w-full justify-start">
                <Bell class="w-4 h-4 mr-2" />
                Clear Cache
              </Button>
              <Button variant="outline" size="sm" class="w-full justify-start">
                <Globe class="w-4 h-4 mr-2" />
                Update System
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center space-x-2">
            <Bell class="w-5 h-5 text-gray-600" />
            <h2 class="text-lg font-semibold text-gray-900">Notification Settings</h2>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <Checkbox id="newOrderNotify" checked />
              <Label for="newOrderNotify">New order notifications</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox id="lowStockNotify" checked />
              <Label for="lowStockNotify">Low stock alerts</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox id="supportTicketNotify" checked />
              <Label for="supportTicketNotify">New support ticket notifications</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox id="systemNotify" />
              <Label for="systemNotify">System maintenance notifications</Label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Information Notice -->
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div class="flex items-center space-x-3">
        <div class="p-2 bg-yellow-100 rounded-full">
          <Settings class="w-5 h-5 text-yellow-600" />
        </div>
        <div>
          <h3 class="font-medium text-yellow-900">Settings Configuration</h3>
          <p class="text-yellow-700">Some settings may require server restart to take effect. Critical changes will be highlighted during implementation.</p>
        </div>
      </div>
    </div>
  </div>
</template>