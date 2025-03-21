import Products from "../api/products";
import Testimonials from "~/api/testimonials";
import Support from "~/api/support";
import Auth from "~/api/auth";
import Stripe from "~/api/stripe";
import Order from "~/api/order";

const factories = ($fetch) => {
  return {
    products: Products($fetch),
    testimonials: Testimonials($fetch),
    support: Support($fetch),
    auth: Auth($fetch),
    stripe: Stripe($fetch),
    order: Order($fetch),
  };
};

export default defineNuxtPlugin(() => {
  return {
    provide: {
      api: factories($fetch),
    },
  };
});
