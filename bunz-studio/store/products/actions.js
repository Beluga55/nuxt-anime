import { getActivePinia } from "pinia";
const useApi = () => useNuxtApp().$api;

export default {
  async showProduct(data) {
    const [product, error] = await useApi().products.showProduct(data);
    if (error) return;

    return product;
  },
  async getProducts(data) {
    const [products, error] = await useApi().products.getProducts(data);
    if (error) return;

    this.products = products;

    return products;
  },
  async fetchAdminProducts(params = {}) {
    try {
      this.adminProductsLoading = true;
      this.adminProductsError = null;

      const [response, error] = await useApi().products.getAdminProducts(params);
      
      if (error) {
        this.adminProductsError = error;
        return { data: [], meta: {} };
      }

      this.adminProducts = response.data;
      this.adminProductsMeta = response.meta;

      return response;
    } catch (error) {
      this.adminProductsError = error.message || 'Failed to fetch admin products';
      return { data: [], meta: {} };
    } finally {
      this.adminProductsLoading = false;
    }
  },
};
