// src/services/itemOpcaoService.js
import apiClient from './apiService';

// A rota base agora inclui o grupoOpcaoId
const resource = (grupoOpcaoId) => `/gruposopcao/${grupoOpcaoId}/itensopcao`;

export default {
  getAllByGrupo(grupoOpcaoId) {
    return apiClient.get(resource(grupoOpcaoId))
      .then(response => response.data);
  },
  getById(grupoOpcaoId, itemId) {
    return apiClient.get(`${resource(grupoOpcaoId)}/${itemId}`)
      .then(response => response.data);
  },
  create(grupoOpcaoId, data) { // data é ItemOpcaoCriarDto do frontend
    // O backend (controller) vai usar o estabelecimentoId do token e o grupoOpcaoId da rota.
    return apiClient.post(resource(grupoOpcaoId), data)
      .then(response => response.data);
  },
  update(grupoOpcaoId, itemId, data) {
    return apiClient.put(`${resource(grupoOpcaoId)}/${itemId}`, data)
      .then(response => response.data);
  },
  delete(grupoOpcaoId, itemId) {
    return apiClient.delete(`${resource(grupoOpcaoId)}/${itemId}`);
  }
};