<template>
  <div ref="map" class="w-full h-full"></div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

export default {
  props: {
    files: {
      type: Array,
      default: () => [], // Provide a default empty array to avoid warnings
    },
  },
  data() {
    return {
      map: null,
      activeFileId: null, // Track the currently active file
      visibleFiles: new Set(), // Track visible files
    };
  },
  mounted() {
    console.log("MapComponent mounted. Initializing map...");
    const runtimeConfig = useRuntimeConfig();
    mapboxgl.accessToken = runtimeConfig.public.mapboxToken;

    this.map = new mapboxgl.Map({
      container: this.$refs.map,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-74.5, 40],
      zoom: 1,
    });

    this.map.addControl(new mapboxgl.NavigationControl());

      // Initialize Mapbox Draw
      this.draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
      });
      this.map.addControl(this.draw);

      // Disable shape drawing initially
      this.map.on("draw.create", this.onDrawCreate);


    this.map.on("load", () => {
      console.log("Map loaded.");
    });
  },
  methods: {
    renderFileOnMap(fileId, geojsonData) {
      // Add the GeoJSON data to the map if not already visible
      if (!this.visibleFiles.has(fileId)) {
        this.map.addSource(fileId, {
          type: "geojson",
          data: geojsonData,
        });
        this.map.addLayer({
          id: fileId,
          type: "fill",
          source: fileId,
          layout: {},
          paint: {
            "fill-color": "#888888",
            "fill-opacity": 0.5,
          },
        });

        this.visibleFiles.add(fileId); // Mark the file as visible
      }
    },
    removeFileFromMap(fileId) {
      if (this.map.getLayer(fileId)) {
        this.map.removeLayer(fileId);
      }
      if (this.map.getSource(fileId)) {
        this.map.removeSource(fileId);
      }

      this.visibleFiles.delete(fileId); // Mark the file as not visible
    },
    toggleFileVisibility(fileId) {
      if (this.visibleFiles.has(fileId)) {
        this.removeFileFromMap(fileId);
      } else {
        const file = this.files.find((f) => f._id === fileId);
        if (!file) {
          console.error("File not found:", fileId);
          return;
        }

        const geojsonUrl = `http://localhost:8080/uploads/${file.fileName}`; // Adjust URL as needed
        fetch(geojsonUrl)
          .then((response) => response.json())
          .then((data) => {
            this.renderFileOnMap(fileId, data);
          })
          .catch((error) => console.error("Error loading GeoJSON:", error));
      }
    },
  },
  watch: {
    files: {
      handler(newFiles) {
        console.log("Updated files:", newFiles); // Log the updated files

        // Remove layers for files that no longer exist
        this.visibleFiles.forEach((fileId) => {
          if (!newFiles.some((file) => file._id === fileId)) {
            this.removeFileFromMap(fileId);
          }
        });
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.mapboxgl-map {
  width: 100%;
  height: 100%;
}
</style>
