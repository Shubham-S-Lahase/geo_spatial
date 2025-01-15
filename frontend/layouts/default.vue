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
    <main class="flex flex-1">
      <aside class="bg-gray-100 w-full md:w-1/4 p-4">
        <UploadButton @uploadSuccess="fetchFiles" />
        <FileList
          :files="files"
          @toggleVisibility="toggleFileVisibility"
          @editFile="openEditModal"
          @fileDeleted="fetchFiles"
        />
        <ShapeList :shapes="shapes" @toggleVisibility="toggleShapeVisibility" />
        <button
          @click="downloadShape"
          class="bg-green-500 text-white p-2 rounded"
        >
          Download Shape as GeoJSON
        </button>
      </aside>
      <div class="flex-1">
        <MapComponent ref="mapComponentRef" :files="files" />
      </div>
    </main>
    <AuthPopup v-if="showAuthPopup" @close="toggleAuthPopup" />
    <EditFileModal
      v-if="showEditModal"
      :file="fileToEdit"
      @close="closeEditModal"
      @update="updateFile"
    />
  </div>
</template>

<script>
import { useUserStore } from "../store/user.js";
import AuthPopup from "../components/AuthPopup.vue";
import UploadButton from "@/components/UploadButton.vue";
import FileList from "@/components/FileList.vue";
import ShapeList from "@/components/ShapeList.vue";
import MapComponent from "@/components/MapComponent.vue";
import EditFileModal from "@/components/EditFileModal.vue";
import { ref, computed, onMounted, nextTick, watch } from "vue";

export default {
  components: {
    AuthPopup,
    UploadButton,
    FileList,
    ShapeList,
    MapComponent,
    EditFileModal,
  },
  setup() {
    const userStore = useUserStore();
    const showAuthPopup = ref(false);
    const showEditModal = ref(false);
    const fileToEdit = ref(null);
    const files = ref([]);
    const shapes = ref([]);
    const mapComponentRef = ref(null);

    const toggleAuthPopup = () => {
      showAuthPopup.value = !showAuthPopup.value;
    };

    const logout = async () => {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include", // Include cookies in the request
      });
      userStore.clearUser();
    };

    const user = computed(() => userStore.user);
    // console.log(user);

    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/api/files", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Include the token
          },
          credentials: "include",
        });
        const data = await response.json();
        files.value = data.files.map((file) => ({ ...file, visible: false }));
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    const fetchShapes = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("http://localhost:8080/api/shapes", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Include the token
          },
          credentials: "include",
        });
        const data = await response.json();
        shapes.value = data.shapes;
      } catch (error) {
        console.error("Error fetching shapes:", error);
      }
    };

    const toggleFileVisibility = (fileId) => {
      console.log("Received toggleVisibility event for fileId:", fileId);
      const file = files.value.find((f) => f._id === fileId);
      console.log("Found file:", file);
      if (file) {
        file.visible = !file.visible;
        if (!mapComponentRef.value) {
          console.error("MapComponent reference is not set.");
          setTimeout(() => toggleFileVisibility(fileId), 100);
          return;
        }

        mapComponentRef.value.toggleFileVisibility(fileId);
      }
    };

    const openEditModal = (file) => {
      fileToEdit.value = file;
      showEditModal.value = true;
    };

    const closeEditModal = () => {
      showEditModal.value = false;
      fileToEdit.value = null;
    };

    const updateFile = async (updatedFile) => {
      try {
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:8080/api/files/${updatedFile._id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: updatedFile.description,
            tags: updatedFile.tags.join(','),
          }),
        });
        fetchFiles(); 
        closeEditModal();
      } catch (error) {
        console.error("Error updating file:", error);
      }
    };


    const toggleShapeVisibility = (shapeId) => {
      // Logic to toggle shape visibility on the map
    };

    const downloadShape = async () => {
      // Logic to download the selected shape as GeoJSON
    };

    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/auth/user", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const userData = await response.json();
          userStore.setUser(userData);
        } else {
          console.error("User  not authenticated");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    onMounted(async () => {
      await nextTick();
      if (mapComponentRef.value) {
        console.log("MapComponent initialized:", mapComponentRef.value);
      } else {
        console.error("MapComponent reference not initialized after nextTick.");
      }
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        userStore.setUser(JSON.parse(storedUser));
        fetchFiles();
        fetchShapes();
      } else {
        fetchFiles();
        fetchShapes();
      }
      fetchUserData();
    });

    watch(mapComponentRef, (newVal) => {
      if (newVal) {
        console.log("MapComponent initialized:", newVal);
      } else {
        console.log("MapComponent reference is still null.");
      }
    });

    return {
      user,
      showAuthPopup,
      toggleAuthPopup,
      logout,
      files,
      shapes,
      fetchFiles,
      fetchShapes,
      toggleFileVisibility,
      toggleShapeVisibility,
      openEditModal,
      closeEditModal,
      showEditModal,
      fileToEdit,
      updateFile,
      downloadShape,
    };
  },
};
</script>

<style scoped>
/* Add any additional styles here */
@media (max-width: 768px) {
  aside {
    width: 100%;
  }
}
</style>
