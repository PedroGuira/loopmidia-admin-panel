// src/store/categoriaStore.js
import { defineStore } from 'pinia';
import categoriaService from '../services/categoriaService';
import { useAuthStore } from './authStore';

export const useCategoriaStore = defineStore('categoria', {
  state: () => ({
    categorias: [],
    categoriaAtual: null,
    loading: false,
    error: null,
  }),
  actions: {
    _getEstabelecimentoIdFromAuth() {
      const auth = useAuthStore(); // Sempre obtenha a instância mais recente do store
      console.log("[Store] _getEstabelecimentoIdFromAuth: Autenticado?", auth.isAuthenticated, "EstID:", auth.getEstabelecimentoId);
      if (!auth.isAuthenticated || !auth.getEstabelecimentoId) { // auth.getEstabelecimentoId é um getter, então é auth.getEstabelecimentoId e não auth.getEstabelecimentoId()
          console.error("[Store] Usuário não autenticado ou estabelecimentoId não disponível.");
          return null; 
      }
      return auth.getEstabelecimentoId; // Retorna o valor do getter
  },
    async fetchCategorias() {
      console.log("CategoriaStore: Iniciando fetchCategorias...");
      this.loading = true;
      this.error = null;
      try {
        this.categorias = await categoriaService.getAll();
        if (!Array.isArray(this.categorias)) this.categorias = [];
        console.log("CategoriaStore: Categorias buscadas:", this.categorias.length);
      } catch (err) {
        console.error("CategoriaStore: Erro em fetchCategorias:", err);
        this.error = err.message || 'Erro ao buscar categorias.';
        this.categorias = [];
      } finally {
        this.loading = false;
        console.log("CategoriaStore: fetchCategorias finalizado.");
      }
    },
    async criarCategoria(novaCategoriaData) {
      console.log("CategoriaStore: Iniciando criarCategoria...", novaCategoriaData);
      this.loading = true;
      this.error = null;
      try {
        const estId = this._getEstabelecimentoIdFromAuth();
        if (estId === null) throw new Error("ID do estabelecimento não disponível para criar categoria.");

        const payload = {
          ...novaCategoriaData, // nome, ordemExibicao, grupoOpcaoIds
          estabelecimentoId: estId // Adicionado pelo store para o DTO da API
        };
        console.log("CategoriaStore: Payload para API (criarCategoria):", payload);
        const categoriaCriada = await categoriaService.create(payload);
        console.log("CategoriaStore: categoriaService.create chamado, resposta:", categoriaCriada);
        await this.fetchCategorias();
        return categoriaCriada;
      } catch (err) {
        console.error("CategoriaStore: Erro em criarCategoria:", err);
        this.error = err.response?.data?.errors || err.response?.data?.message || err.response?.data || err.message || 'Erro ao criar categoria.';
        throw err;
      } finally {
        this.loading = false;
        console.log("CategoriaStore: criarCategoria finalizado.");
      }
    },
    async atualizarCategoria(id, categoriaAtualizadaData) {
      console.log(`CategoriaStore: Iniciando atualizarCategoria para ID ${id}...`, categoriaAtualizadaData);
      this.loading = true;
      this.error = null;
      try {
        const estId = this._getEstabelecimentoIdFromAuth();
        if (estId === null) throw new Error("ID do estabelecimento não disponível para atualizar categoria.");

        const payload = {
          ...categoriaAtualizadaData,
          estabelecimentoId: estId
        };
        console.log("CategoriaStore: Payload para API (atualizarCategoria):", payload);
        await categoriaService.update(id, payload);
        console.log("CategoriaStore: categoriaService.update chamado.");
        await this.fetchCategorias();
        this.categoriaAtual = null;
        return true;
      } catch (err) {
        console.error(`CategoriaStore: Erro em atualizarCategoria para ID ${id}:`, err);
        this.error = err.response?.data?.errors || err.response?.data?.message || err.response?.data ||  err.message || 'Erro ao atualizar categoria.';
        throw err;
      } finally {
        this.loading = false;
        console.log(`CategoriaStore: atualizarCategoria para ID ${id} finalizado.`);
      }
    },
    async deletarCategoria(id) {
      console.log(`CategoriaStore: Iniciando deletarCategoria para ID ${id}...`);
      this.loading = true;
      this.error = null;
      try {
        await categoriaService.delete(id);
        console.log("CategoriaStore: categoriaService.delete chamado.");
        await this.fetchCategorias();
        return true;
      } catch (err) {
        console.error(`CategoriaStore: Erro em deletarCategoria para ID ${id}:`, err);
        this.error = err.message || 'Erro ao deletar categoria.';
        throw err;
      } finally {
        this.loading = false;
        console.log(`CategoriaStore: deletarCategoria para ID ${id} finalizado.`);
      }
    },
    selecionarParaEdicao(categoria) { // Renomeado para evitar conflito de nome com a action de produto
        this.categoriaAtual = categoria ? { ...categoria } : null;
    },
    limparSelecaoAtual() { // Renomeado
        this.categoriaAtual = null;
    }
  },
});