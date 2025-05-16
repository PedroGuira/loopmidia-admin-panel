<template>
  <div id="admin-layout" :class="[theme, { 'sidebar-collapsed': sidebarCollapsed, 'sidebar-mobile-open': mobileSidebarOpen }]">
    <aside class="sidebar" v-if="authStore.isAuthenticated">
      <div class="sidebar-header">
        <img src="https://i.ibb.co/rG3p2449/Imagem-do-Whats-App-de-2025-05-05-s-12-58-21-3b7cfdf5.jpg" alt="Jade Logo" class="logo-img"/>
        <h1 class="admin-title" v-show="!sidebarCollapsed">Jade Admin</h1>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li @click="closeMobileSidebar"><router-link to="/" class="nav-link"><i class="fas fa-tachometer-alt"></i><span v-show="!sidebarCollapsed">Dashboard</span></router-link></li>
          <li @click="closeMobileSidebar"><router-link to="/categorias" class="nav-link"><i class="fas fa-tags"></i><span v-show="!sidebarCollapsed">Categorias</span></router-link></li>
          <li @click="closeMobileSidebar"><router-link to="/produtos" class="nav-link"><i class="fas fa-box-open"></i><span v-show="!sidebarCollapsed">Produtos</span></router-link></li>
          <li @click="closeMobileSidebar"><router-link to="/grupos-opcao" class="nav-link"><i class="fas fa-cogs"></i><span v-show="!sidebarCollapsed">Grupos de Opção</span></router-link></li>
        </ul>
      </nav>
      <div class="sidebar-footer">
        <button @click="toggleSidebar" class="btn-sidebar-action desktop-only" :title="sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'">
            <i :class="sidebarCollapsed ? 'fas fa-angle-double-right' : 'fas fa-angle-double-left'"></i>
            <span v-show="!sidebarCollapsed">Recolher Menu</span>
        </button>
      </div>
    </aside>

    <div class="main-panel">
      <header class="top-header" v-if="authStore.isAuthenticated">
        <button @click="toggleMobileSidebar" class="btn-icon btn-mobile-menu mobile-only" title="Abrir menu">
            <i :class="mobileSidebarOpen ? 'fas fa-times' : 'fas fa-bars'"></i>
        </button>
        <div class="current-view-title">{{ currentRouteName }}</div>
        
        <div class="top-header-actions">
            <button @click="toggleTheme" class="btn-icon btn-theme-toggle" :title="theme === 'theme-dark' ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'">
                <i :class="theme === 'theme-dark' ? 'fas fa-sun' : 'fas fa-moon'"></i>
            </button>
            <div class="user-menu">
                <span class="user-email-display" :title="authStore.currentUser?.email">{{ authStore.currentUser?.email.split('@')[0] }}</span>
                <button class="btn-icon btn-logout" @click="handleLogout" title="Sair">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>
        </div>
      </header>
      <main class="content-area" @click="closeMobileSidebarOnClickOutside">
        <router-view />
      </main>
    </div>
    <div class="mobile-overlay" v-if="mobileSidebarOpen && authStore.isAuthenticated" @click="toggleMobileSidebar"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from './store/authStore';
import { useRoute, useRouter } from 'vue-router';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const sidebarCollapsed = ref(localStorage.getItem('sidebarCollapsed') === 'true' || false);
const mobileSidebarOpen = ref(false);
const theme = ref(localStorage.getItem('adminTheme') || 'theme-dark');

function applyTheme(newTheme) {
  document.body.className = ''; 
  document.body.classList.add(newTheme);

  const layoutElement = document.getElementById('admin-layout');
  if (layoutElement) {
    layoutElement.className = ''; 
    layoutElement.classList.add(newTheme);
    if (sidebarCollapsed.value) layoutElement.classList.add('sidebar-collapsed');
    if (mobileSidebarOpen.value) layoutElement.classList.add('sidebar-mobile-open');
  }
}

watch(theme, (newTheme) => {
  applyTheme(newTheme);
  localStorage.setItem('adminTheme', newTheme);
}, { immediate: true });

