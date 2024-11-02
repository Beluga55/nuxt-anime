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
    authGoogle: async (token) =>
      apiWrapper(async () => {
        const userInfo = await axiosClient
          .get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => res.data);

        return userInfo;
      }),
    loginGoogle: async (data) =>
      apiWrapper(async () => {
        const loginGoogleRes = await axiosClient
          .post("/auth/login-google", data)
          .then((res) => res.data);

        return loginGoogleRes;
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
