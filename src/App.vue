<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import "./App.css";

const isMenuOpen = ref(false);
const route = useRoute();

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  isMenuOpen.value = false;
}

watch(
  () => route.fullPath,
  () => {
    closeMenu();
  }
);
</script>

<template>
  <nav id="navigation-bar">
    <div class="nav-brand">
      <button class="hamburger" type="button" @click="toggleMenu">☰</button>
      <RouterLink class="brand-text" to="/home">Audiobooks API</RouterLink>
    </div>

    <div class="nav-links" :class="{ open: isMenuOpen }">
      <RouterLink class="desktop-home-link" to="/home" @click="closeMenu">Home</RouterLink>
      <RouterLink to="/audiobooks" @click="closeMenu">Audioboeken</RouterLink>
      <RouterLink to="/genres" @click="closeMenu">Genres</RouterLink>
      <RouterLink to="/positions" @click="closeMenu">Posities</RouterLink>
      <RouterLink to="/reviews" @click="closeMenu">Reviews</RouterLink>
      <RouterLink to="/users" @click="closeMenu">Gebruikers</RouterLink>
    </div>
  </nav>

  <RouterView />
</template>