onMounted(() => {
  console.log("App.vue onMounted: Tentando auto-login...");
  authStore.tryAutoLogin();
  if (!authStore.isAuthenticated && route.name !== 'Login' && route.meta.requiresAuth) {
      router.push('/login');
  }
});

function handleLogout() {
  authStore.logout();
  if (route.name !== 'Login') {
    router.push('/login');
  }
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
  localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value);
  applyTheme(theme.value);
}

function toggleMobileSidebar() {
  mobileSidebarOpen.value = !mobileSidebarOpen.value;
  applyTheme(theme.value);
}

function closeMobileSidebar() {
  if (mobileSidebarOpen.value) {
    mobileSidebarOpen.value = false;
    applyTheme(theme.value);
  }
}

// eslint-disable-next-line no-unused-vars
function closeMobileSidebarOnClickOutside(_event) {
  // A lógica de fechar pelo overlay é mais eficaz.
}

const currentRouteName = computed(() => {
    const titles = {
        'Dashboard': 'Painel Principal',
        'Categorias': 'Gerenciar Categorias',
        'Produtos': 'Gerenciar Produtos',
        'GruposOpcao': 'Gerenciar Grupos de Opção',
        'Login': 'Acesso ao Painel'
    };
    if (route.name === 'ItensOpcao') {
        return 'Itens de Opção'; // Título genérico no header principal
    }
    return titles[route.name] || route.name || 'Painel';
});

function toggleTheme() {
    theme.value = theme.value === 'theme-dark' ? 'theme-light' : 'theme-dark';
}
</script>

<style> /* Estilos GLOBAIS */
:root {
  --font-sans: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);

  --primary-color-val: 246, 169, 60;
  --secondary-color-val: 230, 81, 0;

  --bg-main-dark: #1a1c23; --bg-sidebar-dark: #252836; --bg-card-dark: #2f3241; --bg-header-dark: #252836;
  --text-primary-dark: #e5e7eb; --text-secondary-dark: #9ca3af; --text-on-primary-btn-dark: #111827;
  --border-color-dark: #374151; --primary-accent-dark: #f6a93c; --secondary-accent-dark: #e65100;
  --input-bg-dark: #374151; --input-border-dark: #4b5563; --input-text-dark: #e5e7eb;

  --bg-main-light: #f3f4f6; --bg-sidebar-light: #ffffff; --bg-card-light: #ffffff; --bg-header-light: #ffffff;
  --text-primary-light: #1f2937; --text-secondary-light: #6b7280; --text-on-primary-btn-light: #ffffff;
  --border-color-light: #e5e7eb; --primary-accent-light: #e65100; --secondary-accent-light: #f6a93c;
  --input-bg-light: #ffffff; --input-border-light: #d1d5db; --input-text-light: #111827;

  --success-color: #10b981; --warning-color: #f59e0b; --danger-color: #ef4444;
}

html { box-sizing: border-box; }
*, *:before, *:after { box-sizing: inherit; }

body {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color 0.2s ease-out, color 0.2s ease-out;
}
body.theme-dark { background-color: var(--bg-main-dark); color: var(--text-primary-dark); }
body.theme-light { background-color: var(--bg-main-light); color: var(--text-primary-light); }

#app { display: flex; }

#admin-layout {
  display: flex;
  width: 100%;
  min-height: 100vh;
}
#admin-layout.theme-dark { background-color: var(--bg-main-dark); }
#admin-layout.theme-light { background-color: var(--bg-main-light); }

.sidebar {
  width: 260px;
  color: var(--text-secondary);
  display: flex; flex-direction: column;
  position: fixed; left: 0; top: 0; bottom: 0;
  transition: width 0.25s ease-in-out, left 0.25s ease-in-out;
  z-index: 1001;
  box-shadow: var(--shadow-md);
}
body.theme-dark .sidebar { background-color: var(--bg-sidebar-dark); border-right: 1px solid var(--border-color-dark); }
body.theme-light .sidebar { background-color: var(--bg-sidebar-light); border-right: 1px solid var(--border-color-light); }

#admin-layout.sidebar-collapsed .sidebar { width: 70px; }
#admin-layout.sidebar-collapsed .admin-title,
#admin-layout.sidebar-collapsed .sidebar-nav span,
#admin-layout.sidebar-collapsed .btn-sidebar-action span { display: none; }

