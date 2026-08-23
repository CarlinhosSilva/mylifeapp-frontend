import { createApp } from 'vue'
import PrimeVue from 'primevue/config';
import 'primeicons/primeicons.css'
import Aura from '@primeuix/themes/aura'

import 'primeicons/primeicons.css'
import router from './router'
import './style.css'
import App from './App.vue'

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false
    }
  }
})
app.mount('#app')
