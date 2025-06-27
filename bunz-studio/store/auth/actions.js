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
      localStorage.setItem(
        "tokenExpiration",
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      );
    } else {
      localStorage.setItem("token", token);
      localStorage.setItem(
        "tokenExpiration",
        new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      );
    }

    // Set the user data into the store
    this.loginData = login;
    localStorage.setItem("userInfo", JSON.stringify(this.loginData));

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

    // Set the token and expiration in the local storage
    localStorage.setItem("token", loginGoogle.token);
    localStorage.setItem(
      "tokenExpiration",
      loginGoogle.tokenExpiration || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    );

    // If user needs to provide phone number, redirect to complete-profile
    if (loginGoogle.needsPhone) {
      useRouter().push("/complete-profile");
      return;
    }

    // Check for pending checkout - let the login page handle this
    const pendingCheckout = localStorage.getItem('pendingCheckout');
    if (!pendingCheckout) {
      // Only redirect if there's no pending checkout
      useRouter().push("/products");
    }
    return loginGoogle;
  },
  async signup(data) {
    const [signup, error] = await useApi().auth.register(data);

    if (error) return error.message;

    const loginData = {
      email: data.email,
      password: data.password,
    };

    // Wait for login to complete before redirecting
    await this.login(loginData);

    // Redirect to the products page
    useRouter().push("/products");

    // Redirect to login page
    // useRouter().push("/otp");

    // Return the signup response
    return signup;
  },
  async otp(data) {
    const [otp, error] = await useApi().auth.otp(data);

    if (error) return error.message;

    return otp;
  },
  async verifyOtp(data) {
    const [verifyOtp, error] = await useApi().auth.verifyOtp(data);

    if (error) return error.message;

    // Check for pending checkout before redirecting
    const pendingCheckout = localStorage.getItem('pendingCheckout');
    if (!pendingCheckout) {
      // Only redirect if there's no pending checkout
      useRouter().push("/products");
    }

    return verifyOtp;
  },

  async completeProfile(data) {
    const [completeProfile, error] = await useApi().auth.completeProfile(data);

    if (error) return error.message;

    // Check for pending checkout before redirecting
    const pendingCheckout = localStorage.getItem('pendingCheckout');
    if (!pendingCheckout) {
      // Only redirect if there's no pending checkout
      useRouter().push("/products");
    }

    return completeProfile;
  },
};
