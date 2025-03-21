import apiWrapper from "./api_wrapper";

export default () => {
  const axios = useAxios();
  const axiosClient = axios.createAxiosClient();

  return {
    getTestimonials: async () =>
      apiWrapper(async () => {
        const testimonialRes = await axiosClient
          .get("/testimonials")
          .then((res) => res.data);
        return testimonialRes;
      }),
      
    getProductReviews: async ({ productId, page = 1, limit = 3 }) =>
      apiWrapper(async () => {
        const reviews = await axiosClient
          .get(`/testimonials/product/${productId}`, {
            params: { page, limit }
          })
          .then((res) => res.data);
        return reviews;
      }),
  };
};
