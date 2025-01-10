<template>
  <div class="flex flex-col h-screen">
    <header class="bg-gray-800 text-white p-4">
      <nav class="flex justify-between">
        <div class="logo">Your Logo</div>
        <div>
          <div v-if="user">
            <span class="mr-4">Welcome, {{ user.username }}</span>
            <button @click="logout" class="bg-red-500 text-white p-2 rounded">
              Logout
            </button>
          </div>
          <button
            v-else
            @click="toggleAuthPopup"
            class="bg-blue-500 text-white p-2 rounded"
          >
            Login/Register
          </button>
        </div>
      </nav>
    </header>
    <main class="flex flex-1 items-center justify-center">
      <AuthPopup v-if="showAuthPopup" @close="toggleAuthPopup" />
    </main>
  </div>
</template>

<script>
import { useUserStore } from "../store/user.js";
import AuthPopup from "../components/AuthPopup.vue";
import { ref, computed } from "vue";

export default {
  setup() {
    const userStore = useUserStore();
    const showAuthPopup = ref(false);

    const toggleAuthPopup = () => {
      showAuthPopup.value = !showAuthPopup.value;
    };

    const logout = async () => {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include", // Include cookies in the request
      });
      userStore.clearUser ();
    };

    // Create a computed property for user
    const user = computed(() => userStore.user);

    return {
      user,
      showAuthPopup,
      toggleAuthPopup,
      logout,
    };
  },
};
</script>
