import { getActivePinia } from "pinia";
const useApi = () => useNuxtApp().$api;

export default {
  async login(data) {
    const [login, error] = await useApi().auth.login(data);

    if (error) return;

    const token = login.token;
    const remember = login.remember;

    // Set the token in the local storage
    if (remember) {
      localStorage.setItem("token", token);
      localStorage.setItem("tokenExpiration", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
    } else {
      localStorage.setItem("token", token);
      localStorage.setItem("tokenExpiration", new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString());
    }

    // Set the user data into the store
    this.loginData = login;
    localStorage.setItem("userInfo", JSON.stringify(this.loginData));

    // Redirect to products page
    useRouter().push("/products");

    // Return the login response
    return login;
  },
  async authGoogle(token) {
    const [authGoogle, error] = await useApi().auth.authGoogle(token);

    if (error) return;

    return authGoogle;
  },
  async loginGoogle(data) {
    const [loginGoogle, error] = await useApi().auth.loginGoogle(data);

    if (error) return error.message;

    // Set the token in the local storage
    localStorage.setItem("token", loginGoogle.token);

    // Redirect to the products page
    useRouter().push("/products");

    return loginGoogle;
  },
  async signup(data) {
    const [signup, error] = await useApi().auth.register(data);

    if (error) return error.message;

    // Redirect to login page
    useRouter().push("/login");

    // Return the signup response
    return signup;
  },
};
