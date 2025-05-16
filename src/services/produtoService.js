// src/services/produtoService.js
import apiClient from './apiService';

const resourceBase = '/produtos'; 

export default {
  getAll(categoriaId = null) {
    let url = resourceBase;
    if (categoriaId) {
      url += `?categoriaId=${categoriaId}`;
    }
    return apiClient.get(url)
      .then(response => response.data);
  },
  getById(id) {
    return apiClient.get(`${resourceBase}/${id}`)
      .then(response => response.data);
  },
  create(data) { 
    return apiClient.post(resourceBase, data)
      .then(response => response.data);
  },
  update(id, data) {
    return apiClient.put(`${resourceBase}/${id}`, data)
      .then(response => response.data);
  },
  delete(id) {
    return apiClient.delete(`${resourceBase}/${id}`);
  }
};