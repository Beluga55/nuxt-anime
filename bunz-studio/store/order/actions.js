import { getActivePinia } from "pinia";
const useApi = () => useNuxtApp().$api;

export default {
  async fetchOrderBySessionId(sessionId) {
    const [response, error] = await useApi().order.fetchOrderBySessionId(sessionId);
    if (error) return;

    return response;
  },
};
