// src/store/itemOpcaoStore.js
import { defineStore } from 'pinia';
import itemOpcaoService from '../services/itemOpcaoService';
// Não precisamos do authStore aqui diretamente, pois o estabelecimentoId é validado no backend
// e o grupoOpcaoId vem como parâmetro.

export const useItemOpcaoStore = defineStore('itemOpcao', {
  state: () => ({
    itensOpcao: [], // Itens do grupo de opção atualmente selecionado/visualizado
    itemOpcaoAtual: null,
    grupoOpcaoIdAtual: null, // Para saber de qual grupo são os itens
    loading: false,
    error: null,
  }),
  actions: {
    async fetchItensPorGrupo(grupoOpcaoId) {
      if (!grupoOpcaoId) {
        this.itensOpcao = [];
        this.grupoOpcaoIdAtual = null;
        return;
      }
      this.loading = true;
      this.error = null;
      this.grupoOpcaoIdAtual = grupoOpcaoId;
      try {
        this.itensOpcao = await itemOpcaoService.getAllByGrupo(grupoOpcaoId);
        if (!Array.isArray(this.itensOpcao)) {
            this.itensOpcao = [];
        }
      } catch (err) {
        this.error = err.message || `Erro ao buscar itens para o grupo ${grupoOpcaoId}.`;
        this.itensOpcao = [];
      } finally {
        this.loading = false;
      }
    },
    async criarItemOpcao(grupoOpcaoId, novoItemData) {
      this.loading = true;
      this.error = null;
      try {
        // O DTO no backend (ItemOpcaoCriarDto) não precisa de grupoOpcaoId ou estabelecimentoId no corpo,
        // pois eles vêm da rota e do token, respectivamente.
        const payload = { ...novoItemData };
        const itemCriado = await itemOpcaoService.create(grupoOpcaoId, payload);
        // Adiciona à lista local ou recarrega
        await this.fetchItensPorGrupo(grupoOpcaoId);
        return itemCriado;
      } catch (err) {
        this.error = err.response?.data?.errors || err.response?.data?.message || err.response?.data || err.message || 'Erro ao criar item de opção.';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async atualizarItemOpcao(grupoOpcaoId, itemId, itemAtualizadoData) {
      this.loading = true;
      this.error = null;
      try {
        const payload = { ...itemAtualizadoData };
        await itemOpcaoService.update(grupoOpcaoId, itemId, payload);
        await this.fetchItensPorGrupo(grupoOpcaoId);
        this.itemOpcaoAtual = null;
        return true;
      } catch (err) {
        this.error = err.response?.data?.errors || err.response?.data?.message || err.response?.data || err.message || 'Erro ao atualizar item de opção.';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async deletarItemOpcao(grupoOpcaoId, itemId) {
      this.loading = true;
      this.error = null;
      try {
        await itemOpcaoService.delete(grupoOpcaoId, itemId);
        await this.fetchItensPorGrupo(grupoOpcaoId);
        return true;
      } catch (err) {
        this.error = err.message || 'Erro ao deletar item de opção.';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    selecionarItemParaEdicao(item) {
        this.itemOpcaoAtual = item ? { ...item } : null;
    },
    limparItemAtual() {
        this.itemOpcaoAtual = null;
    },
    // Limpa o store quando o usuário navega para fora da tela de itens de um grupo específico
    resetStore() {
        this.itensOpcao = [];
        this.itemOpcaoAtual = null;
        this.grupoOpcaoIdAtual = null;
        this.loading = false;
        this.error = null;
    }
  },
});