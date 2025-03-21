import states from "./states";
import getters from "./getters";
import actions from "./actions";
import { defineStore } from "pinia";

export const useProductsStore = defineStore("products", {
  states,
  getters,
  actions,
});
