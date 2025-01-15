<template>
  <div>
    <h2 class="text-lg font-bold">Shapes</h2>
    <ul>
      <li v-for="shape in shapes" :key="shape._id" class="flex justify-between items-center">
        <span>{{ shape.name }}</span>
        <div>
          <button @click="toggleVisibility(shape._id)">
            <img
              :src="shape.visible ? '/images/show.png' : '/images/hide.png'"
              alt="visibility toggle"
              class="w-6 h-6"
            />
          </button>
          <button @click="editShape(shape)">
            <img src="/images/edit.png" alt="editShapeIcon" class="w-6 h-6" />
          </button>
          <button @click="confirmDelete(shape._id)">
            <img src="/images/delete.png" alt="deleteShapeIcon" class="w-6 h-6" />
          </button>
          <button @click="downloadShape(shape._id)">
            <img src="/images/download.png" alt="downloadShapeIcon" class="w-6 h-6" />
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: ['shapes'],
  methods: {
    toggleVisibility(shapeId) {
      this.$emit('toggleVisibility', shapeId);
    },
    editShape(shape) {
      this.$emit('editShape', shape);
    },
    confirmDelete(shapeId) {
      if (confirm("Are you sure you want to delete this shape?")) {
        this.deleteShape(shapeId);
      }
    },
    async deleteShape(shapeId) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:8080/api/shapes/${shapeId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.$emit('shapeDeleted', shapeId);
      } catch (error) {
        console.error("Error deleting shape:", error);
      }
    },
    async downloadShape(shapeId) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8080/api/shapes/download/${shapeId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error downloading shape');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${shapeId}.geojson`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading shape:", error);
      }
    }
  }
};
</script>