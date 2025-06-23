<template>
  <ErrorBoundary>
    <div class="forest-bg min-vh-100 p-6">
      <div class="container">
        <h1 class="display-4 text-white text-center mb-5">🌳 Tree Catalog</h1>

        <!-- Error Message -->
        <div v-if="error" class="alert alert-danger mb-4">{{ error }}</div>

        <!-- Search Bar -->
        <div class="mb-4">
          <input
            v-model="nameFilter"
            type="text"
            placeholder="Search trees by name"
            class="form-control w-50 mx-auto bark-border"
          />
        </div>

        <!-- Form Section -->
        <form @submit.prevent="handleSubmit" class="bg-white p-4 rounded shadow-lg mb-5 mx-auto" style="max-width: 600px;">
          <div class="row g-3">
            <div class="col-md-6">
              <input
                v-model="form.name"
                type="text"
                placeholder="Tree Name"
                class="form-control bark-border"
                required
              />
            </div>
            <div class="col-md-6">
              <input
                v-model="form.species"
                type="text"
                placeholder="Species"
                class="form-control bark-border"
                required
              />
            </div>
            <div class="col-12">
              <textarea
                v-model="form.description"
                placeholder="Description"
                class="form-control bark-border"
                rows="4"
              />
            </div>
            <div class="col-12">
              <input
                type="file"
                accept="image/*"
                @change="handleFileChange($event.target.files[0])"
                class="form-control bark-border"
              />
            </div>
            <div class="col-12">
              <textarea
                v-model="form.css_style"
                placeholder="Custom CSS (e.g., color: green; border: 2px solid brown;)"
                class="form-control bark-border"
                rows="3"
              />
            </div>
            <div class="col-12">
              <input
                v-model="form.student_id"
                type="text"
                placeholder="Student ID"
                class="form-control bark-border"
                required
              />
            </div>
            <div class="col-12">
              <button type="submit" class="btn leaf-btn text-white w-100">Add Tree</button>
            </div>
          </div>
        </form>

        <!-- No Trees Message -->
        <p v-if="trees && trees.length === 0 && !error && !nameFilter" class="text-center text-white">
          No trees yet. Add one above!
        </p>

        <!-- Search Results -->
        <div v-if="nameFilter && filteredTrees.length === 0" class="text-center text-white mb-4">
          No trees match the search.
        </div>
        <div v-if="nameFilter" class="mb-5">
          <h3 class="text-white text-center mb-3">Search Results</h3>
          <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            <div v-for="tree in filteredTrees" :key="tree.id" class="col">
              <div class="card shadow-sm">
                <div class="card-body">
                  <h4 class="card-title h5">{{ tree.name }}</h4>
                  <p class="card-text text-muted">Species: {{ tree.species }}</p>
                  <p class="card-text">
                    Average Rating: {{ getAverageRating(tree) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Trees Display -->
        <div v-if="!nameFilter" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          <div v-for="tree in trees" :key="tree.id" class="col">
            <div class="card h-100 shadow-sm" :style="tree.css_style || ''">
              <img
                v-if="tree.image_url"
                :src="tree.image_url"
                :alt="tree.name"
                class="card-img-top"
                style="height: 200px; object-fit: cover;"
              />
              <div class="card-body">
                <h2 class="card-title h5">{{ tree.name }}</h2>
                <p class="card-text text-muted">Species: {{ tree.species }}</p>
                <p class="card-text">{{ tree.description || 'No description' }}</p>
                <div class="mb-3">
                  <h3 class="h6">Rate this tree:</h3>
                  <select
                    @change="handleRating(tree.id, form.student_id, parseInt($event.target.value))"
                    class="form-select bark-border"
                  >
                    <option value="">Select Rating</option>
                    <option v-for="r in [1, 2, 3, 4, 5]" :key="r" :value="r">
                      {{ r }} Star{{ r > 1 ? 's' : '' }}
                    </option>
                  </select>
                  <p class="text-muted mt-2">
                    Average: {{ getAverageRating(tree) }}
                  </p>
                </div>
                <!-- QR Code -->
                <div class="mt-3 text-center">
                  <h3 class="h6">Scan or Download QR Code</h3>
                  <qrcode-vue :value="getTreeUrl(tree.id)" :size="100" level="H" :ref="'qrcode-' + tree.id" />
                  <button
                    @click="downloadQRCode(tree.id, tree.name)"
                    class="btn btn-sm leaf-btn text-white mt-2"
                  >
                    Download QR Code
                  </button>
                </div>
                <!-- Delete Button -->
                <div class="mt-3 text-center">
                  <button
                    @click="showDeletePrompt(tree.id, tree.name)"
                    class="btn btn-sm btn-outline-danger"
                  >
                    Delete Tree
                  </button>
                </div>
                <!-- Delete Modal -->
                <div v-if="deleteTreeId === tree.id" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
                  <div class="modal-dialog">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title">Delete Tree: {{ tree.name }}</h5>
                        <button @click="cancelDelete" class="btn-close"></button>
                      </div>
                      <div class="modal-body">
                        <p>Enter admin key to confirm deletion:</p>
                        <input
                          v-model="adminKey"
                          type="password"
                          placeholder="Admin Key"
                          class="form-control"
                        />
                      </div>
                      <div class="modal-footer">
                        <button @click="cancelDelete" class="btn btn-secondary">Cancel</button>
                        <button
                          @click="confirmDelete(tree.id)"
                          class="btn btn-danger"
                          :disabled="!adminKey"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ErrorBoundary>
</template>

<script>
import axios from 'axios';
import ErrorBoundary from '../components/ErrorBoundary.vue';
import QrcodeVue from 'qrcode.vue';

export default {
  name: 'HomeView',
  components: { ErrorBoundary, QrcodeVue },
  data() {
    return {
      trees: [], // Initialize as empty array to avoid undefined errors
      form: {
        name: '',
        species: '',
        description: '',
        image: null,
        css_style: '',
        student_id: '',
      },
      nameFilter: '',
      error: null,
      deleteTreeId: null,
      adminKey: '',
    };
  },
  computed: {
    filteredTrees() {
      if (!this.nameFilter) return [];
      const filter = this.nameFilter.toLowerCase().trim();
      return this.trees
        .filter(tree => tree && tree.name && tree.name.toLowerCase().includes(filter))
        .sort((a, b) => {
          const avgA = this.getAverageRating(a);
          const avgB = this.getAverageRating(b);
          return avgB - avgA; // Descending order
        });
    },
  },
  methods: {
    getAverageRating(tree) {
      if (!tree || !tree.ratings || !Array.isArray(tree.ratings) || tree.ratings.length === 0) {
        return 'No ratings yet';
      }
      return (tree.ratings.reduce((sum, r) => sum + r.rating, 0) / tree.ratings.length).toFixed(1);
    },
    handleFileChange(file) {
      if (file && file.size > 5 * 1024 * 1024) {
        this.error = 'Image size exceeds 5MB. Please choose a smaller file.';
        return;
      }
      this.form.image = file;
    },
    async fetchTrees() {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/trees`);
        console.log('Fetched trees response:', response.data);
        this.trees = Array.isArray(response.data) ? response.data : [];
        this.error = null;
      } catch (error) {
        console.error('Error fetching trees:', error);
        this.trees = []; // Reset to empty array on error
        this.error = 'Failed to load trees. Please check the backend connection.';
      }
    },
    async handleImageUpload(file) {
      try {
        const formData = new FormData();
        formData.append('image', file);
        const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/upload-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.url;
      } catch (error) {
        console.error('Image upload error:', error);
        this.error = 'Failed to upload image.';
        return null;
      }
    },
    async handleSubmit() {
      try {
        const imageUrl = this.form.image ? await this.handleImageUpload(this.form.image) : null;
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/trees`, {
          ...this.form,
          image: imageUrl,
        });
        await this.fetchTrees();
        this.form = { name: '', species: '', description: '', image: null, css_style: '', student_id: '' };
        this.error = null;
      } catch (error) {
        console.error('Submit error:', error);
        this.error = 'Failed to add tree.';
      }
    },
    async handleRating(treeId, studentId, value) {
      try {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/ratings`, {
          tree_id: treeId,
          student_id: studentId,
          rating: value,
        });
        await this.fetchTrees();
        this.error = null;
      } catch (error) {
        console.error('Rating error:', error);
        this.error = 'Failed to add rating.';
      }
    },
    getTreeUrl(treeId) {
      return `${window.location.origin}/tree/${treeId}`;
    },
    downloadQRCode(treeId, treeName) {
      const qrCanvas = this.$refs[`qrcode-${treeId}`][0].$el.querySelector('canvas');
      const qrImage = qrCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = qrImage;
      link.download = `qr-code-${treeName.replace(/\s+/g, '-')}.png`;
      link.click();
    },
    showDeletePrompt(treeId, treeName) {
      this.deleteTreeId = treeId;
      this.deleteTreeName = treeName;
      this.adminKey = '';
    },
    cancelDelete() {
      this.deleteTreeId = null;
      this.deleteTreeName = null;
      this.adminKey = '';
    },
    async confirmDelete(treeId) {
      try {
        const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/trees/${treeId}`, {
          headers: { 'x-admin-key': this.adminKey },
        });
        console.log('Delete response:', response);
        await this.fetchTrees();
        this.error = null;
        this.cancelDelete();
      } catch (error) {
        console.error('Delete error:', error.response ? error.response.data : error.message);
        this.error = error.response?.status === 405 ? 'Method not allowed. Check backend configuration.' : 'Failed to delete tree.';
      }
    },
  },
  mounted() {
    this.fetchTrees();
  },
};
</script>