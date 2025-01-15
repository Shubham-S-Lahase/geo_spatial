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
      default: () => [],
    },
    shapes: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      map: null,
      draw: null,
      distanceMeasurement: null,
      distance: 0,
      markers: [],
      visibleFiles: new Set(), // Track visible files
      visibleShapes: new Set(),
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
        line_string: true,
        point: true,
        trash: true,
      },
    });
    this.map.addControl(this.draw);

    // Event listener for when a shape is created
    this.map.on("draw.create", this.onDrawCreate);
    this.map.on("draw.update", this.onDrawUpdate);
    this.map.on("draw.delete", this.onDrawDelete);

    this.map.on("click", this.onMapClick);

    this.map.on("load", () => {
      console.log("Map loaded.");
      this.loadExistingShapes();
      this.loadExistingMarkers();
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

  onDrawCreate(event) {
    const features = event.features;
    features.forEach((feature) => {
      this.saveShape(feature); // Save the shape to the backend
    });
  },
  onDrawUpdate(event) {
    const features = event.features;
    features.forEach((feature) => {
      this.updateShape(feature); // Update the shape in the backend if needed
    });
  },
  onDrawDelete(event) {
    const features = event.features;
    features.forEach((feature) => {
      this.deleteShape(feature); // Delete the shape from the backend if needed
    });
  },

  addMarker(coords) {
    const marker = new mapboxgl.Marker({ draggable: true })
      .setLngLat(coords)
      .addTo(this.map);

    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      this.updateMarker(marker, lngLat); // Update marker position
    });

    this.markers.push(marker);
    this.saveMarker(coords); // Save marker to the backend
  },
  saveMarker(coords) {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8080/api/markers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "New Marker", // You can customize this
        coordinates: [coords.lng, coords.lat],
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Marker saved:", data);
        this.loadExistingMarkers(); // Reload markers after saving
      })
      .catch((error) => console.error("Error saving marker:", error));
  },
  updateMarker(marker, lngLat) {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8080/api/markers/${marker.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [lngLat.lng, lngLat.lat],
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Marker updated:", data);
      })
      .catch((error) => console.error("Error updating marker:", error));
  },
  loadExistingMarkers() {
    const token = localStorage.getItem("token");
    fetch("http:// localhost:8080/api/markers", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        this.markers.forEach((marker) => marker.remove()); // Clear existing markers
        this.markers = []; // Reset markers array
        data.markers.forEach((markerData) => {
          const marker = new mapboxgl.Marker()
            .setLngLat(markerData.coordinates)
            .addTo(this.map);
          this.markers.push(marker);
        });
      })
      .catch((error) => console.error("Error loading markers:", error));
  },
  deleteMarker(marker) {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8080/api/markers/${marker.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          marker.remove(); // Remove marker from the map
          this.markers = this.markers.filter((m) => m !== marker); // Remove from markers array
          console.log("Marker deleted successfully");
        } else {
          console.error("Error deleting marker");
        }
      })
      .catch((error) => console.error("Error deleting marker:", error));
  },
  clearMarkers() {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
  },
  toggleDistanceMeasurement() {
    this.distanceMeasurement = !this.distanceMeasurement;
    if (this.distanceMeasurement) {
      console.log("Distance measurement mode activated.");
    } else {
      console.log("Distance measurement mode deactivated.");
      this.clearMarkers();
    }
  },

  saveShape(feature) {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8080/api/shapes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: feature.properties.name || "New Shape",
        geojson: feature,
        description: feature.properties.description || "",
        tags: feature.properties.tags || [],
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Shape saved:", data);
        this.loadExistingShapes(); // Reload shapes after saving
      })
      .catch((error) => console.error("Error saving shape:", error));
  },
  loadExistingShapes() {
    this.shapes.forEach((shape) => {
      this.renderShapeOnMap(shape);
    });
  },
  renderShapeOnMap(shape) {
    this.map.addSource(shape._id, {
      type: "geojson",
      data: shape.geojson,
    });
    this.map.addLayer({
      id: shape._id,
      type: "fill",
      source: shape._id,
      layout: {},
      paint: {
        "fill-color": "#888888",
        "fill-opacity": 0.5,
      },
    });
    this.visibleShapes.add(shape._id); // Mark the shape as visible
  },
  toggleShapeVisibility(shapeId) {
    if (this.visibleShapes.has(shapeId)) {
      this.removeShapeFromMap(shapeId);
    } else {
      const shape = this.shapes.find((s) => s._id === shapeId);
      if (shape) {
        this.renderShapeOnMap(shape);
      }
    }
  },
  removeShapeFromMap(shapeId) {
    if (this.map.getLayer(shapeId)) {
      this.map.removeLayer(shapeId);
    }
    if (this.map.getSource(shapeId)) {
      this.map.removeSource(shapeId);
    }
    this.visibleShapes.delete(shapeId); // Mark the shape as not visible
  },
  updateShape(feature) {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8080/api/shapes/${feature.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        geojson: feature,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Shape updated:", data);
      })
      .catch((error) => console.error("Error updating shape:", error));
  },
  deleteShape(feature) {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8080/api/shapes/${feature.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          console.log("Shape deleted:", feature.id);
          this.removeShapeFromMap(feature.id);
        }
      })
      .catch((error) => console.error("Error deleting shape:", error));
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
