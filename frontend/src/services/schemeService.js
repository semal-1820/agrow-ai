import api from "./api";

export const getSchemes = async () => {
  const response = await api.get("/schemes");
  return response.data;
};

export const getEligibleSchemes = async (enterpriseId) => {
  const response = await api.get(
    `/schemes/eligible/${enterpriseId}`
  );

  return response.data;
};