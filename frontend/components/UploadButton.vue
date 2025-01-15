<template>
  <div>
    <button @click="openUploadPopup" class="bg-blue-500 text-white p-2 rounded">
      Upload
    </button>
    <div v-if="showUploadPopup" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <UploadPopup
        @close="showUploadPopup = false"
        @uploadSuccess="handleUploadSuccess"
      />
    </div>
  </div>
</template>

<script>
import UploadPopup from "@/components/UploadPopup.vue";

export default {
  data() {
    return {
      showUploadPopup: false,
    };
  },
  methods: {
    openUploadPopup() {
      this.showUploadPopup = true;
    },
    handleUploadSuccess() {
      this.$emit("uploadSuccess");
      this.showUploadPopup = false;
    },
  },
  components: {
    UploadPopup,
  },
};
</script>

<style scoped>
.fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
}
</style>