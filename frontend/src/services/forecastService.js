import api from "./api";

export const generateForecast = async (enterpriseId) => {
  const response = await api.post(`/forecast/${enterpriseId}`);
  return response.data;
};

export const getForecast = async (enterpriseId) => {
  const response = await api.get(`/forecast/${enterpriseId}`);
  return response.data;
};