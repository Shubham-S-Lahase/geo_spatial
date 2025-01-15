<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-96">
      <h2 class="text-lg font-bold mb-4">Upload File</h2>
      <form @submit.prevent="handleUpload">
        <div class="mb-4">
          <label for="file" class="block text-sm font-medium text-gray-700"
            >Select File</label
          >
          <input
            type="file"
            id="file"
            @change="handleFileChange"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
            required
          />
        </div>
        <div class="mb-4">
          <label
            for="description"
            class="block text-sm font-medium text-gray-700"
            >Description</label
          >
          <input
            type="text"
            id="description"
            v-model="description"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
            required
          />
        </div>
        <div class="mb-4">
          <label for="tags" class="block text-sm font-medium text-gray-700"
            >Tags (comma-separated)</label
          >
          <input
            type="text"
            id="tags"
            v-model="tags"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
            required
          />
        </div>
        <div class="flex justify-end">
          <button
            type="button"
            @click="$emit('close')"
            class="mr-2 bg-gray-300 text-gray-700 p-2 rounded"
          >
            Cancel
          </button>
          <button type="submit" class="bg-blue-500 text-white p-2 rounded">
            Upload
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { useUserStore } from "../store/user.js";
export default {
  data() {
    return {
      selectedFile: null,
      description: "",
      tags: "",
    };
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0];
      const validTypes = [
        "application/json",
        "application/vnd.google-earth.kml+xml",
        "image/tiff",
      ];
      if (file && !validTypes.includes(file.type)) {
        alert("Please select a valid file type (GeoJSON, KML, TIFF).");
        this.selectedFile = null;
      } else {
        this.selectedFile = file;
      }
    },
    async handleUpload() {
      if (!this.selectedFile) {
        alert("Please select a file to upload.");
        return;
      }

      const formData = new FormData();
      formData.append("file", this.selectedFile);
      formData.append("description", this.description);
      formData.append(
        "tags",
        this.tags.split(",").map((tag) => tag.trim())
      ); // Convert tags to an array

      // Log the contents of FormData
      // for (const [key, value] of formData.entries()) {
      //   console.log(`${key}:`, value);
      // }

      try {
        const token = localStorage.getItem('token');
        // console.log("Token being used for upload:", token);
        const response = await fetch("http://localhost:8080/api/files/upload", {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to upload file");
        }

        // Emit an event to notify the parent component of a successful upload
        this.$emit("uploadSuccess");
        this.$emit("close");
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload file. Please try again.");
      }
    },
  },
};
</script>
