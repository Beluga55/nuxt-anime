import { getActivePinia } from "pinia";
const useApi = () => useNuxtApp().$api;

export default {
  async login(data) {
    const [login, error] = await useApi().auth.login(data);

    if (error) return;

    // Set the token in the local storage
    localStorage.setItem("token", login.token);
    
    // Set the user data into the store
    this.loginData = login;
    localStorage.setItem("loginData", JSON.stringify(this.loginData));

    // Redirect to products page
    useRouter().push("/products");

    // Return the login response
    return login;
  },
  async signup(data) {
    const [signup, error] = await useApi().auth.register(data);

    if (error) return;

    // Redirect to login page
    useRouter().push("/login");

    // Return the signup response
    return signup;
  }
};