import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import SignUpView from '../views/SignUpView.vue'
import HomeView from '../views/HomeView.vue'
import { useAuth } from '../composables/useAuth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignUpView,
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const auth = useAuth()

  if (to.meta.requiresAuth && !auth.isAuthenticated.value) {
    next({ name: 'login' })
    return
  }

  if ((to.name === 'login' || to.name === 'signup') && auth.isAuthenticated.value) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
