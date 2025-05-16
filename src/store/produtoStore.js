// src/store/produtoStore.js
import { defineStore } from 'pinia';
import produtoService from '../services/produtoService';
import { useAuthStore } from './authStore';

export const useProdutoStore = defineStore('produto', {
  state: () => ({
    produtos: [],
    produtoAtual: null,
    loading: false,
    error: null,
  }),
  actions: {
    _getEstabelecimentoIdFromAuth() {
        const auth = useAuthStore();
        if (!auth.isAuthenticated || !auth.getEstabelecimentoId) {
            console.error("[ProdutoStore] Usuário não autenticado ou estabelecimentoId não disponível.");
            return null;
        }
        return auth.getEstabelecimentoId;
    },
    async fetchProdutos(categoriaId = null) {
      console.log("ProdutoStore: Iniciando fetchProdutos, categoriaId:", categoriaId);
      this.loading = true;
      this.error = null;
      try {
        this.produtos = await produtoService.getAll(categoriaId);
        if (!Array.isArray(this.produtos)) {
            console.warn("ProdutoStore: produtoService.getAll não retornou um array. Definindo para array vazio.");
            this.produtos = [];
        }
        console.log("ProdutoStore: Produtos buscados:", this.produtos.length);
      } catch (err) {
        console.error("ProdutoStore: Erro em fetchProdutos:", err);
        this.error = err.message || 'Erro ao buscar produtos.';
        this.produtos = [];
      } finally {
        this.loading = false;
        console.log("ProdutoStore: fetchProdutos finalizado.");
      }
    },
    async criarProduto(novoProdutoData) {
      console.log("ProdutoStore: Iniciando criarProduto...", novoProdutoData);
      this.loading = true;
      this.error = null;
      try {
        const estId = this._getEstabelecimentoIdFromAuth();
        if (estId === null) throw new Error("ID do estabelecimento não disponível para criar produto.");

        const payloadParaApi = {
            ...novoProdutoData, // nome, descricao, preco, imagemUrl, disponivel, categoriaId
            estabelecimentoId: estId // Adicionado pelo store para o DTO da API
        };
        console.log("ProdutoStore: Payload para API (criarProduto):", payloadParaApi);

        const produtoCriado = await produtoService.create(payloadParaApi);
        console.log("ProdutoStore: produtoService.create chamado, resposta:", produtoCriado);
        await this.fetchProdutos(novoProdutoData.categoriaId || null);
        return produtoCriado;
      } catch (err) {
        console.error("ProdutoStore: Erro em criarProduto:", err);
        this.error = err.response?.data?.errors || err.response?.data?.message || err.response?.data || err.message || 'Erro ao criar produto.';
        throw err;
      } finally {
        this.loading = false;
        console.log("ProdutoStore: criarProduto finalizado.");
      }
    },
    async atualizarProduto(id, produtoAtualizadoData) {
      console.log(`ProdutoStore: Iniciando atualizarProduto para ID ${id}...`, produtoAtualizadoData);
      this.loading = true;
      this.error = null;
      try {
        const estId = this._getEstabelecimentoIdFromAuth();
        if (estId === null) throw new Error("ID do estabelecimento não disponível para atualizar produto.");

        const payloadParaApi = {
            ...produtoAtualizadoData,
            estabelecimentoId: estId
        };
        console.log("ProdutoStore: Payload para API (atualizarProduto):", payloadParaApi);

        await produtoService.update(id, payloadParaApi);
        console.log("ProdutoStore: produtoService.update chamado.");
        await this.fetchProdutos(produtoAtualizadoData.categoriaId || null);
        this.produtoAtual = null;
        return true;
      } catch (err) {
        console.error(`ProdutoStore: Erro em atualizarProduto para ID ${id}:`, err);
        this.error = err.response?.data?.errors || err.response?.data?.message || err.response?.data || err.message || 'Erro ao atualizar produto.';
        throw err;
      } finally {
        this.loading = false;
        console.log(`ProdutoStore: atualizarProduto para ID ${id} finalizado.`);
      }
    },
    async deletarProduto(id) {
      console.log(`ProdutoStore: Iniciando deletarProduto para ID ${id}...`);
      this.loading = true;
      this.error = null;
      try {
        await produtoService.delete(id);
        console.log("ProdutoStore: produtoService.delete chamado.");
        await this.fetchProdutos();
        return true;
      } catch (err) {
        console.error(`ProdutoStore: Erro em deletarProduto para ID ${id}:`, err);
        this.error = err.message || 'Erro ao deletar produto.';
        throw err;
      } finally {
        this.loading = false;
        console.log(`ProdutoStore: deletarProduto para ID ${id} finalizado.`);
      }
    },
    selecionarProdutoParaEdicao(produto) {
        this.produtoAtual = produto ? { ...produto } : null;
    },
    limparProdutoAtual() {
        this.produtoAtual = null;
    }
  },
});