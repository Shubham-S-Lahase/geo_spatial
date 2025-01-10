import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    preferences: {
      datasets: [], // Array to hold dataset visibility preferences
    },
  }),
  actions: {
    setUser (user) {
      this.user = user;
    },
    clearUser () {
      this.user = null;
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