<script setup lang="ts">
import {
  Plus,
  Search,
  Edit,
  Trash,
  Package,
  AlertTriangle,
  Filter,
  X,
  Save,
  Upload,
} from "lucide-vue-next";

// Middleware to protect admin routes
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
});

// Reactive state
const products = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedCategory = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const productToEdit = ref(null);

// Form data for create/edit
const productForm = ref({
  name: '',
  description: '',
  width: '',
  height: '',
  material: '',
  price: '',
  image: '',
  category: '',
  stock: '',
});

// Available categories
const categories = [
  'Anime Figures',
  'Manga',
  'Cosplay',
  'Accessories',
  'Collectibles',
  'Clothing',
  'Electronics',
  'Art & Prints'
];

// Reset form
const resetForm = () => {
  productForm.value = {
    name: '',
    description: '',
    width: '',
    height: '',
    material: '',
    price: '',
    image: '',
    category: '',
    stock: '',
  };
};

// Fetch products
const fetchProducts = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: '10',
      ...(searchQuery.value && { search: searchQuery.value }),
      ...(selectedCategory.value && selectedCategory.value !== 'all' && { category: selectedCategory.value }),
    });

    const response = await $fetch(`http://localhost:8080/admin/products?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    products.value = response.data;
    totalPages.value = response.meta.totalPages;
  } catch (error) {
    console.error('Error fetching products:', error);
    useToast().toast({
      title: 'Error',
      description: 'Failed to fetch products',
      variant: 'destructive'
    });
  } finally {
    loading.value = false;
  }
};

// Create product
const createProduct = async () => {
  try {
    const token = localStorage.getItem('token');
    await $fetch('http://localhost:8080/admin/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: productForm.value
    });

    useToast().toast({
      title: 'Success',
      description: 'Product created successfully'
    });

    showCreateModal.value = false;
    resetForm();
    await fetchProducts();
  } catch (error) {
    console.error('Error creating product:', error);
    useToast().toast({
      title: 'Error',
      description: 'Failed to create product',
      variant: 'destructive'
    });
  }
};

// Edit product
const editProduct = (product: any) => {
  productToEdit.value = product;
  productForm.value = {
    name: product.name,
    description: product.description,
    width: product.width,
    height: product.height,
    material: product.material,
    price: product.price.toString(),
    image: product.image,
    category: product.category,
    stock: product.stock.toString(),
  };
  showEditModal.value = true;
};

// Update product
const updateProduct = async () => {
  try {
    const token = localStorage.getItem('token');
    await $fetch(`http://localhost:8080/admin/products/${productToEdit.value._id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: productForm.value
    });

    useToast().toast({
      title: 'Success',
      description: 'Product updated successfully'
    });

    showEditModal.value = false;
    resetForm();
    productToEdit.value = null;
    await fetchProducts();
  } catch (error) {
    console.error('Error updating product:', error);
    useToast().toast({
      title: 'Error',
      description: 'Failed to update product',
      variant: 'destructive'
    });
  }
};

