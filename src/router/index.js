import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/pages/Home.vue'
import Audioboeken from '../components/pages/Audioboeken.vue'
import Genres from '../components/pages/Genres.vue'
import Posities from '../components/pages/Posities.vue'
import Reviews from '../components/pages/Reviews.vue'
import Gebruikers from '../components/pages/Gebruikers.vue'
import Audioboek from '../components/entities/Audioboek.vue'
import Genre from '../components/entities/Genre.vue'
import Positie from '../components/entities/Positie.vue'
import Review from '../components/entities/Review.vue'
import Gebruiker from '../components/entities/Gebruiker.vue'
import NotFound from '../components/pages/NotFound.vue'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: Home },
  { path: '/audiobooks', component: Audioboeken },
  { path: '/audiobooks/:slug', component: Audioboek },
  { path: '/genres', component: Genres },
  { path: '/genres/:slug', component: Genre },
  { path: '/positions', component: Posities },
  { path: '/positions/:url', component: Positie },
  { path: '/reviews', component: Reviews },
  { path: '/reviews/:url', component: Review },
  { path: '/users', component: Gebruikers },
  { path: '/users/:slug', component: Gebruiker },
  { path: '/:pathMatch(.*)*', component: NotFound },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
