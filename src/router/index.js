import ArticleDetailsView from '@/views/ArticleDetailsView.vue'
import BasketView from '@/views/BasketView.vue'
import CheckoutView from '@/views/CheckoutView.vue'
import HomeView from '@/views/HomeView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: HomeView },
    { path: '/details', name: 'ArticleDetails', component: ArticleDetailsView },
    { path: '/checkout', name: 'Checkout', component: CheckoutView },
    { path: '/cart', name: 'Basket', component: BasketView }
  ],
})

export default router
