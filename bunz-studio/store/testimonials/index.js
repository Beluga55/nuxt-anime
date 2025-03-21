import states from "./states";
import getters from "./getters";
import actions from "./actions";
import { defineStore } from "pinia";

export const useTestimonialsStore = defineStore("testimonials", {
  state: states,
  getters,
  actions,
});
