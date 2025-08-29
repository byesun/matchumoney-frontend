import HomePage from '@/modules/home/pages/HomePage.vue'

export const homeRoutes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: { requiresAuth: false }
  }
]