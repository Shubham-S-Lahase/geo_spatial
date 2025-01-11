import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null,
    preferences: {
      datasets: [], // Array to hold dataset visibility preferences
    },
  }),
  actions: {
    setUser (user) {
      this.user = user;
      this.token = user.token;
      console.log("User  set in store:", this.user);
      console.log("Token stored in user store:", this.token);
    },
    clearUser () {
      this.user = null;
      this.token = null;
    },
    setPreferences(preferences) {
      this.preferences = preferences;
    },
    toggleDatasetVisibility(datasetId) {
      const index = this.preferences.datasets.indexOf(datasetId);
      if (index === -1) {
        this.preferences.datasets.push(datasetId); 
      } else {
        this.preferences.datasets.splice(index, 1);
      }
    },
  },
});