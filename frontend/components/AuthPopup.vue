<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-96" v-auto-animate>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold">{{ isLogin ? "Login" : "Register" }}</h2>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700"
            >Email</label
          >
          <input
            type="email"
            id="email"
            v-model="email"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
          />
        </div>
        <div v-if="!isLogin" class="mb-4">
          <label for="username" class="block text-sm font-medium text-gray-700"
            >Username</label
          >
          <input
            type="text"
            id="username"
            v-model="username"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
          />
        </div>
        <div class="mb-4">
          <label for="password" class="block text-sm font-medium text-gray-700"
            >Password</label
          >
          <input
            type="password"
            id="password"
            v-model="password"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
          />
        </div>
        <div v-if="!isLogin" class="mb-4">
          <label
            for="confirmPassword"
            class="block text-sm font-medium text-gray-700"
            >Confirm Password</label
          >
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
          />
        </div>
        <div class="flex justify-end">
          <button type="button" @click="toggleForm" class="mr-2 text-blue-500">
            {{ isLogin ? "Create an account" : "Already have an account?" }}
          </button>
          <button type="submit" class="bg-blue-500 text-white p-2 rounded">
            {{ isLogin ? "Login" : "Register" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { useUserStore } from "../store/user.js";
import { ref } from "vue";

export default {
  setup(props, { emit }) {
    const userStore = useUserStore();
    const email = ref("");
    const password = ref("");
    const username = ref("");
    const confirmPassword = ref("");
    const isLogin = ref(true);

    const toggleForm = () => {
      isLogin.value = !isLogin.value;
    };

    const handleSubmit = async () => {
      try {
        if (isLogin.value) {
          const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email.value,
              password: password.value,
            }),
            credentials: "include", // Include cookies in the request
          });

          if (!response.ok) {
            throw new Error("Login failed");
          }

          const data = await response.json();
        //   console.log("Login response data:", data);

          if (data.user) {
            userStore.setUser({
              id: data.user.id,
              email: data.user.email,
              username: data.user.username,
            });
          } else {
            throw new Error("User  data not found in response");
          }
        } else {
          // Handle registration logic here
          const response = await fetch(
            "http://localhost:8080/api/auth/register",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: email.value,
                password: password.value,
                username: username.value,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Registration failed");
          }

          // After successful registration, switch to login form
          toggleForm(); // Toggle to login form
        }
        // Close the popup after successful login/registration
        emit("close");
      } catch (error) {
        console.error(error);
        // Handle error (e.g., show a notification)
      }
    };

    return {
      email,
      password,
      username,
      confirmPassword,
      isLogin,
      toggleForm,
      handleSubmit,
    };
  },
};
</script>
