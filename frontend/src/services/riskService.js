import api from "./api";

export const generateRiskAssessment = async (enterpriseId) => {
  const response = await api.post(`/risk/${enterpriseId}`);
  return response.data;
};

export const getRiskAssessment = async (enterpriseId) => {
  const response = await api.get(`/risk/${enterpriseId}`);
  return response.data;
};