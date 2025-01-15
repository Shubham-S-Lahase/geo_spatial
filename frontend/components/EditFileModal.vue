<template>
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded shadow-lg w-96" v-auto-animate>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold">Edit File</h2>
          <button
            @click="$emit('close')"
            class="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        <form @submit.prevent="submit">
          <div class="mb-4">
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              id="description"
              v-model="file.description"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
            />
          </div>
          <div class="mb-4">
            <label for="tags" class="block text-sm font-medium text-gray-700">Tags</label>
            <input
              type="text"
              id="tags"
              v-model="file.tags"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
            />
          </div>
          <div class="flex justify-end">
            <button type="button" @click="$emit('close')" class="mr-2 text-gray-500 hover:text-gray-700">
              Cancel
            </button>
            <button type="submit" class="bg-blue-500 text-white p-2 rounded">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  
  <script>
  export default {
    props: ["file"],
    methods: {
      submit() {
        this.$emit("update", {
          _id: this.file._id,
          description: this.file.description,
          tags: this.file.tags.split(',').map(tag => tag.trim()),
        });
      },
    },
  };
  </script>
  