import { getActivePinia } from "pinia";
const useApi = () => useNuxtApp().$api;

export default {
  async fetchOrderBySessionId(sessionId) {
    const [response, error] = await useApi().order.fetchOrderBySessionId(sessionId);
    if (error) return;

    return response;
  },

  async fetchUserOrders(email, params = {}) {
    this.loading = true;
    this.error = null;
    
    try {
      const [response, error] = await useApi().order.fetchOrdersByUserEmail(email, params);
      
      if (error) {
        this.error = error.message || 'Failed to fetch orders';
        this.loading = false;
        return { error: this.error };
      }

      this.userOrders = response.orders || [];
      this.ordersPagination = response.pagination || null;
      this.ordersStats = response.stats || null;
      this.loading = false;
      
      return response;
    } catch (err) {
      this.error = err.message || 'An unexpected error occurred';
      this.loading = false;
      return { error: this.error };
    }
  },

  clearUserOrders() {
    this.userOrders = [];
    this.ordersPagination = null;
    this.ordersStats = null;
    this.error = null;
  },

  async fetchOrders(params = {}) {
    const [response, error] = await useApi().order.fetchOrders(params);
    if (error) return;

    return response;
  },
  async viewOrderDetails(orderId) {
    const [response, error] = await useApi().order.viewOrderDetails(orderId);
    if (error) return;

    return response;
  },
};
