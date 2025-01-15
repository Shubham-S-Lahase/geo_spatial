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
        <div class="flex">
          <button @click="toggleVisibility(file._id)">
            <img
              :src="file.visible ? './images/show.png' : './images/hide.png'"
              alt="visibility toggle"
              class="w-6 h-6"
            />
          </button>
          <button @click="editFile(file._id)">✏️</button>
          <button @click="confirmDelete(file._id)">🗑️</button>
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
    editFile(fileId) {
    },
    confirmDelete(fileId) {
    },
  },
};
</script>
