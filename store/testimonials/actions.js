import { getActivePinia } from "pinia";
const useApi = () => useNuxtApp().$api;

export default {
  async getTestimonials(data) {
    const [testimonial, error] = await useApi().testimonials.getTestimonials(
      data
    );
    if (error) return;

    this.testimonials = testimonial;

    return testimonial;
  },
};
