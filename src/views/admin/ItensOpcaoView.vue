<template>
    <div class="view-container itens-opcao-view">
      <div class="view-header">
        <!-- Título principal da view (o genérico "Itens de Opção" vem do App.vue) -->
        <!-- Adicionamos um subtítulo específico aqui -->
        <h2 v-if="grupoPai" class="view-subtitle">
          Itens do Grupo: <strong>{{ grupoPai.nome }}</strong>
        </h2>
        <span v-else class="view-header-placeholder"></span> <!-- Placeholder se grupoPai ainda não carregou -->
  
        <button @click="abrirModalParaNovoItem" class="btn btn-primary">
          <i class="fas fa-plus"></i> Novo Item
        </button>
      </div>
  
      <!-- Botão de Voltar estilizado e posicionado abaixo do header -->
      <div class="actions-bar">
          <router-link to="/grupos-opcao" class="btn btn-secondary">
              <i class="fas fa-arrow-left"></i> Voltar para Grupos de Opção
          </router-link>
      </div>
  
      <div class="content-card card"> <!-- Aplicando .card para a tabela -->
        <div v-if="itemOpcaoStore.loading" class="loading-spinner">Carregando itens...</div>
        <div v-if="!itemOpcaoStore.loading && itemOpcaoStore.error" class="error-message form-error">
          {{ itemOpcaoStore.error }}
        </div>
  
        <table class="data-table" v-if="!itemOpcaoStore.loading && itensOrdenados.length > 0">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Preço Adicional</th>
              <th>Disponível</th>
              <th>Ordem</th>
              <th class="actions-header">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in itensOrdenados" :key="item.id">
              <td data-label="Nome">{{ item.nome }}</td>
              <td data-label="Preço Ad.">R$ {{ item.precoAdicional.toFixed(2).replace('.', ',') }}</td>
              <td data-label="Disponível">{{ item.disponivel ? 'Sim' : 'Não' }}</td>
              <td data-label="Ordem">{{ item.ordemExibicao }}</td>
              <td data-label="Ações" class="actions-cell">
                <button @click="editarItem(item)" class="btn btn-icon btn-warning" title="Editar Item">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="confirmarDelecaoItem(item.id)" class="btn btn-icon btn-danger" title="Deletar Item">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="empty-state" v-if="!itemOpcaoStore.loading && itensOrdenados.length === 0 && !itemOpcaoStore.error">
          Nenhum item cadastrado para este grupo.
        </p>
      </div>
  
      <!-- Modal (estrutura e classes devem ser idênticas aos outros modais) -->
      <div v-if="mostrarModal" class="modal-overlay" @click.self="fecharModal">
        <div class="modal-content card">
          <div class="modal-header">
              <h2>{{ modalEmEdicao ? 'Editar' : 'Novo' }} Item <span v-if="grupoPai" class="modal-subtitle">para "{{ grupoPai.nome }}"</span></h2>
              <button @click="fecharModal" class="btn-icon btn-close-modal" title="Fechar">
                  <i class="fas fa-times"></i>
              </button>
          </div>
          <form @submit.prevent="salvarItem">
            <div class="form-group">
              <label for="nomeItem">Nome do Item:</label>
              <input type="text" id="nomeItem" v-model="formItem.nome" required />
            </div>
            <div class="form-row">
              <div class="form-group column-half">
                <label for="precoAdicionalItem">Preço Adicional (R$):</label>
                <input type="number" id="precoAdicionalItem" v-model.number="formItem.precoAdicional" step="0.01" min="0" required />
              </div>
              <div class="form-group column-half">
                <label for="ordemItem">Ordem de Exibição:</label>
                <input type="number" id="ordemItem" v-model.number="formItem.ordemExibicao" min="0" />
              </div>
            </div>
            <div class="form-group checkbox-group">
              <input type="checkbox" id="disponivelItem" v-model="formItem.disponivel" />
              <label for="disponivelItem" class="checkbox-label">Item Disponível</label>
            </div>
  
            <div v-if="formError" class="error-message form-error">{{ formError }}</div>
            <div class="modal-actions">
              <button type="button" @click="fecharModal" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="salvando">
                  <i class="fas fa-save"></i> {{ salvando ? 'Salvando...' : 'Salvar Item' }}
              </button>
            </div>
          </form>
        </div>
      </div>
  
    </div>
  </template>
  
  <script setup>
  // O script setup permanece o mesmo da sua última versão funcional para ItensOpcaoView.vue
  // com o defineProps corrigido.
  import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue';
  // eslint-disable-next-line no-undef
  const props = defineProps({
    grupoId: {
      type: [String, Number],
      required: true
    }
  });
  import { useItemOpcaoStore } from '../../store/itemOpcaoStore';
  import { useGrupoOpcaoStore } from '../../store/grupoOpcaoStore';
  
  
  const itemOpcaoStore = useItemOpcaoStore();
  const grupoOpcaoStore = useGrupoOpcaoStore();
  
  const mostrarModal = ref(false);
  const modalEmEdicao = ref(false);
  const salvando = ref(false);
  const formError = ref(null);
  const grupoPai = ref(null);
  
  const formItemDefault = {
    id: null, nome: '', precoAdicional: 0.00,
    disponivel: true, ordemExibicao: 0,
  };
  const formItem = ref({ ...formItemDefault });
  
  const itensOrdenados = computed(() => {
      if (!Array.isArray(itemOpcaoStore.itensOpcao)) return [];
      return [...itemOpcaoStore.itensOpcao].sort((a, b) => {
          return a.ordemExibicao - b.ordemExibicao || a.nome.localeCompare(b.nome);
      });
  });
  
  async function carregarDadosDoGrupo() {
      const idGrupoNumerico = parseInt(props.grupoId);
      if (isNaN(idGrupoNumerico)) {
          itemOpcaoStore.error = "ID do Grupo de Opção inválido na rota.";
          console.error("ID do Grupo inválido:", props.grupoId);
          itemOpcaoStore.resetStore();
          grupoPai.value = null;
          return;
      }
      await itemOpcaoStore.fetchItensPorGrupo(idGrupoNumerico);
  
      if (grupoOpcaoStore.gruposOpcao.length === 0) {
          await grupoOpcaoStore.fetchGruposOpcao();
      }
      grupoPai.value = grupoOpcaoStore.gruposOpcao.find(g => g.id === idGrupoNumerico);
      if (!grupoPai.value) {
          console.warn(`Grupo pai com ID ${idGrupoNumerico} não encontrado no store.`);
      }
  }
  
  onMounted(() => {
    carregarDadosDoGrupo();
  });
  
  watch(() => props.grupoId, (newGrupoId) => {
    if (newGrupoId) {
      carregarDadosDoGrupo();
    } else {
      itemOpcaoStore.resetStore();
      grupoPai.value = null;
    }
  }, { immediate: true });
  
  onBeforeUnmount(() => {
      itemOpcaoStore.resetStore();
  });
  
  function abrirModalParaNovoItem() {
    modalEmEdicao.value = false;
    formError.value = null;
    formItem.value = { ...formItemDefault, disponivel: true, precoAdicional: 0.00, ordemExibicao: 0 };
    mostrarModal.value = true;
  }
  
  function editarItem(item) {
    modalEmEdicao.value = true;
    formError.value = null;
    formItem.value = { 
        ...item,
        precoAdicional: parseFloat(item.precoAdicional) || 0.00,
        ordemExibicao: parseInt(item.ordemExibicao) || 0,
      };
    mostrarModal.value = true;
  }
  
  function fecharModal() {
    mostrarModal.value = false;
    formItem.value = { ...formItemDefault };
    formError.value = null;
  }
  
  async function salvarItem() {
    if (!formItem.value.nome.trim()) {
      formError.value = "O nome do item é obrigatório."; return;
    }
    if (formItem.value.precoAdicional === null || formItem.value.precoAdicional < 0) {
        formError.value = "Preço adicional é obrigatório e não pode ser negativo."; return;
    }
  
    salvando.value = true;
    formError.value = null;
    const idGrupoNumerico = parseInt(props.grupoId);
  
    try {
      const payload = {
          nome: formItem.value.nome,
          precoAdicional: parseFloat(formItem.value.precoAdicional) || 0.00,
          disponivel: formItem.value.disponivel,
          ordemExibicao: parseInt(formItem.value.ordemExibicao) || 0,
      };
  
      if (modalEmEdicao.value && formItem.value.id) {
        await itemOpcaoStore.atualizarItemOpcao(idGrupoNumerico, formItem.value.id, payload);
      } else {
        await itemOpcaoStore.criarItemOpcao(idGrupoNumerico, payload);
      }
      fecharModal();
    } catch (error) {
      console.error("Erro ao salvar item de opção:", error);
      if (error.response && error.response.data && error.response.data.message) {
          formError.value = error.response.data.message;
      } else if (error.response && error.response.data && error.response.data.errors) {
          formError.value = Object.values(error.response.data.errors).flat().join(' ');
      } else {
          formError.value = error.message || 'Ocorreu um erro ao salvar o item.';
      }
    } finally {
      salvando.value = false;
    }
  }
  
  async function confirmarDelecaoItem(itemId) {
    if (confirm('Tem certeza que deseja deletar este item de opção?')) {
      const idGrupoNumerico = parseInt(props.grupoId);
      try {
        await itemOpcaoStore.deletarItemOpcao(idGrupoNumerico, itemId);
      } catch (error) {
        console.error("Erro ao deletar item de opção:", error);
        alert(itemOpcaoStore.error || 'Erro ao deletar o item.');
      }
    }
  }
  </script>
  
  <style scoped>
  /* Estilos herdados do App.vue e dos arquivos de Categoria/Produto devem ser aplicados.
     Adicione apenas ajustes finos ou estilos específicos para ItensOpcaoView.vue aqui. */

  .view-header-placeholder {
      flex-grow: 1; 
  }
  .view-subtitle { /* Novo estilo para o subtítulo com o nome do grupo */
      font-size: 1.4rem; /* Ajuste o tamanho conforme necessário */
      font-weight: 500;
      margin-right: auto; /* Empurra para a esquerda, antes do botão Novo Item */
      padding-left: 0; /* Se o .view-header tiver padding, ajuste */
  }
  body.theme-dark .view-subtitle { color: var(--text-primary-dark); }
  body.theme-light .view-subtitle { color: var(--text-primary-light); }
  body.theme-dark .view-subtitle strong { color: var(--primary-accent-dark); }
  body.theme-light .view-subtitle strong { color: var(--primary-accent-light); }
  
  
  .actions-bar { /* Nova barra para o botão "Voltar" */
      margin-bottom: 1.5rem;
      display: flex;
  }
  /* O .btn.btn-secondary já deve ter estilos globais */
  
  /* .card, .data-table, .modal-overlay, .modal-content, .modal-header, .form-group,
     .btn, .btn-primary, .btn-secondary, .btn-icon, .btn-warning, .btn-danger,
     e a responsividade da tabela DEVEM SER IDÊNTICOS aos de CategoriasView.vue
     ou ProdutosView.vue. Se você copiou a seção <style scoped> completa de uma
     delas para cá, já deve estar 95% lá. */
  
  /* Seção <style scoped> copiada e adaptada de CategoriasView.vue */
  .card {
    padding: 1.5rem;
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-sm);
    margin-bottom: 1.5rem;
  }
  body.theme-dark .card { background-color: var(--bg-card-dark); }
  body.theme-light .card { background-color: var(--bg-card-light); border: 1px solid var(--border-color-light); }
  
  .data-table {
    width: 100%;
    border-collapse: collapse;
  }
  .data-table th, .data-table td {
    padding: 0.9rem 1rem;
    text-align: left;
    vertical-align: middle;
    border-bottom: 1px solid;
  }
  body.theme-dark .data-table th, body.theme-dark .data-table td { border-color: var(--border-color-dark); }
  body.theme-light .data-table th, body.theme-light .data-table td { border-color: var(--border-color-light); }
  
  .data-table thead th {
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  body.theme-dark .data-table thead th { color: var(--text-secondary-dark); }
  body.theme-light .data-table thead th { color: var(--text-secondary-light); }
  
  body.theme-dark .data-table tbody tr:hover { background-color: rgba(var(--primary-color-val), 0.05); }
  body.theme-light .data-table tbody tr:hover { background-color: #f8f9fa; }
  
  .data-table td { font-size: 0.9rem; }
  .actions-header { text-align: right; width: 120px; }
  .actions-cell { text-align: right; white-space: nowrap; }
  .actions-cell .btn-icon { margin-left: 0.5rem; }
  
  .modal-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(0,0,0,0.65);
    display: flex; justify-content: center; align-items: center;
    z-index: 1050; padding: 1rem;
  }
  .modal-content {
    width: 100%;
    max-width: 550px; 
    max-height: 90vh;
    overflow-y: auto;
  }
  .modal-header {
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: 0.75rem; margin-bottom: 1.25rem;
    border-bottom: 1px solid;
  }
  body.theme-dark .modal-header { border-color: var(--border-color-dark); }
  body.theme-light .modal-header { border-color: var(--border-color-light); }
  .modal-header h2 { margin: 0; font-size: 1.3rem; font-weight: 600; }
  body.theme-dark .modal-header h2 { color: var(--text-primary-dark); }
  body.theme-light .modal-header h2 { color: var(--text-primary-light); }
  .modal-subtitle {
      font-size: 0.9rem;
      font-weight: normal;
      margin-left: 0.5rem;
  }
  body.theme-dark .modal-subtitle { color: var(--text-secondary-dark); }
  body.theme-light .modal-subtitle { color: var(--text-secondary-light); }
  
  .form-row { display: flex; gap: 1.5rem; margin-bottom: 1.2rem; }
  .form-row .form-group { flex: 1; margin-bottom: 0; }
  
  .modal-actions { margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem; }
  
  @media (max-width: 768px) {
      .view-header {
        flex-direction: column;
        align-items: stretch; /* Botão Novo ocupa largura total */
        gap: 1rem;
      }
      .view-header .btn-primary {
          width: 100%; /* Botão Novo Item ocupa largura total */
      }
      .view-subtitle {
          text-align: center;
          margin-right: 0;
          margin-bottom: 0.5rem;
      }
      .actions-bar {
          justify-content: center; /* Centraliza botão Voltar */
      }
  
      .data-table thead { display: none; }
      .data-table tr {
          display: block; margin-bottom: 1rem;
          border-radius: var(--border-radius-md); padding: 1rem;
          box-shadow: var(--shadow-sm);
      }
      body.theme-dark .data-table tr { border: 1px solid var(--border-color-dark); background-color: var(--bg-card-dark); }
      body.theme-light .data-table tr { border: 1px solid var(--border-color-light); background-color: var(--bg-card-light); }
      
      .data-table td {
          display: block; text-align: right; padding-left: 45%;
          position: relative; border-bottom: 1px dashed; padding-top: 0.6rem; padding-bottom: 0.6rem;
      }
      body.theme-dark .data-table td { border-bottom-color: var(--input-border-dark); }
      body.theme-light .data-table td { border-bottom-color: var(--input-border-light); }
      .data-table tr td:first-child { padding-top: 0; }
      .data-table tr td:last-child { border-bottom: none; }
      
      .data-table td::before {
          content: attr(data-label); position: absolute;
          left: 0.75rem; width: calc(45% - 1rem);
          padding-right: 0.5rem; font-weight: 500;
          text-align: left; white-space: normal;
          font-size: 0.85rem;
      }
      body.theme-dark .data-table td::before { color: var(--text-secondary-dark); }
      body.theme-light .data-table td::before { color: var(--text-secondary-light); }
  
      .actions-cell, .data-table td[data-label="Ações"] { text-align: left; padding-top: 1rem; }
      .actions-cell::before, .data-table td[data-label="Ações"]::before { display: none; }
  
      .form-row { flex-direction: column; gap: 0; }
      .form-row .form-group { margin-bottom: 1.2rem; }
  }
  </style>