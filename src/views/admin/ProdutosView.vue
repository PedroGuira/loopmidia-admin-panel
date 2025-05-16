// src/views/admin/ProdutosView.vue

<template>
  <div class="view-container produtos-view">
    <div class="view-header">
      <span class="view-header-placeholder"></span>
      <button @click="abrirModalParaNovoProduto" class="btn btn-primary">
        <i class="fas fa-plus"></i> Novo Produto
      </button>
    </div>

    <div class="filters-container card">
      <!-- ... (filtros como antes) ... -->
      <div class="form-group">
        <label for="filtroCategoria">Filtrar por Categoria:</label>
        <select id="filtroCategoria" v-model="categoriaFiltroSelecionada" @change="filtrarProdutos">
            <option :value="null">Todas as Categorias</option>
            <option v-for="cat_opt_filter in categoriaStoreForSelect.categorias" :key="cat_opt_filter.id" :value="cat_opt_filter.id">
                {{ cat_opt_filter.nome }}
            </option>
        </select>
      </div>
    </div>

    <div class="content-card card">
      <!-- ... (tabela de produtos como antes, mas a coluna "Personalizável" pode ser removida ou alterada) ... -->
      <table class="data-table" v-if="!produtoStore.loading && itemsToDisplay.length > 0">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Preço</th>
            <th>Disponível</th>
            <!-- <th>Personalizável</th> << COLUNA REMOVIDA OU ALTERADA -->
            <th class="actions-header">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="produto in itemsToDisplay" :key="produto.id">
            <td data-label="Nome">{{ produto.nome }}</td>
            <td data-label="Categoria">{{ produto.categoriaNome || '-' }}</td>
            <td data-label="Preço">R$ {{ produto.preco.toFixed(2).replace('.', ',') }}</td>
            <td data-label="Disponível">{{ produto.disponivel ? 'Sim' : 'Não' }}</td>
            <!-- <td data-label="Personalizável">{{ produto.isPersonalizavel ? 'Sim' : 'Não' }}</td> << REMOVIDO -->
            <td data-label="Ações" class="actions-cell">
              <button @click="editarProduto(produto)" class="btn btn-icon btn-warning" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="confirmarDelecao(produto.id)" class="btn btn-icon btn-danger" title="Deletar">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="empty-state" v-if="!produtoStore.loading && itemsToDisplay && itemsToDisplay.length === 0 && !produtoStore.error">
  Nenhum produto cadastrado ou correspondente ao filtro.
