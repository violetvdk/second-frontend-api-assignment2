<template>
  <nav id="navigation-bar">
    <div class="nav-brand">
      <button class="hamburger" @click="toggleMenu">
        ☰
      </button>
      <router-link class="brand-text" to="/home">Audiobooks API</router-link>
    </div>
    <div :class="['nav-links', { open: isMenuOpen }]">
      <router-link class="desktop-home-link" to="/home" @click="closeMenu">Home</router-link>
      <router-link to="/audiobooks" @click="closeMenu">Audioboeken</router-link>
      <router-link to="/genres" @click="closeMenu">Genres</router-link>
      <router-link to="/positions" @click="closeMenu">Posities</router-link>
      <router-link to="/reviews" @click="closeMenu">Reviews</router-link>
      <router-link to="/users" @click="closeMenu">Gebruikers</router-link>
    </div>
  </nav>

  <router-view />
</template>

<script setup>
import { ref } from 'vue'
import './App.css'

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>
