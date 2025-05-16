// src/store/authStore.js
import { defineStore } from 'pinia';
import apiClient from '../services/apiService'; // Importa o apiClient com interceptor
import router from '../router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('user-token') || null,
    user: JSON.parse(localStorage.getItem('user-data')) || null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user, // Adiciona checagem de user
    currentUser: (state) => state.user,
    getEstabelecimentoId: (state) => state.user?.estabelecimentoId || null,
    getUserRole: (state) => state.user?.role || null,
    getMarcaFranquiaId: (state) => state.user?.marcaFranquiaId || null,
  },
  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        // ... (bloco try como antes) ...
        const response = await apiClient.post('/auth/login', credentials);
        const { token, expiration, userId, email, nomeCompleto, estabelecimentoId, marcaFranquiaId, role } = response.data;
        if (!token) { throw new Error("Token não recebido da API."); }
        this.token = token;
        this.user = { id: userId, email, nomeCompleto, estabelecimentoId, marcaFranquiaId, expiration, role };
        localStorage.setItem('user-token', token);
        localStorage.setItem('user-data', JSON.stringify(this.user));
        console.log("AuthStore: Login bem-sucedido. Usuário e token armazenados.");
        return response.data;

      } catch (err) {
        console.error("AuthStore: Erro detalhado no login:", err);
        this.token = null;
        this.user = null;
        localStorage.removeItem('user-token');
        localStorage.removeItem('user-data');
        
        let errorMessage = 'Falha no login. Verifique suas credenciais ou tente novamente mais tarde.';
        if (err.response && err.response.data) {
            if (err.response.data.message) {
                errorMessage = err.response.data.message;
            } else if (typeof err.response.data === 'string' && err.response.data.length > 0) {
                errorMessage = err.response.data; // Se a API retorna apenas uma string de erro
            } else if (err.response.data.title) { // Para erros de validação do ASP.NET padrão
                errorMessage = err.response.data.title;
            }
        } else if (err.message) {
             errorMessage = err.message;
        }
        
        this.error = errorMessage;
        console.error("AuthStore: Erro final de login no store:", this.error);
        throw new Error(this.error); // Esta seria a linha 44 ou próxima (se o try/catch começar mais cedo)
      } finally {
        this.loading = false;
      }
    },
    logout() {
      console.log("AuthStore: Executando logout.");
      this.token = null; this.user = null;
      localStorage.removeItem('user-token'); localStorage.removeItem('user-data');
      // NÃO PRECISA MAIS: delete apiClient.defaults.headers.common['Authorization'];
      if (router.currentRoute.value.name !== 'Login') {
        router.push('/login');
      }
    },
    tryAutoLogin() {
      console.log("AuthStore: Tentando auto-login...");
      const token = localStorage.getItem('user-token');
      if (!token) { console.log("AuthStore: Nenhum token para auto-login."); return false; }

      const userDataString = localStorage.getItem('user-data');
      if (!userDataString) { this.logout(); return false; }
      
      const user = JSON.parse(userDataString);
      // Opcional: Verificar expiração real do token JWT decodificando-o
      // ou confiar na verificação do backend e no interceptor de resposta para 401.

      this.token = token;
      this.user = user;
      // NÃO PRECISA MAIS: apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log("AuthStore: Auto login processado. Estado atualizado. Token:", !!this.token, "Usuário:", this.user?.email);
      return true;
    }
  },
});