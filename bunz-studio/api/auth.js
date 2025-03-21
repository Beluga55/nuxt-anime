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
    otp: async (data) =>
      apiWrapper(async () => {
        const otpRes = await axiosClient
          .get("/auth/otp", data)
          .then((res) => res.data);
        return otpRes;
      }),
    verifyOtp: async (data) =>
      apiWrapper(async () => {
        const verifyOtpRes = await axiosClient
          .post("/auth/verify-otp", data)
          .then((res) => res.data);
        return verifyOtpRes;
      }),
    completeProfile: async (data) =>
      apiWrapper(async () => {
        const completeProfileRes = await axiosClient
          .post("/auth/complete-profile", data)
          .then((res) => res.data);
        return completeProfileRes;
      }),
  };
};
