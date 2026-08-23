<script setup lang="ts">
import backgroundImage from './assets/background-budget.jpg'
</script>

<template>
  <div class="app-container" :style="{ backgroundImage: `linear-gradient(135deg, rgba(79, 70, 229, 0.8), rgba(15, 23, 42, 0.8)), url('${backgroundImage}')` }">
    <router-view />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
}
</style>
