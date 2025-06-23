<template>
    <div v-if="hasError" class="p-4 text-danger">
      <h1>Something went wrong.</h1>
      <p>{{ errorMessage || 'Unknown error' }}</p>
    </div>
    <slot v-else />
  </template>
  
  <script>
  export default {
    name: 'ErrorBoundary',
    data() {
      return {
        hasError: false,
        errorMessage: null,
      };
    },
    errorCaptured(err) {
      this.hasError = true;
      this.errorMessage = err.message;
      return false;
    },
  };
  </script>