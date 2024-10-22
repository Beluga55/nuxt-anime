import Products from "../api/products";
import Testimonials from "~/api/testimonials";
import Support from "~/api/support";
import Auth from "~/api/auth";

const factories = ($fetch) => {
  return {
    products: Products($fetch),
    testimonials: Testimonials($fetch),
    support: Support($fetch),
    auth: Auth($fetch),
  };
};

export default defineNuxtPlugin(() => {
  return {
    provide: {
      api: factories($fetch),
    },
  };
});