#admin-layout.sidebar-collapsed .sidebar-nav .nav-link,
#admin-layout.sidebar-collapsed .btn-sidebar-action { justify-content: center; text-align: center; }
#admin-layout.sidebar-collapsed .btn-sidebar-action i { margin-right: 0; }
#admin-layout.sidebar-collapsed .sidebar-header { padding: 1.2rem 0.5rem; justify-content: center; }

.sidebar-header {
  padding: 1.2rem 1.1rem;
  display: flex;
  align-items: center;
}
.sidebar-header .logo-img {
  width: 38px; height: 38px;
  border-radius: 50%; margin-right: 10px;
  flex-shrink: 0; object-fit: cover;
}
.sidebar-header .admin-title {
  font-size: 1.2rem; font-weight: 600;
  margin: 0; white-space: nowrap; overflow: hidden; flex-grow: 1;
}
body.theme-dark .sidebar-header .admin-title { color: var(--primary-accent-dark); }
body.theme-light .sidebar-header .admin-title { color: var(--primary-accent-light); }

.sidebar-nav { flex-grow: 1; padding-top: 0.5rem; }
.sidebar-nav ul { list-style: none; padding: 0; margin: 0; }
.sidebar-nav .nav-link {
  display: flex; align-items: center;
  padding: 0.8rem 1.5rem;
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease, border-left-color 0.2s ease;
  font-weight: 500; white-space: nowrap;
  border-left: 4px solid transparent;
}
body.theme-dark .sidebar-nav .nav-link { color: var(--text-secondary-dark); }
body.theme-light .sidebar-nav .nav-link { color: var(--text-secondary-light); }

.sidebar-nav .nav-link i {
  width: 20px; margin-right: 15px;
  font-size: 1rem; text-align: center; flex-shrink: 0;
}
body.theme-dark .sidebar-nav .nav-link:hover { background-color: rgba(var(--primary-color-val), 0.07); color: var(--primary-accent-dark); }
body.theme-light .sidebar-nav .nav-link:hover { background-color: #eef2f7; color: var(--primary-accent-light); }

.sidebar-nav .nav-link.router-link-exact-active {
  border-left-color: var(--primary-accent-dark); 
}
body.theme-dark .sidebar-nav .nav-link.router-link-exact-active { color: var(--primary-accent-dark); background-color: rgba(var(--primary-color-val), 0.1); }
body.theme-light .sidebar-nav .nav-link.router-link-exact-active { color: var(--primary-accent-light); background-color: #e0eafc; border-left-color: var(--primary-accent-light);}

.sidebar-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border-color-dark);
  margin-top: auto;
}
body.theme-light .sidebar-footer { border-top-color: var(--border-color-light); }

.btn-sidebar-action.desktop-only {
    background-color: transparent;
    color: var(--text-secondary);
    border: 1px solid transparent;
    padding: 0.7rem; border-radius: var(--border-radius-sm);
    cursor: pointer; width: 100%;
    text-align: left; display: flex; align-items: center;
    font-size: 0.9rem; font-weight: 500;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}
.btn-sidebar-action.desktop-only i { margin-right: 10px; font-size: 1.1rem; width: 20px; text-align: center; }
body.theme-dark .btn-sidebar-action.desktop-only:hover { background-color: var(--border-color-dark); color: var(--primary-accent-dark); }
body.theme-light .btn-sidebar-action.desktop-only:hover { background-color: var(--border-color-light); color: var(--primary-accent-light); }


.main-panel {
  flex-grow: 1;
  margin-left: 260px;
  transition: margin-left 0.25s ease-in-out;
  display: flex; flex-direction: column;
}
body.theme-dark .main-panel { background-color: var(--bg-main-dark); }
body.theme-light .main-panel { background-color: var(--bg-main-light); }
#admin-layout.sidebar-collapsed .main-panel { margin-left: 70px; }

