<template>
  <div class="view-container categorias-view">
    <div class="view-header">
      <span class="view-header-placeholder"></span>
      <button @click="abrirModalParaNovaCategoria" class="btn btn-primary">
        <i class="fas fa-plus"></i> Nova Categoria
      </button>
    </div>

    <div class="content-card card">
      <div v-if="categoriaStore.loading && !wasGrupoOpcaoLoading" class="loading-spinner">Carregando categorias...</div>
      <div v-if="wasGrupoOpcaoLoading && categoriaStore.loading" class="loading-spinner">Carregando dados...</div>
      <div v-if="!categoriaStore.loading && categoriaStore.error" class="error-message form-error">{{ categoriaStore.error }}</div>

      <table class="data-table" v-if="!categoriaStore.loading && categoriasOrdenadas.length > 0">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Ordem</th>
            <th>Grupos de Opção Vinculados</th>
            <th class="actions-header">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="categoria in categoriasOrdenadas" :key="categoria.id">
            <td data-label="Nome">{{ categoria.nome }}</td>
            <td data-label="Ordem">{{ categoria.ordemExibicao }}</td>
            <td data-label="Grupos Vinculados" class="grupos-vinculados-cell">
              <span v-if="categoria.gruposOpcaoAssociados && categoria.gruposOpcaoAssociados.length > 0"
                    :title="categoria.gruposOpcaoAssociados.map(g => g.nome).join(', ')">
                {{ getGruposNomesPreview(categoria.gruposOpcaoAssociados) }}
              </span>
              <span v-else>-</span>
            </td>
            <td data-label="Ações" class="actions-cell">
              <button @click="editarCategoria(categoria)" class="btn btn-icon btn-warning" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="confirmarDelecao(categoria.id)" class="btn btn-icon btn-danger" title="Deletar">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="empty-state" v-if="!categoriaStore.loading && categoriasOrdenadas.length === 0 && !categoriaStore.error">
        Nenhuma categoria cadastrada.
      </p>
    </div>

    <!-- Modal para Adicionar/Editar Categoria -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content card">
        <div class="modal-header">
            <h2>{{ modalEmEdicao ? 'Editar' : 'Nova' }} Categoria</h2>
            <button @click="fecharModal" class="btn-icon btn-close-modal" title="Fechar">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <form @submit.prevent="salvarCategoria">
          <div class="form-group">
            <label for="nomeCategoria">Nome da Categoria:</label>
            <input type="text" id="nomeCategoria" v-model="formCategoria.nome" required />
          </div>
          <div class="form-group">
            <label for="ordemCategoria">Ordem de Exibição:</label>
            <input type="number" id="ordemCategoria" v-model.number="formCategoria.ordemExibicao" min="0" />
          </div>

          <hr class="separator">
          <h3>Grupos de Opção para esta Categoria</h3>
          <div class="form-group">
            <div v-if="grupoOpcaoStore.loading" class="loading-spinner-small">Carregando grupos de opção...</div>
            <div v-else-if="!grupoOpcaoStore.loading && grupoOpcaoStore.error" class="error-message form-error small">
                {{ grupoOpcaoStore.error }}
            </div>
            <div v-else-if="!grupoOpcaoStore.loading && sortedGruposOpcaoParaSelecao.length === 0" class="info-message small">
                Nenhum grupo de opção cadastrado. Vá para "Grupos de Opção" para criá-los.
            </div>
            <div v-else class="checkbox-list-container">
                <div v-for="grupo in sortedGruposOpcaoParaSelecao" :key="grupo.id" class="checkbox-group">
                  <input 
                      type="checkbox" 
                      :id="'cat-grupo-' + grupo.id"
                      class="styled-checkbox"
                      :value="grupo.id" 
                      v-model="formCategoria.grupoOpcaoIds" 
                  />
                  <label :for="'cat-grupo-' + grupo.id" class="checkbox-label">
                      {{ grupo.nome }} 
                      <small> (Min: {{grupo.minSelecoes}}/Max: {{grupo.maxSelecoes}})</small>
                  </label>
                </div>
            </div>
          </div>

          <div v-if="formError" class="error-message form-error">{{ formError }}</div>
          <div class="modal-actions">
            <button type="button" @click="fecharModal" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="salvandoCategoria">
                <i class="fas fa-save"></i> {{ salvandoCategoria ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCategoriaStore } from '../../store/categoriaStore';
import { useGrupoOpcaoStore } from '../../store/grupoOpcaoStore';

const categoriaStore = useCategoriaStore();
const grupoOpcaoStore = useGrupoOpcaoStore();

const mostrarModal = ref(false);
const modalEmEdicao = ref(false);
const salvandoCategoria = ref(false);
const formError = ref(null);
const wasGrupoOpcaoLoading = ref(false); // Para controlar o estado de loading inicial dos grupos

// formCategoriaDefault agora inclui grupoOpcaoIds
const formCategoriaDefault = { id: null, nome: '', ordemExibicao: 0, grupoOpcaoIds: [] };
const formCategoria = ref({ ...formCategoriaDefault });

const categoriasOrdenadas = computed(() => {
    if (!Array.isArray(categoriaStore.categorias)) return [];
    return [...categoriaStore.categorias].sort((a, b) => {
        return a.ordemExibicao - b.ordemExibicao || a.nome.localeCompare(b.nome);
    });
});

// Ordena os grupos de opção para exibição na lista de checkboxes
const sortedGruposOpcaoParaSelecao = computed(() => {
    if (!Array.isArray(grupoOpcaoStore.gruposOpcao)) return [];
    return [...grupoOpcaoStore.gruposOpcao].sort((a,b) => a.nome.localeCompare(b.nome));
});

onMounted(async () => {
  // Inicia ambos os carregamentos em paralelo
  const fetchCategoriasPromise = categoriaStore.fetchCategorias();
  
  let fetchGruposPromise;
  if (grupoOpcaoStore.gruposOpcao.length === 0) {
    wasGrupoOpcaoLoading.value = true; // Indica que tentamos carregar
    fetchGruposPromise = grupoOpcaoStore.fetchGruposOpcao();
  } else {
    fetchGruposPromise = Promise.resolve(); // Já carregado, resolve imediatamente
  }
  
  await Promise.all([fetchCategoriasPromise, fetchGruposPromise]);
  wasGrupoOpcaoLoading.value = false; // Finaliza o estado de loading dos grupos
});

async function abrirModalParaNovaCategoria() {
  modalEmEdicao.value = false;
  formError.value = null;
  formCategoria.value = { ...formCategoriaDefault, grupoOpcaoIds: [] };
  // Garante que os grupos estejam disponíveis para seleção no modal
  if (grupoOpcaoStore.gruposOpcao.length === 0 && !grupoOpcaoStore.loading) {
    wasGrupoOpcaoLoading.value = true;
    await grupoOpcaoStore.fetchGruposOpcao();
    wasGrupoOpcaoLoading.value = false;
  }
  mostrarModal.value = true;
}

async function editarCategoria(categoria) {
  modalEmEdicao.value = true;
  formError.value = null;
  
  const idsDosGruposAssociados = categoria.gruposOpcaoAssociados 
                               ? categoria.gruposOpcaoAssociados.map(g => g.id) 
                               : [];
  formCategoria.value = { 
    id: categoria.id,
    nome: categoria.nome,
    ordemExibicao: parseInt(categoria.ordemExibicao) || 0,
    grupoOpcaoIds: idsDosGruposAssociados
  };

  if (grupoOpcaoStore.gruposOpcao.length === 0 && !grupoOpcaoStore.loading) {
    wasGrupoOpcaoLoading.value = true;
    await grupoOpcaoStore.fetchGruposOpcao();
    wasGrupoOpcaoLoading.value = false;
  }
  mostrarModal.value = true;
}

function fecharModal() {
  mostrarModal.value = false;
  formCategoria.value = { ...formCategoriaDefault, grupoOpcaoIds: [] };
  formError.value = null;
}

async function salvarCategoria() {
  if (!formCategoria.value.nome.trim()) {
    formError.value = "O nome da categoria é obrigatório."; return;
  }
  salvandoCategoria.value = true;
  formError.value = null;

  try {
    const payload = {
        nome: formCategoria.value.nome,
        ordemExibicao: parseInt(formCategoria.value.ordemExibicao) || 0,
        // Certifique-se que grupoOpcaoIds é um array, mesmo que vazio
        grupoOpcaoIds: Array.isArray(formCategoria.value.grupoOpcaoIds) ? formCategoria.value.grupoOpcaoIds : []
    };

    if (modalEmEdicao.value && formCategoria.value.id) {
      await categoriaStore.atualizarCategoria(formCategoria.value.id, payload);
    } else {
      await categoriaStore.criarCategoria(payload);
    }
    fecharModal();
    // A action no store já chama fetchCategorias, o que deve trazer as associações atualizadas
  } catch (error) {
    console.error("Erro ao salvar categoria:", error);
    if (error.response && error.response.data && error.response.data.message) {
        formError.value = error.response.data.message;
    } else if (error.response && error.response.data && error.response.data.errors) {
        formError.value = Object.values(error.response.data.errors).flat().join(' ');
    } else {
        formError.value = error.message || 'Ocorreu um erro ao salvar.';
    }
  } finally {
    salvandoCategoria.value = false;
  }
}

async function confirmarDelecao(id) {
  if (confirm('Tem certeza que deseja deletar esta categoria? Produtos associados perderão esta categoria e associações com grupos de opção serão removidas.')) {
    try {
      await categoriaStore.deletarCategoria(id);
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
      alert(categoriaStore.error || 'Erro ao deletar.');
    }
  }
}

function getGruposNomesPreview(grupos) {
    if (!grupos || grupos.length === 0) return '-';
    const maxPreview = 2; // Mostrar até X nomes
    let preview = grupos.slice(0, maxPreview).map(g => g.nome).join(', ');
    if (grupos.length > maxPreview) {
        preview += `, +${grupos.length - maxPreview}`;
    }
    return preview;
}

</script>

<style scoped>
/* Copie os estilos de ProdutosView.vue ou GruposOpcaoView.vue para cá,
   pois eles já contêm os estilos para .view-container, .view-header,
   .content-card, .data-table, .modal-overlay, .modal-content, .form-group,
   .btn, e a responsividade da tabela. */

/* Adicione ou ajuste estilos específicos se necessário: */
.grupos-vinculados-cell {
    max-width: 250px; /* Ou o que for adequado */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.grupos-vinculados-cell:hover { /* Opcional: mostrar tudo no hover */
    white-space: normal;
    overflow: visible;
    /* Pode precisar de posicionamento se o texto for muito grande */
}

.checkbox-list-container {
  max-height: 180px;
  overflow-y: auto;
  padding: 0.75rem;
  border: 1px solid var(--input-border);
  border-radius: var(--border-radius-sm);
  margin-top: 0.5rem;
}
body.theme-dark .checkbox-list-container { background-color: var(--input-bg-dark); }
body.theme-light .checkbox-list-container { background-color: var(--input-bg-light); }

.checkbox-list-container .checkbox-group { padding: 0.4rem 0.2rem; }
.checkbox-list-container .checkbox-group small { margin-left: 0.5rem; font-size: 0.8em; }
body.theme-dark .checkbox-list-container .checkbox-group small { color: var(--text-secondary-dark); }
body.theme-light .checkbox-list-container .checkbox-group small { color: var(--text-secondary-light); }

.loading-spinner-small, .error-message.small, .info-message.small {
  font-size: 0.9em; padding: 0.5rem;
}
.info-message.small { font-style: italic; }
body.theme-dark .info-message.small { color: var(--text-secondary-dark); }
body.theme-light .info-message.small { color: var(--text-secondary-light); }

.styled-checkbox { /* Para ter certeza que o checkbox usa accent-color */
  accent-color: var(--primary-accent-dark);
}
body.theme-light .styled-checkbox {
  accent-color: var(--primary-accent-light);
}

/* Copie TODOS os outros estilos relevantes de .card, .data-table, .modal-*, .form-*, etc.
   das outras views se eles não estiverem no CSS global do App.vue */
   /* ... (Cole aqui os estilos <style scoped> completos de ProdutosView.vue, por exemplo) ... */
   /* Garantindo que todas as classes usadas no template tenham seus estilos definidos */
.view-header-placeholder { flex-grow: 1; }
.card {
  padding: 1.5rem;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: 1.5rem;
}
body.theme-dark .card { background-color: var(--bg-card-dark); }
body.theme-light .card { background-color: var(--bg-card-light); border: 1px solid var(--border-color-light); }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td {
  padding: 0.9rem 1rem; text-align: left;
  vertical-align: middle; border-bottom: 1px solid;
}
body.theme-dark .data-table th, body.theme-dark .data-table td { border-color: var(--border-color-dark); }
body.theme-light .data-table th, body.theme-light .data-table td { border-color: var(--border-color-light); }
.data-table thead th {
  font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;
}
body.theme-dark .data-table thead th { color: var(--text-secondary-dark); }
body.theme-light .data-table thead th { color: var(--text-secondary-light); }
.data-table tbody tr:hover {}
body.theme-dark .data-table tbody tr:hover { background-color: rgba(var(--primary-color-val), 0.05); }
body.theme-light .data-table tbody tr:hover { background-color: #f8f9fa; }
.data-table td { font-size: 0.9rem; }
.actions-header { text-align: right; width: 120px; }
.actions-cell { text-align: right; white-space: nowrap; }
.actions-cell .btn-icon { margin-left: 0.5rem; }
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0,0,0,0.65); display: flex; justify-content: center; align-items: center;
  z-index: 1050; padding: 1rem;
}
.modal-content { width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 0.75rem; margin-bottom: 1.25rem; border-bottom: 1px solid;
}
body.theme-dark .modal-header { border-color: var(--border-color-dark); }
body.theme-light .modal-header { border-color: var(--border-color-light); }
.modal-header h2 { margin: 0; font-size: 1.3rem; font-weight: 600; }
body.theme-dark .modal-header h2 { color: var(--text-primary-dark); }
body.theme-light .modal-header h2 { color: var(--text-primary-light); }
.form-row { display: flex; gap: 1.5rem; margin-bottom: 1.2rem; }
.form-row .form-group { flex: 1; margin-bottom: 0; }
.checkbox-label { font-weight: normal !important; margin-left: 0.25rem; }
.separator { border: 0; height: 1px; margin: 1.5rem 0; }
body.theme-dark .separator { background-color: var(--border-color-dark); }
body.theme-light .separator { background-color: var(--border-color-light); }
.modal-content h3 {
    font-size: 1.1rem; font-weight: 500;
    margin-top: 1rem; margin-bottom: 0.75rem; padding-bottom: 0.5rem;
}
body.theme-dark .modal-content h3 { color: var(--text-secondary-dark); border-bottom: 1px solid var(--input-border-dark); }
body.theme-light .modal-content h3 { color: var(--text-secondary-light); border-bottom: 1px solid var(--input-border-light); }
.modal-actions { margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem; }

@media (max-width: 768px) { /* ... (estilos responsivos da tabela como antes) ... */ 
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