<template>
    <ErrorBoundary>
      <div class="forest-bg min-vh-100 p-6">
        <div class="container">
          <h1 class="display-4 text-white text-center mb-5">🌳 Tree Details</h1>
  
          <!-- Error Message -->
          <div v-if="error" class="alert alert-danger mb-4">{{ error }}</div>
  
          <!-- Loading State -->
          <div v-if="loading" class="text-center text-white">Loading...</div>
  
          <!-- Tree Details -->
          <div v-else-if="tree" class="card shadow-sm mx-auto" :style="tree.css_style || ''" style="max-width: 600px;">
            <img
              v-if="tree.image_url"
              :src="tree.image_url"
              :alt="tree.name"
              class="card-img-top"
              style="height: 300px; object-fit: cover;"
            />
            <div class="card-body">
              <h2 class="card-title h4">{{ tree.name }}</h2>
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
                  Average: {{ getAverageRating }}
                </p>
              </div>
              <!-- QR Code -->
              <div class="mt-3 text-center">
                <h3 class="h6">Scan or Download QR Code</h3>
                <qrcode-vue :value="getTreeUrl(tree.id)" :size="100" level="H" ref="qrcode" />
                <button
                  @click="downloadQRCode(tree.id, tree.name)"
                  class="btn btn-sm leaf-btn text-white mt-2"
                >
                  Download QR Code
                </button>
              </div>
            </div>
          </div>
          <div v-else class="alert alert-warning text-center">Tree not found.</div>
  
          <router-link to="/" class="btn leaf-btn text-white mt-4 d-block mx-auto" style="max-width: 200px;">
            Back to Home
          </router-link>
        </div>
      </div>
    </ErrorBoundary>
  </template>
  
  <script>
  import axios from 'axios';
  import ErrorBoundary from '../components/ErrorBoundary.vue';
  import QrcodeVue from 'qrcode.vue';
  
  export default {
    name: 'TreeDetails',
    components: { ErrorBoundary, QrcodeVue },
    data() {
      return {
        tree: null, // Initialize as null to handle loading state
        form: {
          student_id: '',
        },
        error: null,
        loading: true,
      };
    },
    computed: {
      getAverageRating() {
        if (!this.tree || !this.tree.ratings || !Array.isArray(this.tree.ratings) || this.tree.ratings.length === 0) {
          return 'No ratings yet';
        }
        return (this.tree.ratings.reduce((sum, r) => sum + r.rating, 0) / this.tree.ratings.length).toFixed(1);
      },
    },
    methods: {
      async fetchTree() {
        try {
          const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/trees/${this.$route.params.id}`);
          console.log('Fetched tree:', data);
          this.tree = data || {}; // Default to empty object if data is undefined
          this.error = null;
        } catch (error) {
          console.error('Error fetching tree:', error);
          this.error = 'Failed to load tree details.';
        } finally {
          this.loading = false;
        }
      },
      async handleRating(treeId, studentId, value) {
        try {
          await axios.post(`${import.meta.env.VITE_BACKEND_URL}/ratings`, {
            tree_id: treeId,
            student_id: studentId,
            rating: value,
          });
          await this.fetchTree();
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
        const qrCanvas = this.$refs.qrcode.$el.querySelector('canvas');
        const qrImage = qrCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = qrImage;
        link.download = `qr-code-${treeName.replace(/\s+/g, '-')}.png`;
        link.click();
      },
    },
    mounted() {
      this.fetchTree();
    },
  };
  </script>