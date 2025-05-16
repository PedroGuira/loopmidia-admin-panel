// src/services/apiService.js
import axios from 'axios';
// Não vamos importar o router aqui por enquanto para simplificar
// e evitar potenciais problemas de dependência cíclica com o interceptor de resposta.
// O logout será gerenciado pelo authStore e navigation guards.

const apiClient = axios.create({
  baseURL: 'https://localhost:7075/api', // *** CONFIRME SUA PORTA DA API AQUI ***
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Requisição para adicionar o token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user-token'); // Pega o token do localStorage
    
    // Adiciona um log para cada requisição interceptada
    console.log(`[apiService Interceptor] Preparando requisição para: ${config.url}`);

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log("[apiService Interceptor] Token encontrado e header Authorization configurado.");
      // Para depuração, você pode logar o token, mas CUIDADO para não expor em produção:
      // console.log("[apiService Interceptor] Token: ", token);
    } else {
      console.warn("[apiService Interceptor] Nenhum token no localStorage para adicionar ao header da requisição para:", config.url);
    }
    return config;
  },
  (error) => {
    // Erros que acontecem ANTES da requisição ser enviada (raro)
    console.error("[apiService Interceptor] Erro na configuração da requisição:", error);
    return Promise.reject(error);
  }
);

// Opcional: Interceptor de Resposta para erros globais (como 401)
// Por enquanto, vamos manter simples e focar no envio correto do token.
// Se o erro 401 persistir MESMO COM O TOKEN SENDO ENVIADO, o problema é no backend.
/*
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.warn("[apiService Interceptor de Resposta] Erro 401 recebido da API.");
      // Aqui, uma ação global de logout poderia ser disparada,
      // mas é preciso cuidado para não criar loops ou dependências indesejadas.
      // O authStore.logout() já trata o redirecionamento.
      // const authStore = useAuthStore(); // Cuidado com a importação aqui
      // if (authStore.isAuthenticated) {
      //   authStore.logout();
      // }
    }
    return Promise.reject(error);
  }
);
*/

export default apiClient;