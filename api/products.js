import apiWrapper from "./api_wrapper";

export default () => {
  const axios = useAxios();
  const axiosClient = axios.createAxiosClient();

  return {
    getProducts: async () =>
      apiWrapper(async () => {
        const productRes = await axiosClient
          .get("/products") // Ensure this matches your backend route
          .then((res) => res.data);
        return productRes;
      }),
    showProduct: async (id) =>
      apiWrapper(async () => {
        const productRes = await axiosClient
          .get(`/products/${id}`)
          .then((res) => res.data);
        return productRes;
      }),
  };
};
