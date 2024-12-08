import { getActivePinia } from "pinia";
const useApi = () => useNuxtApp().$api;

export default {
  async createCheckoutSession(data) {
    const [response, error] = await useApi().stripe.createCheckoutSession(data);
    if (error) return;

    return response;
  },
};
