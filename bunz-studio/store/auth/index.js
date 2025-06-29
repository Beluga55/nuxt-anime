import states from "./states";
import getters from "./getters";
import actions from "./actions";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: states,
  getters,
  actions,
  
  // Integration with useAuth composable
  hooks: {
    onActivated() {
      // Initialize useAuth when store is activated
      if (process.client) {
        const { useAuth } = require('@/composables/useAuth');
        const auth = useAuth();
        auth.initializeAuth();
      }
    }
  }
});
