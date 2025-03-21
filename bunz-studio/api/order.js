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
      })
  };
};
