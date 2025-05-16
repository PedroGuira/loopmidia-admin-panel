import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia() // Criar instância do Pinia

app.use(pinia) // Usar Pinia
app.use(router)
app.mount('#app')