import { getActivePinia } from "pinia";
const useApi = () => useNuxtApp().$api;

export default {
  async getTestimonials() {
    const [response, error] = await useApi().testimonials.getTestimonials();
    if (error) return;

    this.testimonials = response.reviews;
    return response;
  },
};
