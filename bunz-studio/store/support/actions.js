import { getActivePinia } from "pinia";
const useApi = () => useNuxtApp().$api;

export default {
  async sendSupportMessage(data) {
    const [support, error] = await useApi().support.sendSupportMessage(data);
    if (error) return;

    return support;
  },
};
