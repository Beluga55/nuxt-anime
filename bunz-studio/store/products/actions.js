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
};
