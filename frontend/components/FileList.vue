<template>
  <div>
    <h2 class="text-lg font-bold">Files</h2>
    <ul>
      <li
        v-for="file in files"
        :key="file._id"
        class="flex justify-between items-center"
      >
        <span>{{ file.fileName }}</span>
        <div class="flex items-center">
          <button @click="toggleVisibility(file._id)">
            <img
              :src="file.visible ? '/images/show.png' : '/images/hide.png'"
              alt="visibility toggle"
              class="w-6 h-6"
            />
          </button>
          <button @click="editFile(file)">
            <img src="/images/edit.png" alt="editFileIcon" class="w-6 h-6" />
          </button>
          <button @click="confirmDelete(file._id)">
            <img src="/images/delete.png" alt="deleteFileIcon" class="w-6" />
          </button>
          <button @click="downloadFile(file._id)">
            <img src="/images/download.png" alt="downloadFileIcon" class="w-6" />
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: ["files"],
  methods: {
    toggleVisibility(fileId) {
      this.$emit("toggleVisibility", fileId);
    },
    isVisible(fileId) {
      return this.$store.state.user.preferences.datasets.includes(fileId);
    },
    editFile(file) {
      this.$emit("editFile", file);
    },
    confirmDelete(fileId) {
      if (confirm("Are you sure you want to delete this file?")) {
        this.deleteFile(fileId);
      }
    },
    async deleteFile(fileId) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:8080/api/files/${fileId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.$emit("fileDeleted", fileId);
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    },
    async downloadFile(fileId) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8080/api/files/download/${fileId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error downloading file');
        }

        // Create a blob from the response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileId;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading file:", error);
      }
    },
  },
};
</script>
