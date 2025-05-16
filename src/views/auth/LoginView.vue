<template>
    <div class="login-page-wrapper"> <!-- Este wrapper centraliza tudo na tela -->
      <div class="login-card-container"> <!-- Este é o "quadrado" / card -->
        <img 
          src="https://i.ibb.co/rG3p2449/Imagem-do-Whats-App-de-2025-05-05-s-12-58-21-3b7cfdf5.jpg" 
          alt="Jade Logo" 
          class="login-logo"
        />
        <h2 class="login-title">Painel Administrativo</h2>
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="email" required placeholder="seuemail@exemplo.com" />
          </div>
          <div class="form-group">
            <label for="password">Senha:</label>
            <input type="password" id="password" v-model="password" required placeholder="Sua senha" />
          </div>
          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
          <button type="submit" class="btn-login" :disabled="loading">
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
      </div>
      <!-- O copyright pode ficar fora do card, se preferir, ou dentro. Vou deixar fora por enquanto. -->
      <p class="copyright-text-login">Copyright © {{ new Date().getFullYear() }} Jade Soluções Digitais</p>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../../store/authStore';
  
  const email = ref('');
  const password = ref('');
  const errorMessage = ref('');
  const loading = ref(false);
  
  const router = useRouter();
  const authStore = useAuthStore();
  
  async function handleLogin() {
    loading.value = true;
    errorMessage.value = '';
    try {
      await authStore.login({ email: email.value, password: password.value });
      router.push('/'); 
    } catch (error) {
      errorMessage.value = error.message || 'Falha no login. Verifique suas credenciais.';
      console.error('Erro no login:', error);
    } finally {
      loading.value = false;
    }
  }
  </script>
  
  <style scoped>
  .login-page-wrapper {
    display: flex;
    flex-direction: column; /* Para alinhar o copyright abaixo do card */
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    width: 100%;
    padding: 20px;
    /* A cor de fundo principal da página virá do body (var(--bg-main-dark) ou var(--bg-main-light)) */
  }
  
  .login-card-container {
    /* Este é o "quadrado" que você queria */
    background-color: var(--bg-card); /* Cor do card baseada no tema */
    padding: 2.5rem 2rem; /* Padding interno do card */
    border-radius: var(--border-radius-md); /* Bordas arredondadas do card */
    box-shadow: var(--shadow-md); /* Sombra do card */
    width: 100%;
    max-width: 400px; /* Largura do card de login */
    text-align: center;
    color: var(--text-primary); /* Cor do texto dentro do card, baseada no tema */
  }
  
  .login-logo {
    max-width: 100px;
    height: 100px;
    border-radius: 50%;
    margin-bottom: 1.5rem;
    object-fit: cover;
    /* A borda pode ser opcional ou usar var(--border-color) */
    /* border: 3px solid var(--primary-accent-dark); */
  }
  
  .login-title { /* Renomeado de login-box h2 para evitar conflito se houver h2 global */
    margin-bottom: 2rem;
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--primary-accent); /* Usa a cor de destaque do tema */
  }
  
  .login-form .form-group { /* Namespace para evitar conflito com .form-group global */
    margin-bottom: 1.2rem;
    text-align: left;
  }
  
  .login-form .form-group label {
    display: block;
    margin-bottom: 0.4rem;
    font-weight: 500;
    font-size: 0.9rem;
    color: var(--text-secondary); /* Cor secundária do texto do tema */
  }
  
  /* Inputs herdam estilos globais de App.vue (input[type="email"], input[type="password"]) */
  /* Se precisar de sobrescrita específica para o login: */

  .btn-login { /* Este botão usa as classes .btn .btn-primary globais */
    width: 100%;
    margin-top: 1rem; /* Espaço acima do botão */
    padding-top: 0.8rem;
    padding-bottom: 0.8rem;
    font-size: 1rem;
    /* A cor e o hover vêm das classes .btn e .btn-primary globais */
  }
  
  .error-message { /* Estilo do erro */
    color: var(--danger-color);
    background-color: rgba(239, 68, 68, 0.1); /* Adapta para o erro ser sutil */
    border: 1px solid rgba(var(--danger-color), 0.3); /* Adapta */
    padding: 0.75rem;
    border-radius: var(--border-radius-sm);
    margin-bottom: 1rem;
    font-size: 0.85rem;
    text-align: left;
  }
  
  .copyright-text-login { /* Classe específica para o copyright do login */
    margin-top: 2rem; /* Espaço entre o card e o copyright */
    font-size: 0.8rem;
    text-align: center;
    color: var(--text-secondary); /* Cor secundária do texto do tema */
  }
  </style>