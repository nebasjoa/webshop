import ArticleDetailsView from '@/views/ArticleDetailsView.vue'
import HomeView from '@/views/HomeView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: HomeView },
    { path: '/details', name: 'ArticleDetails', component: ArticleDetailsView }
  ],
})

export default router
