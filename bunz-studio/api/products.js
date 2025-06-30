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
    getAdminProducts: async (params = {}) =>
      apiWrapper(async () => {
        const queryString = new URLSearchParams(params).toString();
        const url = `/admin/products${queryString ? `?${queryString}` : ''}`;
        
        const productRes = await axiosClient
          .get(url)
          .then((res) => res.data);
        return productRes;
      }),
    updateProduct: async (id, productData) =>
      apiWrapper(async () => {
        const productRes = await axiosClient
          .put(`/admin/products/${id}`, productData)
          .then((res) => res.data);
        return productRes;
      }),
  };
};
