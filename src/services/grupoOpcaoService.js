// src/services/grupoOpcaoService.js
import apiClient from './apiService';

const resourceBase = '/gruposopcao'; // Rota base para o painel admin

export default {
  getAll() {
    return apiClient.get(resourceBase) // GET /api/gruposopcao
      .then(response => response.data);
  },
  getById(id) {
    return apiClient.get(`${resourceBase}/${id}`) // GET /api/gruposopcao/123
      .then(response => response.data);
  },
  create(data) { // data é GrupoOpcaoCriarDto do frontend
    // O backend (controller) vai usar o estabelecimentoId do token.
    // O payload aqui é o que o GrupoOpcaoCriarDto no backend espera (sem o estId se o controller preenche)
    return apiClient.post(resourceBase, data)
      .then(response => response.data);
  },
  update(id, data) { // data é GrupoOpcaoCriarDto do frontend
    return apiClient.put(`${resourceBase}/${id}`, data)
      .then(response => response.data); // PUT costuma retornar 204 NoContent, response.data pode ser undefined
  },
  delete(id) {
    return apiClient.delete(`${resourceBase}/${id}`);
  }
};