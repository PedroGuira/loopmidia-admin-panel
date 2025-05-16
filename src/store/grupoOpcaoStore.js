// src/store/grupoOpcaoStore.js
import { defineStore } from 'pinia';
import grupoOpcaoService from '../services/grupoOpcaoService';
import { useAuthStore } from './authStore'; // Para pegar o estabelecimentoId ao criar/atualizar

export const useGrupoOpcaoStore = defineStore('grupoOpcao', {
  state: () => ({
    gruposOpcao: [],
    grupoOpcaoAtual: null, // Para edição
    loading: false,
    error: null,
  }),
  actions: {
    _getEstabelecimentoIdFromAuth() {
        const auth = useAuthStore();
        if (!auth.isAuthenticated || !auth.getEstabelecimentoId) {
            console.error("[GrupoOpcaoStore] Usuário não autenticado ou estabelecimentoId não disponível.");
            return null;
        }
        return auth.getEstabelecimentoId;
    },
    async fetchGruposOpcao() {
      this.loading = true;
      this.error = null;
      try {
        this.gruposOpcao = await grupoOpcaoService.getAll();
        if (!Array.isArray(this.gruposOpcao)) {
            this.gruposOpcao = [];
        }
      } catch (err) {
        this.error = err.message || 'Erro ao buscar grupos de opção.';
        this.gruposOpcao = [];
      } finally {
        this.loading = false;
      }
    },
    async criarGrupoOpcao(novoGrupoData) { // ex: { nome, descricao, minSelecoes, maxSelecoes, ordemExibicao }
      this.loading = true;
      this.error = null;
      try {
        const estId = this._getEstabelecimentoIdFromAuth();
        if (estId === null) throw new Error("ID do estabelecimento não disponível.");

        // O DTO no backend (GrupoOpcaoCriarDto) tem EstabelecimentoId,
        // e o controller usa o do token para preenchê-lo no service.
        // Então, o payload do frontend não precisa mais enviar explicitamente,
        // A MENOS que o DTO da API ainda o exija.
        // Vamos assumir que o controller API preenche o estId no service.
        const payload = { ...novoGrupoData };
        // Se o seu GrupoOpcaoCriarDto no backend AINDA tem EstabelecimentoId:
        // const payload = { ...novoGrupoData, estabelecimentoId: estId };

        const grupoCriado = await grupoOpcaoService.create(payload);
        await this.fetchGruposOpcao(); // Recarrega a lista
        return grupoCriado;
      } catch (err) {
        this.error = err.response?.data?.errors || err.response?.data?.message || err.response?.data || err.message || 'Erro ao criar grupo de opção.';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async atualizarGrupoOpcao(id, grupoAtualizadoData) {
      this.loading = true;
      this.error = null;
      try {
        const estId = this._getEstabelecimentoIdFromAuth();
        if (estId === null) throw new Error("ID do estabelecimento não disponível.");
        
        const payload = { ...grupoAtualizadoData };
        // Se o DTO da API ainda tem EstabelecimentoId:
        // const payload = { ...grupoAtualizadoData, estabelecimentoId: estId };

        await grupoOpcaoService.update(id, payload);
        await this.fetchGruposOpcao();
        this.grupoOpcaoAtual = null;
        return true;
      } catch (err) {
        this.error = err.response?.data?.errors || err.response?.data?.message || err.response?.data || err.message || 'Erro ao atualizar grupo de opção.';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async deletarGrupoOpcao(id) {
      this.loading = true;
      this.error = null;
      try {
        await grupoOpcaoService.delete(id);
        await this.fetchGruposOpcao();
        return true;
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Erro ao deletar grupo de opção. Verifique se ele não está associado a categorias.';
        // Armazena o erro para ser exibido na view
        // Poderia ser mais específico se a API retornar um código/mensagem para "em uso"
        this.fetchGruposOpcao(); // Recarrega para refletir o estado atual
        throw err;
      } finally {
        this.loading = false;
      }
    },
    selecionarParaEdicao(grupo) {
        this.grupoOpcaoAtual = grupo ? { ...grupo } : null;
    },
    limparSelecaoAtual() {
        this.grupoOpcaoAtual = null;
    }
  },
});