.top-header {
  padding: 0.75rem 1.5rem;
  display: flex; align-items: center; justify-content: space-between;
  position: sticky; top: 0;
  z-index: 999; box-shadow: var(--shadow-sm);
}
body.theme-dark .top-header { background-color: var(--bg-header-dark); border-bottom: 1px solid var(--border-color-dark); }
body.theme-light .top-header { background-color: var(--bg-header-light); border-bottom: 1px solid var(--border-color-light); }

.btn-mobile-menu.mobile-only {
  display: none; background: none; border: none;
  font-size: 1.4rem; cursor: pointer; margin-right: 1rem; padding: 0.5rem;
}
body.theme-dark .btn-mobile-menu.mobile-only { color: var(--primary-accent-dark); }
body.theme-light .btn-mobile-menu.mobile-only { color: var(--primary-accent-light); }

.current-view-title { font-size: 1.15rem; font-weight: 600; }
body.theme-dark .current-view-title { color: var(--text-primary-dark); }
body.theme-light .current-view-title { color: var(--text-primary-light); }

.top-header-actions { display: flex; align-items: center; gap: 0.5rem; }
.btn-icon {
  background: none; border: none; font-size: 1.1rem;
  padding: 0.5rem; border-radius: 50%; width: 38px; height: 38px;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background-color 0.2s, color 0.2s;
}
body.theme-dark .btn-icon { color: var(--text-secondary-dark); }
body.theme-light .btn-icon { color: var(--text-secondary-light); }
body.theme-dark .btn-icon:hover { background-color: var(--border-color-dark); color: var(--text-primary-dark); }
body.theme-light .btn-icon:hover { background-color: #e9ecef;  color: var(--text-primary-light);}

.user-menu { display: flex; align-items: center; gap: 0.75rem; }
.user-email-display { font-size: 0.85rem; font-weight: 500; display: none; }
body.theme-dark .user-email-display { color: var(--text-secondary-dark); }
body.theme-light .user-email-display { color: var(--text-secondary-light); }

@media (min-width: 768px) { .user-email-display { display: inline; } }

.content-area { padding: 20px 25px; flex-grow: 1; overflow-y: auto; }
.mobile-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0,0,0,0.4); z-index: 1000; display: none;
}

@media (max-width: 992px) {
  .sidebar { left: -260px; box-shadow: 0 0 20px rgba(0,0,0,0.25); }
  #admin-layout.sidebar-mobile-open .sidebar { left: 0; }
  #admin-layout.sidebar-collapsed .sidebar { left: -70px; }
  #admin-layout.sidebar-collapsed.sidebar-mobile-open .sidebar { width: 260px; }
  #admin-layout.sidebar-collapsed.sidebar-mobile-open .admin-title,
  #admin-layout.sidebar-collapsed.sidebar-mobile-open .sidebar-nav span,
  #admin-layout.sidebar-collapsed.sidebar-mobile-open .btn-sidebar-action span { display: inline; }

  #admin-layout.sidebar-collapsed.sidebar-mobile-open .sidebar-nav .nav-link,
  #admin-layout.sidebar-collapsed.sidebar-mobile-open .btn-sidebar-action { justify-content: flex-start; }
  
  .main-panel { margin-left: 0 !important; }
  .btn-mobile-menu.mobile-only { display: inline-flex; }
  .sidebar-footer .desktop-only { display: none; } 
  #admin-layout.sidebar-mobile-open .mobile-overlay { display: block; }
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
}
body.theme-dark .view-header { border-bottom: 1px solid var(--border-color-dark); }
body.theme-light .view-header { border-bottom: 1px solid var(--border-color-light); }

.view-header h1 { font-size: 1.6rem; margin-bottom: 0; font-weight: 600; }
body.theme-dark .view-header h1 { color: var(--text-primary-dark); }
body.theme-light .view-header h1 { color: var(--text-primary-light); }

/* Estilos para botões, inputs, etc. que serão usados nas views */
/* Botões (reutilizável e temático) */
.btn {
  padding: 0.6rem 1.2rem; border-radius: var(--border-radius-sm);
  font-size: 0.9rem; cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  font-weight: 500; text-decoration: none; display: inline-flex;
  align-items: center; gap: 0.4rem; border: 1px solid transparent;
  line-height: 1.5; /* Para consistência de altura */
}
.btn i { font-size: 0.9em; /* Ícones um pouco menores que o texto do botão */ }

