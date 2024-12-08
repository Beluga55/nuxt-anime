import apiWrapper from "./api_wrapper";

export default () => {
  const axios = useAxios();
  const axiosClient = axios.createAxiosClient();

  return {
    createCheckoutSession: async (data) =>
      apiWrapper(async () => {
        const checkoutRes = await axiosClient
          .post("/api/create-checkout-session", data)
          .then((res) => res.data);
        return checkoutRes;
      }),
  };
};
