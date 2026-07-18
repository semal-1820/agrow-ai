import api from "./api";

export const getEnterprises = async () => {
  const response = await api.get("/enterprise");
  return response.data;
};

export const getEnterprise = async (id) => {
  const response = await api.get(`/enterprise/${id}`);
  return response.data;
};

export const createEnterprise = async (data) => {
  const response = await api.post("/enterprise", data);
  return response.data;
};

export const updateEnterprise = async (id, data) => {
  const response = await api.put(`/enterprise/${id}`, data);
  return response.data;
};

export const deleteEnterprise = async (id) => {
  const response = await api.delete(`/enterprise/${id}`);
  return response.data;
};