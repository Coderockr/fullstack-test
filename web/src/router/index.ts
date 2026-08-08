import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/auth/LoginPage.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/pages/auth/RegisterPage.vue'),
    meta: { guestOnly: true },
  },
  { path: '/', redirect: { name: 'investments' } },
  {
    path: '/investments',
    name: 'investments',
    component: () => import('@/pages/InvestmentListPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/investments/new',
    name: 'investments.new',
    component: () => import('@/pages/CreateInvestmentPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/investments/:id',
    name: 'investments.show',
    component: () => import('@/pages/InvestmentDetailPage.vue'),
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notfound',
    component: () => import('@/pages/NotFoundPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'investments' }
  }

  return true
})

export default router
