<script setup lang="ts">
import {
  FileText,
  MessageSquare,
  Mail,
  Star,
  Plus,
  Edit,
  Trash,
} from "lucide-vue-next";

// Middleware to protect admin routes
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
});
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Content Management</h1>
        <p class="text-gray-600">Manage website content, testimonials, and communications</p>
      </div>
    </div>

    <!-- Content Management Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Testimonials Management -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center space-x-3 mb-4">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <Star class="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Testimonials</h3>
            <p class="text-sm text-gray-600">Manage customer reviews</p>
          </div>
        </div>
        <div class="space-y-3">
          <Button class="w-full justify-start" variant="outline">
            <Plus class="w-4 h-4 mr-2" />
            Add New Testimonial
          </Button>
          <Button class="w-full justify-start" variant="outline">
            <Edit class="w-4 h-4 mr-2" />
            Edit Testimonials
          </Button>
          <Button class="w-full justify-start" variant="outline">
            <MessageSquare class="w-4 h-4 mr-2" />
            Moderate Reviews
          </Button>
        </div>
      </div>

      <!-- FAQ Management -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center space-x-3 mb-4">
          <div class="p-2 bg-blue-100 rounded-lg">
            <MessageSquare class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">FAQ Management</h3>
            <p class="text-sm text-gray-600">Update frequently asked questions</p>
          </div>
        </div>
        <div class="space-y-3">
          <Button class="w-full justify-start" variant="outline">
            <Plus class="w-4 h-4 mr-2" />
            Add New FAQ
          </Button>
          <Button class="w-full justify-start" variant="outline">
            <Edit class="w-4 h-4 mr-2" />
            Edit FAQs
          </Button>
          <Button class="w-full justify-start" variant="outline">
            <Trash class="w-4 h-4 mr-2" />
            Remove FAQs
          </Button>
        </div>
      </div>

      <!-- Email Templates -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center space-x-3 mb-4">
          <div class="p-2 bg-green-100 rounded-lg">
            <Mail class="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Email Templates</h3>
            <p class="text-sm text-gray-600">Manage email communications</p>
          </div>
        </div>
        <div class="space-y-3">
          <Button class="w-full justify-start" variant="outline">
            <Edit class="w-4 h-4 mr-2" />
            Order Confirmations
          </Button>
          <Button class="w-full justify-start" variant="outline">
            <Edit class="w-4 h-4 mr-2" />
            Support Responses
          </Button>
          <Button class="w-full justify-start" variant="outline">
            <Edit class="w-4 h-4 mr-2" />
            Marketing Emails
          </Button>
        </div>
      </div>

      <!-- Page Content -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center space-x-3 mb-4">
          <div class="p-2 bg-purple-100 rounded-lg">
            <FileText class="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Page Content</h3>
            <p class="text-sm text-gray-600">Update website pages</p>
          </div>
        </div>
        <div class="space-y-3">
          <Button class="w-full justify-start" variant="outline">
            <Edit class="w-4 h-4 mr-2" />
            About Page
          </Button>
          <Button class="w-full justify-start" variant="outline">
            <Edit class="w-4 h-4 mr-2" />
            Terms & Conditions
          </Button>
          <Button class="w-full justify-start" variant="outline">
            <Edit class="w-4 h-4 mr-2" />
            Privacy Policy
          </Button>
        </div>
      </div>
    </div>

    <!-- Coming Soon Notice -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div class="flex items-center space-x-3">
        <div class="p-2 bg-blue-100 rounded-full">
          <FileText class="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 class="font-medium text-blue-900">Content Management Features</h3>
          <p class="text-blue-700">Advanced content management features are being developed. You can currently manage basic content through the existing interfaces.</p>
        </div>
      </div>
    </div>
  </div>
</template>