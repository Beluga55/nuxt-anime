import apiWrapper from "./api_wrapper";

export default () => {
  const axios = useAxios();
  const axiosClient = axios.createAxiosClient();

  return {
    fetchOrderBySessionId: async (sessionId) =>
      apiWrapper(async () => {
        const orderRes = await axiosClient
          .get(`/api/orders/session/${sessionId}`)
          .then((res) => res.data);
        return orderRes;
      }),
    
    fetchOrdersByUserEmail: async (email, params = {}) =>
      apiWrapper(async () => {
        const queryParams = new URLSearchParams(params).toString();
        const url = `/api/orders/user/${encodeURIComponent(email)}${queryParams ? `?${queryParams}` : ''}`;
        const orderRes = await axiosClient
          .get(url)
          .then((res) => res.data);
        return orderRes;
      }),
    fetchOrders: async (params = {}) =>
      apiWrapper(async () => {
        const queryParams = new URLSearchParams(params).toString();
        const url = `/admin/orders${queryParams ? `?${queryParams}` : ''}`;
        const orderRes = await axiosClient.get(url).then((res) => res.data);
        return orderRes;
      }),
    viewOrderDetails: async (orderId) =>
      apiWrapper(async () => {
        const url = `/admin/orders/${orderId}`;
        const orderRes = await axiosClient.get(url).then((res) => res.data);
        return orderRes;
      }),
  };
};
