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
  };
};
