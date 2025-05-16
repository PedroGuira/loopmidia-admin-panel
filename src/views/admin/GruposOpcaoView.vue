<template>
    <div class="view-container grupos-opcao-view"> <!-- Mesma classe de container -->
      <div class="view-header"> <!-- Mesma estrutura de header da view -->
        <span class="view-header-placeholder"></span>
        <button @click="abrirModalParaNovo" class="btn btn-primary">
          <i class="fas fa-plus"></i> Novo Grupo de Opção
        </button>
      </div>
  
      <div class="content-card card"> <!-- MESMA ESTRUTURA DE CARD PARA A TABELA -->
        <div v-if="grupoOpcaoStore.loading" class="loading-spinner">Carregando...</div>
        <div v-if="!grupoOpcaoStore.loading && grupoOpcaoStore.error" class="error-message form-error">
          {{ grupoOpcaoStore.error }}
        </div>
  
        <table class="data-table" v-if="!grupoOpcaoStore.loading && gruposOrdenados.length > 0">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Min/Max Seleções</th>
              <th>Ordem</th>
              <th>Itens Cadastrados</th>
              <th class="actions-header">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="grupo in gruposOrdenados" :key="grupo.id">
              <td data-label="Nome">{{ grupo.nome }}</td>
              <td data-label="Descrição" class="description-cell">{{ grupo.descricao || '-' }}</td>
              <td data-label="Min/Max">{{ grupo.minSelecoes }} / {{ grupo.maxSelecoes }}</td>
              <td data-label="Ordem">{{ grupo.ordemExibicao }}</td>
              <td data-label="Itens">
                <router-link :to="`/grupos-opcao/${grupo.id}/itens`" class="btn btn-secondary btn-sm btn-manage-items" title="Gerenciar Itens deste Grupo">
                  <i class="fas fa-list-ul"></i> {{ grupo.quantidadeItens }} Item(ns)
                </router-link>
              </td>
              <td data-label="Ações" class="actions-cell">
                <button @click="editarGrupo(grupo)" class="btn btn-icon btn-warning" title="Editar Grupo">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="confirmarDelecao(grupo.id)" class="btn btn-icon btn-danger" title="Deletar Grupo">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="empty-state" v-if="!grupoOpcaoStore.loading && gruposOrdenados.length === 0 && !grupoOpcaoStore.error">
          Nenhum grupo de opção cadastrado.
        </p>
      </div>
  
      <!-- Modal para Adicionar/Editar Grupo de Opção -->
      <!-- GARANTA QUE ESTA ESTRUTURA DE MODAL É IDÊNTICA ÀS OUTRAS VIEWS -->
      <div v-if="mostrarModal" class="modal-overlay" @click.self="fecharModal">
        <div class="modal-content card">
          <div class="modal-header">
              <h2>{{ modalEmEdicao ? 'Editar' : 'Novo' }} Grupo de Opção</h2>
              <button @click="fecharModal" class="btn-icon btn-close-modal" title="Fechar">
                  <i class="fas fa-times"></i>
              </button>
          </div>
          <form @submit.prevent="salvarGrupo">
            <div class="form-group">
              <label for="nomeGrupo">Nome do Grupo:</label>
              <input type="text" id="nomeGrupo" v-model="formGrupo.nome" required />
            </div>
            <div class="form-group">
              <label for="descricaoGrupo">Descrição (opcional):</label>
              <textarea id="descricaoGrupo" v-model="formGrupo.descricao" rows="2" placeholder="Ex: Escolha até 2 sabores"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group column-half">
                <label for="minSelecoesGrupo">Mínimo de Seleções:</label>
                <input type="number" id="minSelecoesGrupo" v-model.number="formGrupo.minSelecoes" min="0" required />
              </div>
              <div class="form-group column-half">
                <label for="maxSelecoesGrupo">Máximo de Seleções:</label>
                <input type="number" id="maxSelecoesGrupo" v-model.number="formGrupo.maxSelecoes" min="1" required />
              </div>
            </div>
             <div class="form-group">
              <label for="ordemGrupo">Ordem de Exibição:</label>
              <input type="number" id="ordemGrupo" v-model.number="formGrupo.ordemExibicao" min="0" />
            </div>
  
            <div v-if="formError" class="error-message form-error">{{ formError }}</div>
            <div class="modal-actions">
              <button type="button" @click="fecharModal" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="salvando">
                  <i class="fas fa-save"></i> {{ salvando ? 'Salvando...' : 'Salvar Grupo' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  // O script setup permanece o mesmo da sua última versão funcional para GruposOpcaoView.vue
  // Certifique-se de que não há diferenças lógicas aqui que possam afetar a renderização.
  import { ref, onMounted, computed } from 'vue';
  import { useGrupoOpcaoStore } from '../../store/grupoOpcaoStore';
  
  const grupoOpcaoStore = useGrupoOpcaoStore();
  
  const mostrarModal = ref(false);
  const modalEmEdicao = ref(false);
  const salvando = ref(false);
  const formError = ref(null);
  
  const formGrupoDefault = {
    id: null, nome: '', descricao: '',
    minSelecoes: 0, maxSelecoes: 1, ordemExibicao: 0,
  };
  const formGrupo = ref({ ...formGrupoDefault });
  
  const gruposOrdenados = computed(() => {
      return [...grupoOpcaoStore.gruposOpcao].sort((a, b) => {
          return a.ordemExibicao - b.ordemExibicao || a.nome.localeCompare(b.nome);
      });
  });
  
  onMounted(() => {
    grupoOpcaoStore.fetchGruposOpcao();
  });
  
  function abrirModalParaNovo() {
    modalEmEdicao.value = false;
    formError.value = null;
    formGrupo.value = { ...formGrupoDefault, minSelecoes: 0, maxSelecoes: 1, ordemExibicao: 0 };
    mostrarModal.value = true;
  }
  
  function editarGrupo(grupo) {
    modalEmEdicao.value = true;
    formError.value = null;
    formGrupo.value = { 
      ...grupo,
      minSelecoes: parseInt(grupo.minSelecoes) || 0,
      maxSelecoes: parseInt(grupo.maxSelecoes) || 1,
      ordemExibicao: parseInt(grupo.ordemExibicao) || 0,
     };
    mostrarModal.value = true;
  }
  
  function fecharModal() {
    mostrarModal.value = false;
    formGrupo.value = { ...formGrupoDefault };
    formError.value = null;
  }
  
  async function salvarGrupo() {
    if (!formGrupo.value.nome.trim()) {
      formError.value = "O nome do grupo é obrigatório."; return;
    }
    if (formGrupo.value.minSelecoes < 0) {
        formError.value = "Mínimo de seleções não pode ser negativo."; return;
    }
    if (formGrupo.value.maxSelecoes < 1) { // MaxSelecoes deve ser pelo menos 1
        formError.value = "Máximo de seleções deve ser ao menos 1."; return;
    }
    if (formGrupo.value.minSelecoes > formGrupo.value.maxSelecoes) {
        formError.value = "Mínimo de seleções não pode ser maior que o máximo."; return;
    }
  
    salvando.value = true;
    formError.value = null;
  
    try {
      const payload = {
          nome: formGrupo.value.nome,
          descricao: formGrupo.value.descricao,
          minSelecoes: parseInt(formGrupo.value.minSelecoes),
          maxSelecoes: parseInt(formGrupo.value.maxSelecoes),
          ordemExibicao: parseInt(formGrupo.value.ordemExibicao) || 0,
      };
  
      if (modalEmEdicao.value && formGrupo.value.id) {
        await grupoOpcaoStore.atualizarGrupoOpcao(formGrupo.value.id, payload);
      } else {
        await grupoOpcaoStore.criarGrupoOpcao(payload);
      }
      fecharModal();
    } catch (error) {
      console.error("Erro ao salvar grupo de opção:", error);
      if (error.response && error.response.data && error.response.data.message) {
          formError.value = error.response.data.message;
      } else if (error.response && error.response.data && error.response.data.errors) {
          formError.value = Object.values(error.response.data.errors).flat().join(' ');
      } else {
          formError.value = error.message || 'Ocorreu um erro ao salvar.';
      }
    } finally {
      salvando.value = false;
    }
  }
  
  async function confirmarDelecao(id) {
    if (confirm('Tem certeza que deseja deletar este grupo de opção? Itens de opção associados também podem ser afetados. Se o grupo estiver vinculado a categorias, a deleção pode ser impedida pela API.')) {
      try {
        await grupoOpcaoStore.deletarGrupoOpcao(id);
      } catch (error) {
        console.error("Erro ao deletar grupo de opção:", error);
        alert(grupoOpcaoStore.error || 'Erro ao deletar. Verifique se não está em uso por alguma categoria.');
      }
    }
  }
  </script>
  
  <style scoped>
  /* MUITO IMPORTANTE:
     Se você tem estilos <style scoped> em CategoriasView.vue e ProdutosView.vue que fazem o layout
     da tabela e do modal funcionar corretamente, COPIE ESSES ESTILOS PARA CÁ.
     Os estilos globais do App.vue devem cobrir a maior parte, mas pode haver
     ajustes finos específicos de view que estão faltando aqui. */
  
  /* Estilos base que devem ser consistentes com CategoriasView e ProdutosView */

  .view-header-placeholder {
      flex-grow: 1; 
  }
  
  .card { /* Estilo para o card de conteúdo e modal */
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
  .description-cell {
      max-width: 250px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
  }
  .btn-manage-items {
      padding: 0.4rem 0.8rem !important;
      font-size: 0.85rem !important;
      line-height: 1.2 !important;
  }
  .btn-manage-items i { margin-right: 0.4rem !important; font-size: 0.8em !important; }
  
  .actions-header { text-align: right; width: 130px; } /* Ajuste a largura conforme necessário */
  .actions-cell { text-align: right; white-space: nowrap; }
  .actions-cell .btn-icon { margin-left: 0.5rem; }
  
  /* Modal Styles */
  .modal-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(0,0,0,0.65);
    display: flex; justify-content: center; align-items: center;
    z-index: 1050; padding: 1rem;
  }
  .modal-content { /* .card já é aplicado no template */
    width: 100%;
    max-width: 600px; 
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
  
  .form-row { display: flex; gap: 1.5rem; margin-bottom: 1.2rem; }
  .form-row .form-group { flex: 1; margin-bottom: 0; }
  
  .modal-actions { margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem; }
  
  
  /* Responsividade da tabela (DEVE SER IDÊNTICA ÀS OUTRAS VIEWS) */
  @media (max-width: 768px) {
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