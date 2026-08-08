import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import router from './router'
import { onUnauthorized } from './services/apiClient'
import { useAuthStore } from './stores/auth.store'
import 'vue-sonner/style.css'
import './assets/styles/main.css'

const pinia = createPinia()
setActivePinia(pinia)

// Instantiating the store wires the token provider into the API client and
// hydrates the session from localStorage.
const auth = useAuthStore()

onUnauthorized(() => {
  auth.clear()
  if (router.currentRoute.value.name !== 'login') {
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
  }
})

createApp(App).use(pinia).use(router).use(VueQueryPlugin).mount('#app')