</p>
    </div>

    <!-- Modal para Adicionar/Editar Produto -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content card">
        <div class="modal-header">
            <h2>{{ modalEmEdicao ? 'Editar' : 'Novo' }} Produto</h2>
            <button @click="fecharModal" class="btn-icon btn-close-modal" title="Fechar">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <form @submit.prevent="salvarProduto">
          <div class="form-row">
            <div class="form-group column-half">
              <label for="nomeProduto">Nome do Produto:</label>
              <input type="text" id="nomeProduto" v-model="formProduto.nome" required />
            </div>
            <div class="form-group column-half">
              <label for="precoProduto">Preço (R$):</label>
              <input type="number" id="precoProduto" v-model.number="formProduto.preco" step="0.01" min="0.01" required />
            </div>
          </div>

          <div class="form-group">
            <label for="descricaoProduto">Descrição:</label>
            <textarea id="descricaoProduto" v-model="formProduto.descricao" rows="3"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group column-half">
              <label for="categoriaProduto">Categoria:</label>
              <select id="categoriaProduto" v-model="formProduto.categoriaId">
                <option :value="null">-- Sem Categoria --</option>
                <option v-for="cat_opt_form in categoriaStoreForSelect.categorias" :key="cat_opt_form.id" :value="cat_opt_form.id">
                  {{ cat_opt_form.nome }}
                </option>
              </select>
            </div>
            <div class="form-group column-half">
              <label for="imagemUrlProduto">URL da Imagem:</label>
              <input type="text" id="imagemUrlProduto" v-model="formProduto.imagemUrl" placeholder="https://exemplo.com/imagem.jpg"/>
            </div>
          </div>
          
          <div class="form-group checkbox-group">
            <input type="checkbox" id="disponivelProduto" v-model="formProduto.disponivel" />
            <label for="disponivelProduto" class="checkbox-label">Produto Disponível</label>
          </div>

          <!-- SEÇÃO DE PERSONALIZAÇÃO REMOVIDA DO FORMULÁRIO DE PRODUTO -->
          <!-- 
          <hr class="separator">
          <h3>Opções de Personalização</h3>
          <div class="form-group checkbox-group">
            <input type="checkbox" id="isPersonalizavelProduto" v-model="formProduto.isPersonalizavel" />
            <label for="isPersonalizavelProduto" class="checkbox-label">Este produto é personalizável?</label>
          </div>
          <div v-if="formProduto.isPersonalizavel" class="form-row">
            <div class="form-group column-half">
                <label for="maxSaboresProduto">Máx. Sabores/Opções:</label>
                <input type="number" id="maxSaboresProduto" v-model.number="formProduto.maxSabores" min="0" />
            </div>
            <div class="form-group column-half">
                <label for="maxAcompanhamentosProduto">Máx. Acompanhamentos:</label>
                <input type="number" id="maxAcompanhamentosProduto" v-model.number="formProduto.maxAcompanhamentos" min="0" />
            </div>
          </div>
          -->

          <div v-if="formError" class="error-message form-error">{{ formError }}</div>
          <div class="modal-actions">
            <button type="button" @click="fecharModal" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="salvandoProduto">
                <i class="fas fa-save"></i> {{ salvandoProduto ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useProdutoStore } from '../../store/produtoStore';
import { useCategoriaStore } from '../../store/categoriaStore';

const produtoStore = useProdutoStore();
const categoriaStoreForSelect = useCategoriaStore();

const mostrarModal = ref(false);
const modalEmEdicao = ref(false);
const salvandoProduto = ref(false);
const formError = ref(null);
const categoriaFiltroSelecionada = ref(null);

const formProdutoDefault = {
  id: null, nome: '', descricao: '', preco: null, imagemUrl: '',
  disponivel: true, categoriaId: null,
};
const formProduto = ref({ ...formProdutoDefault });

const itemsToDisplay = computed(() => {
  if (Array.isArray(produtoStore.produtos)) {
    return produtoStore.produtos;
  }
  return []; 
});

onMounted(async () => {
  console.log("ProdutosView: onMounted - Carregando categorias e produtos...");
  await categoriaStoreForSelect.fetchCategorias();
  await produtoStore.fetchProdutos(categoriaFiltroSelecionada.value);
  console.log("ProdutosView: onMounted - Dados carregados.");
});

watch(categoriaFiltroSelecionada, (newVal) => {
    console.log("ProdutosView: Filtro de categoria mudou para:", newVal);
    produtoStore.fetchProdutos(newVal);
});

function filtrarProdutos() { 
    console.log("ProdutosView: filtrarProdutos chamado (via watch).");
}

function abrirModalParaNovoProduto() {
  modalEmEdicao.value = false;
  formError.value = null;
  formProduto.value = { ...formProdutoDefault, disponivel: true, preco: 0.01 }; // Preço default > 0
  mostrarModal.value = true;
}

function editarProduto(produto) {
  modalEmEdicao.value = true;
  formError.value = null;
  formProduto.value = {
    id: produto.id,
    nome: produto.nome,
    descricao: produto.descricao,
    preco: parseFloat(produto.preco) || 0.01, // Garante que seja número
    imagemUrl: produto.imagemUrl,
    disponivel: produto.disponivel,
    categoriaId: produto.categoriaId === undefined ? null : produto.categoriaId
  };
  mostrarModal.value = true;
}

function fecharModal() {
  mostrarModal.value = false;
  formProduto.value = { ...formProdutoDefault };
  formError.value = null;
}

async function salvarProduto() {
  console.log("ProdutosView: Iniciando salvarProduto...");
  console.log("Dados do formulário:", JSON.parse(JSON.stringify(formProduto.value)));

  if (!formProduto.value.nome || !formProduto.value.nome.trim()) {
    formError.value = "O nome do produto é obrigatório.";
    console.log("ProdutosView: Validação falhou - Nome obrigatório.");
    return;
  }
  if (formProduto.value.preco === null || formProduto.value.preco === undefined || formProduto.value.preco <= 0) {
    formError.value = "O preço é obrigatório e deve ser maior que zero.";
    console.log("ProdutosView: Validação falhou - Preço inválido. Valor:", formProduto.value.preco);
    return;
  }

  salvandoProduto.value = true;
  formError.value = null;
  console.log("ProdutosView: Validações passaram, salvandoProduto = true.");

  try {
    // Payload que o store espera (sem estabelecimentoId, o store adiciona)
    const payloadParaStore = {
        nome: formProduto.value.nome,
        descricao: formProduto.value.descricao || null,
        preco: parseFloat(formProduto.value.preco),
        imagemUrl: formProduto.value.imagemUrl || null,
        disponivel: formProduto.value.disponivel,
        categoriaId: formProduto.value.categoriaId ? parseInt(formProduto.value.categoriaId) : null,
    };
    console.log("ProdutosView: Payload para o store:", payloadParaStore);

    if (modalEmEdicao.value && formProduto.value.id) {
      console.log("ProdutosView: Chamando store.atualizarProduto...");
      await produtoStore.atualizarProduto(formProduto.value.id, payloadParaStore);
      console.log("ProdutosView: store.atualizarProduto concluído.");
    } else {
      console.log("ProdutosView: Chamando store.criarProduto...");
      await produtoStore.criarProduto(payloadParaStore);
      console.log("ProdutosView: store.criarProduto concluído.");
    }
    fecharModal();
    console.log("ProdutosView: Modal fechado. Buscando produtos atualizados...");
    await produtoStore.fetchProdutos(categoriaFiltroSelecionada.value);
    console.log("ProdutosView: Produtos atualizados.");
  } catch (error) { 
    console.error("ProdutosView: Erro capturado ao salvar produto:", error);
    // Tenta pegar a mensagem de erro mais específica
    if (error.response && error.response.data && error.response.data.message) {
        formError.value = error.response.data.message;
    } else if (error.response && error.response.data && error.response.data.title) { // Para erros de validação do ASP.NET
        formError.value = error.response.data.title;
        if(error.response.data.errors) {
            let messages = [];
            for (const key in error.response.data.errors) {
                messages = messages.concat(error.response.data.errors[key]);
            }
            formError.value += ": " + messages.join(' ');
        }
    }
     else if (error.message) {
        formError.value = error.message;
    } else {
        formError.value = 'Ocorreu um erro desconhecido ao salvar.';
    }
  } 
  finally { 
    console.log("ProdutosView: Finalizando salvarProduto, salvandoProduto = false.");
    salvandoProduto.value = false; 
  }
}

async function confirmarDelecao(id) {
  if (confirm(`Tem certeza que deseja deletar este produto?`)) {
    try {
      await produtoStore.deletarProduto(id);
      await produtoStore.fetchProdutos(categoriaFiltroSelecionada.value);
    } catch (error) { 
      console.error("ProdutosView: Erro ao deletar produto:", error);
      alert(produtoStore.error || 'Erro ao deletar.');
    }
  }
}
</script>

<style scoped>
/* Os estilos aqui devem ser IDÊNTICOS aos de CategoriasView.vue e GruposOpcaoView.vue */
/* Copie os estilos <style scoped> de um desses arquivos para cá se ainda não o fez,
   para garantir consistência visual completa. */

/* Exemplo de como ficariam os estilos copiados (resumido): */

.card {
  padding: 1.5rem;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: 1.5rem;
}
body.theme-dark .card { background-color: var(--bg-card-dark); }
body.theme-light .card { background-color: var(--bg-card-light); border: 1px solid var(--border-color-light); }

.filters-container.card { /* Estilo para o card de filtros */
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
}
.filters-container .form-group { margin-bottom: 0; flex-grow: 1; }
.filters-container label { margin-bottom: 0; font-weight: 500; white-space: nowrap; }
.filters-container select { min-width: 200px; }


.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td {
  padding: 0.9rem 1rem; text-align: left;
  vertical-align: middle; border-bottom: 1px solid;
}
body.theme-dark .data-table th, body.theme-dark .data-table td { border-color: var(--border-color-dark); }
body.theme-light .data-table th, body.theme-light .data-table td { border-color: var(--border-color-light); }
/* ... mais estilos de tabela, modal, responsividade como nas outras views ... */
/* É crucial que os estilos scoped aqui sejam os mesmos que os de CategoriasView ou GruposOpcaoView */
/* para garantir a consistência visual que você busca. */

/* Certifique-se de que todos os estilos relevantes de CategoriasView.vue <style scoped>
   estejam aqui, especialmente para .data-table, .modal-overlay, .modal-content, etc. */

/* Seção de estilo <style scoped> copiada de CategoriasView.vue para consistência */
.view-header-placeholder { flex-grow: 1; }
.data-table thead th {
  font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;
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
  background-color: rgba(0,0,0,0.65); display: flex; justify-content: center; align-items: center;
  z-index: 1050; padding: 1rem;
}
.modal-content { width: 100%; max-width: 650px; max-height: 90vh; overflow-y: auto; }
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