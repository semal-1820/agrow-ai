import api from "./api";

export const getFinancialRecords = async () => {
  const response = await api.get("/financial-records");
  return response.data;
};

export const getFinancialRecord = async (id) => {
  const response = await api.get(`/financial-records/${id}`);
  return response.data;
};

export const createFinancialRecord = async (data) => {
  const response = await api.post("/financial-records", data);
  return response.data;
};

export const updateFinancialRecord = async (id, data) => {
  const response = await api.put(
    `/financial-records/${id}`,
    data
  );

  return response.data;
};

export const deleteFinancialRecord = async (id) => {
  const response = await api.delete(
    `/financial-records/${id}`
  );

  return response.data;
};