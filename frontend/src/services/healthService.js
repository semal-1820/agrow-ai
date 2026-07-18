import api from "./api";

export const getEnterpriseHealth = async (enterpriseId) => {
  const response = await api.get(`/health/${enterpriseId}`);
  return response.data;
};