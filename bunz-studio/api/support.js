import apiWrapper from "./api_wrapper";

export default () => {
  const axios = useAxios();
  const axiosClient = axios.createAxiosClient();

  return {
    sendSupportMessage: async (data) =>
      apiWrapper(async () => {
        const supportRes = await axiosClient
          .post("/support", data)
          .then((res) => res.data);
        return supportRes;
      }),
  };
};
