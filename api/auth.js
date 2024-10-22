import apiWrapper from "./api_wrapper";

export default () => {
  const axios = useAxios();
  const axiosClient = axios.createAxiosClient();

  return {
    login: async (data) =>
      apiWrapper(async () => {
        const loginRes = await axiosClient
          .post("/auth/login", data)
          .then((res) => res.data);
        return loginRes;
      }),
    register: async (data) =>
      apiWrapper(async () => {
        const registerRes = await axiosClient
          .post("/auth/register", data)
          .then((res) => res.data);
        return registerRes;
      }),
  };
};