/* Botão Primário */
body.theme-dark .btn-primary { background-color: var(--primary-accent-dark); color: var(--text-on-primary-btn-dark); border-color: var(--primary-accent-dark); }
body.theme-light .btn-primary { background-color: var(--primary-accent-light); color: var(--text-on-primary-btn-light); border-color: var(--primary-accent-light); }
body.theme-dark .btn-primary:hover { background-color: var(--secondary-accent-dark); border-color: var(--secondary-accent-dark); }
body.theme-light .btn-primary:hover { background-color: var(--secondary-accent-light); border-color: var(--secondary-accent-light); }

/* Botão Secundário/Outline */
body.theme-dark .btn-secondary { background-color: transparent; color: var(--primary-accent-dark); border-color: var(--primary-accent-dark); }
body.theme-light .btn-secondary { background-color: transparent; color: var(--primary-accent-light); border-color: var(--primary-accent-light); }
body.theme-dark .btn-secondary:hover { background-color: rgba(var(--primary-color-val), 0.1); }
body.theme-light .btn-secondary:hover { background-color: rgba(var(--secondary-color-val), 0.1); } /* Usando o accent secundário para hover no tema claro */

/* Botão Warning */
.btn-warning { background-color: var(--warning-color); color: #fff; border:none; }
.btn-warning:hover { filter: brightness(90%); }

/* Botão Danger */
.btn-danger { background-color: var(--danger-color); color: #fff; border:none; }
.btn-danger:hover { filter: brightness(90%); }


/* Inputs, Selects, Textareas */
input[type="text"], input[type="number"], input[type="email"], input[type="password"],
textarea, select {
  width: 100%;
  padding: 0.65rem 0.9rem; /* Ajustado */
  border: 1px solid;
  border-radius: var(--border-radius-sm);
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
body.theme-dark input, body.theme-dark textarea, body.theme-dark select {
  background-color: var(--input-bg-dark); color: var(--input-text-dark); border-color: var(--input-border-dark);
}
body.theme-light input, body.theme-light textarea, body.theme-light select {
  background-color: var(--input-bg-light); color: var(--input-text-light); border-color: var(--input-border-light);
}

body.theme-dark input:focus, body.theme-dark textarea:focus, body.theme-dark select:focus {
  outline: none; border-color: var(--primary-accent-dark); box-shadow: 0 0 0 2px rgba(var(--primary-color-val), 0.3);
}
body.theme-light input:focus, body.theme-light textarea:focus, body.theme-light select:focus {
  outline: none; border-color: var(--primary-accent-light); box-shadow: 0 0 0 2px rgba(var(--secondary-color-val), 0.3); /* Usando o laranja mais escuro para foco no tema claro */
}

.form-group { margin-bottom: 1.2rem; }
.form-group label { font-weight: 500; font-size: 0.9rem; display: block; margin-bottom: 0.4rem; }
body.theme-dark .form-group label { color: var(--text-secondary-dark); }
body.theme-light .form-group label { color: var(--text-secondary-light); }

.checkbox-group { display: flex; align-items: center; gap: 0.5rem; }
.checkbox-group input[type="checkbox"] {
    width: auto; height: 18px; width: 18px; margin: 0;
}
body.theme-dark .checkbox-group input[type="checkbox"] { accent-color: var(--primary-accent-dark); }
body.theme-light .checkbox-group input[type="checkbox"] { accent-color: var(--primary-accent-light); }
.checkbox-group .checkbox-label { font-weight: normal; margin-bottom: 0; }

.loading-spinner, .error-message.form-error, .empty-state {
  padding: 1rem;
  border-radius: var(--border-radius-md);
  margin: 1rem 0;
  text-align: center;
}

.error-message.form-error {
    background-color: rgba(var(--danger-color), 0.1);
    color: var(--danger-color);
    border: 1px solid rgba(var(--danger-color), 0.3);
    font-size: 0.9em;
}
.empty-state { font-style: italic; }
body.theme-dark .empty-state { color: var(--text-secondary-dark); }
body.theme-light .empty-state { color: var(--text-secondary-light); }
</style>