// Delete product
const deleteProduct = async (productId: string) => {
  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    await $fetch(`http://localhost:8080/admin/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    useToast().toast({
      title: 'Success',
      description: 'Product deleted successfully'
    });

    await fetchProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
    useToast().toast({
      title: 'Error',
      description: 'Failed to delete product',
      variant: 'destructive'
    });
  }
};

// Watch for search/filter changes
watch([searchQuery, selectedCategory], () => {
  currentPage.value = 1;
  fetchProducts();
}, { debounce: 500 });

// Watch for page changes
watch(currentPage, () => {
  fetchProducts();
});

// Load products on mount
onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Product Management</h1>
        <p class="text-gray-600">Manage your anime product inventory</p>
      </div>
      <Button @click="showCreateModal = true" class="flex items-center space-x-2">
        <Plus class="w-4 h-4" />
        <span>Add Product</span>
      </Button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1 relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            v-model="searchQuery"
            placeholder="Search products..."
            class="pl-10"
          />
        </div>

        <!-- Category Filter -->
        <div class="sm:w-48">
          <Select v-model="selectedCategory">
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Clear Filters -->
        <Button
          v-if="searchQuery || (selectedCategory && selectedCategory !== 'all')"
          @click="searchQuery = ''; selectedCategory = 'all'"
          variant="outline"
        >
          <X class="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>

    <!-- Products Table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-color mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading products...</p>
      </div>

      <div v-else-if="products.length === 0" class="p-8 text-center">
        <Package class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600">No products found</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in products" :key="product._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img
                      class="h-10 w-10 rounded-lg object-cover"
                      :src="product.imageUrl"
                      :alt="product.name"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ product.name }}
                    </div>
                    <div class="text-sm text-gray-500 max-w-xs truncate">
                      {{ product.description }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ product.category }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                RM{{ product.price.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span
                    :class="[
                      'text-sm font-medium',
                      product.stock <= 10 ? 'text-red-600' : 'text-gray-900'
                    ]"
                  >
                    {{ product.stock }}
                  </span>
                  <AlertTriangle
                    v-if="product.stock <= 10"
                    class="w-4 h-4 text-red-500 ml-1"
                  />
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ product.rating.toFixed(1) }} ({{ product.numReviews }})
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <Button
                    @click="editProduct(product)"
                    variant="ghost"
                    size="sm"
                    class="text-blue-600 hover:text-blue-700"
                  >
                    <Edit class="w-4 h-4" />
                  </Button>
                  <Button
                    @click="deleteProduct(product._id)"
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

    <!-- Create Product Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Create New Product</h2>
            <Button @click="showCreateModal = false; resetForm()" variant="ghost" size="sm">
              <X class="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <form @submit.prevent="createProduct" class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label for="name">Product Name</Label>
              <Input id="name" v-model="productForm.name" required />
            </div>
            <div>
              <Label for="category">Category</Label>
              <Select v-model="productForm.category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label for="description">Description</Label>
            <textarea
              id="description"
              v-model="productForm.description"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
              required
            ></textarea>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label for="width">Width</Label>
              <Input id="width" v-model="productForm.width" required />
            </div>
            <div>
              <Label for="height">Height</Label>
              <Input id="height" v-model="productForm.height" required />
            </div>
            <div>
              <Label for="price">Price (RM)</Label>
              <Input id="price" v-model="productForm.price" type="number" step="0.01" required />
            </div>
            <div>
              <Label for="stock">Stock</Label>
              <Input id="stock" v-model="productForm.stock" type="number" required />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label for="material">Material</Label>
              <Input id="material" v-model="productForm.material" required />
            </div>
            <div>
              <Label for="image">Image Path</Label>
              <Input id="image" v-model="productForm.image" required />
            </div>
          </div>

          <div class="flex justify-end space-x-2 pt-4">
            <Button type="button" @click="showCreateModal = false; resetForm()" variant="outline">
              Cancel
            </Button>
            <Button type="submit" class="flex items-center space-x-2">
              <Save class="w-4 h-4" />
              <span>Create Product</span>
            </Button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Product Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Edit Product</h2>
            <Button @click="showEditModal = false; resetForm(); productToEdit = null" variant="ghost" size="sm">
              <X class="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <form @submit.prevent="updateProduct" class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label for="edit-name">Product Name</Label>
              <Input id="edit-name" v-model="productForm.name" required />
            </div>
            <div>
              <Label for="edit-category">Category</Label>
              <Select v-model="productForm.category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label for="edit-description">Description</Label>
            <textarea
              id="edit-description"
              v-model="productForm.description"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
              required
            ></textarea>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label for="edit-width">Width</Label>
              <Input id="edit-width" v-model="productForm.width" required />
            </div>
            <div>
              <Label for="edit-height">Height</Label>
              <Input id="edit-height" v-model="productForm.height" required />
            </div>
            <div>
              <Label for="edit-price">Price (RM)</Label>
              <Input id="edit-price" v-model="productForm.price" type="number" step="0.01" required />
            </div>
            <div>
              <Label for="edit-stock">Stock</Label>
              <Input id="edit-stock" v-model="productForm.stock" type="number" required />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label for="edit-material">Material</Label>
              <Input id="edit-material" v-model="productForm.material" required />
            </div>
            <div>
              <Label for="edit-image">Image Path</Label>
              <Input id="edit-image" v-model="productForm.image" required />
            </div>
          </div>

          <div class="flex justify-end space-x-2 pt-4">
            <Button type="button" @click="showEditModal = false; resetForm(); productToEdit = null" variant="outline">
              Cancel
            </Button>
            <Button type="submit" class="flex items-center space-x-2">
              <Save class="w-4 h-4" />
              <span>Update Product</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>