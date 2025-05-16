// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import CategoriasView from '../views/admin/CategoriasView.vue';
import ProdutosView from '../views/admin/ProdutosView.vue';
import LoginView from '../views/auth/LoginView.vue'; // Importar LoginView
import { useAuthStore } from '../store/authStore'; // Para o guard
import GruposOpcaoView from '../views/admin/GruposOpcaoView.vue'; 
import ItensOpcaoView from '../views/admin/ItensOpcaoView.vue'; 

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true } // Para redirecionar se já estiver logado
  },
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true } // Esta rota requer autenticação
  },
  {
    path: '/categorias',
    name: 'Categorias',
    component: CategoriasView,
    meta: { requiresAuth: true }
  },
  {
    path: '/produtos',
    name: 'Produtos',
    component: ProdutosView,
    meta: { requiresAuth: true }
  },
  {
    path: '/grupos-opcao', // Ou o nome que preferir, ex: /opcoes
    name: 'GruposOpcao',
    component: GruposOpcaoView,
    meta: { requiresAuth: true, title: 'Grupos de Opção' } // Adiciona título para o header
  },
  {
    path: '/grupos-opcao/:grupoId/itens', // Rota aninhada
    name: 'ItensOpcao',
    component: ItensOpcaoView,
    props: true, // Permite que o :grupoId seja passado como prop para o componente
    meta: { requiresAuth: true, title: 'Gerenciar Itens de Opção' }
  },
  // Rota de fallback para URLs não encontradas (opcional)
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});


router.beforeEach(async (to, from, next) => { // Adicionado async
  const authStore = useAuthStore();
  console.log(`Router Guard: Navegando de ${from.name} para ${to.name}. Autenticado inicialmente: ${authStore.isAuthenticated}`);

  // Tenta carregar o usuário do localStorage se o estado do Pinia ainda não foi inicializado
  // e o token existe no localStorage.
  if (!authStore.token && localStorage.getItem('user-token')) {
    console.log("Router Guard: Token no localStorage, tentando auto-login...");
    await authStore.tryAutoLogin(); // Espera o tryAutoLogin concluir
    console.log(`Router Guard: Autenticado após tryAutoLogin: ${authStore.isAuthenticated}`);
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  if (requiresAuth && !authStore.isAuthenticated) {
    console.log("Router Guard: Rota requer autenticação, usuário não logado. Redirecionando para /login.");
    next({ name: 'Login', query: { redirect: to.fullPath } }); // Salva a rota de destino
  } else if (requiresGuest && authStore.isAuthenticated) {
    console.log("Router Guard: Rota é para convidados, usuário logado. Redirecionando para /.");
    next('/');
  } else {
    console.log("Router Guard: Permitindo navegação.");
    next();
  }
});

export default router;